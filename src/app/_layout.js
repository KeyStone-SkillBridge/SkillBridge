import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

import { setUnauthorizedHandler } from "../services/session";
import { invalidateSkillBridge } from "../services/useSkillBridge";

export default function RootLayout() {
  useEffect(() => {
    // Any 401 from the API (expired / invalid token) lands the user on Login.
    let alertShown = false;
    setUnauthorizedHandler(() => {
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

  return <Stack screenOptions={{ headerShown: false }} />;
}
