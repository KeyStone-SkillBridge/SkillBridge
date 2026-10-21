import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Checklist from "../../../assets/images/CheckList.svg";
import LogoSvg from "../../../assets/images/logo.svg";
import NotificationBell from "../../../assets/images/Notifications.svg";
import Shield from "../../../assets/images/Shield.svg";
import Readiness from "../../../assets/images/SpeedGauge.svg";
import Stack from "../../../assets/images/Stak.svg";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FC" />

      {/* ================= Top Header Bar ================= */}
      <View style={styles.headerBar}>
        <View style={styles.headerBrandGroup}>
          <LogoSvg width={30} height={30} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.brandTitle}>SkillBridge</Text>
            <Text style={styles.brandSubtitle}>Nigeria Careers</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.bellBtn} hitSlop={10}>
            <NotificationBell />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileOutlineCircle}
            onPress={() => router.push("/(tabs)/profile")}
            hitSlop={8}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 1. Hero Purple Card ================= */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.inductionPill}>
              <View style={styles.whiteDot} />
              <Text style={styles.inductionPillText}>Day 1 Induction</Text>
            </View>

            <Shield width={16} height={20} />
          </View>

          <Text style={styles.heroHeadline}>
            Welcome to SkillBridge,{"\n"}Amaka! 👋
          </Text>

          <View style={styles.corridorRow}>
            <Stack width={16} height={16} />
            <Text style={styles.corridorText}>
              Junior Fintech Data Analyst • Lagos Tech Corridor
            </Text>
          </View>
        </View>

        {/* ================= 2. Onboarding Milestone Card ================= */}
        <View style={styles.card}>
          <View style={styles.milestoneHeaderRow}>
            <View style={styles.milestoneTitleGroup}>
              <View style={styles.milestoneIconWrap}>
                <Checklist />
              </View>
              <Text style={styles.milestoneHeading}>
                Onboarding{"\n"}Milestone
              </Text>
            </View>

            <Text style={styles.milestonePercentText}>60%{"\n"}Completed</Text>
          </View>

          {/* Progress Track */}
          <View style={styles.milestoneTrack}>
            <View style={styles.milestoneFill} />
          </View>

          {/* Milestone List */}
          <View style={styles.milestoneList}>
            {/* Step 1 */}
            <View style={styles.milestoneItem}>
              <View style={styles.milestoneItemLeft}>
                <Ionicons name="checkmark-circle" size={18} color="#731F94" />
                <Text style={styles.milestoneItemText}>
                  Basic Profile Survey
                </Text>
              </View>
              <Text style={styles.milestoneStatusDone}>Done</Text>
            </View>

            {/* Step 2 */}
            <View style={styles.milestoneItem}>
              <View style={styles.milestoneItemLeft}>
                <Ionicons name="checkmark-circle" size={18} color="#731F94" />
                <Text style={styles.milestoneItemText}>
                  CV Upload & AI Extraction
                </Text>
              </View>
              <Text style={styles.milestoneParsedBadge}>14 parsed</Text>
            </View>

            {/* Step 3 (Active) */}
            <TouchableOpacity
              style={[styles.milestoneItem, styles.milestoneItemActive]}
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/skills")}
            >
              <View style={styles.milestoneItemLeft}>
                <Ionicons name="radio-button-on" size={18} color="#731F94" />
                <Text style={[styles.milestoneItemText, { fontWeight: "700" }]}>
                  Take 15–Min Diagnostic
                </Text>
              </View>
              <View style={styles.upNextBadge}>
                <Text style={styles.upNextText}>Up Next</Text>
              </View>
            </TouchableOpacity>

            {/* Step 4 (Locked) */}
            <View style={styles.milestoneItem}>
              <View style={styles.milestoneItemLeft}>
                <Feather name="lock" size={16} color="#A396A6" />
                <Text style={styles.milestoneItemTextLocked}>
                  Activate 60–Day Capstone{"\n"}Roadmap
                </Text>
              </View>
              <Text style={styles.lockedText}>Locked</Text>
            </View>
          </View>
        </View>

        {/* ================= 3. Baseline Readiness Telemetry ================= */}
        <View style={styles.telemetrySectionHeader}>
          <Text style={styles.telemetrySectionTitle}>
            Baseline Readiness Telemetry
          </Text>
          <Text style={styles.realtimeSyncText}>Real–time sync</Text>
        </View>

        <View style={styles.telemetryGrid}>
          {/* Box 1: Readiness */}
          <View style={styles.telemetryBox}>
            <View style={styles.telemetryBoxTop}>
              <Text style={styles.telemetryBoxLabel}>Readiness</Text>
              <Readiness />
            </View>
            <View style={styles.telemetryNumberRow}>
              <Text style={styles.telemetryNumberBig}>48%</Text>
              <Text style={styles.telemetryNumberSub}>CV</Text>
            </View>
            <View style={styles.miniBarTrack}>
              <View style={[styles.miniBarFill, { width: "48%" }]} />
            </View>
            <Text style={styles.telemetryCaption}>📈 Unlock 85%+ via Test</Text>
          </View>

          {/* Box 2: Applications */}
          <View style={styles.telemetryBox}>
            <View style={styles.telemetryBoxTop}>
              <Text style={styles.telemetryBoxLabel}>Applications</Text>
              <Feather name="send" size={15} color="#731F94" />
            </View>
            <Text style={styles.telemetryNumberBig}>0</Text>
            <Text style={styles.telemetryCaptionGray}>
              Unlocks post Sprint 1{"\n"}Capstone
            </Text>
          </View>

          {/* Box 3: Sprint Track */}
          <View style={styles.telemetryBox}>
            <View style={styles.telemetryBoxTop}>
              <Text style={styles.telemetryBoxLabel}>Sprint Track</Text>
              <Ionicons name="calendar-outline" size={16} color="#731F94" />
            </View>
            <View style={styles.telemetryNumberRow}>
              <Text style={styles.telemetryNumberBig}>Day 1</Text>
              <Text style={styles.telemetryNumberSub}>/ 60</Text>
            </View>
            <View style={styles.telemetryTagRow}>
              <View style={styles.tinyPurpleDot} />
              <Text style={styles.telemetryTagText}>Ready to Initiate</Text>
            </View>
          </View>

          {/* Box 4: Skill Badges */}
          <View style={styles.telemetryBox}>
            <View style={styles.telemetryBoxTop}>
              <Text style={styles.telemetryBoxLabel}>Skill Badges</Text>
              <Ionicons name="trophy-outline" size={16} color="#731F94" />
            </View>
            <View style={styles.telemetryNumberRow}>
              <Text style={styles.telemetryNumberBig}>0</Text>
              <Text style={styles.telemetryNumberSub}>/ 6</Text>
            </View>
            <Text style={styles.telemetryCaptionGray}>
              Earn Level 1 in Test
            </Text>
          </View>
        </View>

        {/* ================= 4. Extracted Skills Container ================= */}
        <View style={styles.card}>
          <View style={styles.extractedHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.extractedTitle}>Extracted Skills</Text>
              <Text style={styles.extractedSubtitle}>
                Parsed from CV • Pending diagnostic verification
              </Text>
            </View>
            <MaterialCommunityIcons name="creation" size={18} color="#731F94" />
          </View>

          <View style={styles.skillsTagWrap}>
            <View style={styles.skillTagVerified}>
              <Ionicons name="checkmark" size={12} color="#731F94" />
              <Text style={styles.skillTagTextVerified}>Econometrics</Text>
            </View>

            <View style={styles.skillTagVerified}>
              <Ionicons name="checkmark" size={12} color="#731F94" />
              <Text style={styles.skillTagTextVerified}>Advanced Excel</Text>
            </View>

            <View style={styles.skillTagVerified}>
              <Ionicons name="checkmark" size={12} color="#731F94" />
              <Text style={styles.skillTagTextVerified}>
                Financial Modeling
              </Text>
            </View>

            <View style={styles.skillTagPending}>
              <Feather name="info" size={12} color="#731F94" />
              <Text style={styles.skillTagTextPending}>SQL (needs test)</Text>
            </View>

            <View style={styles.skillTagPending}>
              <Feather name="info" size={12} color="#731F94" />
              <Text style={styles.skillTagTextPending}>
                Python (needs test)
              </Text>
            </View>
          </View>
        </View>

        {/* ================= 5. Preliminary Role Matches ================= */}
        <View style={styles.card}>
          <View style={styles.roleMatchesHeaderRow}>
            <View>
              <Text style={styles.roleMatchesTitle}>
                Preliminary Role Matches
              </Text>
              <Text style={styles.roleMatchesSubtitle}>
                Lagos Fintech market compatibility
              </Text>
            </View>

            <View style={styles.lockedPill}>
              <Feather name="lock" size={11} color="#731F94" />
              <Text style={styles.lockedPillText}>Locked</Text>
            </View>
          </View>

          {/* Job Card 1: Flutterwave */}
          <View style={styles.jobCard}>
            <View style={styles.jobTopRow}>
              <View style={styles.companyLogoBox}>
                <Text style={styles.companyLogoText}>FW</Text>
              </View>
              <View style={styles.jobTitleCol}>
                <Text style={styles.jobTitleText}>
                  Junior Fintech Data Analyst
                </Text>
                <Text style={styles.jobCompanyText}>
                  Flutterwave • Victoria Island, Lagos
                </Text>
              </View>
              <Text style={styles.matchPercentText}>74% Match</Text>
            </View>

            <View style={styles.jobBottomRow}>
              <Text style={styles.salaryText}>₦280k - ₦320k / mo</Text>
              <View style={styles.validateRow}>
                <MaterialCommunityIcons
                  name="shield-search"
                  size={14}
                  color="#731F94"
                />
                <Text style={styles.validateText}>Validate via Diagnostic</Text>
              </View>
            </View>
          </View>

          {/* Job Card 2: Moniepoint */}
          <View style={styles.jobCard}>
            <View style={styles.jobTopRow}>
              <View style={styles.companyLogoBox}>
                <Text style={styles.companyLogoText}>MP</Text>
              </View>
              <View style={styles.jobTitleCol}>
                <Text style={styles.jobTitleText}>
                  Associate Analytics Engineer
                </Text>
                <Text style={styles.jobCompanyText}>
                  Moniepoint • Lekki Phase 1 / Hybrid
                </Text>
              </View>
              <Text style={styles.matchPercentText}>71% Match</Text>
            </View>

            <View style={styles.jobBottomRow}>
              <Text style={styles.salaryText}>₦260k - ₦300k / mo</Text>
              <View style={styles.validateRow}>
                <MaterialCommunityIcons
                  name="shield-search"
                  size={14}
                  color="#731F94"
                />
                <Text style={styles.validateText}>Validate via Diagnostic</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================= 6. Cohort Invitation Banner ================= */}
        <TouchableOpacity
          style={styles.cohortCard}
          activeOpacity={0.88}
          onPress={() => router.push("/upgrade")}
        >
          <View style={styles.cohortIconBox}>
            <FontAwesome5 name="users" size={18} color="#FFFFFF" />
          </View>

          <View style={styles.cohortInfoCol}>
            <Text style={styles.cohortTag}>
              Cohort Invitation • 16 spots left
            </Text>
            <Text style={styles.cohortTitle}>
              Lekki–Yaba Analyst Cohort #15
            </Text>
            <Text style={styles.cohortSubtitle}>
              Starts this Monday • Peer reviews & mock fintech interviews.
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#731F94" />
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
    paddingBottom: 12,
    backgroundColor: "#FAF8FC",
  },
  headerBrandGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1C101B",
    lineHeight: 18,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.5,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bellBtn: {
    padding: 2,
  },
  profileOutlineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#731F94",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 110,
  },

  /* 1. Hero Purple Card */
  heroCard: {
    backgroundColor: "#5C1678",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  inductionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 6,
  },
  whiteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  inductionPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroHeadline: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  corridorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  corridorText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E8D4F0",
  },

  /* Shared Card */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },

  /* 2. Onboarding Milestone Card */
  milestoneHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  milestoneTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  milestoneIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
    lineHeight: 16,
  },
  milestonePercentText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
    textAlign: "right",
    lineHeight: 14,
  },
  milestoneTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F0E5F7",
    overflow: "hidden",
    marginBottom: 16,
  },
  milestoneFill: {
    width: "60%",
    height: "100%",
    backgroundColor: "#731F94",
    borderRadius: 3,
  },
  milestoneList: {
    gap: 12,
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  milestoneItemActive: {
    backgroundColor: "#F8F4FC",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
  },
  milestoneItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  milestoneItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#131B2A",
  },
  milestoneItemTextLocked: {
    fontSize: 12,
    fontWeight: "500",
    color: "#A396A6",
    lineHeight: 16,
  },
  milestoneStatusDone: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7B6F84",
  },
  milestoneParsedBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
    backgroundColor: "#F5EEFC",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  upNextBadge: {
    backgroundColor: "#731F94",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  upNextText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  lockedText: {
    fontSize: 11,
    color: "#A396A6",
    fontWeight: "500",
  },

  /* 3. Telemetry Grid */
  telemetrySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
  },
  telemetrySectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#131B2A",
  },
  realtimeSyncText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#7B6F84",
  },
  telemetryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  telemetryBox: {
    width: "48.4%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  telemetryBoxTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  telemetryBoxLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#131B2A",
  },
  telemetryNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  telemetryNumberBig: {
    fontSize: 20,
    fontWeight: "800",
    color: "#131B2A",
  },
  telemetryNumberSub: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
    marginLeft: 4,
  },
  miniBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F0E5F7",
    overflow: "hidden",
    marginBottom: 6,
  },
  miniBarFill: {
    height: "100%",
    backgroundColor: "#731F94",
    borderRadius: 2,
  },
  telemetryCaption: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
  },
  telemetryCaptionGray: {
    fontSize: 9,
    color: "#7B6F84",
    lineHeight: 12,
    marginTop: 4,
  },
  telemetryTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  tinyPurpleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#731F94",
  },
  telemetryTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
  },

  /* 4. Extracted Skills */
  extractedHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  extractedTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
  },
  extractedSubtitle: {
    fontSize: 10,
    color: "#7B6F84",
    marginTop: 2,
  },
  skillsTagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTagVerified: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5EEFC",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 4,
  },
  skillTagTextVerified: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  skillTagPending: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF5FF",
    borderWidth: 1,
    borderColor: "#EBDDF7",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 4,
  },
  skillTagTextPending: {
    fontSize: 11,
    fontWeight: "600",
    color: "#731F94",
  },

  /* 5. Preliminary Role Matches */
  roleMatchesHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  roleMatchesTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
  },
  roleMatchesSubtitle: {
    fontSize: 10,
    color: "#7B6F84",
    marginTop: 1,
  },
  lockedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5EEFC",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  lockedPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },
  jobCard: {
    backgroundColor: "#F8F4FC",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  jobTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  companyLogoBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#EAE0F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  companyLogoText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#731F94",
  },
  jobTitleCol: {
    flex: 1,
  },
  jobTitleText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#131B2A",
  },
  jobCompanyText: {
    fontSize: 10,
    color: "#7B6F84",
    marginTop: 2,
  },
  matchPercentText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
  },
  jobBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EFE5F7",
    paddingTop: 8,
  },
  salaryText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#131B2A",
  },
  validateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  validateText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },

  /* 6. Cohort Invitation */
  cohortCard: {
    backgroundColor: "#F6EFFC",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cohortIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#731F94",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cohortInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  cohortTag: {
    fontSize: 9,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.3,
  },
  cohortTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#131B2A",
    marginTop: 2,
  },
  cohortSubtitle: {
    fontSize: 10,
    color: "#7B6F84",
    lineHeight: 14,
    marginTop: 2,
  },
});
