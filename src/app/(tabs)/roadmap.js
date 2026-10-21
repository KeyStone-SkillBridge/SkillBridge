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
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import LogoSvg from "../../../assets/images/logo.svg"; // Points to your downloaded logo SVG asset

const COACH_AVATAR = require("../../../assets/images/TundeAlabi.png"); // Points to your downloaded coach image asset

export default function RoadmapScreen() {
  const router = useRouter();
  const [selectedMonthTab, setSelectedMonthTab] = useState(1);

  // 88% Role Match Circular Ring
  const circleSize = 52;
  const strokeWidth = 4.5;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const matchValue = 0.88;
  const strokeDashoffset = circumference - circumference * matchValue;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FC" />

      {/* ================= Header Bar ================= */}
      <View style={styles.headerBar}>
        <View style={styles.headerBrandGroup}>
          <LogoSvg width={30} height={30} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.brandTitle}>SkillBridge</Text>
            <Text style={styles.brandSubtitle}>ROADMAP</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.bellBtn} hitSlop={10}>
            <Ionicons name="notifications-outline" size={22} color="#1C101B" />
            <View style={styles.bellDot} />
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
        {/* ================= 1. Calibrated Target Track Card ================= */}
        <View style={styles.targetCard}>
          <View style={styles.targetTopRow}>
            <View style={styles.targetLeftCol}>
              <View style={styles.calibratedPill}>
                <Ionicons name="star" size={11} color="#731F94" />
                <Text style={styles.calibratedPillText}>
                  TARGET TRACK CALIBRATED
                </Text>
              </View>
              <Text style={styles.targetRoleText}>
                Junior Fintech Data Analyst
              </Text>
            </View>

            {/* Circular Gauge */}
            <View style={styles.matchGaugeWrap}>
              <View style={styles.circularContainer}>
                <Svg width={circleSize} height={circleSize}>
                  <Circle
                    stroke="#EFE5F7"
                    fill="none"
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                  />
                  <Circle
                    stroke="#731F94"
                    fill="none"
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
                  />
                </Svg>
                <View style={styles.gaugeInnerLabel}>
                  <Text style={styles.gaugePercentText}>88%</Text>
                </View>
              </View>
              <Text style={styles.roleMatchLabel}>ROLE MATCH</Text>
            </View>
          </View>

          {/* Coach Tade AI Lead Row */}
          <View style={styles.coachRow}>
            <View style={styles.coachAvatarWrap}>
              <Image
                source={COACH_AVATAR}
                style={styles.coachAvatar}
                resizeMode="cover"
              />
              <View style={styles.coachOnlineBadge} />
            </View>

            <View style={styles.coachMetaCol}>
              <View style={styles.coachNameRow}>
                <Text style={styles.coachName}>Coach Tade</Text>
                <View style={styles.aiLeadBadge}>
                  <Text style={styles.aiLeadText}>AI Lead</Text>
                </View>
              </View>
              <Text style={styles.coachQuote}>"You're 2 modules away!"</Text>
            </View>

            <TouchableOpacity
              style={styles.askBtn}
              onPress={() =>
                Alert.alert("Coach Tade", "Opening AI study coach chat...")
              }
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-outline" size={13} color="#731F94" />
              <Text style={styles.askBtnText}>Ask</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 2. Pace Tracker Card ================= */}
        <View style={styles.card}>
          <Text style={styles.paceOverline}>PACE TRACKER</Text>
          <View style={styles.paceHeaderRow}>
            <Text style={styles.paceDaysText}>Day 14 of 60</Text>
            <View style={styles.sprintPill}>
              <Text style={styles.sprintPillText}>Sprint 2 of 8</Text>
            </View>
            <Text style={styles.pacePercentText}>38%</Text>
          </View>

          {/* 3-Segment Timeline Progress Bar */}
          <View style={styles.segmentedProgressBar}>
            <View style={[styles.barSegment, styles.segmentActive]} />
            <View style={[styles.barSegment, styles.segmentMid]} />
            <View style={[styles.barSegment, styles.segmentInactive]} />
          </View>

          <View style={styles.segmentLabelsRow}>
            <View style={styles.activeLabelDotWrap}>
              <View style={styles.purpleTinyDot} />
              <Text style={styles.segmentLabelActive}>
                Month 1: SQL{"\n"}Foundations
              </Text>
            </View>
            <Text style={styles.segmentLabelInactive}>
              Month 2:{"\n"}Capstones
            </Text>
            <Text style={styles.segmentLabelInactive}>
              Month 3: Recruiter{"\n"}Pipeline
            </Text>
          </View>
        </View>

        {/* ================= 3. Month Horizon Tabs ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthTabsRow}
        >
          <TouchableOpacity
            style={[
              styles.monthTab,
              selectedMonthTab === 1
                ? styles.monthTabActive
                : styles.monthTabInactive,
            ]}
            onPress={() => setSelectedMonthTab(1)}
            activeOpacity={0.85}
          >
            <View
              style={
                selectedMonthTab === 1
                  ? styles.monthNumberBoxActive
                  : styles.monthNumberBoxInactive
              }
            >
              <Text
                style={
                  selectedMonthTab === 1
                    ? styles.monthNumberTextActive
                    : styles.monthNumberTextInactive
                }
              >
                1
              </Text>
            </View>
            <View>
              <Text
                style={
                  selectedMonthTab === 1
                    ? styles.monthDaysLabelActive
                    : styles.monthDaysLabelInactive
                }
              >
                DAYS 1–30 •
              </Text>
              <Text
                style={
                  selectedMonthTab === 1
                    ? styles.monthTabTitleActive
                    : styles.monthTabTitleInactive
                }
              >
                Month 1: SQL Core
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.monthTab,
              selectedMonthTab === 2
                ? styles.monthTabActive
                : styles.monthTabInactive,
            ]}
            onPress={() => setSelectedMonthTab(2)}
            activeOpacity={0.85}
          >
            <View
              style={
                selectedMonthTab === 2
                  ? styles.monthNumberBoxActive
                  : styles.monthNumberBoxInactive
              }
            >
              <Text
                style={
                  selectedMonthTab === 2
                    ? styles.monthNumberTextActive
                    : styles.monthNumberTextInactive
                }
              >
                2
              </Text>
            </View>
            <View>
              <Text
                style={
                  selectedMonthTab === 2
                    ? styles.monthDaysLabelActive
                    : styles.monthDaysLabelInactive
                }
              >
                DAYS 31–60
              </Text>
              <Text
                style={
                  selectedMonthTab === 2
                    ? styles.monthTabTitleActive
                    : styles.monthTabTitleInactive
                }
              >
                Month 2: Capstones
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* ================= 4. Month 1: Production SQL Curriculum ================= */}
        <View style={styles.curriculumSectionHeader}>
          <Text style={styles.curriculumTitle}>
            Month 1: Production{"\n"}SQL
          </Text>
          <View style={{ alignItems: "flex-end" }}>
            <View style={styles.inProgressPill}>
              <Text style={styles.inProgressText}>In Progress</Text>
            </View>
            <Text style={styles.durationSubText}>4 Weeks</Text>
          </View>
        </View>

        {/* Week 1 (Done) */}
        <View style={styles.card}>
          <View style={styles.weekTopRow}>
            <View style={styles.verifiedCheckWrap}>
              <Ionicons name="checkmark" size={14} color="#0D8A58" />
            </View>
            <Text style={styles.weekNumberText}>WEEK 1</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="ribbon-outline" size={11} color="#0D8A58" />
              <Text style={styles.verifiedBadgeText}>
                Verified Badge Earned
              </Text>
            </View>
          </View>

          <Text style={styles.moduleTitle}>
            PostgreSQL Architecture & Relational Modeling
          </Text>
          <Text style={styles.moduleDescription}>
            Normal forms, indexing structures, ledger table constraints, and
            ACID guarantees for fintech databases.
          </Text>
        </View>

        {/* Week 2 (Current Active Sprint) */}
        <View style={styles.currentSprintBorderWrap}>
          <View style={styles.currentSprintTag}>
            <View style={styles.whiteTinyDot} />
            <Text style={styles.currentSprintTagText}>CURRENT SPRINT</Text>
          </View>

          <View style={styles.weekTopRow}>
            <View style={styles.activePlayWrap}>
              <Ionicons name="play" size={13} color="#731F94" />
            </View>
            <Text style={styles.weekActiveLabel}>WEEK 2 • ACTIVE NOW</Text>
          </View>

          <Text style={styles.moduleTitle}>
            Complex Queries, CTEs & Window Functions
          </Text>
          <Text style={styles.moduleDescription}>
            Running totals, lead/lag sessionization, cohort partitioning, and
            Flutterwave merchant daily settlement scripts.
          </Text>

          {/* Mini Sprint Progress Box */}
          <View style={styles.sprintProgressCard}>
            <View style={styles.sprintProgressHeader}>
              <View style={styles.sprintProgressLabelRow}>
                <MaterialCommunityIcons
                  name="chart-box-outline"
                  size={15}
                  color="#731F94"
                />
                <Text style={styles.sprintProgressHeading}>
                  Sprint Completion
                </Text>
              </View>
              <Text style={styles.sprintProgressStat}>
                70% finished (2 left)
              </Text>
            </View>

            <View style={styles.sprintBarTrack}>
              <View style={[styles.sprintBarFill, { width: "70%" }]} />
            </View>

            <View style={styles.sprintFooterRow}>
              <Text style={styles.nextTopicText}>
                Next: Multi-stage CTE Optimizations
              </Text>
              <Text style={styles.estTimeText}>Est. 45 mins</Text>
            </View>
          </View>

          {/* Resume Action Buttons */}
          <View style={styles.actionBtnRow}>
            <TouchableOpacity
              style={styles.resumeBtn}
              activeOpacity={0.88}
              onPress={() =>
                Alert.alert(
                  "SQL Sandbox",
                  "Launching live PostgreSQL sandbox session...",
                )
              }
            >
              <Ionicons name="terminal" size={16} color="#FFFFFF" />
              <Text style={styles.resumeBtnText}>Resume SQL Sandbox</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpCircleBtn} hitSlop={10}>
              <Feather name="help-circle" size={18} color="#731F94" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Week 3 (Locked) */}
        <View style={styles.card}>
          <View style={styles.weekTopRow}>
            <View style={styles.clockIconWrap}>
              <Ionicons name="time-outline" size={15} color="#731F94" />
            </View>
            <Text style={styles.weekNumberText}>WEEK 3</Text>
            <View style={styles.unlocksBadge}>
              <Feather name="lock" size={10} color="#556070" />
              <Text style={styles.unlocksBadgeText}>Unlocks in 3 days</Text>
            </View>
          </View>

          <Text style={styles.moduleTitle}>
            Cohort Retention & Churn Modeling
          </Text>
          <Text style={styles.moduleDescription}>
            Build quarterly active user (QAU) retention curves and identify
            high-value customer drop-off inflection points.
          </Text>
        </View>

        {/* Month 1 Capstone Card */}
        <View style={styles.capstoneCard}>
          <View style={styles.capstoneHeaderRow}>
            <View style={styles.capstoneBadge}>
              <Text style={styles.capstoneBadgeText}>MONTH 1 CAPSTONE</Text>
            </View>
            <View style={styles.busIconWrap}>
              <MaterialCommunityIcons name="bus" size={20} color="#731F94" />
            </View>
          </View>

          <Text style={styles.capstoneTitle}>
            Lagos Commute BRT Fare Anomaly Detection
          </Text>
          <Text style={styles.capstoneDescription}>
            Audit 1.2M automated terminal transactions across Ikorodu and CMS
            routes to flag card-cloning fraud.
          </Text>

          <View style={styles.capstoneFooterRow}>
            <View style={styles.capstoneChipsGroup}>
              <View style={styles.techPill}>
                <Text style={styles.techPillText}>PostgreSQL</Text>
              </View>
              <View style={styles.techPill}>
                <Text style={styles.techPillText}>Supabase</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.rubricBtn}>
              <Text style={styles.rubricBtnText}>Preview Rubric</Text>
              <Feather name="chevron-right" size={13} color="#731F94" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 5. Upcoming Milestones ================= */}
        <View style={styles.upcomingHeaderRow}>
          <Text style={styles.upcomingTitle}>Upcoming Milestones</Text>
          <Text style={styles.visionText}>Full 90–Day Vision</Text>
        </View>

        {/* Month 2 Milestone Preview */}
        <View style={styles.card}>
          <View style={styles.milestoneTopRow}>
            <View style={styles.milestoneIconSquare}>
              <FontAwesome5 name="university" size={14} color="#731F94" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.milestonePeriodText}>
                MONTH 2 (DAYS 31–60)
              </Text>
            </View>
            <View style={styles.lockedPreviewBadge}>
              <Feather name="lock" size={10} color="#556070" />
              <Text style={styles.lockedPreviewText}>Locked Preview</Text>
            </View>
          </View>

          <Text style={styles.milestoneHeadingText}>
            Fintech Production Capstone & API Integration
          </Text>
          <Text style={styles.milestoneBodyText}>
            Microservice ledger auditing, real-time Streamlit interactive fraud
            investigation dashboard, and Airflow orchestrations.
          </Text>

          <View style={styles.miniChipsRow}>
            <View style={styles.miniTechPill}>
              <Text style={styles.miniTechText}>Streamlit</Text>
            </View>
            <View style={styles.miniTechPill}>
              <Text style={styles.miniTechText}>Apache Airflow</Text>
            </View>
            <View style={styles.miniTechPill}>
              <Text style={styles.miniTechText}>FastAPI</Text>
            </View>
          </View>
        </View>

        {/* Month 3 Milestone Preview */}
        <View style={styles.card}>
          <View style={styles.milestoneTopRow}>
            <View style={styles.milestoneIconSquare}>
              <MaterialCommunityIcons
                name="handshake-outline"
                size={18}
                color="#731F94"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.milestonePeriodText}>
                MONTH 3 (DAYS 61–90)
              </Text>
            </View>
            <View style={styles.fastTrackBadge}>
              <Text style={styles.fastTrackText}>Fast–Track</Text>
            </View>
          </View>

          <Text style={styles.milestoneHeadingText}>
            Recruiter Fast–Track & Technical Interviews
          </Text>

          <View style={styles.hiringBannerBox}>
            <FontAwesome5 name="users" size={14} color="#731F94" />
            <Text style={styles.hiringBannerLabel}>Hiring Partners Ready</Text>
            <Text style={styles.guaranteedBadge}>Guaranteed Review</Text>
          </View>
        </View>

        {/* ================= 6. Cohort Office Hours Card ================= */}
        <View style={styles.officeHoursCard}>
          <View style={styles.officeHoursIconBox}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={20}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.officeHoursInfo}>
            <Text style={styles.officeHoursTitle}>Cohort Office Hours</Text>
            <Text style={styles.officeHoursSubtitle}>
              7:00 PM (WAT) with Lead Engineer Bimbo
            </Text>
          </View>

          <TouchableOpacity
            style={styles.joinRoomBtn}
            onPress={() =>
              Alert.alert("Cohort Live Room", "Joining video call room...")
            }
          >
            <Text style={styles.joinRoomText}>Join Room</Text>
          </TouchableOpacity>
        </View>

        {/* ================= 7. Bottom Workspace CTA ================= */}
        <TouchableOpacity
          style={styles.workspaceBtn}
          activeOpacity={0.88}
          onPress={() => router.push("/(tabs)/learn")}
        >
          <Text style={styles.workspaceBtnText}>View Project Workspace</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
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
    paddingTop: 8,
    paddingBottom: 110,
  },

  /* 1. Target Card */
  targetCard: {
    backgroundColor: "#F5EEFC",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  targetTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  targetLeftCol: {
    flex: 1,
    marginRight: 10,
  },
  calibratedPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBE0F7",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
    marginBottom: 6,
  },
  calibratedPillText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.3,
  },
  targetRoleText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#131B2A",
    lineHeight: 22,
  },
  matchGaugeWrap: {
    alignItems: "center",
    width: 60,
  },
  circularContainer: {
    position: "relative",
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeInnerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugePercentText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#731F94",
  },
  roleMatchLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#7B6F84",
    letterSpacing: 0.3,
    marginTop: 2,
    textAlign: "center",
  },
  coachRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
  },
  coachAvatarWrap: {
    position: "relative",
    marginRight: 10,
  },
  coachAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E6D7F6",
  },
  coachOnlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0D8A58",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  coachMetaCol: {
    flex: 1,
  },
  coachNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  coachName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#131B2A",
  },
  aiLeadBadge: {
    backgroundColor: "#EBE0F7",
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  aiLeadText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
  },
  coachQuote: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 1,
  },
  askBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5EEFC",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },
  askBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },

  /* Shared Card */
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

  /* 2. Pace Tracker */
  paceOverline: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7B6F84",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  paceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  paceDaysText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#131B2A",
  },
  sprintPill: {
    backgroundColor: "#EBE0F7",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  sprintPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },
  pacePercentText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#731F94",
  },
  segmentedProgressBar: {
    flexDirection: "row",
    height: 6,
    gap: 4,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  barSegment: {
    flex: 1,
    height: "100%",
    borderRadius: 3,
  },
  segmentActive: {
    backgroundColor: "#731F94",
  },
  segmentMid: {
    backgroundColor: "#E8D4F0",
  },
  segmentInactive: {
    backgroundColor: "#F0EAF5",
  },
  segmentLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  activeLabelDotWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  purpleTinyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#731F94",
    marginTop: 4,
  },
  segmentLabelActive: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
    lineHeight: 12,
  },
  segmentLabelInactive: {
    fontSize: 9,
    color: "#7B6F84",
    lineHeight: 12,
  },

  /* 3. Month Horizon Tabs */
  monthTabsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  monthTab: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  monthTabActive: {
    backgroundColor: "#6A1B87",
  },
  monthTabInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE5F7",
  },
  monthNumberBoxActive: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  monthNumberTextActive: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  monthNumberBoxInactive: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  monthNumberTextInactive: {
    fontSize: 12,
    fontWeight: "800",
    color: "#731F94",
  },
  monthDaysLabelActive: {
    fontSize: 9,
    fontWeight: "800",
    color: "#ECC538",
  },
  monthDaysLabelInactive: {
    fontSize: 9,
    fontWeight: "700",
    color: "#7B6F84",
  },
  monthTabTitleActive: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  monthTabTitleInactive: {
    fontSize: 12,
    fontWeight: "700",
    color: "#131B2A",
  },

  /* 4. Curriculum Section */
  curriculumSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  curriculumTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#131B2A",
    lineHeight: 22,
  },
  inProgressPill: {
    backgroundColor: "#F0E5F7",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  inProgressText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },
  durationSubText: {
    fontSize: 10,
    color: "#7B6F84",
    marginTop: 2,
  },

  /* Week Rows */
  weekTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  verifiedCheckWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#E6F4EA",
    alignItems: "center",
    justifyContent: "center",
  },
  weekNumberText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#131B2A",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 4,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#0D8A58",
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#131B2A",
    lineHeight: 18,
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 11,
    color: "#556070",
    lineHeight: 16,
  },

  /* Active Current Sprint Box */
  currentSprintBorderWrap: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.4,
    borderColor: "#731F94",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: "relative",
  },
  currentSprintTag: {
    position: "absolute",
    top: -10,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#731F94",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  whiteTinyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  currentSprintTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  activePlayWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  weekActiveLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
  },
  sprintProgressCard: {
    backgroundColor: "#FAF5FC",
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  sprintProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sprintProgressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sprintProgressHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: "#131B2A",
  },
  sprintProgressStat: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },
  sprintBarTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#EBE0F7",
    overflow: "hidden",
    marginBottom: 6,
  },
  sprintBarFill: {
    height: "100%",
    backgroundColor: "#731F94",
    borderRadius: 2.5,
  },
  sprintFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nextTopicText: {
    fontSize: 9,
    color: "#556070",
  },
  estTimeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#131B2A",
  },
  actionBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resumeBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#731F94",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  resumeBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  helpCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Week 3 Locked */
  clockIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  unlocksBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EAF5",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 4,
  },
  unlocksBadgeText: {
    fontSize: 9,
    color: "#556070",
    fontWeight: "600",
  },

  /* Capstone Card */
  capstoneCard: {
    backgroundColor: "#F5EEFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  capstoneHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  capstoneBadge: {
    backgroundColor: "#731F94",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  capstoneBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  busIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  capstoneTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#131B2A",
    marginBottom: 4,
  },
  capstoneDescription: {
    fontSize: 11,
    color: "#556070",
    lineHeight: 16,
    marginBottom: 12,
  },
  capstoneFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  capstoneChipsGroup: {
    flexDirection: "row",
    gap: 6,
  },
  techPill: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  techPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#131B2A",
  },
  rubricBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  rubricBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },

  /* 5. Upcoming Milestones */
  upcomingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  upcomingTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#131B2A",
  },
  visionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  milestoneTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  milestoneIconSquare: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  milestonePeriodText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#556070",
    letterSpacing: 0.3,
  },
  lockedPreviewBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EAF5",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 3,
  },
  lockedPreviewText: {
    fontSize: 9,
    color: "#556070",
    fontWeight: "600",
  },
  fastTrackBadge: {
    backgroundColor: "#F0E5F7",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  fastTrackText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
  },
  milestoneHeadingText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
    marginBottom: 4,
  },
  milestoneBodyText: {
    fontSize: 11,
    color: "#556070",
    lineHeight: 16,
    marginBottom: 10,
  },
  miniChipsRow: {
    flexDirection: "row",
    gap: 6,
  },
  miniTechPill: {
    backgroundColor: "#F0EAF5",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  miniTechText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#556070",
  },
  hiringBannerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF5FC",
    borderRadius: 8,
    padding: 8,
    gap: 8,
    marginTop: 6,
  },
  hiringBannerLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#131B2A",
  },
  guaranteedBadge: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
  },

  /* 6. Cohort Office Hours */
  officeHoursCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBE0F7",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  officeHoursIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#731F94",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  officeHoursInfo: {
    flex: 1,
  },
  officeHoursTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#131B2A",
  },
  officeHoursSubtitle: {
    fontSize: 10,
    color: "#556070",
    marginTop: 1,
  },
  joinRoomBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  joinRoomText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#731F94",
  },

  /* 7. Bottom Workspace CTA */
  workspaceBtn: {
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
  workspaceBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
