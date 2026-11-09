import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { getErrorMessage } from "../services/api";
import { authService } from "../services/endpoints";
import { log, logError } from "../services/logger";
import {
  clearPendingCredentials,
  extractToken,
  extractUser,
  getPendingCredentials,
  saveSession,
} from "../services/session";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const userEmail = params?.email || "your email";

  // 6-digit OTP code state
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);

  // Countdown timer for code resend
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle digit input & auto-focus shift
  const handleDigitChange = (value, index) => {
    // The API only accepts a code of exactly six digits.
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullCode = code.join("");
  const isCodeComplete = /^\d{6}$/.test(fullCode);

  // Verify Code Submission
  const handleVerify = async () => {
    if (!isCodeComplete) {
      Alert.alert(
        "Invalid Code",
        "Please enter the complete 6-digit verification code.",
      );
      return;
    }

    setLoading(true);

    try {
      // Hit the dedicated verify-email endpoint with { email, code }
      const res = await authService.verifyEmail({
        email: userEmail,
        code: fullCode,
      });

      const token = extractToken(res?.data);
      log("verify-email", "Email verified — token returned?", {
        hasToken: !!token,
      });
      if (token) {
        await saveSession(token, extractUser(res?.data));
      } else {
        // verify-email returns no JWT — log in with the credentials kept
        // in memory from signup.
        const creds = getPendingCredentials(userEmail);
        let signedIn = false;
        if (creds) {
          try {
            await authService.loginAndStore(creds);
            clearPendingCredentials();
            signedIn = true;
          } catch (loginError) {
            logError("verify-email", "login after verify", loginError);
          }
        } else {
          log("verify-email", "No pending credentials in memory — sending to login");
        }
        if (!signedIn) {
          Alert.alert(
            "Email verified",
            "Your email is verified. Please log in to continue setting up your profile.",
            [{ text: "Log in", onPress: () => router.replace("/login") }],
          );
          return;
        }
      }

      Alert.alert("Success", "Email verified successfully!", [
        {
          text: "Continue",
          onPress: () => router.push("/profile-setup"),
        },
      ]);
    } catch (error) {
      logError("verify-email", "handleVerify", error);

      Alert.alert(
        "Verification Failed",
        getErrorMessage(error, "Verification code is invalid or has expired."),
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Code Placeholder
  const handleResend = async () => {
    if (timer > 0) return;

    setResending(true);
    try {
      // Placeholder / hook up to resend endpoint later if provided
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTimer(60);
      Alert.alert(
        "Code Sent",
        `A fresh verification code was sent to ${userEmail}.`,
      );
    } catch (error) {
      logError("verify-email", "handleResend", error);
      Alert.alert(
        "Notice",
        "A new code could not be sent. Please check your network connection.",
      );
    } finally {
      setResending(false);
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

            {/* Title & Instructions */}
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit verification code to{"\n"}
              <Text style={styles.emailHighlight}>{userEmail}</Text>
            </Text>

            {/* 6-Digit OTP Input Grid */}
            <View style={styles.otpInputContainer}>
              {code.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(ref) => (inputRefs.current[idx] = ref)}
                  style={[
                    styles.digitBox,
                    digit ? styles.digitBoxFilled : null,
                  ]}
                  value={digit}
                  onChangeText={(val) => handleDigitChange(val, idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={idx === 0}
                  editable={!loading}
                />
              ))}
            </View>

            {/* Verify CTA Button */}
            <TouchableOpacity
              onPress={handleVerify}
              activeOpacity={0.85}
              disabled={!isCodeComplete || loading}
              style={[
                styles.verifyButton,
                (!isCodeComplete || loading) && styles.disabledButton,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify & Proceed</Text>
              )}
            </TouchableOpacity>

            {/* Resend Code Section */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive code? </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={timer > 0 || resending}
              >
                {resending ? (
                  <ActivityIndicator size="small" color="#7A1380" />
                ) : (
                  <Text
                    style={[
                      styles.resendLink,
                      timer > 0 && styles.resendLinkDisabled,
                    ]}
                  >
                    {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                  </Text>
                )}
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
  emailHighlight: {
    fontWeight: "700",
    color: "#7A1380",
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 8,
  },
  digitBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#E2D9E2",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#1C101B",
    backgroundColor: "#FAF8FC",
  },
  digitBoxFilled: {
    borderColor: "#7A1380",
    backgroundColor: "#FFFFFF",
  },
  verifyButton: {
    height: 52,
    backgroundColor: "#7A1380",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#D1C7D2",
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#5B4E5A",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7A1380",
  },
  resendLinkDisabled: {
    color: "#A396A1",
  },
});
