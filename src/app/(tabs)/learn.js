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
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import LogoSvg from "../../../assets/images/logo.svg";

export default function LearnScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("modules"); // 'modules' | 'certs'

  // 4/6 Pathway Gauge
  const circleSize = 52;
  const strokeWidth = 4.5;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pathwayRatio = 4 / 6;
  const strokeDashoffset = circumference - circumference * pathwayRatio;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FC" />

      {/* ================= Top Header Bar ================= */}
      <View style={styles.headerBar}>
        <View style={styles.headerBrandGroup}>
          <LogoSvg width={30} height={30} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.brandTitle}>SkillBridge</Text>
            <Text style={styles.brandSubtitle}>Learning</Text>
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
        {/* ================= Breadcrumb & Title ================= */}
        <View style={styles.titleSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.breadcrumbText}>
              PATHWAYS & BADGES{" "}
              <Text style={styles.breadcrumbSub}>› Fintech Core</Text>
            </Text>
            <Text style={styles.pageTitle}>Learning & Certs</Text>
            <Text style={styles.targetTrackText}>
              Target Track:{" "}
              <Text style={styles.targetTrackValue}>
                Junior Fintech Data Analyst
              </Text>
            </Text>
          </View>

          <View style={styles.titleIconBadge}>
            <MaterialCommunityIcons
              name="certificate-outline"
              size={22}
              color="#731F94"
            />
          </View>
        </View>

        {/* ================= 1. Certification Pathway Card ================= */}
        <View style={styles.card}>
          <View style={styles.pathwayTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pathwayOverline}>CERTIFICATION PATHWAY</Text>
              <View style={styles.percentRow}>
                <Text style={styles.percentBig}>65%</Text>
                <Text style={styles.percentLabel}>Completed</Text>
              </View>
            </View>

            {/* Circular Gauge */}
            <View style={styles.gaugeContainer}>
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
              <View style={styles.gaugeCenterLabel}>
                <Text style={styles.gaugeFractionText}>4/6</Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.pathwayBarTrack}>
            <View style={styles.pathwayBarFill} />
          </View>

          {/* Key Metric Counters */}
          <View style={styles.pathwayMetricsRow}>
            <View style={styles.metricItem}>
              <Ionicons name="checkmark-circle" size={15} color="#731F94" />
              <Text style={styles.metricText}>4 of 6 Modules Done</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="ribbon-outline" size={15} color="#731F94" />
              <Text style={styles.metricText}>2 Certifications Earned</Text>
            </View>
          </View>

          {/* Streak Banner */}
          <View style={styles.streakBanner}>
            <View style={styles.streakLeft}>
              <MaterialCommunityIcons name="fire" size={16} color="#731F94" />
              <Text style={styles.streakBold}>12–Day Study Streak</Text>
            </View>
            <View style={styles.streakDot} />
            <Text style={styles.streakHoursText}>
              18.5 hrs logged this sprint
            </Text>
          </View>
        </View>

        {/* ================= 2. Horizontal Filter Tabs ================= */}
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === "modules" && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter("modules")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === "modules" && styles.filterPillTextActive,
              ]}
            >
              Core Modules (6)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === "certs" && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter("certs")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === "certs" && styles.filterPillTextActive,
              ]}
            >
              Industry Certifications (3)
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= 3. Active Module 3 Card ================= */}
        <View style={styles.card}>
          <View style={styles.moduleBadgesRow}>
            <View style={styles.activeSprintBadge}>
              <Text style={styles.activeSprintText}>
                ACTIVE NOW • SPRINT WK 3
              </Text>
            </View>

            <View style={styles.timeEstBadge}>
              <Feather name="clock" size={12} color="#556070" />
              <Text style={styles.timeEstText}>45 mins left</Text>
            </View>
          </View>

          <Text style={styles.activeModuleTitle}>
            Module 3: Advanced SQL Window Functions & Ledger Reconciliation
          </Text>

          <View style={styles.coDevelopedRow}>
            <FontAwesome5 name="building" size={12} color="#731F94" />
            <Text style={styles.coDevelopedText}>
              Co-developed with Flutterwave Engineering
            </Text>
          </View>

          {/* Module Progress Checklist Box */}
          <View style={styles.lessonListBox}>
            <View style={styles.lessonListHeader}>
              <Text style={styles.lessonProgressTitle}>Module Progress</Text>
              <Text style={styles.lessonProgressCount}>
                3 of 5 lessons done
              </Text>
            </View>

            {/* Lesson 3.1 */}
            <View style={styles.lessonRow}>
              <Ionicons name="checkmark-circle" size={16} color="#731F94" />
              <Text style={styles.lessonTitleDone}>
                3.1: Running Totals & Cumulative Balances
              </Text>
              <Text style={styles.lessonDuration}>15m</Text>
            </View>

            {/* Lesson 3.2 */}
            <View style={styles.lessonRow}>
              <Ionicons name="checkmark-circle" size={16} color="#731F94" />
              <Text style={styles.lessonTitleDone}>
                3.2: Partitioning by Merchant ID
              </Text>
              <Text style={styles.lessonDuration}>20m</Text>
            </View>

            {/* Lesson 3.3 (Current) */}
            <View style={[styles.lessonRow, styles.lessonRowCurrent]}>
              <Ionicons name="radio-button-on" size={16} color="#731F94" />
              <Text style={styles.lessonTitleCurrent}>
                3.3: LEAD / LAG for Transaction Latency
              </Text>
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>CURRENT</Text>
              </View>
            </View>

            {/* Lesson 3.4 (Locked) */}
            <View style={styles.lessonRow}>
              <Feather name="lock" size={14} color="#A396A6" />
              <Text style={styles.lessonTitleLocked}>
                3.4: Edge Case Reconciliation Simulation
              </Text>
              <Text style={styles.lessonDuration}>30m</Text>
            </View>
          </View>

          {/* CTAs */}
          <TouchableOpacity
            style={styles.resumeModuleBtn}
            activeOpacity={0.88}
            onPress={() =>
              Alert.alert("Cloud Sandbox", "Opening live sandbox terminal...")
            }
          >
            <Ionicons name="terminal" size={16} color="#FFFFFF" />
            <Text style={styles.resumeModuleBtnText}>
              Resume Module & Cloud Sandbox
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.lessonNotesBtn}
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert(
                "Lesson Notes",
                "Fetching schema definitions and DDL scripts...",
              )
            }
          >
            <Feather name="file-text" size={15} color="#731F94" />
            <Text style={styles.lessonNotesBtnText}>
              View Lesson Notes & Schema DDL
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= 4. Upcoming Modules Section ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Upcoming Modules</Text>
          <Feather name="clock" size={14} color="#556070" />
        </View>

        {/* Module 4 Card */}
        <View style={styles.card}>
          <View style={styles.upcomingBadgeRow}>
            <View style={styles.moduleNumberPill}>
              <Text style={styles.moduleNumberText}>Module 4</Text>
            </View>
            <Text style={styles.unlocksText}>Unlocks in 2 days</Text>
          </View>

          <Text style={styles.moduleCardTitle}>
            Financial Crime & Anomaly Detection with Python Pandas
          </Text>
          <Text style={styles.moduleCardDescription}>
            Identify fraudulent spike heuristics across transaction streams
            using z-score normalization.
          </Text>

          <View style={styles.moduleCardFooter}>
            <View style={styles.metaRow}>
              <Feather name="clock" size={12} color="#7B6F84" />
              <Text style={styles.metaText}>4.5 hrs total</Text>
            </View>
            <Text style={styles.metaText}>Partner: Moniepoint</Text>
          </View>
        </View>

        {/* Module 5 Card */}
        <View style={styles.card}>
          <View style={styles.upcomingBadgeRow}>
            <View style={styles.moduleNumberPill}>
              <Text style={styles.moduleNumberText}>Module 5</Text>
            </View>
            <View style={styles.metaRow}>
              <Feather name="lock" size={10} color="#7B6F84" />
              <Text style={styles.metaText}>Prerequisite: Mod 3</Text>
            </View>
          </View>

          <Text style={styles.moduleCardTitle}>
            Automated dbt Data Pipelines for FinTech
          </Text>
          <Text style={styles.moduleCardDescription}>
            Transform raw payment gateway events into verified Kimball
            dimensional data models.
          </Text>

          <View style={styles.moduleCardFooter}>
            <View style={styles.metaRow}>
              <Feather name="clock" size={12} color="#7B6F84" />
              <Text style={styles.metaText}>6.0 hrs total</Text>
            </View>
            <Text style={styles.metaText}>Live CI/CD testing</Text>
          </View>
        </View>

        {/* Available Track Card */}
        <View style={styles.card}>
          <View style={styles.upcomingBadgeRow}>
            <View style={styles.moduleNumberPill}>
              <Text style={styles.moduleNumberText}>AVAILABLE TRACK</Text>
            </View>
            <Feather name="lock" size={14} color="#7B6F84" />
          </View>

          <Text style={styles.moduleCardTitle}>
            Advanced Python Financial Engineering
          </Text>
          <Text style={styles.moduleCardDescription}>
            Master algorithmic trade analytics, risk-adjusted returns modeling,
            and automated reconciliation.
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Requires 4 modules</Text>
            <View style={styles.streakDot} />
            <Text style={styles.metaText}>20 hrs hands-on labs</Text>
          </View>
        </View>

        {/* ================= 5. Verified Partner Certifications ================= */}
        <Text style={styles.sectionTitle}>Verified Partner Certifications</Text>
        <Text style={styles.sectionSubtitle}>
          Cryptographically signed credentials vetted by Tier-1 FinTechs &
          Nigerian Commercial Banks.
        </Text>

        {/* Certificate 1: SQL Specialist (Earned) */}
        <View style={styles.card}>
          <View style={styles.certTopRow}>
            <View style={styles.certIconSquarePurple}>
              <MaterialCommunityIcons
                name="certificate"
                size={24}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.earnedBadge}>
                <Text style={styles.earnedBadgeText}>EARNED & ACTIVE</Text>
              </View>
              <Text style={styles.certTitle}>
                SkillBridge Certified SQL Data Specialist
              </Text>
              <Text style={styles.certSub}>
                Issued Oct 2024 • UNILAG Deanery Validated
              </Text>
            </View>
          </View>

          {/* Blockchain Node Details */}
          <View style={styles.blockchainBox}>
            <View style={styles.blockchainRow}>
              <Text style={styles.blockchainLabel}>Credential ID</Text>
              <Text style={styles.blockchainValueBold}>#SKB-9841-A0</Text>
            </View>
            <View style={styles.blockchainRow}>
              <Text style={styles.blockchainLabel}>Verification Node</Text>
              <Text style={styles.blockchainValue}>
                Polygon Mainnet (Hash: 0x7b2f...e9)
              </Text>
            </View>
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={14} color="#731F94" />
              <Text style={styles.verifiedText}>
                Verified on Blockchain & LinkedIn
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.certBtnRow}>
            <TouchableOpacity
              style={styles.viewPdfBtn}
              onPress={() =>
                Alert.alert(
                  "Credential",
                  "Downloading official credential PDF...",
                )
              }
            >
              <Feather name="download" size={14} color="#731F94" />
              <Text style={styles.viewPdfText}>View PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBadgeBtn}
              onPress={() =>
                Alert.alert("Share", "Sharing verified badge to LinkedIn...")
              }
            >
              <Feather name="share-2" size={14} color="#FFFFFF" />
              <Text style={styles.shareBadgeText}>Share Badge</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Certificate 2: Lagos Fintech Associate (In Progress) */}
        <View style={styles.card}>
          <View style={styles.certTopRow}>
            <View style={styles.certIconSquareLavender}>
              <Ionicons name="ribbon-outline" size={24} color="#731F94" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.inProgressBadge}>
                <Text style={styles.inProgressBadgeText}>
                  IN PROGRESS (80%)
                </Text>
              </View>
              <Text style={styles.certTitle}>
                Lagos Fintech Associate Analytics Certification (Level 1)
              </Text>
              <Text style={styles.certSub}>
                Endorsed by Sterling Bank, Flutterwave & Moniepoint
              </Text>
            </View>
          </View>

          {/* Progress Track */}
          <View style={styles.pathwayBarTrack}>
            <View style={[styles.pathwayBarFill, { width: "80%" }]} />
          </View>

          {/* Checklist */}
          <View style={styles.certChecklist}>
            <View style={styles.checkItemRow}>
              <Ionicons name="checkmark-circle" size={15} color="#0D8A58" />
              <Text style={styles.checkItemLabel}>Pass Diagnostic Test</Text>
              <Text style={styles.checkItemValueGreen}>PASSED (94%)</Text>
            </View>

            <View style={styles.checkItemRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={15}
                color="#731F94"
              />
              <Text style={styles.checkItemLabel}>Complete 2 Capstones</Text>
              <Text style={styles.checkItemValue}>1 / 2 Finished</Text>
            </View>

            <View style={styles.checkItemRow}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={15}
                color="#7B6F84"
              />
              <Text style={styles.checkItemLabel}>Pass Peer Code Review</Text>
              <Text style={styles.checkItemValueGray}>Pending</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.claimCertBtn}
            onPress={() =>
              Alert.alert("Capstone 2", "Navigating to Capstone 2 Workspace...")
            }
          >
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.claimCertBtnText}>
              Complete Capstone 2 to Claim
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= 6. Cloud Practice Environments ================= */}
        <View style={styles.practiceHeaderRow}>
          <Text style={styles.sectionTitle}>Cloud Practice Environments</Text>
          <View style={styles.liveRuntimePill}>
            <View style={styles.greenLiveDot} />
            <Text style={styles.liveRuntimeText}>Live Runtime</Text>
          </View>
        </View>

        {/* PostgreSQL Terminal Box */}
        <View style={styles.darkTerminalCard}>
          <View style={styles.terminalHeader}>
            <View style={styles.terminalTitleRow}>
              <MaterialCommunityIcons
                name="database"
                size={16}
                color="#C488DE"
              />
              <Text style={styles.terminalTitleText}>
                PostgreSQL Transit Sandbox
              </Text>
            </View>
            <View style={styles.terminalVersionBadge}>
              <Text style={styles.terminalVersionText}>v16.1</Text>
            </View>
          </View>

          <Text style={styles.terminalDesc}>
            Pre-seeded with 120,000 real Cowry BRT transit logs. Practice
            partition queries and rolling balances without setup.
          </Text>

          {/* SQL Code Snippet Box */}
          <View style={styles.codeSnippetBox}>
            <Text style={styles.codeText}>
              <Text style={styles.sqlKeyword}>SELECT</Text> card_id,{" "}
              <Text style={styles.sqlKeyword}>SUM</Text>(amount){" "}
              <Text style={styles.sqlKeyword}>OVER</Text>
              {"\n"}(<Text style={styles.sqlKeyword}>PARTITION BY</Text>{" "}
              terminal_id) <Text style={styles.sqlKeyword}>FROM</Text>
              {"\n"}
              cowry_logs <Text style={styles.sqlKeyword}>LIMIT</Text> 5;
            </Text>
          </View>

          <View style={styles.terminalFooterRow}>
            <Text style={styles.memoryText}>Memory: 512MB / 1024MB</Text>
            <TouchableOpacity
              style={styles.launchQueryBtn}
              onPress={() =>
                Alert.alert(
                  "Query Runner",
                  "Executing PostgreSQL query runner...",
                )
              }
            >
              <Ionicons name="play" size={14} color="#FFFFFF" />
              <Text style={styles.launchQueryText}>Launch Query Runner</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FastAPI Webhooks Mock */}
        <View style={styles.card}>
          <View style={styles.fastApiRow}>
            <View style={styles.fastApiIconBox}>
              <MaterialCommunityIcons
                name="webhook"
                size={22}
                color="#731F94"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.fastApiTitle}>FastAPI Webhooks Mock</Text>
              <Text style={styles.fastApiSubtitle}>
                Simulate Paystack charge.success webhooks...
              </Text>
            </View>
            <TouchableOpacity
              style={styles.launchPillBtn}
              onPress={() =>
                Alert.alert(
                  "Webhook Simulator",
                  "Starting webhook server listener...",
                )
              }
            >
              <Text style={styles.launchPillText}>Launch</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 7. National Accreditation Guarantee ================= */}
        <View style={styles.accreditationCard}>
          <View style={styles.shieldIconWrap}>
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color="#731F94"
            />
          </View>

          <Text style={styles.accreditationTitle}>
            National Accreditation Guarantee
          </Text>
          <Text style={styles.accreditationDesc}>
            NDPR Compliant & NITDA Accredited. All certificates carry
            cryptographic signatures recognized by 48+ Nigerian hiring partners.
          </Text>

          <View style={styles.standardsRow}>
            <Text style={styles.standardText}>SEC VETTED</Text>
            <View style={styles.standardDot} />
            <Text style={styles.standardText}>LSETF PARTNER</Text>
            <View style={styles.standardDot} />
            <Text style={styles.standardText}>ISO/IEC 27001</Text>
          </View>
        </View>
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

  /* Title Section */
  titleSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  breadcrumbText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.4,
  },
  breadcrumbSub: {
    color: "#7B6F84",
    fontWeight: "600",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#131B2A",
    letterSpacing: -0.4,
    marginTop: 2,
  },
  targetTrackText: {
    fontSize: 11,
    color: "#556070",
    marginTop: 2,
  },
  targetTrackValue: {
    fontWeight: "700",
    color: "#731F94",
  },
  titleIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
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

  /* 1. Certification Pathway Card */
  pathwayTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pathwayOverline: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7B6F84",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  percentRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  percentBig: {
    fontSize: 26,
    fontWeight: "800",
    color: "#131B2A",
  },
  percentLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#731F94",
    marginLeft: 6,
  },
  gaugeContainer: {
    position: "relative",
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeCenterLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeFractionText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#131B2A",
  },
  pathwayBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F0E5F7",
    overflow: "hidden",
    marginBottom: 12,
  },
  pathwayBarFill: {
    width: "65%",
    height: "100%",
    backgroundColor: "#731F94",
    borderRadius: 3,
  },
  pathwayMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#131B2A",
  },
  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF5FC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  streakLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakBold: {
    fontSize: 11,
    fontWeight: "800",
    color: "#731F94",
  },
  streakDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C488DE",
    marginHorizontal: 8,
  },
  streakHoursText: {
    fontSize: 10,
    color: "#556070",
    fontWeight: "500",
  },

  /* 2. Filter Tabs */
  filterTabsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#EAE1FA",
  },
  filterPillActive: {
    backgroundColor: "#731F94",
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#556070",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },

  /* 3. Module 3 Active */
  moduleBadgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activeSprintBadge: {
    backgroundColor: "#F5EEFC",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeSprintText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.3,
  },
  timeEstBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeEstText: {
    fontSize: 11,
    color: "#556070",
    fontWeight: "600",
  },
  activeModuleTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#131B2A",
    lineHeight: 22,
    marginBottom: 6,
  },
  coDevelopedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  coDevelopedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#731F94",
  },
  lessonListBox: {
    backgroundColor: "#FAF8FC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  lessonListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  lessonProgressTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#131B2A",
  },
  lessonProgressCount: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lessonRowCurrent: {
    backgroundColor: "#F3ECFA",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  lessonTitleDone: {
    flex: 1,
    fontSize: 11,
    color: "#131B2A",
    fontWeight: "500",
  },
  lessonTitleCurrent: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  lessonTitleLocked: {
    flex: 1,
    fontSize: 11,
    color: "#A396A6",
    fontWeight: "500",
  },
  lessonDuration: {
    fontSize: 10,
    color: "#7B6F84",
    fontWeight: "600",
  },
  currentBadge: {
    backgroundColor: "#731F94",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  resumeModuleBtn: {
    height: 44,
    backgroundColor: "#731F94",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  resumeModuleBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  lessonNotesBtn: {
    height: 42,
    backgroundColor: "#F0E5F7",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  lessonNotesBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#731F94",
  },

  /* 4. Upcoming Modules */
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#131B2A",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#556070",
    lineHeight: 16,
    marginBottom: 12,
  },
  upcomingBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  moduleNumberPill: {
    backgroundColor: "#F5EEFC",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  moduleNumberText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
  },
  unlocksText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },
  moduleCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#131B2A",
    marginBottom: 4,
    lineHeight: 18,
  },
  moduleCardDescription: {
    fontSize: 11,
    color: "#556070",
    lineHeight: 16,
    marginBottom: 10,
  },
  moduleCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: "#7B6F84",
    fontWeight: "600",
  },

  /* 5. Partner Certifications */
  certTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  certIconSquarePurple: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#731F94",
    alignItems: "center",
    justifyContent: "center",
  },
  certIconSquareLavender: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  earnedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5EEFC",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  earnedBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#731F94",
  },
  inProgressBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5EEFC",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  inProgressBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#731F94",
  },
  certTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
    lineHeight: 17,
  },
  certSub: {
    fontSize: 10,
    color: "#7B6F84",
    marginTop: 2,
  },
  blockchainBox: {
    backgroundColor: "#FAF8FC",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 4,
  },
  blockchainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  blockchainLabel: {
    fontSize: 10,
    color: "#7B6F84",
    fontWeight: "500",
  },
  blockchainValueBold: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
  },
  blockchainValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "#131B2A",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F0E5F7",
    paddingTop: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },
  certBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  viewPdfBtn: {
    flex: 1,
    height: 38,
    backgroundColor: "#F0E5F7",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  viewPdfText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  shareBadgeBtn: {
    flex: 1,
    height: 38,
    backgroundColor: "#731F94",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  shareBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Cert Checklist */
  certChecklist: {
    gap: 8,
    marginVertical: 10,
  },
  checkItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkItemLabel: {
    flex: 1,
    fontSize: 11,
    color: "#131B2A",
    fontWeight: "600",
    marginLeft: 6,
  },
  checkItemValueGreen: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0D8A58",
  },
  checkItemValue: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },
  checkItemValueGray: {
    fontSize: 10,
    color: "#7B6F84",
    fontWeight: "600",
  },
  claimCertBtn: {
    height: 42,
    backgroundColor: "#731F94",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 6,
  },
  claimCertBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* 6. Cloud Practice Environments */
  practiceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 10,
  },
  liveRuntimePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0D8A58",
  },
  liveRuntimeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },
  darkTerminalCard: {
    backgroundColor: "#282752",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  terminalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  terminalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  terminalTitleText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  terminalVersionBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  terminalVersionText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#E8D4F0",
  },
  terminalDesc: {
    fontSize: 11,
    color: "#B6B5D4",
    lineHeight: 16,
    marginBottom: 10,
  },
  codeSnippetBox: {
    backgroundColor: "#1E1D3E",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#E8D4F0",
    lineHeight: 16,
  },
  sqlKeyword: {
    fontWeight: "bold",
    color: "#C488DE",
  },
  terminalFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memoryText: {
    fontSize: 10,
    color: "#8A89B0",
    fontWeight: "500",
  },
  launchQueryBtn: {
    backgroundColor: "#731F94",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  launchQueryText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  fastApiRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fastApiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  fastApiTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
  },
  fastApiSubtitle: {
    fontSize: 10,
    color: "#7B6F84",
    marginTop: 2,
  },
  launchPillBtn: {
    backgroundColor: "#F0E5F7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  launchPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },

  /* 7. National Accreditation */
  accreditationCard: {
    backgroundColor: "#F6EFFC",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  shieldIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EAE0F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  accreditationTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
    marginBottom: 4,
  },
  accreditationDesc: {
    fontSize: 11,
    color: "#556070",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  standardsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  standardText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#7B6F84",
    letterSpacing: 0.4,
  },
  standardDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#731F94",
    marginHorizontal: 8,
  },
});
