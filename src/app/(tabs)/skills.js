import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
import NotificationBell from "../../../assets/images/Notifications.svg";

export default function SkillGapScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Overall Circular Progress Specs
  const circleSize = 64;
  const strokeWidth = 5;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const readinessValue = 0.74;
  const strokeDashoffset = circumference - circumference * readinessValue;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FC" />

      {/* ================= Header Bar ================= */}
      <View style={styles.headerBar}>
        <View style={styles.headerBrandGroup}>
          <LogoSvg width={30} height={30} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.brandTitle}>SkillBridge</Text>
            <Text style={styles.brandSubtitle}>SKILL GAP</Text>
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
        {/* ================= User Profile Identity Card ================= */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle} />
              <View style={styles.avatarCheckBadge}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.profileMeta}>
              <Text style={styles.profileName}>Amaka Okafor</Text>
              <Text style={styles.profileEducation}>
                Economics & Statistics
              </Text>
            </View>

            <View style={styles.hubPill}>
              <Text style={styles.hubPillText}>Lagos Hub</Text>
            </View>
          </View>

          <View style={styles.profileBottomRow}>
            <View style={styles.roleTagGroup}>
              <MaterialCommunityIcons
                name="asterisk"
                size={14}
                color="#731F94"
              />
              <Text style={styles.roleTagText}>Junior Data Analyst</Text>
            </View>

            <View style={styles.specBadge}>
              <Text style={styles.specBadgeText}>Verified Spec</Text>
            </View>
          </View>
        </View>

        {/* ================= Overall Market Fit Card ================= */}
        <View style={styles.marketFitCard}>
          <View style={styles.fitLeftCol}>
            <Text style={styles.marketFitOverline}>OVERALL MARKET FIT</Text>
            <View style={styles.readinessRow}>
              <Text style={styles.readinessBigText}>74%</Text>
              <Text style={styles.readinessLabel}>Readiness</Text>
            </View>
          </View>

          {/* Radial Ring Meter */}
          <View style={styles.circularGaugeContainer}>
            <Svg width={circleSize} height={circleSize}>
              <Circle
                stroke="#EAE1FA"
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
              <Text style={styles.gaugeDeltaText}>+6%</Text>
            </View>
          </View>
        </View>

        {/* ================= Filter Segmented Pills ================= */}
        <View style={styles.filterPillTrack}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === "All" && styles.filterPillActive,
            ]}
            onPress={() => setSelectedFilter("All")}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedFilter === "All" && styles.filterPillTextActive,
              ]}
            >
              All <Text style={styles.filterPillCount}>(14)</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === "Ready" && styles.filterPillActive,
            ]}
            onPress={() => setSelectedFilter("Ready")}
          >
            <Text style={styles.filterPillText}>
              Ready <Text style={styles.purpleCount}>8</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === "Partial" && styles.filterPillActive,
            ]}
            onPress={() => setSelectedFilter("Partial")}
          >
            <Text style={styles.filterPillText}>
              Partial <Text style={styles.purpleCount}>4</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === "Gaps" && styles.filterPillActive,
            ]}
            onPress={() => setSelectedFilter("Gaps")}
          >
            <Text style={styles.filterPillText}>
              Gaps <Text style={styles.purpleCount}>2</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= Section 1: Possessed Core Skills ================= */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithDot}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Possessed Core Skills</Text>
          </View>
          <Text style={styles.sectionCountLabel}>8 Verified</Text>
        </View>

        {/* B.Sc Economics */}
        <View style={styles.skillCard}>
          <View style={styles.skillTopRow}>
            <View style={styles.skillIconBox}>
              <Ionicons name="school-outline" size={18} color="#731F94" />
            </View>
            <Text style={styles.skillItemTitle}>
              B.Sc Economics & Statistics
            </Text>
            <Text style={styles.skillPercentText}>94%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "94%" }]} />
          </View>
        </View>

        {/* Advanced MS Excel */}
        <View style={styles.skillCard}>
          <View style={styles.skillTopRow}>
            <View style={styles.skillIconBox}>
              <MaterialCommunityIcons
                name="table-large"
                size={18}
                color="#731F94"
              />
            </View>
            <View style={styles.skillHeaderCol}>
              <Text style={styles.skillItemTitle}>
                Advanced MS Excel & Pivot Tables
              </Text>
              <Text style={styles.skillItemSubtitle}>
                92% Lagos Fintech benchmark
              </Text>
            </View>
            <Text style={styles.skillPercentText}>92%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "92%" }]} />
          </View>
        </View>

        {/* Financial Modeling */}
        <View style={styles.skillCard}>
          <View style={styles.skillTopRow}>
            <View style={styles.skillIconBox}>
              <FontAwesome5 name="university" size={15} color="#731F94" />
            </View>
            <View style={styles.skillHeaderCol}>
              <Text style={styles.skillItemTitle}>
                Financial Modeling & Valuation
              </Text>
              <Text style={styles.skillItemSubtitle}>
                Aligned with Sterling & Stanbic IBTC specs
              </Text>
            </View>
            <Text style={styles.skillPercentText}>88%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "88%" }]} />
          </View>
        </View>

        {/* Data Storytelling */}
        <View style={styles.skillCard}>
          <View style={styles.skillTopRow}>
            <View style={styles.skillIconBox}>
              <Feather name="trending-up" size={16} color="#731F94" />
            </View>
            <View style={styles.skillHeaderCol}>
              <Text style={styles.skillItemTitle}>
                Data Storytelling & Reporting
              </Text>
              <Text style={styles.skillItemSubtitle}>
                Executive dashboard synthesis
              </Text>
            </View>
            <Text style={styles.skillPercentText}>78%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "78%" }]} />
          </View>
        </View>

        {/* ================= Section 2: Partial Proficiencies ================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
          <View style={styles.sectionTitleWithDot}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Partial Proficiencies</Text>
          </View>
          <Text style={styles.sectionCountLabel}>4 Developing</Text>
        </View>

        {/* SQL Window Functions */}
        <View style={styles.skillCard}>
          <View style={styles.skillTopRow}>
            <View style={styles.skillIconBox}>
              <MaterialCommunityIcons
                name="database-outline"
                size={18}
                color="#731F94"
              />
            </View>
            <View style={styles.skillHeaderCol}>
              <Text style={styles.skillItemTitle}>SQL Window Functions</Text>
              <Text style={styles.skillItemSubtitle}>
                Sprint 2 • Active Course
              </Text>
            </View>
            <Text style={styles.skillPercentText}>65%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "65%" }]} />
          </View>
        </View>

        {/* PowerBI Dashboard Design */}
        <View style={styles.skillCard}>
          <View style={styles.skillTopRow}>
            <View style={styles.skillIconBox}>
              <MaterialCommunityIcons
                name="chart-pie"
                size={18}
                color="#731F94"
              />
            </View>
            <View style={styles.skillHeaderCol}>
              <Text style={styles.skillItemTitle}>
                PowerBI Dashboard Design
              </Text>
              <Text style={styles.skillItemSubtitle}>
                2 practice labs remaining
              </Text>
            </View>
            <Text style={styles.skillPercentText}>70%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "70%" }]} />
          </View>
        </View>

        {/* ================= Section 3: Critical Missing Gaps ================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
          <View style={styles.sectionTitleWithDot}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Critical Missing Gaps</Text>
          </View>
          <Text style={styles.highImpactLabel}>High Impact</Text>
        </View>

        {/* Python Data Wrangling Gap Card */}
        <View style={styles.criticalGapCard}>
          <View style={styles.gapHeaderRow}>
            <View style={styles.gapIconBox}>
              <Feather name="code" size={16} color="#731F94" />
            </View>
            <View style={styles.gapHeaderInfo}>
              <Text style={styles.gapTitle}>Python Data Wrangling</Text>
              <Text style={styles.gapSubtitle}>
                Pandas & NumPy fundamentals
              </Text>
            </View>
            <View style={styles.rolesPill}>
              <Text style={styles.rolesPillText}>Found in 88% roles</Text>
            </View>
          </View>

          <View style={styles.gapFooterRow}>
            <Text style={styles.unlocksText}>
              Unlocks 14 Lagos Junior Roles
            </Text>

            <TouchableOpacity
              style={styles.addRoadmapBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/(tabs)/learn")}
            >
              <Ionicons name="add" size={15} color="#FFFFFF" />
              <Text style={styles.addRoadmapText}>Add to 60–Day Roadmap</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= Section 4: Benchmark Matrix Card ================= */}
        <View style={styles.benchmarkCard}>
          <View style={styles.benchmarkHeader}>
            <View style={styles.benchmarkIconBox}>
              <MaterialCommunityIcons
                name="chart-bar"
                size={18}
                color="#731F94"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.benchmarkTitle}>
                Nigeria Fintech Benchmark Matrix
              </Text>
              <Text style={styles.benchmarkSubtitle}>Entry Standards</Text>
            </View>
          </View>

          {/* Bar 1: Current Profile */}
          <View style={styles.benchmarkRow}>
            <Text style={styles.benchmarkRowLabel}>
              Amaka Okafor (Current Profile)
            </Text>
            <Text style={styles.benchmarkRowValue}>74%</Text>
          </View>
          <View style={styles.benchmarkTrack}>
            <View style={[styles.benchmarkFillPurple, { width: "74%" }]} />
          </View>

          {/* Bar 2: Market Readiness */}
          <View style={styles.benchmarkRow}>
            <Text style={styles.benchmarkRowLabel}>
              Market Readiness Threshold
            </Text>
            <Text style={styles.benchmarkRowValue}>65%</Text>
          </View>
          <View style={styles.benchmarkTrack}>
            <View style={[styles.benchmarkFillLightPurple, { width: "65%" }]} />
          </View>

          {/* Bar 3: Peer Average */}
          <View style={styles.benchmarkRow}>
            <Text style={styles.benchmarkRowLabel}>
              UNILAG Econs/Stats Peer Average
            </Text>
            <Text style={styles.benchmarkRowValue}>62%</Text>
          </View>
          <View style={styles.benchmarkTrack}>
            <View style={[styles.benchmarkFillGray, { width: "62%" }]} />
          </View>

          {/* Benchmark Footer */}
          <View style={styles.benchmarkFooterRow}>
            <View style={styles.percentileGroup}>
              <Feather name="shield" size={13} color="#731F94" />
              <Text style={styles.percentileText}>
                Top 8th Percentile in Lagos Cohort
              </Text>
            </View>

            <TouchableOpacity
              style={styles.fullMatrixBtn}
              onPress={() => router.push("/(tabs)/learn")}
            >
              <Text style={styles.fullMatrixText}>Full Matrix</Text>
              <Feather name="arrow-right" size={12} color="#731F94" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= Bottom Career Launch Action ================= */}
        <TouchableOpacity
          style={styles.launchCareerBtn}
          activeOpacity={0.88}
          onPress={() => router.push("/launch-career")}
        >
          <Text style={styles.launchCareerText}>Launch Career</Text>
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
    paddingTop: 6,
    paddingBottom: 120, // Accommodates floating 6-item bottom tab bar
  },

  /* Profile Identity Card */
  profileCard: {
    backgroundColor: "#F5EEFC",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6D7F6",
  },
  avatarCheckBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#731F94",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#131B2A",
  },
  profileEducation: {
    fontSize: 12,
    color: "#655B6E",
    marginTop: 2,
  },
  hubPill: {
    backgroundColor: "#EBE0F7",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  hubPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  profileBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EBE0F7",
  },
  roleTagGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1C101B",
  },
  specBadge: {
    backgroundColor: "#EBE0F7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  specBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },

  /* Market Fit Card */
  marketFitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  fitLeftCol: {
    flex: 1,
  },
  marketFitOverline: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7B6F84",
    letterSpacing: 0.5,
  },
  readinessRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  readinessBigText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#131B2A",
  },
  readinessLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#731F94",
    marginLeft: 6,
  },
  circularGaugeContainer: {
    position: "relative",
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeInnerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeDeltaText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#731F94",
  },

  /* Filter Pills */
  filterPillTrack: {
    flexDirection: "row",
    backgroundColor: "#EDE5F7",
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },
  filterPillActive: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5B4E5A",
  },
  filterPillTextActive: {
    color: "#731F94",
  },
  filterPillCount: {
    color: "#731F94",
  },
  purpleCount: {
    color: "#731F94",
    fontWeight: "800",
  },

  /* Sections */
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitleWithDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#731F94",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#131B2A",
  },
  sectionCountLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7B6F84",
  },
  highImpactLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },

  /* Skill Item Card */
  skillCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  skillTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  skillIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  skillHeaderCol: {
    flex: 1,
  },
  skillItemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#131B2A",
    flex: 1,
  },
  skillItemSubtitle: {
    fontSize: 11,
    color: "#7B6F84",
    marginTop: 1,
  },
  skillPercentText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#731F94",
    marginLeft: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F0E5F7",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#731F94",
    borderRadius: 3,
  },

  /* Critical Gap Card */
  criticalGapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  gapHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  gapIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  gapHeaderInfo: {
    flex: 1,
  },
  gapTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
  },
  gapSubtitle: {
    fontSize: 11,
    color: "#7B6F84",
    marginTop: 1,
  },
  rolesPill: {
    backgroundColor: "#F0E5F7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  rolesPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },
  gapFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unlocksText: {
    fontSize: 11,
    color: "#556070",
    flex: 1,
    marginRight: 8,
  },
  addRoadmapBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#731F94",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    gap: 4,
  },
  addRoadmapText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Benchmark Matrix Card */
  benchmarkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    marginBottom: 18,
  },
  benchmarkHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  benchmarkIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  benchmarkTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
  },
  benchmarkSubtitle: {
    fontSize: 11,
    color: "#7B6F84",
    marginTop: 1,
  },
  benchmarkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  benchmarkRowLabel: {
    fontSize: 11,
    color: "#131B2A",
    fontWeight: "600",
  },
  benchmarkRowValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5B4E5A",
  },
  benchmarkTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#F0E5F7",
    overflow: "hidden",
  },
  benchmarkFillPurple: {
    height: "100%",
    backgroundColor: "#731F94",
    borderRadius: 2.5,
  },
  benchmarkFillLightPurple: {
    height: "100%",
    backgroundColor: "#A868C5",
    borderRadius: 2.5,
  },
  benchmarkFillGray: {
    height: "100%",
    backgroundColor: "#A89CAE",
    borderRadius: 2.5,
  },
  benchmarkFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5EEFC",
  },
  percentileGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  percentileText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#731F94",
  },
  fullMatrixBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fullMatrixText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },

  /* Launch Career CTA */
  launchCareerBtn: {
    height: 50,
    backgroundColor: "#731F94",
    borderRadius: 14,
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
  launchCareerText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
