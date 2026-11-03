import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import LogoSvg from "../../assets/images/logo.svg";
import { getErrorMessage } from "../services/api";
import { asList, authService, skillGapService } from "../services/endpoints";
import { invalidateSkillBridge } from "../services/useSkillBridge";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid =
    email.trim() !== "" && password.trim() !== "" && !emailError && !loading;

  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text.length > 0 && !emailRegex.test(text)) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleLogin = async () => {
    console.log("Attempting login with email:", email);
    if (!email || emailError) {
      setEmailError("Enter a valid email address");
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const payload = {
        email: cleanEmail,
        password: password,
      };

      // Logs in AND persists the JWT (throws if no token came back).
      await authService.loginAndStore(payload);
      await AsyncStorage.setItem("already_onboarded", "true");
      invalidateSkillBridge();

      // First-time users (no skill-gap analysis yet) finish profile setup.
      let hasAnalysis = true;
      try {
        hasAnalysis = asList(await skillGapService.getAll()).length > 0;
      } catch (e) {
        // If this check fails, just go to the dashboard.
      }

      router.replace(hasAnalysis ? "/(tabs)" : "/profile-setup");
    } catch (error) {
      const status = error.response?.status;
      const serverMessage =
        status === 401 || status === 400
          ? error.response?.data?.message || "Invalid email or password."
          : getErrorMessage(
              error,
              "Invalid email or password. Please verify your credentials and try again.",
            );

      console.error(
        "Login failed:",
        error.response?.data || error.message || error,
      );
      Alert.alert("Login Failed", serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google Sign In", "Connecting Google OAuth service...");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header: Back Chevron + Center Logo */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={12}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={28} color="#7A1380" />
              </TouchableOpacity>

              <View style={styles.logoWrapper}>
                <LogoSvg width={30} height={30} />
              </View>

              <View style={styles.headerRightPlaceholder} />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to continue accelerating your tech & fintech career.
            </Text>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  emailError ? styles.inputErrorBorder : null,
                ]}
                placeholder="Enter email address"
                placeholderTextColor="#A396A1"
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {emailError ? (
                <View style={styles.errorRow}>
                  <MaterialIcons name="warning" size={16} color="#E53935" />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity
                  onPress={() => router.push("/forgot-password")}
                  hitSlop={8}
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter password"
                  placeholderTextColor="#A396A1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={12}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#1C101B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Log In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={!isFormValid}
              style={[
                styles.loginButton,
                !isFormValid && styles.disabledButton,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              activeOpacity={0.85}
              disabled={loading}
              style={styles.googleButton}
            >
              <Svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                style={styles.googleIcon}
              >
                <Path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                />
                <Path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.26 21.36 7.34 24 12 24z"
                />
                <Path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.13z"
                />
                <Path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.27 6.58l4.01 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                />
              </Svg>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Bottom Nav to Sign Up */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    marginTop: 4,
  },
  backButton: {
    width: 40,
    justifyContent: "center",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1C101B",
    marginTop: 24,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: "#5B4E5A",
    marginBottom: 24,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C101B",
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7A1380",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1C101B",
    backgroundColor: "#FFFFFF",
  },
  inputErrorBorder: {
    borderColor: "#E53935",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: "#E53935",
    fontWeight: "500",
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    height: "100%",
    justifyContent: "center",
  },
  loginButton: {
    height: 52,
    backgroundColor: "#7A1380",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  disabledButton: {
    backgroundColor: "#D1C7D2",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2D9E2",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: "#7B6F84",
    fontWeight: "500",
  },
  googleButton: {
    height: 52,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C101B",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  signupText: {
    fontSize: 14,
    color: "#1C101B",
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7A1380",
  },
});
