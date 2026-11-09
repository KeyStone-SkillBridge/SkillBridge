import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
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
import { EmptyCard, LoadingState } from "../../components/StateViews";
import { getErrorMessage } from "../../services/api";
import { addSkillToRoadmap, skillIcon } from "../../services/skillActions";
import { titleCase, useSkillBridge } from "../../services/useSkillBridge";
import { logError } from "../../services/logger";

const norm = (s) => String(s || "").trim().toLowerCase();

export default function SkillGapScreen() {
  const router = useRouter();
  const { data, stats, loading, refreshing, refresh } = useSkillBridge();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [addingSkill, setAddingSkill] = useState(null);
  const [addedSkills, setAddedSkills] = useState({});

  const gap = data?.latestGap;
  const requiredSet = new Set(stats.requiredSkills.map(norm));
  const readySkills = stats.requiredSkills.length
    ? stats.matchedSkills
    : stats.currentSkills;
  const partialSkills = stats.requiredSkills.length
    ? stats.currentSkills.filter((s) => !requiredSet.has(norm(s)))
    : [];
  const gapSkills = stats.missingSkills;
  const totalCount = readySkills.length + partialSkills.length + gapSkills.length;

  const show = (section) => selectedFilter === "All" || selectedFilter === section;

  // Overall Circular Progress Specs
  const circleSize = 64;
  const strokeWidth = 5;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const readinessValue = stats.readiness / 100;
  const strokeDashoffset = circumference - circumference * readinessValue;

  const topMatchPct = data?.matches?.[0]?.matchPercentage;

  const handleAddToRoadmap = async (skill) => {
    setAddingSkill(skill);
    try {
      const { savedTo } = await addSkillToRoadmap(skill, data);
      setAddedSkills((prev) => ({ ...prev, [skill]: true }));
      Alert.alert(
        "Added to your plan",
        savedTo === "roadmap"
          ? `"${titleCase(skill)}" was added to the first 30 days of your roadmap.`
          : `"${titleCase(skill)}" was saved to your plan. Your 90-day roadmap hasn't been generated yet, so it is listed under "Your Skill Plan" on the Roadmap tab.`,
      );
    } catch (err) {
      logError("skills", "handleAddToRoadmap", err);
      Alert.alert("Couldn't add skill", getErrorMessage(err));
    } finally {
      setAddingSkill(null);
    }
  };

  const renderSkillCard = (skill, variant) => (
    <View key={`${variant}-${skill}`} style={styles.skillCard}>
      <View style={styles.skillTopRow}>
        <View style={styles.skillIconBox}>
          <MaterialCommunityIcons name={skillIcon(skill)} size={18} color="#731F94" />
        </View>
        <View style={styles.skillHeaderCol}>
          <Text style={styles.skillItemTitle}>{titleCase(skill)}</Text>
          <Text style={styles.skillItemSubtitle}>
            {variant === "ready"
              ? stats.targetRole
                ? `Required for ${stats.targetRole}`
                : "Extracted from your CV"
              : "Transferable skill"}
          </Text>
        </View>
        <Text style={styles.skillPercentText}>
          {variant === "ready" ? "Ready" : "Bonus"}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: variant === "ready" ? "100%" : "60%" },
          ]}
        />
      </View>
    </View>
  );

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

      {loading && !data ? (
        <LoadingState label="Loading your skill analysis..." />
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#731F94" />
        }
      >
        {/* ================= User Profile Identity Card ================= */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle} />
              {gap?.status === "completed" && (
                <View style={styles.avatarCheckBadge}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.profileMeta}>
              <Text style={styles.profileName}>{stats.fullName || "Your Profile"}</Text>
              <Text style={styles.profileEducation} numberOfLines={1}>
                {data?.profile?.education || "Add your education in Profile"}
              </Text>
            </View>

            {!!stats.location && (
              <View style={styles.hubPill}>
                <Text style={styles.hubPillText} numberOfLines={1}>{stats.location}</Text>
              </View>
            )}
          </View>

          <View style={styles.profileBottomRow}>
            <View style={styles.roleTagGroup}>
              <MaterialCommunityIcons
                name="asterisk"
                size={14}
                color="#731F94"
              />
              <Text style={styles.roleTagText}>
                {stats.targetRole || "No target role yet"}
              </Text>
            </View>

            <View style={styles.specBadge}>
              <Text style={styles.specBadgeText}>
                {gap?.status === "completed"
                  ? "AI Verified"
                  : gap?.status === "failed"
                    ? "Analysis Failed"
                    : gap
                      ? "Pending"
                      : "Not Analysed"}
              </Text>
            </View>
          </View>
        </View>

        {!gap ? (
          <EmptyCard
            icon="file-text"
            title="No skill analysis yet"
            message="Upload your CV and set a target role so our AI can benchmark your skills."
            ctaLabel="Start Analysis"
            onPress={() => router.push("/profile-setup")}
          />
        ) : (
          <>
        {/* ================= Overall Market Fit Card ================= */}
        <View style={styles.marketFitCard}>
          <View style={styles.fitLeftCol}>
            <Text style={styles.marketFitOverline}>OVERALL MARKET FIT</Text>
            <View style={styles.readinessRow}>
              <Text style={styles.readinessBigText}>{stats.readiness}%</Text>
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
              <Text style={styles.gaugeDeltaText}>
                {stats.requiredSkills.length
                  ? `${stats.matchedSkills.length}/${stats.requiredSkills.length}`
                  : `${stats.currentSkills.length}`}
              </Text>
            </View>
          </View>
        </View>

        {!!stats.summary && (
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="creation" size={16} color="#731F94" />
            <Text style={styles.summaryText}>{stats.summary}</Text>
          </View>
        )}

        {/* ================= Filter Segmented Pills ================= */}
        <View style={styles.filterPillTrack}>
          {[
            { key: "All", count: totalCount },
            { key: "Ready", count: readySkills.length },
            { key: "Partial", count: partialSkills.length },
            { key: "Gaps", count: gapSkills.length },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterPill,
                selectedFilter === f.key && styles.filterPillActive,
              ]}
              onPress={() => setSelectedFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedFilter === f.key && styles.filterPillTextActive,
                ]}
              >
                {f.key}{" "}
                <Text style={f.key === "All" ? styles.filterPillCount : styles.purpleCount}>
                  {f.key === "All" ? `(${f.count})` : f.count}
                </Text>
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= Section 1: Possessed Core Skills ================= */}
        {show("Ready") && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithDot}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>Possessed Core Skills</Text>
              </View>
              <Text style={styles.sectionCountLabel}>{readySkills.length} Verified</Text>
            </View>
            {readySkills.length === 0 ? (
              <Text style={styles.emptySectionText}>
                None of the required skills were found yet — check the gaps below.
              </Text>
            ) : (
              readySkills.map((s) => renderSkillCard(s, "ready"))
            )}
          </>
        )}

        {/* ================= Section 2: Partial Proficiencies ================= */}
        {show("Partial") && partialSkills.length > 0 && (
          <>
            <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
              <View style={styles.sectionTitleWithDot}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>Transferable Skills</Text>
              </View>
              <Text style={styles.sectionCountLabel}>{partialSkills.length} Extra</Text>
            </View>
            {partialSkills.map((s) => renderSkillCard(s, "partial"))}
          </>
        )}

        {/* ================= Section 3: Critical Missing Gaps ================= */}
        {show("Gaps") && (
          <>
            <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
              <View style={styles.sectionTitleWithDot}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>Critical Missing Gaps</Text>
              </View>
              <Text style={styles.highImpactLabel}>
                {gapSkills.length ? "High Impact" : "All clear"}
              </Text>
            </View>

            {gapSkills.length === 0 ? (
              <Text style={styles.emptySectionText}>
                No critical gaps found for {stats.targetRole || "your target role"}. 🎉
              </Text>
            ) : (
              gapSkills.map((skill) => (
                <View key={`gap-${skill}`} style={styles.criticalGapCard}>
                  <View style={styles.gapHeaderRow}>
                    <View style={styles.gapIconBox}>
                      <MaterialCommunityIcons name={skillIcon(skill)} size={16} color="#731F94" />
                    </View>
                    <View style={styles.gapHeaderInfo}>
                      <Text style={styles.gapTitle}>{titleCase(skill)}</Text>
                      <Text style={styles.gapSubtitle}>
                        Required for {stats.targetRole || "your target role"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.gapFooterRow}>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/learn")}>
                      <Text style={styles.unlocksText}>Find courses →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.addRoadmapBtn, addedSkills[skill] && { opacity: 0.6 }]}
                      activeOpacity={0.85}
                      disabled={!!addingSkill || addedSkills[skill]}
                      onPress={() => handleAddToRoadmap(skill)}
                    >
                      {addingSkill === skill ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons
                            name={addedSkills[skill] ? "checkmark" : "add"}
                            size={15}
                            color="#FFFFFF"
                          />
                          <Text style={styles.addRoadmapText}>
                            {addedSkills[skill] ? "Added" : "Add to Roadmap"}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

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
              <Text style={styles.benchmarkTitle}>Benchmark Matrix</Text>
              <Text style={styles.benchmarkSubtitle}>
                {stats.targetRole || "Target role"} entry standards
              </Text>
            </View>
          </View>

          {/* Bar 1: Current Profile */}
          <View style={styles.benchmarkRow}>
            <Text style={styles.benchmarkRowLabel}>
              {stats.firstName} (Current Profile)
            </Text>
            <Text style={styles.benchmarkRowValue}>{stats.readiness}%</Text>
          </View>
          <View style={styles.benchmarkTrack}>
            <View style={[styles.benchmarkFillPurple, { width: `${stats.readiness}%` }]} />
          </View>

          {/* Bar 2: Required skills covered */}
          <View style={styles.benchmarkRow}>
            <Text style={styles.benchmarkRowLabel}>Required Skills Covered</Text>
            <Text style={styles.benchmarkRowValue}>
              {stats.matchedSkills.length}/{stats.requiredSkills.length || 0}
            </Text>
          </View>
          <View style={styles.benchmarkTrack}>
            <View
              style={[
                styles.benchmarkFillLightPurple,
                {
                  width: `${stats.requiredSkills.length ? Math.round((stats.matchedSkills.length / stats.requiredSkills.length) * 100) : 0}%`,
                },
              ]}
            />
          </View>

          {/* Bar 3: Best job match */}
          <View style={styles.benchmarkRow}>
            <Text style={styles.benchmarkRowLabel}>Best Job Match</Text>
            <Text style={styles.benchmarkRowValue}>
              {typeof topMatchPct === "number" ? `${topMatchPct}%` : "—"}
            </Text>
          </View>
          <View style={styles.benchmarkTrack}>
            <View
              style={[
                styles.benchmarkFillGray,
                { width: `${typeof topMatchPct === "number" ? topMatchPct : 0}%` },
              ]}
            />
          </View>

          {/* Benchmark Footer */}
          <View style={styles.benchmarkFooterRow}>
            <View style={styles.percentileGroup}>
              <Feather name="shield" size={13} color="#731F94" />
              <Text style={styles.percentileText}>
                {gapSkills.length
                  ? `${gapSkills.length} skill${gapSkills.length > 1 ? "s" : ""} to job-ready`
                  : "Job-ready for your target"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.fullMatrixBtn}
              onPress={() => router.push("/(tabs)/roadmap")}
            >
              <Text style={styles.fullMatrixText}>View Roadmap</Text>
              <Feather name="arrow-right" size={12} color="#731F94" />
            </TouchableOpacity>
          </View>
        </View>
          </>
        )}

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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F5EEFC",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#3C303B",
  },
  emptySectionText: {
    fontSize: 12,
    color: "#7B6F84",
    marginBottom: 10,
    lineHeight: 17,
  },
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
