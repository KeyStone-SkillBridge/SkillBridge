import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AccountShield from "../../assets/images/AccountShield.svg";

function SkillBridgeShieldIllustration() {
  return (
    <View style={styles.shieldOuterGlow}>
      <View style={styles.shieldCirclePurple}>
        <AccountShield width={48} height={48} color="#FFFFFF" />

        {/* Floating "Saved" cloud pill */}
        <View style={styles.savedPillBadge}>
          <Ionicons name="cloud-done" size={14} color="#731F94" />
          <Text style={styles.savedPillText}>Saved</Text>
        </View>
      </View>
    </View>
  );
}

export default function SafelySignOutScreen() {
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const handleSignOut = async () => {
    // If I later need to persist biometric preferences, i woulf store it here
    if (biometricEnabled) {
      await AsyncStorage.setItem("quick_biometric_login", "true");
    }

    // This removes active auth token, retain already_onboarded = true
    await AsyncStorage.removeItem("user_token");
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9FB" />

      {/* Top Header Row */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.closeCircleBtn}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Ionicons name="close" size={20} color="#1C101B" />
        </TouchableOpacity>

        <View style={styles.shieldPillHeader}>
          <Ionicons name="shield-checkmark" size={14} color="#731F94" />
          <Text style={styles.shieldPillHeaderText}>SKILLBRIDGE SHIELD</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shield Illustration */}
        <View style={styles.shieldCenterWrapper}>
          <SkillBridgeShieldIllustration />
        </View>

        {/* Title & Cloud Sync Notice */}
        <Text style={styles.headline}>Safely Sign Out?</Text>
        <Text style={styles.descriptionText}>
          Your progress on Sprint 2: SQL Capstone and your 12–day study streak
          are securely synced to the cloud.
        </Text>

        {/* User Session Info Card */}
        <View style={styles.summaryCard}>
          {/* User Row */}
          <View style={styles.userRow}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarPlaceholder} />
              <View style={styles.onlineBadge} />
            </View>

            <View style={styles.userInfoCol}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>Amaka Okafor</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#731F94"
                  style={{ marginLeft: 6 }}
                />
              </View>
              <Text style={styles.userSubtitle}>
                UNILAG • B.Sc Economics & Stats
              </Text>
            </View>
          </View>

          {/* Sync & Sprint Stats Container */}
          <View style={styles.statsContainer}>
            <View style={styles.statRowItem}>
              <View style={styles.statRowLeft}>
                <Ionicons name="chevron-forward" size={15} color="#731F94" />
                <Text style={styles.statRowLabel}>Cloud Sandbox State</Text>
              </View>
              <Text style={styles.statRowValue}>Synced 12s ago</Text>
            </View>

            <View style={styles.statRowItem}>
              <View style={styles.statRowLeft}>
                <Ionicons name="ribbon-outline" size={16} color="#731F94" />
                <Text style={styles.statRowLabel}>Sprint Milestones</Text>
              </View>
              <Text style={styles.statRowValueBold}>4 of 6 Badges</Text>
            </View>

            <View style={styles.statRowItem}>
              <View style={styles.statRowLeft}>
                <Ionicons name="flame" size={16} color="#731F94" />
                <Text style={styles.statRowLabel}>Active Streak</Text>
              </View>
              <View style={styles.streakPill}>
                <Text style={styles.streakPillText}>12 Days</Text>
              </View>
            </View>
          </View>

          {/* Biometrics Toggle Row */}
          <View style={styles.biometricRow}>
            <MaterialCommunityIcons
              name="fingerprint"
              size={24}
              color="#731F94"
              style={{ marginRight: 12 }}
            />
            <View style={styles.biometricTextCol}>
              <Text style={styles.biometricTitle}>
                Keep Quick Biometric Login
              </Text>
              <Text style={styles.biometricSubtitle}>
                Skip password on this phone next time
              </Text>
            </View>

            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: "#D1C2CE", true: "#731F94" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Action CTAs */}
        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.88}
          onPress={handleSignOut}
        >
          <Ionicons name="exit-outline" size={20} color="#FFFFFF" />
          <Text style={styles.signOutBtnText}>Yes, Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelReturnBtn}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={18} color="#731F94" />
          <Text style={styles.cancelReturnBtnText}>
            Cancel & Return to Dashboard
          </Text>
        </TouchableOpacity>

        {/* NDPR Compliance Notice */}
        <View style={styles.ndprRow}>
          <FontAwesome5
            name="file-contract"
            size={14}
            color="#5A6679"
            style={{ marginRight: 8, marginTop: 2 }}
          />
          <Text style={styles.ndprText}>
            Session tokens are immediately invalidated across public nodes in
            full compliance with the Nigeria Data Protection Regulation (NDPR).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9F9FB",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  closeCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EEEAF8",
    alignItems: "center",
    justifyContent: "center",
  },
  shieldPillHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFE6F7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  shieldPillHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1C101B",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  shieldCenterWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  shieldOuterGlow: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#E2D9FA",
    alignItems: "center",
    justifyContent: "center",
  },
  shieldCirclePurple: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: "#731F94",
    alignItems: "center",
    justifyContent: "center",
  },
  savedPillBadge: {
    position: "absolute",
    bottom: -8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    gap: 4,
  },
  savedPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  headline: {
    fontSize: 24,
    fontWeight: "800",
    color: "#131B2A",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EADCF7",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0D8A58",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userInfoCol: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#131B2A",
  },
  userSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statsContainer: {
    backgroundColor: "#F8F5FC",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  statRowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  statRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statRowLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  statRowValue: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  statRowValueBold: {
    fontSize: 12,
    color: "#1F2937",
    fontWeight: "800",
  },
  streakPill: {
    backgroundColor: "#ECE3F6",
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  streakPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1F2937",
  },
  biometricRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 6,
  },
  biometricTextCol: {
    flex: 1,
    marginRight: 10,
  },
  biometricTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#131B2A",
  },
  biometricSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  signOutBtn: {
    height: 50,
    backgroundColor: "#731F94",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  signOutBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  cancelReturnBtn: {
    height: 50,
    backgroundColor: "#F3EEFB",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  cancelReturnBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#731F94",
  },
  ndprRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 8,
  },
  ndprText: {
    flex: 1,
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
    textAlign: "center",
  },
});
