import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoSvg from "../../../assets/images/logo.svg";

export default function ProfileScreen() {
  const router = useRouter();
  const [directInMail, setDirectInMail] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FC" />

      {/* ================= Header Bar ================= */}
      <View style={styles.headerBar}>
        <View style={styles.headerBrandGroup}>
          <LogoSvg width={30} height={30} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.brandTitle}>SkillBridge</Text>
            <Text style={styles.brandSubtitle}>PROFILE BADGES</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.bellBtn} hitSlop={10}>
            <Ionicons name="notifications-outline" size={22} color="#1C101B" />
            <View style={styles.bellDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/profile-settings")}
            hitSlop={10}
          >
            <Ionicons name="settings-outline" size={22} color="#731F94" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 1. User Identity Hero Card ================= */}
        <View style={styles.heroCard}>
          {/* User Row */}
          <View style={styles.heroUserRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle} />
              <View style={styles.avatarGradCapBadge}>
                <Ionicons name="school" size={11} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.heroMetaCol}>
              <View style={styles.nameRow}>
                <Text style={styles.heroName}>Amaka Okafor</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#731F94"
                  style={{ marginLeft: 6 }}
                />
              </View>
              <Text style={styles.heroSubtitle}>B.Sc Economics</Text>
            </View>
          </View>

          {/* Hire-Ready Banner */}
          <View style={styles.hireReadyBox}>
            <View style={styles.hireReadyNumberWrap}>
              <Text style={styles.hireReadyPercent}>84</Text>
              <Text style={styles.hireReadyPercentSymbol}>%</Text>
            </View>

            <View style={styles.hireReadyMetaCol}>
              <Text style={styles.hireReadyLabel}>TIER 1 HIRE–READY</Text>
              <Text style={styles.hireReadyCohortText}>
                Top 8% in Lagos Cohort
              </Text>
            </View>

            <Feather name="trending-up" size={18} color="#731F94" />
          </View>

          {/* Velocity Progress Bar */}
          <View style={styles.velocityRow}>
            <View style={styles.velocityLabelWrap}>
              <MaterialCommunityIcons
                name="speedometer"
                size={14}
                color="#731F94"
              />
              <Text style={styles.velocityText}>
                Sprint Velocity: Day 14 of 60
              </Text>
            </View>
            <Text style={styles.badgesCountText}>4 of 6 Badges</Text>
          </View>

          <View style={styles.velocityTrack}>
            <View style={styles.velocityFill} />
          </View>

          {/* Streak Sub-stats */}
          <View style={styles.streakSubRow}>
            <View style={styles.streakWrap}>
              <MaterialCommunityIcons name="fire" size={14} color="#731F94" />
              <Text style={styles.streakText}>12–day study streak</Text>
            </View>
            <Text style={styles.nextCapstoneText}>Next: Ledger Capstone</Text>
          </View>
        </View>

        {/* ================= 2. Cryptographic Skill Matrix Header ================= */}
        <View style={styles.matrixHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.matrixSectionTitle}>
              Cryptographic Skill Matrix
            </Text>
            <Text style={styles.matrixSectionSubtitle}>
              Immutable proof synced via Lagos Sandbox API
            </Text>
          </View>

          <View style={styles.w12Badge}>
            <Text style={styles.w12BadgeText}>W–12{"\n"}Verified</Text>
          </View>
        </View>

        {/* Badge 1: SQL Expert */}
        <View style={styles.card}>
          <View style={styles.badgeTopRow}>
            <View style={styles.badgeIconWrap}>
              <MaterialCommunityIcons
                name="database"
                size={22}
                color="#731F94"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.badgeTitleRow}>
                <Text style={styles.badgeTitle}>SQL Expert Badge</Text>
                <Ionicons name="checkmark-circle" size={13} color="#731F94" />
              </View>
              <Text style={styles.badgeValidationText}>
                UNILAG Registrar API & Sandbox test
              </Text>
              <Text style={styles.badgeIdText}>
                ID: #SKB–8091 • Block #10928
              </Text>
            </View>

            <View style={styles.scoreWrap}>
              <Text style={styles.scoreText}>
                <Text style={styles.scoreBig}>98</Text>/100
              </Text>
              <Text style={styles.masteryLabel}>MASTERY</Text>
            </View>
          </View>

          <View style={styles.chipsAndActionRow}>
            <View style={styles.skillChipsGroup}>
              <View style={styles.skillChip}>
                <Text style={styles.skillChipText}>Window Functions</Text>
              </View>
              <View style={styles.skillChip}>
                <Text style={styles.skillChipText}>Complex CTEs</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.pdfDownloadBtn}
              onPress={() =>
                Alert.alert("Download", "Downloading SQL Badge PDF...")
              }
            >
              <Feather name="arrow-down-circle" size={14} color="#731F94" />
              <Text style={styles.pdfBtnText}>PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Badge 2: EDA & Statistical Modeling */}
        <View style={styles.card}>
          <View style={styles.badgeTopRow}>
            <View style={styles.badgeIconWrap}>
              <Feather name="trending-up" size={20} color="#731F94" />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.badgeTitle}>EDA & Statistical Modeling</Text>
              <Text style={styles.badgeValidationText}>
                Verified vs Moniepoint transaction schema
              </Text>
              <Text style={styles.badgeIdText}>
                ID: #SKB–8224 • Live Audit Passed
              </Text>
            </View>

            <View style={styles.scoreWrap}>
              <View style={styles.scoreBadgeTop}>
                <Ionicons name="checkmark-circle" size={12} color="#731F94" />
                <Text style={styles.scoreText}>
                  <Text style={styles.scoreBig}>94</Text>/100
                </Text>
              </View>
              <Text style={styles.masteryLabel}>ADVANCED</Text>
            </View>
          </View>

          <View style={styles.chipsAndActionRow}>
            <View style={styles.skillChipsGroup}>
              <View style={styles.skillChip}>
                <Text style={styles.skillChipText}>Python / Polars</Text>
              </View>
              <View style={styles.skillChip}>
                <Text style={styles.skillChipText}>Risk Matrices</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.pdfDownloadBtn}
              onPress={() =>
                Alert.alert("Download", "Downloading EDA Badge PDF...")
              }
            >
              <Feather name="arrow-down-circle" size={14} color="#731F94" />
              <Text style={styles.pdfBtnText}>PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Badge 3: Financial Statement Analysis */}
        <View style={styles.card}>
          <View style={styles.badgeTopRow}>
            <View style={styles.badgeIconWrap}>
              <FontAwesome5 name="university" size={16} color="#731F94" />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.badgeTitle}>
                Financial Statement Analysis
              </Text>
              <Text style={styles.badgeValidationText}>
                Sterling Bank quantitative benchmark criteria
              </Text>
              <Text style={styles.badgeIdText}>
                ID: #SKB–7915 • Peer Reviewed
              </Text>
            </View>

            <View style={styles.scoreWrap}>
              <View style={styles.scoreBadgeTop}>
                <Ionicons name="checkmark-circle" size={12} color="#731F94" />
                <Text style={styles.scoreText}>
                  <Text style={styles.scoreBig}>92</Text>/100
                </Text>
              </View>
              <Text style={styles.masteryLabel}>VERIFIED</Text>
            </View>
          </View>

          <View style={styles.chipsAndActionRow}>
            <View style={styles.skillChipsGroup}>
              <View style={styles.skillChip}>
                <Text style={styles.skillChipText}>Ratio Auditing</Text>
              </View>
              <View style={styles.skillChip}>
                <Text style={styles.skillChipText}>Cash Flow Models</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.pdfDownloadBtn}
              onPress={() =>
                Alert.alert("Download", "Downloading Financial Analysis PDF...")
              }
            >
              <Feather name="arrow-down-circle" size={14} color="#731F94" />
              <Text style={styles.pdfBtnText}>PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Badge 4: Advanced MS Excel */}
        <View style={styles.card}>
          <View style={styles.badgeTopRow}>
            <View style={styles.badgeIconWrap}>
              <MaterialCommunityIcons
                name="table-large"
                size={20}
                color="#731F94"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.badgeTitleRow}>
                <Text style={styles.badgeTitle}>Advanced MS Excel</Text>
                <Ionicons name="checkmark-circle" size={13} color="#731F94" />
              </View>
              <Text style={styles.badgeValidationText}>
                Pivot Engineering & Dynamic Power Queries
              </Text>
              <Text style={styles.badgeIdText}>ID: #SKB–7710 • Certified</Text>
            </View>

            <View style={styles.scoreWrap}>
              <Text style={styles.scoreText}>
                <Text style={styles.scoreBig}>95</Text>/100
              </Text>
              <Text style={styles.masteryLabel}>MASTERY</Text>
            </View>
          </View>

          <View style={styles.chipsAndActionRow}>
            <View style={styles.skillChipsGroup}>
              <View style={styles.skillChip}>
                <Text style={styles.skillChipText}>Power Pivot</Text>
              </View>
              <View style={styles.skillChip}>
                <Text style={styles.skillChipText}>VBA Macros</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.pdfDownloadBtn}
              onPress={() =>
                Alert.alert("Download", "Downloading MS Excel PDF...")
              }
            >
              <Feather name="arrow-down-circle" size={14} color="#731F94" />
              <Text style={styles.pdfBtnText}>PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Badge 5: Fintech Core & Ledger Reconciliation (Active 65%) */}
        <View style={styles.card}>
          <View style={styles.badgeTopRow}>
            <View style={styles.badgeIconWrap}>
              <MaterialCommunityIcons name="laptop" size={20} color="#731F94" />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.badgeTitle}>
                Fintech Core & Ledger Reconciliation
              </Text>
              <Text style={styles.badgeValidationText}>
                Unlocks automatically upon Capstone 1 review
              </Text>
              <Text style={styles.sprintTargetText}>Sprint Week 3 Target</Text>
            </View>

            <View style={styles.scoreWrap}>
              <Text style={styles.scoreBig}>65%</Text>
              <Text style={styles.activeLabel}>ACTIVE</Text>
            </View>
          </View>

          <View style={styles.velocityTrack}>
            <View style={[styles.velocityFill, { width: "65%" }]} />
          </View>

          <View style={styles.activeCardFooter}>
            <View style={styles.modulesRemainingWrap}>
              <Feather name="lock" size={11} color="#556070" />
              <Text style={styles.modulesRemainingText}>
                2 Modules remaining
              </Text>
            </View>

            <TouchableOpacity
              style={styles.resumeModuleRow}
              onPress={() => router.push("/(tabs)/learn")}
            >
              <Text style={styles.resumeModuleText}>Resume Module</Text>
              <Feather name="arrow-right" size={13} color="#731F94" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 3. Cryptographic Credential Box ================= */}
        <View style={styles.credentialContainer}>
          <View style={styles.credentialTopHeader}>
            <View style={styles.qrIconSquare}>
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={20}
                color="#731F94"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.credTitle}>Cryptographic Credential</Text>
              <Text style={styles.credSub}>NDPR & ISO–27001 COMPLIANT</Text>
            </View>

            <View style={styles.liveSyncPill}>
              <View style={styles.liveSyncDot} />
              <Text style={styles.liveSyncText}>Live Sync</Text>
            </View>
          </View>

          {/* Inner Token Digest Card */}
          <View style={styles.tokenDigestCard}>
            <View style={styles.qrPlaceholderBox}>
              <Ionicons name="qr-code-outline" size={48} color="#731F94" />
            </View>

            <View style={styles.digestMetaCol}>
              <Text style={styles.digestLabel}>TOKEN DIGEST</Text>
              <Text style={styles.digestCode}>NG–DA–2024–8841–A0</Text>
              <Text style={styles.digestSigner}>
                Signer: UNILAG Deanery / SkillBridge Lagos Validator
              </Text>
              <View style={styles.encryptedRow}>
                <Feather name="lock" size={10} color="#731F94" />
                <Text style={styles.encryptedText}>
                  Encrypted ECDSA SHA–256
                </Text>
              </View>
            </View>
          </View>

          {/* Action 1: Add to LinkedIn */}
          <TouchableOpacity
            style={styles.linkedInBtn}
            activeOpacity={0.88}
            onPress={() =>
              Alert.alert(
                "LinkedIn",
                "Redirecting to add credential to LinkedIn profile...",
              )
            }
          >
            <Feather name="link" size={15} color="#FFFFFF" />
            <Text style={styles.linkedInBtnText}>
              Add Verified Credential to LinkedIn Profile
            </Text>
          </TouchableOpacity>

          {/* Action 2: Download PDF Dossier */}
          <TouchableOpacity
            style={styles.dossierBtn}
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert(
                "PDF Dossier",
                "Downloading complete verified credential dossier...",
              )
            }
          >
            <Feather name="file-text" size={15} color="#731F94" />
            <Text style={styles.dossierBtnText}>
              Download Verified PDF Skill Dossier
            </Text>
          </TouchableOpacity>

          {/* Direct InMail Switcher */}
          <View style={styles.inMailCard}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <View style={styles.inMailTitleRow}>
                <Text style={styles.inMailTitle}>
                  Lagos FinTech Direct InMail
                </Text>
                <View style={styles.inMailDot} />
              </View>
              <Text style={styles.inMailDesc}>
                Allows Moniepoint, Flutterwave, and Sterling Bank talent leads
                to message Amaka directly.
              </Text>
            </View>

            <Switch
              value={directInMail}
              onValueChange={setDirectInMail}
              trackColor={{ false: "#D1C2CE", true: "#731F94" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ================= 4. Accreditation Notice & Settings CTA ================= */}
        <View style={styles.registryNoticeRow}>
          <Feather name="shield" size={13} color="#731F94" />
          <Text style={styles.registryNoticeText}>
            SkillBridge Career Acceleration • Verified Cohort Registry
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileSettingsBtn}
          activeOpacity={0.88}
          onPress={() => router.push("/profile-settings")}
        >
          <Text style={styles.profileSettingsBtnText}>Profile Settings</Text>
          <Ionicons name="settings" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF8FC",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#FAF8FC",
  },
  headerBrandGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1C101B",
    lineHeight: 18,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.6,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bellBtn: {
    position: "relative",
    padding: 2,
  },
  bellDot: {
    position: "absolute",
    top: 2,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#731F94",
  },
  settingsBtn: {
    padding: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },

  /* 1. Hero Identity Card */
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  heroUserRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarWrap: {
    position: "relative",
    marginRight: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5EEFC",
    borderWidth: 1.5,
    borderColor: "#731F94",
  },
  avatarGradCapBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#731F94",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  heroMetaCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#131B2A",
  },
  heroSubtitle: {
    fontSize: 12,
    color: "#556070",
    marginTop: 2,
  },
  hireReadyBox: {
    backgroundColor: "#FAF5FC",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  hireReadyNumberWrap: {
    backgroundColor: "#EAE1FA",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "baseline",
    marginRight: 10,
  },
  hireReadyPercent: {
    fontSize: 18,
    fontWeight: "800",
    color: "#731F94",
  },
  hireReadyPercentSymbol: {
    fontSize: 11,
    fontWeight: "800",
    color: "#731F94",
  },
  hireReadyMetaCol: {
    flex: 1,
  },
  hireReadyLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.3,
  },
  hireReadyCohortText: {
    fontSize: 11,
    color: "#556070",
    marginTop: 1,
  },
  velocityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  velocityLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  velocityText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#131B2A",
  },
  badgesCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#731F94",
  },
  velocityTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F0E5F7",
    overflow: "hidden",
    marginBottom: 10,
  },
  velocityFill: {
    width: "68%",
    height: "100%",
    backgroundColor: "#731F94",
    borderRadius: 3,
  },
  streakSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  nextCapstoneText: {
    fontSize: 10,
    color: "#556070",
    fontWeight: "600",
  },

  /* 2. Cryptographic Skill Matrix */
  matrixHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  matrixSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#731F94",
  },
  matrixSectionSubtitle: {
    fontSize: 11,
    color: "#556070",
    marginTop: 1,
  },
  w12Badge: {
    backgroundColor: "#EAE1FA",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  w12BadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#731F94",
    textAlign: "center",
  },

  /* Shared Badge Card */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  badgeTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  badgeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FAF5FC",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
  },
  badgeValidationText: {
    fontSize: 10,
    color: "#556070",
    marginTop: 2,
    lineHeight: 14,
  },
  badgeIdText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#7B6F84",
    marginTop: 2,
  },
  scoreWrap: {
    alignItems: "flex-end",
  },
  scoreBadgeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreText: {
    fontSize: 10,
    color: "#7B6F84",
    fontWeight: "600",
  },
  scoreBig: {
    fontSize: 16,
    fontWeight: "800",
    color: "#731F94",
  },
  masteryLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.4,
    marginTop: 1,
  },
  activeLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.4,
    marginTop: 1,
  },
  sprintTargetText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
    marginTop: 2,
  },
  chipsAndActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skillChipsGroup: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  skillChip: {
    backgroundColor: "#FAF5FC",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  skillChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#556070",
  },
  pdfDownloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingLeft: 6,
  },
  pdfBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#731F94",
  },
  activeCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  modulesRemainingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  modulesRemainingText: {
    fontSize: 10,
    color: "#556070",
    fontWeight: "600",
  },
  resumeModuleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  resumeModuleText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#731F94",
  },

  /* 3. Cryptographic Credential */
  credentialContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  credentialTopHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  qrIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FAF5FC",
    alignItems: "center",
    justifyContent: "center",
  },
  credTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#731F94",
  },
  credSub: {
    fontSize: 9,
    fontWeight: "700",
    color: "#7B6F84",
    letterSpacing: 0.3,
    marginTop: 1,
  },
  liveSyncPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5EEFC",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  liveSyncDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#731F94",
  },
  liveSyncText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#731F94",
  },
  tokenDigestCard: {
    backgroundColor: "#FAF5FC",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  qrPlaceholderBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  digestMetaCol: {
    flex: 1,
  },
  digestLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#7B6F84",
    letterSpacing: 0.4,
  },
  digestCode: {
    fontSize: 11,
    fontWeight: "800",
    color: "#731F94",
    marginTop: 1,
  },
  digestSigner: {
    fontSize: 9,
    color: "#556070",
    lineHeight: 12,
    marginTop: 2,
  },
  encryptedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  encryptedText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#731F94",
  },
  linkedInBtn: {
    height: 44,
    backgroundColor: "#731F94",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  linkedInBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  dossierBtn: {
    height: 42,
    backgroundColor: "#F0E5F7",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 12,
  },
  dossierBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#731F94",
  },
  inMailCard: {
    backgroundColor: "#FAF8FC",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  inMailTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inMailTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#731F94",
  },
  inMailDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#731F94",
  },
  inMailDesc: {
    fontSize: 9,
    color: "#556070",
    lineHeight: 13,
    marginTop: 2,
  },

  /* 4. Footer Settings Action */
  registryNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 10,
  },
  registryNoticeText: {
    fontSize: 10,
    color: "#556070",
    fontWeight: "600",
    textAlign: "center",
  },
  profileSettingsBtn: {
    height: 48,
    backgroundColor: "#731F94",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  profileSettingsBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
