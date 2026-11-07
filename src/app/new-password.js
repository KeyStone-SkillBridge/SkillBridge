import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { logError } from "../services/logger";

export default function NewPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const email = params?.email || "";
  const code = params?.code || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = password.length >= 6 && passwordsMatch && !loading;

  const handleResetPassword = async () => {
    if (!passwordsMatch) {
      Alert.alert("Password Mismatch", "The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword: password,
      };
      await authService.resetPassword(payload);

      Alert.alert(
        "Password Reset Successful",
        "Your password has been updated. Please log in with your new credentials.",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/login"),
          },
        ],
      );
    } catch (error) {
      logError("new-password", "handleResetPassword", error);
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Could not update password. Your reset code may have expired.";

      Alert.alert("Reset Failed", serverMessage);
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

            {/* Title */}
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>
              Create a strong password with at least 6 characters.
            </Text>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter new password"
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

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#A396A1"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  hitSlop={12}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#1C101B"
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !passwordsMatch ? (
                <Text style={styles.errorText}>Passwords do not match</Text>
              ) : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
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
                <Text style={styles.primaryButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C101B",
    marginBottom: 8,
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
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
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    height: "100%",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 12,
    color: "#E53935",
    fontWeight: "500",
    marginTop: 6,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
