import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  RefreshControl,
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
import { ErrorBanner, LoadingState } from "../../components/StateViews";
import { initials, titleCase, useSkillBridge } from "../../services/useSkillBridge";

export default function HomeScreen() {
  const router = useRouter();
  const { data, stats, loading, refreshing, refresh } = useSkillBridge();

  const matches = data?.matches || [];
  const requiredSet = new Set(stats.requiredSkills.map((s) => s.toLowerCase()));
  const progress = data?.progress || [];

  // Onboarding milestones driven by real data
  const milestones = [
    {
      key: "profile",
      label: "Basic Profile Survey",
      done: !!data?.profile,
      route: "/profile-settings",
    },
    {
      key: "cv",
      label: "CV Upload & AI Extraction",
      done: stats.hasCV && stats.hasGap,
      badge: stats.currentSkills.length ? `${stats.currentSkills.length} parsed` : null,
      route: "/profile-setup",
    },
    {
      key: "matches",
      label: "Generate Career Matches",
      done: matches.length > 0,
      route: "/(tabs)/jobs",
    },
    {
      key: "roadmap",
      label: "Activate 90–Day\nRoadmap",
      done: stats.hasRoadmap,
      route: "/(tabs)/roadmap",
    },
  ];
  const doneCount = milestones.filter((m) => m.done).length;
  const milestonePct = Math.round((doneCount / milestones.length) * 100);
  const nextIdx = milestones.findIndex((m) => !m.done);

  const someFailed = (data?.errors || []).length > 0 && (data?.errors || []).length < 7;

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
            style={[styles.profileOutlineCircle, styles.avatarInitialsCircle]}
            onPress={() => router.push("/(tabs)/profile")}
            hitSlop={8}
          >
            <Text style={styles.avatarInitialsText}>{initials(stats.fullName)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !data ? (
        <LoadingState label="Loading your dashboard..." />
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#731F94" />
        }
      >
        {someFailed && (
          <ErrorBanner
            message="Some data couldn't load. Pull down or tap to retry."
            onRetry={refresh}
          />
        )}

        {/* ================= 1. Hero Purple Card ================= */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.inductionPill}>
              <View style={styles.whiteDot} />
              <Text style={styles.inductionPillText}>
                {stats.hasRoadmap ? `Day ${stats.dayNumber} of 90` : "Day 1 Induction"}
              </Text>
            </View>

            <Shield width={16} height={20} />
          </View>

          <Text style={styles.heroHeadline}>
            Welcome to SkillBridge,{"\n"}{stats.firstName}! 👋
          </Text>

          <View style={styles.corridorRow}>
            <Stack width={16} height={16} />
            <Text style={styles.corridorText}>
              {[stats.targetRole || "Set your target role", stats.location]
                .filter(Boolean)
                .join(" • ")}
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

            <Text style={styles.milestonePercentText}>
              {milestonePct}%{"\n"}Completed
            </Text>
          </View>

          {/* Progress Track */}
          <View style={styles.milestoneTrack}>
            <View style={[styles.milestoneFill, { width: `${milestonePct}%` }]} />
          </View>

          {/* Milestone List */}
          <View style={styles.milestoneList}>
            {milestones.map((m, idx) => {
              if (m.done) {
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={styles.milestoneItem}
                    onPress={() => router.push(m.route)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.milestoneItemLeft}>
                      <Ionicons name="checkmark-circle" size={18} color="#731F94" />
                      <Text style={styles.milestoneItemText}>{m.label}</Text>
                    </View>
                    {m.badge ? (
                      <Text style={styles.milestoneParsedBadge}>{m.badge}</Text>
                    ) : (
                      <Text style={styles.milestoneStatusDone}>Done</Text>
                    )}
                  </TouchableOpacity>
                );
              }
              if (idx === nextIdx) {
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.milestoneItem, styles.milestoneItemActive]}
                    activeOpacity={0.8}
                    onPress={() => router.push(m.route)}
                  >
                    <View style={styles.milestoneItemLeft}>
                      <Ionicons name="radio-button-on" size={18} color="#731F94" />
                      <Text style={[styles.milestoneItemText, { fontWeight: "700" }]}>
                        {m.label}
                      </Text>
                    </View>
                    <View style={styles.upNextBadge}>
                      <Text style={styles.upNextText}>Up Next</Text>
                    </View>
                  </TouchableOpacity>
                );
              }
              return (
                <View key={m.key} style={styles.milestoneItem}>
                  <View style={styles.milestoneItemLeft}>
                    <Feather name="lock" size={16} color="#A396A6" />
                    <Text style={styles.milestoneItemTextLocked}>{m.label}</Text>
                  </View>
                  <Text style={styles.lockedText}>Locked</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ================= 3. Baseline Readiness Telemetry ================= */}
        <View style={styles.telemetrySectionHeader}>
          <Text style={styles.telemetrySectionTitle}>
            Baseline Readiness Telemetry
          </Text>
          <Text style={styles.realtimeSyncText}>Pull to sync</Text>
        </View>

        <View style={styles.telemetryGrid}>
          {/* Box 1: Readiness */}
          <TouchableOpacity
            style={styles.telemetryBox}
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/skills")}
          >
            <View style={styles.telemetryBoxTop}>
              <Text style={styles.telemetryBoxLabel}>Readiness</Text>
              <Readiness />
            </View>
            <View style={styles.telemetryNumberRow}>
              <Text style={styles.telemetryNumberBig}>{stats.readiness}%</Text>
              <Text style={styles.telemetryNumberSub}>CV</Text>
            </View>
            <View style={styles.miniBarTrack}>
              <View style={[styles.miniBarFill, { width: `${stats.readiness}%` }]} />
            </View>
            <Text style={styles.telemetryCaption}>
              {stats.missingSkills.length
                ? `📈 Close ${stats.missingSkills.length} gap${stats.missingSkills.length > 1 ? "s" : ""}`
                : stats.hasGap
                  ? "✅ No critical gaps"
                  : "📄 Upload CV to score"}
            </Text>
          </TouchableOpacity>

          {/* Box 2: Job Matches */}
          <TouchableOpacity
            style={styles.telemetryBox}
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/jobs")}
          >
            <View style={styles.telemetryBoxTop}>
              <Text style={styles.telemetryBoxLabel}>Job Matches</Text>
              <Feather name="send" size={15} color="#731F94" />
            </View>
            <Text style={styles.telemetryNumberBig}>{matches.length}</Text>
            <Text style={styles.telemetryCaptionGray}>
              {matches.length
                ? `Best fit: ${matches[0].matchPercentage}%`
                : "Generate matches on the\nJobs tab"}
            </Text>
          </TouchableOpacity>

          {/* Box 3: Sprint Track */}
          <TouchableOpacity
            style={styles.telemetryBox}
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/roadmap")}
          >
            <View style={styles.telemetryBoxTop}>
              <Text style={styles.telemetryBoxLabel}>Roadmap</Text>
              <Ionicons name="calendar-outline" size={16} color="#731F94" />
            </View>
            <View style={styles.telemetryNumberRow}>
              <Text style={styles.telemetryNumberBig}>
                {stats.hasRoadmap ? `Day ${stats.dayNumber}` : "—"}
              </Text>
              <Text style={styles.telemetryNumberSub}>/ 90</Text>
            </View>
            <View style={styles.telemetryTagRow}>
              <View style={styles.tinyPurpleDot} />
              <Text style={styles.telemetryTagText}>
                {stats.hasRoadmap
                  ? `${stats.doneTasks}/${stats.tasks.length} tasks done`
                  : "Ready to Initiate"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Box 4: Learning */}
          <TouchableOpacity
            style={styles.telemetryBox}
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/learn")}
          >
            <View style={styles.telemetryBoxTop}>
              <Text style={styles.telemetryBoxLabel}>Learning</Text>
              <Ionicons name="trophy-outline" size={16} color="#731F94" />
            </View>
            <View style={styles.telemetryNumberRow}>
              <Text style={styles.telemetryNumberBig}>{stats.completedProgress}</Text>
              <Text style={styles.telemetryNumberSub}>/ {progress.length}</Text>
            </View>
            <Text style={styles.telemetryCaptionGray}>
              {progress.length ? "Resources completed" : "Start a resource to track"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= 4. Extracted Skills Container ================= */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => router.push("/(tabs)/skills")}
        >
          <View style={styles.extractedHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.extractedTitle}>Extracted Skills</Text>
              <Text style={styles.extractedSubtitle}>
                {stats.currentSkills.length
                  ? "Parsed from CV • Highlighted skills match your target role"
                  : "No skills yet — upload your CV to extract them"}
              </Text>
            </View>
            <MaterialCommunityIcons name="creation" size={18} color="#731F94" />
          </View>

          <View style={styles.skillsTagWrap}>
            {stats.currentSkills.slice(0, 10).map((skill) =>
              requiredSet.has(skill.toLowerCase()) || requiredSet.size === 0 ? (
                <View key={skill} style={styles.skillTagVerified}>
                  <Ionicons name="checkmark" size={12} color="#731F94" />
                  <Text style={styles.skillTagTextVerified}>{titleCase(skill)}</Text>
                </View>
              ) : (
                <View key={skill} style={styles.skillTagPending}>
                  <Feather name="info" size={12} color="#731F94" />
                  <Text style={styles.skillTagTextPending}>{titleCase(skill)}</Text>
                </View>
              ),
            )}
            {stats.missingSkills.slice(0, 3).map((skill) => (
              <View key={`missing-${skill}`} style={styles.skillTagPending}>
                <Feather name="plus" size={12} color="#731F94" />
                <Text style={styles.skillTagTextPending}>{titleCase(skill)} (gap)</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* ================= 5. Preliminary Role Matches ================= */}
        <View style={styles.card}>
          <View style={styles.roleMatchesHeaderRow}>
            <View>
              <Text style={styles.roleMatchesTitle}>
                {matches.length ? "Top Role Matches" : "Preliminary Role Matches"}
              </Text>
              <Text style={styles.roleMatchesSubtitle}>
                Ranked by skill compatibility
              </Text>
            </View>

            <View style={styles.lockedPill}>
              <Feather name={matches.length ? "zap" : "lock"} size={11} color="#731F94" />
              <Text style={styles.lockedPillText}>{matches.length ? "Live" : "Locked"}</Text>
            </View>
          </View>

          {matches.length === 0 ? (
            <TouchableOpacity onPress={() => router.push("/(tabs)/jobs")}>
              <Text style={styles.roleMatchesSubtitle}>
                No matches yet. Open the Jobs tab to generate your matches →
              </Text>
            </TouchableOpacity>
          ) : (
            matches.slice(0, 2).map((m) => {
              const opp = m.opportunity || {};
              return (
                <TouchableOpacity
                  key={m.id}
                  style={styles.jobCard}
                  activeOpacity={0.85}
                  onPress={() => router.push("/(tabs)/jobs")}
                >
                  <View style={styles.jobTopRow}>
                    <View style={styles.companyLogoBox}>
                      <Text style={styles.companyLogoText}>{initials(opp.company)}</Text>
                    </View>
                    <View style={styles.jobTitleCol}>
                      <Text style={styles.jobTitleText}>{opp.title}</Text>
                      <Text style={styles.jobCompanyText}>
                        {[opp.company, opp.location].filter(Boolean).join(" • ")}
                      </Text>
                    </View>
                    <Text style={styles.matchPercentText}>{m.matchPercentage}% Match</Text>
                  </View>

                  <View style={styles.jobBottomRow}>
                    <Text style={styles.salaryText}>
                      {titleCase((opp.type || "role").replace("_", " "))} • {titleCase(opp.workMode || "onsite")}
                    </Text>
                    <View style={styles.validateRow}>
                      <MaterialCommunityIcons
                        name="shield-search"
                        size={14}
                        color="#731F94"
                      />
                      <Text style={styles.validateText}>
                        {(m.missingSkills || []).length
                          ? `${m.missingSkills.length} gap${m.missingSkills.length > 1 ? "s" : ""} to close`
                          : "Ready to apply"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
            <Text style={styles.cohortTag}>SkillBridge Pro</Text>
            <Text style={styles.cohortTitle}>Join an Analyst Cohort</Text>
            <Text style={styles.cohortSubtitle}>
              Peer reviews, mentor sessions & mock interviews.
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#731F94" />
        </TouchableOpacity>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarInitialsCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialsText: {
    fontSize: 11,
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
