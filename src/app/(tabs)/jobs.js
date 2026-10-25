import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import LogoSvg from "../../../assets/images/logo.svg";

const CAFE_ONE_IMAGE = require("../../../assets/images/TundeAlabi.png");

export default function JobsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [bookmarked, setBookmarked] = useState(false);

  // 89% Match Circular Gauge
  const circleSize = 60;
  const strokeWidth = 5;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const matchRatio = 0.89;
  const strokeDashoffset = circumference - circumference * matchRatio;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FC" />

      {/* ================= Header Bar ================= */}
      <View style={styles.headerBar}>
        <View style={styles.headerBrandGroup}>
          <LogoSvg width={30} height={30} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.brandTitle}>SkillBridge</Text>
            <Text style={styles.brandSubtitle}>JOBS</Text>
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
        {/* ================= Search Bar ================= */}
        <View style={styles.searchBarContainer}>
          <Feather
            name="search"
            size={18}
            color="#7B6F84"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Fintech & Banking"
            placeholderTextColor="#7B6F84"
          />
          <TouchableOpacity hitSlop={8}>
            <MaterialCommunityIcons
              name="tune-variant"
              size={20}
              color="#731F94"
            />
          </TouchableOpacity>
        </View>

        {/* ================= Filter Chips ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === "All"
                ? styles.filterChipActive
                : styles.filterChipInactive,
            ]}
            onPress={() => setActiveFilter("All")}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === "All"
                  ? styles.filterTextActive
                  : styles.filterTextInactive,
              ]}
            >
              All Roles (42)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === "NYSC"
                ? styles.filterChipActive
                : styles.filterChipInactive,
            ]}
            onPress={() => setActiveFilter("NYSC")}
          >
            <Ionicons
              name="school-outline"
              size={14}
              color={activeFilter === "NYSC" ? "#FFFFFF" : "#731F94"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === "NYSC"
                  ? styles.filterTextActive
                  : styles.filterTextInactive,
              ]}
            >
              NYSC / Fresh Grad
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === "Hybrid"
                ? styles.filterChipActive
                : styles.filterChipInactive,
            ]}
            onPress={() => setActiveFilter("Hybrid")}
          >
            <Feather
              name="home"
              size={13}
              color={activeFilter === "Hybrid" ? "#FFFFFF" : "#731F94"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === "Hybrid"
                  ? styles.filterTextActive
                  : styles.filterTextInactive,
              ]}
            >
              Hybrid / Remote
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ================= Featured Main Job Card ================= */}
        <View style={styles.featuredJobCard}>
          {/* Top Title Section */}
          <View style={styles.featuredHeaderRow}>
            <Image
              source={CAFE_ONE_IMAGE}
              style={styles.featuredCompanyLogo}
              resizeMode="cover"
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.fastTrackBadgeRow}>
                <Text style={styles.fastTrackText}>FAST–TRACK VERIFIED</Text>
                <Ionicons name="checkmark-circle" size={13} color="#731F94" />
              </View>
              <Text style={styles.featuredJobTitle}>
                Graduate Trainee Business & Data Analyst
              </Text>
              <Text style={styles.featuredCompanyText}>
                Sterling Bank × Café One
              </Text>
            </View>
          </View>

          {/* 4-Item Parameter Grid */}
          <View style={styles.jobSpecGrid}>
            <View style={styles.jobSpecItem}>
              <Ionicons name="location-outline" size={16} color="#731F94" />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.specLabel}>Location</Text>
                <Text style={styles.specValue}>Victoria Island</Text>
              </View>
            </View>

            <View style={styles.jobSpecItem}>
              <MaterialCommunityIcons
                name="cash-multiple"
                size={16}
                color="#731F94"
              />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.specLabel}>Monthly Stipend</Text>
                <Text style={styles.specValue}>₦220k – ₦300k</Text>
              </View>
            </View>

            <View style={styles.jobSpecItem}>
              <MaterialCommunityIcons
                name="badge-account-outline"
                size={16}
                color="#731F94"
              />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.specLabel}>Cohort Intake</Text>
                <Text style={styles.specValue}>NYSC Accepted</Text>
              </View>
            </View>

            <View style={styles.jobSpecItem}>
              <Ionicons name="flash-outline" size={16} color="#731F94" />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.specLabel}>Hiring Speed</Text>
                <Text style={styles.specValue}>Offers in 6 days</Text>
              </View>
            </View>
          </View>

          {/* Nested SkillBridge Match Engine Card */}
          <View style={styles.matchEngineCard}>
            <View style={styles.engineHeaderRow}>
              <View style={styles.engineDotRow}>
                <View style={styles.tinyPurpleDot} />
                <Text style={styles.engineTitle}>SkillBridge Match Engine</Text>
              </View>
              <View style={styles.calibrationPill}>
                <Text style={styles.calibrationPillText}>High Calibration</Text>
              </View>
            </View>

            {/* Match Gauge & Pass Box */}
            <View style={styles.gaugePassCard}>
              <View style={styles.gaugeWrap}>
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
                  <Text style={styles.gaugePercent}>89%</Text>
                  <Text style={styles.gaugeMatchLabel}>Match</Text>
                </View>
              </View>

              <View style={styles.passInfoCol}>
                <View style={styles.passTitleRow}>
                  <Feather name="zap" size={12} color="#731F94" />
                  <Text style={styles.passTitleText}>
                    STAGE 1 FAST–TRACK PASS
                  </Text>
                </View>
                <Text style={styles.passDescText}>
                  Your profile automatically bypasses general HR screen directly
                  to the Group Data Lead review.
                </Text>
              </View>
            </View>

            {/* Plain Terms Explanation */}
            <View style={styles.plainTermsBox}>
              <View style={styles.plainTermsHeader}>
                <MaterialCommunityIcons
                  name="lightbulb-on-outline"
                  size={16}
                  color="#731F94"
                />
                <Text style={styles.plainTermsTitle}>
                  Why you match in plain terms
                </Text>
              </View>
              <Text style={styles.plainTermsBody}>
                Your{" "}
                <Text style={styles.boldText}>
                  UNILAG Econometrics coursework
                </Text>{" "}
                provides the exact quantitative foundation assessed by Sterling
                Bank. Your verified{" "}
                <Text style={styles.boldText}>SQL Window Functions</Text> score
                puts you in the top 10% of applicants.
              </Text>
            </View>

            {/* Strong Skills Alignment */}
            <View style={styles.alignmentHeaderRow}>
              <Text style={styles.alignmentHeading}>
                STRONG SKILL ALIGNMENT (4/4 CORE)
              </Text>
              <Text style={styles.alignmentSub}>Verified via Assessments</Text>
            </View>

            <View style={styles.skillPillsWrap}>
              {[
                "PostgreSQL queries",
                "Financial Modeling",
                "Cohort Analysis",
                "Advanced Excel",
              ].map((skill) => (
                <View key={skill} style={styles.verifiedSkillPill}>
                  <Ionicons name="checkmark-circle" size={13} color="#731F94" />
                  <Text style={styles.verifiedSkillText}>{skill}</Text>
                </View>
              ))}
            </View>

            {/* Growth Gaps to Close */}
            <View style={[styles.alignmentHeaderRow, { marginTop: 14 }]}>
              <Text style={styles.alignmentHeading}>GROWTH GAPS TO CLOSE</Text>
              <Text style={styles.bridgeableSub}>Bridgeable in 1–2 weeks</Text>
            </View>

            <View style={styles.gapCard}>
              <Feather
                name="info"
                size={14}
                color="#D97706"
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.gapCardTitle}>AWS Redshift ingestion</Text>
                <Text style={styles.gapCardDesc}>
                  Minor gap — team confirmed this can be acquired during first
                  30 days onboarding.
                </Text>
              </View>
            </View>

            <View style={styles.gapCard}>
              <Feather
                name="info"
                size={14}
                color="#D97706"
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.gapCardTitle}>dbt pipeline basics</Text>
                <Text style={styles.gapCardDesc}>
                  Recommended 4hr micro-lab on your SkillBridge Roadmap to
                  achieve 96% match.
                </Text>
              </View>
            </View>

            {/* Perks Row */}
            <View style={styles.perksRow}>
              <View style={styles.perkItem}>
                <Ionicons name="cafe-outline" size={13} color="#556070" />
                <Text style={styles.perkText}>Free Café One Workspace</Text>
              </View>
              <View style={styles.perkItem}>
                <Feather name="shield" size={12} color="#556070" />
                <Text style={styles.perkText}>HMO + Transit Pass</Text>
              </View>
              <View style={styles.perkItem}>
                <Feather name="clock" size={12} color="#556070" />
                <Text style={styles.perkText}>2 Days Remote / WFH</Text>
              </View>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={() => setBookmarked(!bookmarked)}
              hitSlop={8}
            >
              <Ionicons
                name={bookmarked ? "bookmark" : "bookmark-outline"}
                size={18}
                color="#731F94"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={() => Alert.alert("Share Role", "Sharing role link...")}
              hitSlop={8}
            >
              <Feather name="share-2" size={18} color="#731F94" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              activeOpacity={0.88}
              onPress={() =>
                Alert.alert(
                  "Apply",
                  "Redirecting to direct candidate fast-pass pipeline...",
                )
              }
            >
              <Feather name="lock" size={15} color="#FFFFFF" />
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= More Roles Calibrated for You ================= */}
        <View style={styles.moreRolesHeaderRow}>
          <View>
            <Text style={styles.moreRolesTitle}>
              More Roles Calibrated for You
            </Text>
            <Text style={styles.moreRolesSubtitle}>
              Based on your validated Lagos university records
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("All Roles", "Fetching full matched catalog...")
            }
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Role 1: Moniepoint */}
        <View style={styles.calibratedRoleCard}>
          <View style={styles.roleCardTopRow}>
            <View style={styles.roleLogoBox}>
              <MaterialCommunityIcons
                name="alpha-m-box"
                size={28}
                color="#0052FF"
              />
            </View>

            <View style={styles.roleInfoCol}>
              <Text style={styles.roleName}>Junior Data Analyst</Text>
              <Text style={styles.roleCompany}>
                Moniepoint Microfinance Bank • Lekki Phase 1
              </Text>
            </View>

            <View style={styles.matchPillBadge}>
              <MaterialCommunityIcons
                name="creation"
                size={12}
                color="#731F94"
              />
              <Text style={styles.matchPillText}>81% Match</Text>
            </View>
          </View>

          <View style={styles.roleMetaRow}>
            <Text style={styles.roleSalary}>₦250k – ₦320k/mo</Text>
            <Text style={styles.roleMetaTag}>Hybrid • NYSC Eligible</Text>
          </View>

          <View style={styles.roleChipsRow}>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>Fintech Metrics</Text>
            </View>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>PowerBI</Text>
            </View>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>SQL Joins</Text>
            </View>
          </View>
        </View>

        {/* Role 2: PiggyVest */}
        <View style={styles.calibratedRoleCard}>
          <View style={styles.roleCardTopRow}>
            <View style={styles.roleLogoBox}>
              <MaterialCommunityIcons
                name="piggy-bank"
                size={26}
                color="#0D8A58"
              />
            </View>

            <View style={styles.roleInfoCol}>
              <Text style={styles.roleName}>Growth Analytics Associate</Text>
              <Text style={styles.roleCompany}>
                PiggyVest • Ikeja GRA, Lagos
              </Text>
            </View>

            <View style={styles.matchPillBadge}>
              <MaterialCommunityIcons
                name="creation"
                size={12}
                color="#731F94"
              />
              <Text style={styles.matchPillText}>87% Match</Text>
            </View>
          </View>

          <View style={styles.roleMetaRow}>
            <Text style={styles.roleSalary}>₦280k – ₦350k/mo</Text>
            <Text style={styles.roleMetaTag}>
              Full-time Grad • Remote 3x/wk
            </Text>
          </View>

          <View style={styles.roleChipsRow}>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>Funnel Attribution</Text>
            </View>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>Python / Pandas</Text>
            </View>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>Mixpanel</Text>
            </View>
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

  /* Search & Filters */
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFE5F7",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#131B2A",
  },
  filterChipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  filterChipActive: {
    backgroundColor: "#731F94",
  },
  filterChipInactive: {
    backgroundColor: "#EAE1FA",
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  filterTextInactive: {
    color: "#731F94",
  },

  /* Featured Job Card */
  featuredJobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  featuredHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  featuredCompanyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EBE0F7",
  },
  fastTrackBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  fastTrackText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.4,
  },
  featuredJobTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#131B2A",
    lineHeight: 20,
  },
  featuredCompanyText: {
    fontSize: 11,
    color: "#556070",
    marginTop: 2,
  },
  jobSpecGrid: {
    backgroundColor: "#FAF8FC",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  jobSpecItem: {
    width: "46%",
    flexDirection: "row",
    alignItems: "center",
  },
  specLabel: {
    fontSize: 9,
    color: "#7B6F84",
    fontWeight: "500",
  },
  specValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#131B2A",
    marginTop: 1,
  },

  /* Nested Match Engine Card */
  matchEngineCard: {
    backgroundColor: "#F5EEFC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  engineHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  engineDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tinyPurpleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#731F94",
  },
  engineTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#131B2A",
  },
  calibrationPill: {
    backgroundColor: "#EBE0F7",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  calibrationPillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
  },
  gaugePassCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  gaugeWrap: {
    position: "relative",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  gaugeCenterLabel: {
    position: "absolute",
    alignItems: "center",
  },
  gaugePercent: {
    fontSize: 14,
    fontWeight: "800",
    color: "#731F94",
  },
  gaugeMatchLabel: {
    fontSize: 8,
    color: "#7B6F84",
    fontWeight: "600",
  },
  passInfoCol: {
    flex: 1,
  },
  passTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  passTitleText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
  },
  passDescText: {
    fontSize: 10,
    color: "#556070",
    lineHeight: 14,
  },
  plainTermsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  plainTermsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  plainTermsTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#131B2A",
  },
  plainTermsBody: {
    fontSize: 10,
    color: "#556070",
    lineHeight: 15,
  },
  boldText: {
    fontWeight: "700",
    color: "#131B2A",
  },
  alignmentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  alignmentHeading: {
    fontSize: 9,
    fontWeight: "800",
    color: "#131B2A",
    letterSpacing: 0.3,
  },
  alignmentSub: {
    fontSize: 9,
    color: "#731F94",
    fontWeight: "600",
  },
  bridgeableSub: {
    fontSize: 9,
    color: "#7B6F84",
    fontWeight: "500",
  },
  skillPillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  verifiedSkillPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  verifiedSkillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },
  gapCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  gapCardTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#131B2A",
  },
  gapCardDesc: {
    fontSize: 9,
    color: "#556070",
    lineHeight: 13,
    marginTop: 2,
  },
  perksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EFE5F7",
  },
  perkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  perkText: {
    fontSize: 9,
    color: "#556070",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#731F94",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* More Roles Calibrated */
  moreRolesHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  moreRolesTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#131B2A",
  },
  moreRolesSubtitle: {
    fontSize: 10,
    color: "#7B6F84",
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  calibratedRoleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  roleCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  roleLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F5F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  roleInfoCol: {
    flex: 1,
  },
  roleName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
  },
  roleCompany: {
    fontSize: 10,
    color: "#7B6F84",
    marginTop: 2,
  },
  matchPillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5EEFC",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 3,
  },
  matchPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
  },
  roleMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roleSalary: {
    fontSize: 11,
    fontWeight: "800",
    color: "#131B2A",
  },
  roleMetaTag: {
    fontSize: 10,
    color: "#556070",
    fontWeight: "600",
  },
  roleChipsRow: {
    flexDirection: "row",
    gap: 6,
  },
  roleChip: {
    backgroundColor: "#F5EEFC",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#731F94",
  },
});
