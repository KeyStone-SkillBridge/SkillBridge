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
  Linking,
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
import { EmptyCard, LoadingState } from "../../components/StateViews";
import { getErrorMessage } from "../../services/api";
import { setLearningProgress, startLearning } from "../../services/skillActions";
import { titleCase, useSkillBridge } from "../../services/useSkillBridge";

const DIFFICULTY_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

export default function LearnScreen() {
  const router = useRouter();
  const { data, stats, loading, refreshing, refresh, reload } = useSkillBridge();
  const [activeFilter, setActiveFilter] = useState("modules"); // 'modules' | 'projects'
  const [busyId, setBusyId] = useState(null);

  const progress = data?.progress || [];
  const recs = data?.recommendations || [];
  const progressByRec = {};
  progress.forEach((p) => {
    progressByRec[String(p.recommendationId)] = p;
  });

  const resources = recs.filter((r) => r.type !== "project");
  const projects = recs.filter((r) => r.type === "project");
  const visible = activeFilter === "modules" ? resources : projects;

  const tracked = progress.length;
  const completed = progress.filter((p) => p.status === "completed");
  const active =
    progress
      .filter((p) => p.status === "in_progress")
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0] || null;
  const hoursLogged = completed.reduce(
    (sum, p) => sum + (p.recommendation?.estimatedHours || 0),
    0,
  );
  const pathwayPct = tracked ? Math.round((completed.length / tracked) * 100) : 0;

  // Pathway Gauge
  const circleSize = 52;
  const strokeWidth = 4.5;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - circumference * (pathwayPct / 100);

  const openUrl = (url) => {
    if (!url) {
      Alert.alert("No link", "This resource doesn't have a link yet.");
      return;
    }
    Linking.openURL(url).catch(() => Alert.alert("Couldn't open link", url));
  };

  const searchSkill = (skill) =>
    openUrl(`https://www.google.com/search?q=${encodeURIComponent(`learn ${skill} free course`)}`);

  const handleStart = async (rec) => {
    setBusyId(`rec-${rec.id}`);
    try {
      await startLearning(rec.id);
      await reload();
      if (rec.url) openUrl(rec.url);
    } catch (err) {
      Alert.alert("Couldn't start tracking", getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleProgress = async (record, pct) => {
    setBusyId(`prog-${record.id}`);
    try {
      await setLearningProgress(record.id, pct);
      await reload();
    } catch (err) {
      Alert.alert("Couldn't update progress", getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

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

      {loading && !data ? (
        <LoadingState label="Loading your learning plan..." />
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#731F94" />
        }
      >
        {/* ================= Breadcrumb & Title ================= */}
        <View style={styles.titleSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.breadcrumbText}>
              PATHWAYS & RESOURCES{" "}
              <Text style={styles.breadcrumbSub}>› Personalised</Text>
            </Text>
            <Text style={styles.pageTitle}>Learning</Text>
            <Text style={styles.targetTrackText}>
              Target Track:{" "}
              <Text style={styles.targetTrackValue}>
                {stats.targetRole || "Not set"}
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

        {/* ================= 1. Learning Pathway Card ================= */}
        <View style={styles.card}>
          <View style={styles.pathwayTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pathwayOverline}>LEARNING PATHWAY</Text>
              <View style={styles.percentRow}>
                <Text style={styles.percentBig}>{pathwayPct}%</Text>
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
                <Text style={styles.gaugeFractionText}>
                  {completed.length}/{tracked}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.pathwayBarTrack}>
            <View style={[styles.pathwayBarFill, { width: `${pathwayPct}%` }]} />
          </View>

          {/* Key Metric Counters */}
          <View style={styles.pathwayMetricsRow}>
            <View style={styles.metricItem}>
              <Ionicons name="checkmark-circle" size={15} color="#731F94" />
              <Text style={styles.metricText}>
                {completed.length} of {tracked} Done
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="play-circle-outline" size={15} color="#731F94" />
              <Text style={styles.metricText}>
                {stats.inProgress.length} In Progress
              </Text>
            </View>
          </View>

          {/* Hours Banner */}
          <View style={styles.streakBanner}>
            <View style={styles.streakLeft}>
              <MaterialCommunityIcons name="fire" size={16} color="#731F94" />
              <Text style={styles.streakBold}>
                {stats.missingSkills.length} skill gap{stats.missingSkills.length === 1 ? "" : "s"} to close
              </Text>
            </View>
            <View style={styles.streakDot} />
            <Text style={styles.streakHoursText}>{hoursLogged} hrs completed</Text>
          </View>
        </View>

        {/* ================= 2. Active resource ================= */}
        {active && (
          <View style={styles.card}>
            <View style={styles.moduleBadgesRow}>
              <View style={styles.activeSprintBadge}>
                <Text style={styles.activeSprintText}>
                  ACTIVE NOW • {active.progressPercentage || 0}%
                </Text>
              </View>

              {!!active.recommendation?.estimatedHours && (
                <View style={styles.timeEstBadge}>
                  <Feather name="clock" size={12} color="#556070" />
                  <Text style={styles.timeEstText}>
                    {active.recommendation.estimatedHours} hrs
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.activeModuleTitle}>
              {active.recommendation?.title || "Learning resource"}
            </Text>

            {!!active.recommendation?.skill?.name && (
              <View style={styles.coDevelopedRow}>
                <MaterialCommunityIcons name="tag-outline" size={13} color="#731F94" />
                <Text style={styles.coDevelopedText}>
                  {active.recommendation.skill.name}
                  {active.recommendation.difficulty
                    ? ` • ${DIFFICULTY_LABEL[active.recommendation.difficulty] || active.recommendation.difficulty}`
                    : ""}
                </Text>
              </View>
            )}

            {/* Progress controls */}
            <View style={styles.lessonListBox}>
              <View style={styles.lessonListHeader}>
                <Text style={styles.lessonProgressTitle}>Update Progress</Text>
                <Text style={styles.lessonProgressCount}>
                  {active.progressPercentage || 0}% done
                </Text>
              </View>
              <View style={styles.pathwayBarTrack}>
                <View
                  style={[styles.pathwayBarFill, { width: `${active.progressPercentage || 0}%` }]}
                />
              </View>
              <View style={styles.progressChipRow}>
                {[25, 50, 75, 100].map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    style={[
                      styles.progressChip,
                      (active.progressPercentage || 0) >= pct && styles.progressChipActive,
                    ]}
                    disabled={busyId === `prog-${active.id}`}
                    onPress={() => handleProgress(active, pct)}
                  >
                    <Text
                      style={[
                        styles.progressChipText,
                        (active.progressPercentage || 0) >= pct && styles.progressChipTextActive,
                      ]}
                    >
                      {pct === 100 ? "Done" : `${pct}%`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* CTAs */}
            <TouchableOpacity
              style={styles.resumeModuleBtn}
              activeOpacity={0.88}
              onPress={() => openUrl(active.recommendation?.url)}
            >
              <Feather name="external-link" size={16} color="#FFFFFF" />
              <Text style={styles.resumeModuleBtnText}>Continue Learning</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= 3. Filter Tabs ================= */}
        <View style={styles.filterTabsRow}>
          {[
            { key: "modules", label: `Resources (${resources.length})` },
            { key: "projects", label: `Projects (${projects.length})` },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterPill,
                activeFilter === f.key && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === f.key && styles.filterPillTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= 4. Recommendations ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <Feather name="star" size={14} color="#556070" />
        </View>

        {visible.length === 0 ? (
          <EmptyCard
            icon="book-open"
            title={recs.length ? "Nothing in this category" : "No recommendations yet"}
            message={
              recs.length
                ? "Switch tabs to see other resources."
                : "We're curating resources for your skill gaps. Meanwhile, search for courses on the skills below."
            }
          />
        ) : (
          visible.map((rec) => {
            const record = progressByRec[String(rec.id)];
            const busy = busyId === `rec-${rec.id}`;
            return (
              <View key={rec.id} style={styles.card}>
                <View style={styles.upcomingBadgeRow}>
                  <View style={styles.moduleNumberPill}>
                    <Text style={styles.moduleNumberText}>
                      {(DIFFICULTY_LABEL[rec.difficulty] || "Resource").toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.unlocksText}>
                    {record
                      ? record.status === "completed"
                        ? "Completed ✓"
                        : `${record.progressPercentage || 0}% done`
                      : rec.skill?.name || ""}
                  </Text>
                </View>

                <Text style={styles.moduleCardTitle}>{rec.title}</Text>
                {!!rec.description && (
                  <Text style={styles.moduleCardDescription}>{rec.description}</Text>
                )}

                <View style={styles.moduleCardFooter}>
                  <View style={styles.metaRow}>
                    <Feather name="clock" size={12} color="#7B6F84" />
                    <Text style={styles.metaText}>
                      {rec.estimatedHours ? `${rec.estimatedHours} hrs total` : "Self-paced"}
                    </Text>
                  </View>
                  {record ? (
                    <TouchableOpacity onPress={() => openUrl(rec.url)}>
                      <Text style={styles.linkText}>Open →</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.launchPillBtn}
                      disabled={busy}
                      onPress={() => handleStart(rec)}
                    >
                      {busy ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.launchPillText}>Start</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}

        {/* ================= 5. Skills to learn (from gap analysis) ================= */}
        {stats.missingSkills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills To Learn</Text>
            <Text style={styles.sectionSubtitle}>
              From your skill-gap analysis. Tap a skill to find free courses.
            </Text>
            <View style={styles.card}>
              {stats.missingSkills.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={styles.checkItemRow}
                  onPress={() => searchSkill(skill)}
                >
                  <MaterialCommunityIcons name="school-outline" size={15} color="#731F94" />
                  <Text style={styles.checkItemLabel}>{titleCase(skill)}</Text>
                  <Feather name="external-link" size={13} color="#731F94" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressChipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  progressChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E4D4EE",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  progressChipActive: {
    backgroundColor: "#731F94",
    borderColor: "#731F94",
  },
  progressChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  progressChipTextActive: {
    color: "#FFFFFF",
  },
  linkText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#731F94",
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
