import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();

  // Delete Modal State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // Notification Toggles
  const [jobAlerts, setJobAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);

  // Security & Privacy Toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [recruiterNetwork, setRecruiterNetwork] = useState(true);

  const confirmDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      Alert.alert(
        "Required",
        "Please enter your password to confirm account deletion.",
      );
      return;
    }

    setDeleteModalVisible(false);
    setDeletePassword("");
    // Clear local storage and reset to onboarding
    await AsyncStorage.clear();
    router.replace("/onboarding");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color="#7A1380" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn} hitSlop={12}>
          <Ionicons name="notifications" size={22} color="#7A1380" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 1. Account and security ================= */}
        <Text style={styles.sectionHeader}>Account and security</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() => router.push("/forgot-password")}
          >
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Password reset</Text>
              <Text style={styles.rowSubtitle}>Last changed 2 months ago</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#7A1380" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Two–factor authentication</Text>
              <Text style={styles.rowSubtitle}>
                Protect sign-in with a code
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.pillBadge,
                twoFactorEnabled ? styles.pillActive : styles.pillInactive,
              ]}
              onPress={() => setTwoFactorEnabled((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pillText,
                  twoFactorEnabled
                    ? styles.pillTextActive
                    : styles.pillTextInactive,
                ]}
              >
                {twoFactorEnabled ? "On" : "Off"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 2. Notifications ================= */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.rowItem}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Job match alerts</Text>
              <Text style={styles.rowSubtitle}>
                When a new opportunity fits you
              </Text>
            </View>
            <Switch
              value={jobAlerts}
              onValueChange={setJobAlerts}
              trackColor={{ false: "#D1C2CE", true: "#7A1380" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Weekly progress summary</Text>
              <Text style={styles.rowSubtitle}>Every Monday, 8:00 am</Text>
            </View>
            <Switch
              value={weeklySummary}
              onValueChange={setWeeklySummary}
              trackColor={{ false: "#D1C2CE", true: "#7A1380" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ================= 3. Privacy and data ================= */}
        <Text style={styles.sectionHeader}>Privacy and data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Data retention</Text>
              <Text style={styles.rowSubtitle}>Keep my CV for 12 months</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#7A1380" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() => setDeleteModalVisible(true)}
          >
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Delete account</Text>
              <Text style={styles.rowSubtitle}>
                Permanently removes your CV and data
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#7A1380" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Recruiter Visibility Network</Text>
              <Text style={styles.rowSubtitle}>
                Allow vetted employers (e.g Flutterwave, Sterling, Moniepoint)
                to discover your profile
              </Text>
            </View>
            <Switch
              value={recruiterNetwork}
              onValueChange={setRecruiterNetwork}
              trackColor={{ false: "#D1C2CE", true: "#7A1380" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ================= 4. Help and support ================= */}
        <Text style={styles.sectionHeader}>Help and support</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>FAQs</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#7A1380" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Contact support</Text>
              <Text style={styles.rowSubtitle}>
                Raise a ticket. We reply within 2 working days
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#7A1380" />
          </TouchableOpacity>
        </View>

        {/* Log out trigger button -> routes to /logout-confirm */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.push("/logout-confirm")}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ================= Delete Account Confirmation Modal ================= */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setDeleteModalVisible(false);
          setDeletePassword("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete account</Text>

            {/* Warning callout banner */}
            <View style={styles.deleteWarningBanner}>
              <Ionicons
                name="warning-outline"
                size={18}
                color="#B71C1C"
                style={{ marginTop: 1, marginRight: 8 }}
              />
              <Text style={styles.deleteWarningText}>
                This permanently deletes your data.
              </Text>
            </View>

            {/* Password confirmation input box */}
            <View style={styles.passwordInputContainer}>
              <Feather
                name="lock"
                size={16}
                color="#1C101B"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm password"
                placeholderTextColor="#1C101B"
                secureTextEntry
                value={deletePassword}
                onChangeText={setDeletePassword}
                autoCapitalize="none"
              />
            </View>

            {/* Modal action buttons */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletePassword("");
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={confirmDeleteAccount}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteConfirmText}>
                  Delete{"\n"}account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 44,
  },
  backBtn: {
    width: 36,
    justifyContent: "center",
  },
  bellBtn: {
    width: 36,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C101B",
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1C101B",
    marginBottom: 10,
    marginTop: 14,
    letterSpacing: -0.2,
  },
  card: {
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C101B",
    marginBottom: 3,
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#5B4E5A",
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#EBDDE9",
  },
  pillBadge: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: "#7A1380",
  },
  pillInactive: {
    backgroundColor: "#D1C2CE",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  pillTextInactive: {
    color: "#8A7B87",
  },
  logoutButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: "#D32F2F",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#D32F2F",
  },

  /* Delete Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    paddingVertical: 22,
    paddingHorizontal: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1C101B",
    marginBottom: 12,
  },
  modalActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7A1380",
  },
  deleteWarningBanner: {
    backgroundColor: "#F8D7DA",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  deleteWarningText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B71C1C",
    flex: 1,
    lineHeight: 18,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#1C101B",
  },
  deleteConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: "#B71C1C",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteConfirmText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B71C1C",
    textAlign: "center",
    lineHeight: 14,
  },
});
