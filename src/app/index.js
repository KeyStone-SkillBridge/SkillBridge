import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StatusBar, StyleSheet, Text, View } from "react-native";

import LogoSvg from "../../assets/images/logo.svg";
import { userService } from "../services/endpoints";
import { getAppState, getToken } from "../services/session";

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const determineRoute = async () => {
      // Minimum display timer so splash is visible and smooth (1.8s)
      const splashDelay = new Promise((resolve) => setTimeout(resolve, 1800));

      try {
        const [hasOnboarded, token] = await Promise.all([
          AsyncStorage.getItem("already_onboarded"),
          getToken(),
          splashDelay,
        ]);

        // Restore an existing session: verify the token is still valid.
        if (token) {
          try {
            await userService.getMe();
            const state = await getAppState();
            router.replace(state.onboardingComplete === false ? "/profile-setup" : "/(tabs)");
            return;
          } catch (err) {
            // 401 → interceptor already cleared the token; anything else
            // (offline) → still let them in with the cached session.
            if (err?.response?.status !== 401) {
              router.replace("/(tabs)");
              return;
            }
          }
        }

        if (hasOnboarded === "true") {
          router.replace("/login");
        } else {
          router.replace("/onboarding");
        }
      } catch (e) {
        await splashDelay;
        router.replace("/onboarding");
      }
    };

    determineRoute();
  }, [fadeAnim, scaleAnim, router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9FB" />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LogoSvg width={110} height={110} fill="#7A1380" />
        <Text style={styles.brandTitle}>SkillBridge</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB", // crisp clean off-white background from design
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    marginTop: 18,
    fontSize: 26,
    fontWeight: "800",
    color: "#7A1380", // matching signature purple brand color
    letterSpacing: -0.5,
  },
});
