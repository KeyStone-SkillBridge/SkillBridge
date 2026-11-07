import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import LogoSvg from "../../../assets/images/logo.svg";
import { EmptyCard, LoadingState } from "../../components/StateViews";
import { skillIcon } from "../../services/skillActions";
import { titleCase, useSkillBridge } from "../../services/useSkillBridge";

const tierFor = (pct) =>
  pct >= 80
    ? "HIRE–READY"
    : pct >= 60
      ? "NEARLY READY"
      : pct >= 35
        ? "DEVELOPING"
        : "GETTING STARTED";

// ---- CV display helpers (API CV: { id, fileName, fileType, fileSize, createdAt }) ----
const formatBytes = (bytes) => {
  const n = Number(bytes);
  if (!n || n < 0) return "";
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const cvKind = (cv) => {
  const type = String(cv?.fileType || "").toLowerCase();
  const name = String(cv?.fileName || "").toLowerCase();
  if (type.includes("pdf") || name.endsWith(".pdf")) return "PDF";
  if (type.includes("wordprocessingml") || name.endsWith(".docx")) return "DOCX";
  if (type.includes("msword") || name.endsWith(".doc")) return "DOC";
  return "";
};

const formatDate = (iso) => {
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ProfileScreen() {
  const router = useRouter();
  const { data, stats, loading, refreshing, refresh } = useSkillBridge();

  const profile = data?.profile || {};
  const requiredSet = new Set(stats.requiredSkills.map((s) => s.toLowerCase()));
  const nextTask = stats.tasks.find((t) => t.status !== "done");
  const learning = stats.inProgress;
  const latestCv = data?.cvs?.[0];

  const details = [
    { icon: "target", label: "Career Goal", value: profile.careerGoal },
    { icon: "book-open", label: "Education", value: profile.education },
    { icon: "briefcase", label: "Experience", value: profile.experience },
    { icon: "map-pin", label: "Location", value: profile.location },
    { icon: "phone", label: "Phone", value: profile.phone },
    { icon: "mail", label: "Email", value: data?.me?.email },
  ].filter((d) => d.value);

  const cvMeta = latestCv
    ? [
        cvKind(latestCv),
        formatBytes(latestCv.fileSize),
        latestCv.createdAt ? `Uploaded ${formatDate(latestCv.createdAt)}` : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FC" />

      {/* ================= Header Bar ================= */}
      <View style={styles.headerBar}>
        <View style={styles.headerBrandGroup}>
          <LogoSvg width={30} height={30} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.brandTitle}>SkillBridge</Text>
            <Text style={styles.brandSubtitle}>PROFILE</Text>
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

      {loading && !data ? (
        <LoadingState label="Loading your profile..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#731F94"
            />
          }
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
                  <Text style={styles.heroName}>
                    {stats.fullName || "Your Name"}
                  </Text>
                  {data?.me?.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#731F94"
                      style={{ marginLeft: 6 }}
                    />
                  )}
                </View>
                <Text style={styles.heroSubtitle}>
                  {stats.targetRole ||
                    profile.education ||
                    data?.me?.email ||
                    ""}
                </Text>
              </View>
            </View>

            {/* Hire-Ready Banner */}
            <View style={styles.hireReadyBox}>
              <View style={styles.hireReadyNumberWrap}>
                <Text style={styles.hireReadyPercent}>{stats.readiness}</Text>
                <Text style={styles.hireReadyPercentSymbol}>%</Text>
              </View>

              <View style={styles.hireReadyMetaCol}>
                <Text style={styles.hireReadyLabel}>
                  {tierFor(stats.readiness)}
                </Text>
                <Text style={styles.hireReadyCohortText}>
                  {stats.missingSkills.length
                    ? `${stats.missingSkills.length} skill gap${stats.missingSkills.length > 1 ? "s" : ""} remaining`
                    : stats.hasGap
                      ? "No critical gaps"
                      : "Upload your CV to get scored"}
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
                  {stats.hasRoadmap
                    ? `Roadmap: Day ${stats.dayNumber} of 90`
                    : "Roadmap not started"}
                </Text>
              </View>
              <Text style={styles.badgesCountText}>
                {stats.doneTasks} of {stats.tasks.length} Tasks
              </Text>
            </View>

            <View style={styles.velocityTrack}>
              <View
                style={[styles.velocityFill, { width: `${stats.taskPct}%` }]}
              />
            </View>

            {/* Sub-stats */}
            <View style={styles.streakSubRow}>
              <View style={styles.streakWrap}>
                <MaterialCommunityIcons name="fire" size={14} color="#731F94" />
                <Text style={styles.streakText}>
                  {stats.completedProgress} resource
                  {stats.completedProgress === 1 ? "" : "s"} completed
                </Text>
              </View>
              {!!nextTask && (
                <Text style={styles.nextCapstoneText} numberOfLines={1}>
                  Next: {nextTask.title}
                </Text>
              )}
            </View>
          </View>

          {/* ================= 2. Skill Matrix ================= */}
          <View style={styles.matrixHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.matrixSectionTitle}>Skill Matrix</Text>
              <Text style={styles.matrixSectionSubtitle}>
                Extracted from your CV and confirmed by you
              </Text>
            </View>

            <View style={styles.w12Badge}>
              <Text style={styles.w12BadgeText}>
                {stats.currentSkills.length}
                {"\n"}Skills
              </Text>
            </View>
          </View>

          {stats.currentSkills.length === 0 ? (
            <EmptyCard
              icon="award"
              title="No skills on your profile yet"
              message={
                latestCv
                  ? "Your CV is uploaded, but no skills have been extracted from it yet. Re-upload it or add your skills in Profile Settings."
                  : "Upload your CV and our AI will extract your skills automatically."
              }
              ctaLabel={latestCv ? "Update CV" : "Upload CV"}
              onPress={() => router.push("/profile-settings")}
            />
          ) : (
            stats.currentSkills.map((skill) => {
              const required = requiredSet.has(skill.toLowerCase());
              return (
                <View key={skill} style={styles.card}>
                  <View style={styles.badgeTopRow}>
                    <View style={styles.badgeIconWrap}>
                      <MaterialCommunityIcons
                        name={skillIcon(skill)}
                        size={20}
                        color="#731F94"
                      />
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.badgeTitleRow}>
                        <Text style={styles.badgeTitle}>
                          {titleCase(skill)}
                        </Text>
                        {required && (
                          <Ionicons
                            name="checkmark-circle"
                            size={13}
                            color="#731F94"
                          />
                        )}
                      </View>
                      <Text style={styles.badgeValidationText}>
                        {required
                          ? `Required for ${stats.targetRole || "your target role"}`
                          : "Transferable skill"}
                      </Text>
                    </View>

                    <View style={styles.scoreWrap}>
                      <Text style={styles.masteryLabel}>
                        {required ? "CORE" : "BONUS"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          {/* In-progress learning (like the "active badge" card) */}
          {learning.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.badgeTopRow}>
                <View style={styles.badgeIconWrap}>
                  <MaterialCommunityIcons
                    name="laptop"
                    size={20}
                    color="#731F94"
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.badgeTitle}>
                    {p.recommendation?.title || "Learning resource"}
                  </Text>
                  <Text style={styles.badgeValidationText}>
                    {p.recommendation?.skill?.name || "In progress"}
                  </Text>
                </View>

                <View style={styles.scoreWrap}>
                  <Text style={styles.scoreBig}>
                    {p.progressPercentage || 0}%
                  </Text>
                  <Text style={styles.activeLabel}>ACTIVE</Text>
                </View>
              </View>

              <View style={styles.velocityTrack}>
                <View
                  style={[
                    styles.velocityFill,
                    { width: `${p.progressPercentage || 0}%` },
                  ]}
                />
              </View>

              <View style={styles.activeCardFooter}>
                <View />
                <TouchableOpacity
                  style={styles.resumeModuleRow}
                  onPress={() => router.push("/(tabs)/learn")}
                >
                  <Text style={styles.resumeModuleText}>Resume</Text>
                  <Feather name="arrow-right" size={13} color="#731F94" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* ================= 3. Profile Details ================= */}
          <View style={styles.credentialContainer}>
            <View style={styles.credentialTopHeader}>
              <View style={styles.qrIconSquare}>
                <Feather name="user" size={20} color="#731F94" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.credTitle}>Profile Details</Text>
                <Text style={styles.credSub}>
                  {latestCv ? "CV ON FILE" : "NO CV UPLOADED"}
                </Text>
              </View>
            </View>

            {!!latestCv && (
              <TouchableOpacity
                style={styles.cvRow}
                activeOpacity={0.85}
                onPress={() => router.push("/profile-settings")}
              >
                <View style={styles.cvIconWrap}>
                  <Feather name="file-text" size={18} color="#731F94" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.cvName} numberOfLines={1}>
                    {latestCv.fileName || "My CV"}
                  </Text>
                  {!!cvMeta && <Text style={styles.cvMeta}>{cvMeta}</Text>}
                </View>
                <Feather name="chevron-right" size={16} color="#7B6F84" />
              </TouchableOpacity>
            )}

            {!!profile.bio && (
              <Text style={styles.detailBio}>{profile.bio}</Text>
            )}

            {details.length === 0 ? (
              <Text style={styles.detailEmpty}>
                Your profile is empty. Add your details in Profile Settings.
              </Text>
            ) : (
              details.map((d) => (
                <View key={d.label} style={styles.detailRow}>
                  <Feather name={d.icon} size={14} color="#731F94" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.detailLabel}>{d.label}</Text>
                    <Text style={styles.detailValue}>{d.value}</Text>
                  </View>
                </View>
              ))
            )}

            <TouchableOpacity
              style={styles.dossierBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/profile-settings")}
            >
              <Feather name="edit-2" size={15} color="#731F94" />
              <Text style={styles.dossierBtnText}>
                {latestCv
                  ? "Edit Profile & Replace CV"
                  : "Edit Profile & Upload CV"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.profileSettingsBtn}
            activeOpacity={0.88}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.profileSettingsBtnText}>Account Settings</Text>
            <Ionicons name="settings" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cvRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF5FC",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  cvIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cvName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#131B2A",
  },
  cvMeta: {
    fontSize: 11,
    color: "#556070",
    marginTop: 2,
  },
  detailBio: {
    fontSize: 12,
    color: "#3C303B",
    lineHeight: 17,
    marginBottom: 10,
  },
  detailEmpty: {
    fontSize: 12,
    color: "#7B6F84",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E5F7",
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7B6F84",
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#131B2A",
    marginTop: 2,
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
