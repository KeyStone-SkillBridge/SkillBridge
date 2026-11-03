import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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

import LogoSvg from "../../assets/images/logo.svg";
import { authService } from "../services/endpoints";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid = email.trim() !== "" && !emailError && !loading;

  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text.length > 0 && !emailRegex.test(text)) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSendCode = async () => {
    if (!email || emailError) {
      setEmailError("Enter a valid email address");
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      await authService.forgotPassword({ email: cleanEmail });

      // Navigate to OTP verification screen with reset flow param
      router.push({
        pathname: "/verify-otp",
        params: {
          email: cleanEmail,
          flow: "reset",
        },
      });
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Could not send reset code. Please verify your email and try again.";

      Alert.alert("Request Failed", serverMessage);
    } finally {
      setLoading(false);
    }
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
            {/* Header */}
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

            {/* Title & Description */}
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Don't worry! Enter your registered email address and we'll send
              you a 6-digit recovery code.
            </Text>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  emailError ? styles.inputErrorBorder : null,
                ]}
                placeholder="Enter your registered email"
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

            {/* Send Code CTA */}
            <TouchableOpacity
              onPress={handleSendCode}
              activeOpacity={0.85}
              disabled={!isFormValid}
              style={[
                styles.primaryButton,
                !isFormValid && styles.disabledButton,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Send Reset Code</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <View style={styles.backToLoginRow}>
              <Text style={styles.backText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.loginLink}>Log In</Text>
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
    marginTop: 28,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: "#5B4E5A",
    lineHeight: 20,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C101B",
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
  primaryButton: {
    height: 52,
    backgroundColor: "#7A1380",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#D1C7D2",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backToLoginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  backText: {
    fontSize: 14,
    color: "#1C101B",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7A1380",
  },
});
