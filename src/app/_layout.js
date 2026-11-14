import { NetworkStateType, useNetworkState } from "expo-network";
import { router, Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";

import {
  CONNECTIVITY_MESSAGES,
  reportConnectivityProblem,
  setConnectivityAlertHandler,
  setDeviceOnline,
} from "../services/connectivity";
import { log, warn } from "../services/logger";
import { runNetworkCheck } from "../services/netcheck";
import { getToken, setUnauthorizedHandler } from "../services/session";
import { invalidateSkillBridge, loadSkillBridge } from "../services/useSkillBridge";

export default function RootLayout() {
  const network = useNetworkState();
  const wasOffline = useRef(false);

  // "Offline" only when the phone clearly says so. isConnected is also false
  // for an UNKNOWN connection type, which is not proof of anything.
  const offline = network.isConnected === false && network.type === NetworkStateType.NONE;

  useEffect(() => {
    // Any 401 from the API (expired / invalid token) lands the user on Login.
    let alertShown = false;
    setUnauthorizedHandler(() => {
      warn("layout", "Unauthorized — redirecting to /login");
      invalidateSkillBridge();
      router.replace("/login");
      if (!alertShown) {
        alertShown = true;
        Alert.alert(
          "Session expired",
          "Please log in again to continue.",
          [{ text: "OK", onPress: () => (alertShown = false) }],
        );
      }
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  // Development builds only: measure what this phone can reach (see netcheck.js)
  // and print the result as "[netcheck]" lines in the console.
  useEffect(() => {
    if (!__DEV__) return undefined;
    const timer = setTimeout(() => runNetworkCheck(), 5000);
    return () => clearTimeout(timer);
  }, []);

  // The one place connectivity problems become an alert.
  useEffect(() => {
    setConnectivityAlertHandler((kind, done) => {
      const { title, message } = CONNECTIVITY_MESSAGES[kind];
      Alert.alert(title, message, [{ text: "OK", onPress: done }], {
        cancelable: true,
        onDismiss: done,
      });
    });
    return () => setConnectivityAlertHandler(null);
  }, []);

  // React to the phone going offline / coming back.
  useEffect(() => {
    setDeviceOnline(!offline);

    if (offline && !wasOffline.current) {
      reportConnectivityProblem("offline");
    }

    if (!offline && wasOffline.current) {
      // Back online: refresh quietly — but only for a signed-in user, otherwise
      // the authenticated requests would be rejected and look like an expired
      // session.
      getToken().then((token) => {
        if (!token) return;
        log("layout", "Back online — refreshing data");
        invalidateSkillBridge();
        loadSkillBridge(true).catch(() => {});
      });
    }
    wasOffline.current = offline;
  }, [offline]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
