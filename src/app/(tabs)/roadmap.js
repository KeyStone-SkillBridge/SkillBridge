import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import LogoSvg from "../../../assets/images/logo.svg"; // Points to your downloaded logo SVG asset
import { EmptyCard, LoadingState } from "../../components/StateViews";
import { getErrorMessage } from "../../services/api";
import { getAppState, updateAppState } from "../../services/session";
import { cycleTaskStatus, generateRoadmap } from "../../services/skillActions";
import { titleCase, useSkillBridge } from "../../services/useSkillBridge";
import { logError } from "../../services/logger";
import { useSingleFlight } from "../../services/singleFlight";

const COACH_AVATAR = require("../../../assets/images/TundeAlabi.png"); // Points to your downloaded coach image asset

const PHASES = [
  { key: "30", month: 1, days: "DAYS 1–30", name: "Foundations" },
  { key: "60", month: 2, days: "DAYS 31–60", name: "Projects" },
  { key: "90", month: 3, days: "DAYS 61–90", name: "Job Ready" },
];

const TYPE_LABEL = { learn: "Learn", project: "Project", practice: "Practice", apply: "Apply" };

export default function RoadmapScreen() {
  const router = useRouter();
  const { data, stats, loading, refreshing, refresh, reload } = useSkillBridge();
  const [selectedMonthTab, setSelectedMonthTab] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(null);
  const [localPlan, setLocalPlan] = useState({ planned: [], done: [] });

  const roadmap = data?.activeRoadmap;
  const tbp = roadmap?.tasksByPhase || {};
  const hasTasks = stats.tasks.length > 0;

  // Local fallback plan (used while AI roadmap generation is unavailable)
  useEffect(() => {
    getAppState().then((s) =>
      setLocalPlan({ planned: s.plannedSkills || [], done: s.localDoneSkills || [] }),
    );
  }, [data]);
  const localSkills = [
    ...new Set([...(stats.missingSkills || []).map((s) => s.toLowerCase()), ...localPlan.planned]),
  ];

  // Which phase is "current": first phase with unfinished tasks.
  const currentPhaseIdx = Math.max(
    0,
    PHASES.findIndex((p) => (tbp[p.key] || []).some((t) => t.status !== "done")),
  );

  useEffect(() => {
    if (hasTasks) setSelectedMonthTab(currentPhaseIdx + 1);
  }, [hasTasks, currentPhaseIdx]);

  const phase = PHASES[selectedMonthTab - 1];
  const phaseTasks = [...(tbp[phase.key] || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
  const phaseDone = phaseTasks.filter((t) => t.status === "done").length;

  // Gauge
  const circleSize = 52;
  const strokeWidth = 4.5;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const matchPct = stats.topMatch?.matchPercentage ?? stats.readiness;
  const strokeDashoffset = circumference - circumference * (matchPct / 100);

  const remaining = stats.tasks.length - stats.doneTasks;
  const coachQuote = hasTasks
    ? remaining === 0
      ? '"Roadmap complete — time to apply!"'
      : `"You're ${remaining} task${remaining > 1 ? "s" : ""} away!"`
    : stats.missingSkills.length
      ? `"Close ${stats.missingSkills.length} gap${stats.missingSkills.length > 1 ? "s" : ""} to be job-ready."`
      : '"Let\'s build your plan."';

  const handleGenerate = useSingleFlight(async () => {
    setGenerating(true);
    try {
      await generateRoadmap(data?.latestGap?.id);
      await reload();
      Alert.alert("Roadmap ready", "Your personalised 90-day roadmap has been generated.");
    } catch (err) {
      logError("roadmap", "handleGenerate", err);
      Alert.alert("Roadmap", getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }, "handleGenerate");

  const handleTaskPress = async (task) => {
    if (!roadmap?.id) return;
    setUpdatingTask(task.id);
    try {
      await cycleTaskStatus(roadmap.id, task);
      await reload();
    } catch (err) {
      logError("roadmap", "handleTaskPress", err);
      Alert.alert("Couldn't update task", getErrorMessage(err));
    } finally {
      setUpdatingTask(null);
    }
  };

  const toggleLocalSkill = async (skill) => {
    const done = new Set(localPlan.done);
    done.has(skill) ? done.delete(skill) : done.add(skill);
    const next = [...done];
    setLocalPlan((p) => ({ ...p, done: next }));
    await updateAppState({ localDoneSkills: next });
  };

  const openResource = (url) => {
    if (!url) return;
    Linking.openURL(url).catch((e) => {
      logError("roadmap", "open link", e);
      Alert.alert("Couldn't open link", url);
    });
  };

  const renderTask = (task) => {
    const isDone = task.status === "done";
    const isActive = task.status === "in_progress";
    const busy = updatingTask === task.id;
    const statusBtnLabel = isDone ? "Mark as To-do" : isActive ? "Mark Complete" : "Start Task";

    const body = (
      <>
        <View style={styles.weekTopRow}>
          {isDone ? (
            <View style={styles.verifiedCheckWrap}>
              <Ionicons name="checkmark" size={14} color="#0D8A58" />
            </View>
          ) : isActive ? (
            <View style={styles.activePlayWrap}>
              <Ionicons name="play" size={13} color="#731F94" />
            </View>
          ) : (
            <View style={styles.clockIconWrap}>
              <Ionicons name="time-outline" size={15} color="#731F94" />
            </View>
          )}
          <Text style={isActive ? styles.weekActiveLabel : styles.weekNumberText}>
            {(TYPE_LABEL[task.taskType] || "Task").toUpperCase()}
            {task.estimatedHours ? ` • ${task.estimatedHours}H` : ""}
            {isActive ? " • ACTIVE NOW" : ""}
          </Text>
          {isDone && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="ribbon-outline" size={11} color="#0D8A58" />
              <Text style={styles.verifiedBadgeText}>Completed</Text>
            </View>
          )}
        </View>

        <Text style={styles.moduleTitle}>{task.title}</Text>
        {!!task.description && (
          <Text style={styles.moduleDescription}>{task.description}</Text>
        )}

        <View style={styles.actionBtnRow}>
          <TouchableOpacity
            style={[styles.resumeBtn, isDone && styles.resumeBtnMuted]}
            activeOpacity={0.88}
            disabled={busy}
            onPress={() => handleTaskPress(task)}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name={isDone ? "refresh" : isActive ? "checkmark-done" : "play"}
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.resumeBtnText}>{statusBtnLabel}</Text>
              </>
            )}
          </TouchableOpacity>

          {!!task.resourceUrl && (
            <TouchableOpacity
              style={styles.helpCircleBtn}
              hitSlop={10}
              onPress={() => openResource(task.resourceUrl)}
            >
              <Feather name="external-link" size={18} color="#731F94" />
            </TouchableOpacity>
          )}
        </View>
      </>
    );

    if (isActive) {
      return (
        <View key={task.id} style={styles.currentSprintBorderWrap}>
          <View style={styles.currentSprintTag}>
            <View style={styles.whiteTinyDot} />
            <Text style={styles.currentSprintTagText}>CURRENT SPRINT</Text>
          </View>
          {body}
        </View>
      );
    }
    return (
      <View key={task.id} style={styles.card}>
        {body}
      </View>
    );
  };

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

      {loading && !data ? (
        <LoadingState label="Loading your roadmap..." />
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#731F94" />
        }
      >
        {/* ================= 1. Calibrated Target Track Card ================= */}
        <View style={styles.targetCard}>
          <View style={styles.targetTopRow}>
            <View style={styles.targetLeftCol}>
              <View style={styles.calibratedPill}>
                <Ionicons name="star" size={11} color="#731F94" />
                <Text style={styles.calibratedPillText}>
                  {hasTasks ? "TARGET TRACK CALIBRATED" : "TARGET TRACK"}
                </Text>
              </View>
              <Text style={styles.targetRoleText}>
                {roadmap?.targetRole ? titleCase(roadmap.targetRole) : stats.targetRole || "Set a target role"}
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
                  <Text style={styles.gaugePercentText}>{matchPct}%</Text>
                </View>
              </View>
              <Text style={styles.roleMatchLabel}>
                {stats.topMatch ? "ROLE MATCH" : "READINESS"}
              </Text>
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
              <Text style={styles.coachQuote}>{coachQuote}</Text>
            </View>

            <TouchableOpacity
              style={styles.askBtn}
              onPress={() => router.push("/(tabs)/learn")}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-outline" size={13} color="#731F94" />
              <Text style={styles.askBtnText}>Learn</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!roadmap ? (
          <>
            <EmptyCard
              icon="map"
              title="Generate your 90-day roadmap"
              message={
                data?.latestGap
                  ? "We'll turn your skill gaps into a 30/60/90-day plan of tasks and projects."
                  : "Complete your skill-gap analysis first so we know what to plan for."
              }
              ctaLabel={generating ? "Generating..." : data?.latestGap ? "Generate Roadmap" : "Start Analysis"}
              onPress={
                generating
                  ? undefined
                  : data?.latestGap
                    ? handleGenerate
                    : () => router.push("/profile-setup")
              }
            />

            {localSkills.length > 0 && (
              <>
                <View style={styles.curriculumSectionHeader}>
                  <Text style={styles.curriculumTitle}>Your Skill Plan</Text>
                  <View style={{ alignItems: "flex-end" }}>
                    <View style={styles.inProgressPill}>
                      <Text style={styles.inProgressText}>
                        {localPlan.done.filter((d) => localSkills.includes(d)).length}/{localSkills.length} done
                      </Text>
                    </View>
                  </View>
                </View>
                {localSkills.map((skill) => {
                  const done = localPlan.done.includes(skill);
                  return (
                    <TouchableOpacity
                      key={skill}
                      style={styles.card}
                      activeOpacity={0.85}
                      onPress={() => toggleLocalSkill(skill)}
                    >
                      <View style={styles.weekTopRow}>
                        {done ? (
                          <View style={styles.verifiedCheckWrap}>
                            <Ionicons name="checkmark" size={14} color="#0D8A58" />
                          </View>
                        ) : (
                          <View style={styles.clockIconWrap}>
                            <Ionicons name="time-outline" size={15} color="#731F94" />
                          </View>
                        )}
                        <Text style={styles.weekNumberText}>SKILL GAP</Text>
                      </View>
                      <Text style={styles.moduleTitle}>Learn {titleCase(skill)}</Text>
                      <Text style={styles.moduleDescription}>
                        {done ? "Marked as learned — tap to undo." : "Tap when you've learned this skill."}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </>
        ) : (
          <>
        {/* ================= 2. Pace Tracker Card ================= */}
        <View style={styles.card}>
          <Text style={styles.paceOverline}>PACE TRACKER</Text>
          <View style={styles.paceHeaderRow}>
            <Text style={styles.paceDaysText}>Day {stats.dayNumber} of 90</Text>
            <View style={styles.sprintPill}>
              <Text style={styles.sprintPillText}>Phase {currentPhaseIdx + 1} of 3</Text>
            </View>
            <Text style={styles.pacePercentText}>{stats.taskPct}%</Text>
          </View>

          {/* 3-Segment Timeline Progress Bar */}
          <View style={styles.segmentedProgressBar}>
            {PHASES.map((p, i) => (
              <View
                key={p.key}
                style={[
                  styles.barSegment,
                  i < currentPhaseIdx
                    ? styles.segmentActive
                    : i === currentPhaseIdx
                      ? styles.segmentMid
                      : styles.segmentInactive,
                ]}
              />
            ))}
          </View>

          <View style={styles.segmentLabelsRow}>
            {PHASES.map((p, i) =>
              i === currentPhaseIdx ? (
                <View key={p.key} style={styles.activeLabelDotWrap}>
                  <View style={styles.purpleTinyDot} />
                  <Text style={styles.segmentLabelActive}>
                    Month {p.month}:{"\n"}{p.name}
                  </Text>
                </View>
              ) : (
                <Text key={p.key} style={styles.segmentLabelInactive}>
                  Month {p.month}:{"\n"}{p.name}
                </Text>
              ),
            )}
          </View>
        </View>

        {/* ================= 3. Month Horizon Tabs ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthTabsRow}
        >
          {PHASES.map((p) => {
            const active = selectedMonthTab === p.month;
            const count = (tbp[p.key] || []).length;
            return (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.monthTab,
                  active ? styles.monthTabActive : styles.monthTabInactive,
                ]}
                onPress={() => setSelectedMonthTab(p.month)}
                activeOpacity={0.85}
              >
                <View style={active ? styles.monthNumberBoxActive : styles.monthNumberBoxInactive}>
                  <Text style={active ? styles.monthNumberTextActive : styles.monthNumberTextInactive}>
                    {p.month}
                  </Text>
                </View>
                <View>
                  <Text style={active ? styles.monthDaysLabelActive : styles.monthDaysLabelInactive}>
                    {p.days} • {count} task{count === 1 ? "" : "s"}
                  </Text>
                  <Text style={active ? styles.monthTabTitleActive : styles.monthTabTitleInactive}>
                    Month {p.month}: {p.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ================= 4. Selected phase curriculum ================= */}
        <View style={styles.curriculumSectionHeader}>
          <Text style={styles.curriculumTitle}>
            Month {phase.month}:{"\n"}{phase.name}
          </Text>
          <View style={{ alignItems: "flex-end" }}>
            <View style={styles.inProgressPill}>
              <Text style={styles.inProgressText}>
                {phaseTasks.length === 0
                  ? "Empty"
                  : phaseDone === phaseTasks.length
                    ? "Completed"
                    : selectedMonthTab - 1 === currentPhaseIdx
                      ? "In Progress"
                      : "Upcoming"}
              </Text>
            </View>
            <Text style={styles.durationSubText}>
              {phaseDone}/{phaseTasks.length} done
            </Text>
          </View>
        </View>

        {phaseTasks.length === 0 ? (
          <Text style={styles.moduleDescription}>
            No tasks in this phase yet. Add gaps from the Skill Gap tab.
          </Text>
        ) : (
          phaseTasks.map(renderTask)
        )}

        {/* ================= 5. Upcoming Milestones ================= */}
        <View style={styles.upcomingHeaderRow}>
          <Text style={styles.upcomingTitle}>Upcoming Milestones</Text>
          <Text style={styles.visionText}>Full 90–Day Vision</Text>
        </View>

        {PHASES.filter((p) => p.month > currentPhaseIdx + 1).map((p) => {
          const tasks = tbp[p.key] || [];
          const skills = [...new Set(tasks.map((t) => t.skill).filter(Boolean))].slice(0, 3);
          return (
            <TouchableOpacity
              key={p.key}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => setSelectedMonthTab(p.month)}
            >
              <View style={styles.milestoneTopRow}>
                <View style={styles.milestoneIconSquare}>
                  {p.month === 2 ? (
                    <FontAwesome5 name="university" size={14} color="#731F94" />
                  ) : (
                    <MaterialCommunityIcons name="handshake-outline" size={18} color="#731F94" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.milestonePeriodText}>
                    MONTH {p.month} ({p.days})
                  </Text>
                </View>
                <View style={styles.lockedPreviewBadge}>
                  <Feather name="lock" size={10} color="#556070" />
                  <Text style={styles.lockedPreviewText}>{tasks.length} tasks</Text>
                </View>
              </View>

              <Text style={styles.milestoneHeadingText}>
                {tasks[0]?.title || `Month ${p.month}: ${p.name}`}
              </Text>
              {tasks.length > 1 && (
                <Text style={styles.milestoneBodyText}>
                  + {tasks.length - 1} more task{tasks.length > 2 ? "s" : ""}
                </Text>
              )}

              {skills.length > 0 && (
                <View style={styles.miniChipsRow}>
                  {skills.map((s) => (
                    <View key={s} style={styles.miniTechPill}>
                      <Text style={styles.miniTechText}>{titleCase(s)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
          </>
        )}

        {/* ================= 7. Bottom Workspace CTA ================= */}
        <TouchableOpacity
          style={styles.workspaceBtn}
          activeOpacity={0.88}
          onPress={() => router.push("/(tabs)/learn")}
        >
          <Text style={styles.workspaceBtnText}>View Learning Resources</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  resumeBtnMuted: {
    backgroundColor: "#A396A6",
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
