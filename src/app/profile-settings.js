import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getErrorMessage } from "../services/api";
import {
  asList,
  buildCvFormData,
  cvService,
  profileService,
  unwrap,
  userService,
} from "../services/endpoints";
import { getAppState, setCachedUser, updateAppState } from "../services/session";
import { initials, invalidateSkillBridge, useSkillBridge } from "../services/useSkillBridge";
import { logError } from "../services/logger";
import { useSingleFlight } from "../services/singleFlight";

const FIELDS = [
  { key: "fullName", label: "Full Name", placeholder: "Your full name" },
  { key: "phone", label: "Mobile Line", placeholder: "+234 800 000 0000", keyboardType: "phone-pad" },
  { key: "location", label: "Location", placeholder: "e.g. Yaba, Lagos / Remote" },
  { key: "careerGoal", label: "Career Goal", placeholder: "e.g. Junior Data Analyst" },
  { key: "education", label: "Education", placeholder: "e.g. B.Sc Economics, UNILAG (2023)" },
  { key: "experience", label: "Experience", placeholder: "e.g. Finance Intern – GTBank (6 months)", multiline: true },
  { key: "bio", label: "Bio", placeholder: "A short summary about you", multiline: true },
];

const fmtSize = (bytes) => (bytes ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : "");
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

export default function ProfileScreen() {
  const router = useRouter();
  const { data, stats, loading, refreshing, refresh, reload } = useSkillBridge();

  const profile = data?.profile || {};
  const me = data?.me || {};
  const activeCv = data?.cvs?.[0] || null;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [cvBusy, setCvBusy] = useState("");
  const [history, setHistory] = useState([]);

  // Seed the form from server data whenever it changes (and we're not editing)
  useEffect(() => {
    if (editing) return;
    setForm({
      fullName: me.fullName || "",
      phone: profile.phone || "",
      location: profile.location || "",
      careerGoal: profile.careerGoal || "",
      education: profile.education || "",
      experience: profile.experience || "",
      bio: profile.bio || "",
    });
  }, [data, editing]);

  // CV analysis history = audit trail
  useEffect(() => {
    if (!activeCv?.id) {
      setHistory([]);
      return;
    }
    cvService
      .getAnalysisHistory(activeCv.id)
      .then((res) => setHistory(asList(res)))
      .catch((e) => {
        logError("profile-settings", "load analysis history", e);
        setHistory([]);
      });
  }, [activeCv?.id]);

  const completionChecks = [
    { ok: !!me.fullName, hint: "Add your full name" },
    { ok: !!profile.phone, hint: "Add your mobile number" },
    { ok: !!profile.location, hint: "Add your location" },
    { ok: !!profile.education, hint: "Add your education" },
    { ok: !!profile.experience, hint: "Add your experience" },
    { ok: !!profile.careerGoal, hint: "Set a career goal" },
    { ok: !!profile.bio, hint: "Write a short bio" },
    { ok: !!activeCv, hint: "Upload your CV" },
  ];
  const completion = Math.round(
    (completionChecks.filter((c) => c.ok).length / completionChecks.length) * 100,
  );
  const nextHint = completionChecks.find((c) => !c.ok)?.hint;

  const handleSave = useSingleFlight(async () => {
    if (!form.fullName?.trim()) {
      Alert.alert("Name required", "Please enter your full name.");
      return;
    }
    setSaving(true);
    try {
      if (form.fullName.trim() !== (me.fullName || "")) {
        const updated = unwrap(await userService.updateMe({ fullName: form.fullName.trim() }));
        if (updated) await setCachedUser(updated);
      }
      const payload = {};
      ["phone", "location", "careerGoal", "education", "experience", "bio"].forEach((k) => {
        const v = (form[k] || "").trim();
        if (v !== (profile[k] || "")) payload[k] = v || null;
      });
      if (Object.keys(payload).length) await profileService.updateMyProfile(payload);
      invalidateSkillBridge();
      await reload();
      setEditing(false);
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (err) {
      logError("profile-settings", "save profile", err);
      Alert.alert("Couldn't save", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, "handleSave");

  // Ask the AI to analyse the CV again (no re-upload needed).
  const runAnalysis = async (cvId) => {
    const state = await getAppState();
    const target = profile.careerGoal || state.targetRole || stats.targetRole || undefined;
    const analysis = unwrap(
      await cvService.analyzeCV(cvId, {
        targetJobTitle: target ? String(target).split(" / ")[0].slice(0, 120) : undefined,
        careerStage: "Entry",
        primaryGoal: "Gap Analysis",
      }),
    );
    if (analysis?.skillGapId) await updateAppState({ skillGapId: analysis.skillGapId });
  };

  const handlePickDocument = useSingleFlight(async () => {
    let file;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      file = result.assets[0];
    } catch (err) {
      logError("profile-settings", "pick document", err);
      console.log("Error picking document:", err);
      return;
    }

    if (file.size && file.size > 5 * 1024 * 1024) {
      Alert.alert("File too large", "Please choose a CV under 5MB.");
      return;
    }

    let saved = false;
    try {
      setCvBusy("Uploading CV...");
      const formData = buildCvFormData(file);
      const res = activeCv?.id
        ? await cvService.updateCV(activeCv.id, formData)
        : await cvService.uploadCV(formData);
      const cv = unwrap(res);
      const cvId = cv?.id || activeCv?.id;
      await updateAppState({ cvId });
      saved = true;
      invalidateSkillBridge();

      setCvBusy("Re-analysing skills...");
      await runAnalysis(cvId);

      invalidateSkillBridge();
      await reload();
      Alert.alert("CV Updated", "Your skills and gaps have been recalculated.");
    } catch (err) {
      logError("profile-settings", "CV update", err);
      if (err?.response?.status === 401) return;
      Alert.alert(
        saved ? "CV saved, analysis failed" : "CV update failed",
        saved
          ? `${getErrorMessage(err)}\n\nYour CV was saved. Tap "Re-run analysis" to try the analysis again.`
          : getErrorMessage(err),
      );
      invalidateSkillBridge();
      reload();
    } finally {
      setCvBusy("");
    }
  }, "handlePickDocument");

  const handleReanalyze = useSingleFlight(async () => {
    if (!activeCv?.id || cvBusy) return;
    try {
      setCvBusy("Re-analysing skills...");
      await runAnalysis(activeCv.id);
      invalidateSkillBridge();
      await reload();
      Alert.alert("Analysis complete", "Your skills and gaps have been recalculated.");
    } catch (err) {
      logError("profile-settings", "re-run analysis", err);
      if (err?.response?.status === 401) return;
      Alert.alert("Analysis failed", getErrorMessage(err));
    } finally {
      setCvBusy("");
    }
  }, "handleReanalyze");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color="#7A1380" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn} hitSlop={12}>
          <Ionicons name="notifications" size={22} color="#7A1380" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Profile</Text>
      </View>

      {loading && !data ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#7A1380" />
        </View>
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#7A1380" />
        }
      >
        {/* ================= 1. User Info & Completion Card ================= */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials(me.fullName)}</Text>
            </View>

            <View style={styles.profileDetails}>
              <Text style={styles.userName}>{me.fullName || "Your Name"}</Text>
              <Text style={styles.userEmail}>{me.email || ""}</Text>
              {!!profile.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#5B4E5A" />
                  <Text style={styles.userLocation}>{profile.location}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Profile Completion Bar */}
          <View style={styles.completionHeaderRow}>
            <View style={styles.completionLabelGroup}>
              <Feather name="shield" size={13} color="#1C101B" />
              <Text style={styles.completionLabelText}>Profile Completion</Text>
            </View>
            <Text style={styles.completionPercentText}>{completion}%</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${completion}%` }]} />
          </View>

          <View style={styles.completionPromptRow}>
            <Feather name={nextHint ? "plus-circle" : "check-circle"} size={12} color="#5B4E5A" />
            <Text style={styles.completionPromptText}>
              {nextHint ? `${nextHint} to reach 100%.` : "Your profile is complete!"}
            </Text>
          </View>
        </View>

        {/* ================= 2. Edit profile data ================= */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeading}>Edit profile data</Text>
            <Text style={styles.subSectionHeading}>
              {editing ? "Update your details below" : "Communication Channels"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editBtnRow}
            hitSlop={8}
            onPress={() => setEditing((e) => !e)}
            disabled={saving}
          >
            <MaterialCommunityIcons
              name={editing ? "close" : "pencil"}
              size={16}
              color="#7A1380"
            />
            <Text style={styles.editText}>{editing ? "Cancel" : "Edit"}</Text>
          </TouchableOpacity>
        </View>

        {editing ? (
          <View style={styles.editForm}>
            {FIELDS.map((f) => (
              <View key={f.key} style={{ marginBottom: 12 }}>
                <Text style={styles.editLabel}>{f.label}</Text>
                <TextInput
                  style={[styles.editInput, f.multiline && styles.editInputMultiline]}
                  value={form[f.key]}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor="#A894A6"
                  keyboardType={f.keyboardType || "default"}
                  multiline={!!f.multiline}
                  editable={!saving}
                />
              </View>
            ))}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Mobile Line */}
            <View style={styles.channelPill}>
              <View style={styles.channelLeft}>
                <Feather name="smartphone" size={18} color="#FFFFFF" />
                <View style={styles.channelTextGroup}>
                  <Text style={styles.channelTitle}>Mobile Line</Text>
                  <Text style={styles.channelValue}>{profile.phone || "Not added"}</Text>
                </View>
              </View>
              {!!profile.phone && (
                <View style={styles.channelBadge}>
                  <Text style={styles.channelBadgeText}>SAVED</Text>
                </View>
              )}
            </View>

            {/* Email */}
            <View style={styles.channelPill}>
              <View style={styles.channelLeft}>
                <Feather name="mail" size={18} color="#FFFFFF" />
                <View style={styles.channelTextGroup}>
                  <Text style={styles.channelTitle}>Email</Text>
                  <Text style={styles.channelValue}>{me.email || "—"}</Text>
                </View>
              </View>
              <View style={styles.channelBadge}>
                <Text style={styles.channelBadgeText}>
                  {me.isVerified ? "VERIFIED" : "PRIMARY"}
                </Text>
              </View>
            </View>

            {/* Location / Relocation */}
            <View style={styles.channelPill}>
              <View style={styles.channelLeft}>
                <Ionicons name="location-outline" size={18} color="#FFFFFF" />
                <View style={styles.channelTextGroup}>
                  <Text style={styles.channelTitle}>Target Jobs Location</Text>
                  <Text style={styles.channelValue}>{profile.location || "Not added"}</Text>
                </View>
              </View>
              {!!profile.location && (
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              )}
            </View>
          </>
        )}

        {/* ================= 3. Education & Experience ================= */}
        <Text
          style={[
            styles.sectionHeadingPurple,
            { marginTop: 22, marginBottom: 10 },
          ]}
        >
          Education & Experience
        </Text>

        <View style={styles.eduExpContainer}>
          <View style={styles.eduItem}>
            <View style={styles.eduIconBox}>
              <Ionicons name="school-outline" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.eduContent}>
              <Text style={styles.eduInstitution}>Education</Text>
              <Text style={styles.eduDegree}>{profile.education || "Not added yet"}</Text>
            </View>
          </View>

          <View style={styles.eduDivider} />

          <View style={styles.eduItem}>
            <View style={styles.eduIconBox}>
              <FontAwesome5 name="briefcase" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.eduContent}>
              <Text style={styles.eduInstitution}>Experience</Text>
              <Text style={styles.eduRole}>{profile.experience || "Not added yet"}</Text>
            </View>
          </View>

          <View style={styles.eduDivider} />

          <View style={styles.eduItem}>
            <View style={styles.eduIconBox}>
              <Feather name="flag" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.eduContent}>
              <Text style={styles.eduInstitution}>Career Goal</Text>
              <Text style={styles.eduRole}>{profile.careerGoal || "Not set"}</Text>
            </View>
          </View>
        </View>

        {/* ================= 4. CV Management Center ================= */}
        <View
          style={[styles.sectionHeaderRow, { marginTop: 24, marginBottom: 10 }]}
        >
          <View style={styles.rowCenter}>
            <Ionicons name="folder-open-outline" size={18} color="#7A1380" />
            <Text style={[styles.sectionHeading, { marginLeft: 8 }]}>
              CV Management Center
            </Text>
          </View>
          <TouchableOpacity
            style={styles.outlinedUpdateBtn}
            onPress={handlePickDocument}
            activeOpacity={0.8}
            disabled={!!cvBusy}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={13}
              color="#7A1380"
            />
            <Text style={styles.outlinedUpdateText}>{activeCv ? "Update" : "Upload"}</Text>
          </TouchableOpacity>
        </View>

        {/* Active CV Bar */}
        {activeCv && (
          <View style={styles.activeCvBar}>
            <View style={[styles.rowCenter, { flex: 1 }]}>
              <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.activeCvName} numberOfLines={1}>{activeCv.fileName}</Text>
                <Text style={styles.activeCvMeta}>
                  {[fmtSize(activeCv.fileSize), `Uploaded ${fmtDate(activeCv.updatedAt || activeCv.createdAt)}`]
                    .filter(Boolean)
                    .join(" • ")}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Re-upload Area */}
        <TouchableOpacity
          style={styles.reuploadCard}
          onPress={handlePickDocument}
          activeOpacity={0.85}
          disabled={!!cvBusy}
        >
          {cvBusy ? (
            <>
              <ActivityIndicator size="large" color="#7A1380" />
              <Text style={styles.reuploadTitle}>{cvBusy}</Text>
            </>
          ) : (
            <>
              <Feather name="upload-cloud" size={40} color="#7A1380" />
              <Text style={styles.reuploadTitle}>
                {activeCv ? "Tap to Replace or Re-upload CV" : "Tap to Upload Your CV"}
              </Text>

              <View style={styles.browseButton}>
                <Text style={styles.browseButtonText}>Browse Files</Text>
              </View>

              <Text style={styles.uploadFormatNotice}>
                Supports PDF, DOCX (Max 5MB)
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Run the analysis again on the CV already on file */}
        {activeCv && (
          <TouchableOpacity
            style={[styles.reanalyzeBtn, !!cvBusy && { opacity: 0.5 }]}
            onPress={handleReanalyze}
            activeOpacity={0.85}
            disabled={!!cvBusy}
          >
            <Feather name="refresh-cw" size={15} color="#7A1380" />
            <Text style={styles.reanalyzeBtnText}>Re-run analysis</Text>
          </TouchableOpacity>
        )}

        {/* Auto Gap Analysis Banner */}
        <View style={styles.gapBanner}>
          <MaterialCommunityIcons
            name="creation"
            size={20}
            color="#FFFFFF"
            style={{ marginTop: 2 }}
          />
          <Text style={styles.gapBannerText}>
            <Text style={{ fontWeight: "800" }}>Auto Gap Analysis: </Text>
            Updating your CV re-runs the AI skill-gap analysis for your target role.
          </Text>
        </View>

        {/* ================= 5. Resume Audit Trail ================= */}
        {history.length > 0 && (
          <>
            <Text
              style={[
                styles.sectionHeaderSmall,
                { marginTop: 24, marginBottom: 10 },
              ]}
            >
              ANALYSIS HISTORY
            </Text>

            <View style={styles.auditCard}>
              {history.slice(0, 5).map((h, idx, arr) => (
                <View key={h.id} style={styles.auditRow}>
                  <View style={styles.timelineCol}>
                    <View style={styles.timelineDot} />
                    {idx < arr.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.auditDetails}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.auditVersion}>
                        {idx === 0 ? "Latest" : `Analysis ${arr.length - idx}`}
                      </Text>
                      <Text style={styles.auditDate}>{fmtDate(h.createdAt)}</Text>
                    </View>
                    <Text style={styles.auditDescription}>
                      {h.primaryGoal || "Gap Analysis"}
                      {h.targetJobTitle ? ` for ${h.targetJobTitle}` : ""}
                      {h.careerStage ? ` • ${h.careerStage}` : ""}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ================= 6. Membership & Credits ================= */}
        <View
          style={[styles.sectionHeaderRow, { marginTop: 24, marginBottom: 10 }]}
        >
          <View style={styles.rowCenter}>
            <MaterialCommunityIcons
              name="shield-star-outline"
              size={20}
              color="#7A1380"
            />
            <Text style={[styles.sectionHeading, { marginLeft: 8 }]}>
              Membership & Credits
            </Text>
          </View>
          <View style={styles.basicPlanBadge}>
            <Text style={styles.basicPlanText}>BASIC PLAN</Text>
          </View>
        </View>

        <View style={styles.membershipCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.tierName}>Pathfinder Free Tier</Text>
              <Text style={styles.tierSubtitle}>
                Standard graduate discovery pass
              </Text>
            </View>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#7A1380"
            />
          </View>

          <View style={styles.tierStatsRow}>
            <View style={styles.tierStatBox}>
              <Text style={styles.tierStatLabel}>Weekly AI Matches</Text>
              <Text style={styles.tierStatValue}>3 of 3 used</Text>
            </View>

            <View style={styles.tierStatBox}>
              <Text style={styles.tierStatLabel}>Pathway Horizon</Text>
              <Text style={styles.tierStatValue}>60–Day View</Text>
            </View>
          </View>
        </View>

        {/* ================= 7. Upgrade to Pathfinder Pro ================= */}
        <View style={styles.upgradeCard}>
          <View style={styles.rowBetween}>
            <View style={styles.growthBadge}>
              <Ionicons name="flash" size={12} color="#FFFFFF" />
              <Text style={styles.growthBadgeText}>
                Accelerated Career Growth
              </Text>
            </View>
            <Text style={styles.pricingText}>₦3,500/mo</Text>
          </View>

          <Text style={styles.upgradeTitle}>Upgrade to Pathfinder Pro</Text>
          <Text style={styles.upgradeDescription}>
            Unlock high-volume Nigerian & remote hiring pipeline with
            specialized tooling.
          </Text>

          {/* Checklist */}
          <View style={styles.checkItemRow}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#7A1380"
            />
            <Text style={styles.checkItemText}>
              Unlimited Career Track deep dives & SQL benchmarks
            </Text>
          </View>

          <View style={styles.checkItemRow}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#7A1380"
            />
            <Text style={styles.checkItemText}>
              Direct Recruiter InMail pings to verified talent teams
            </Text>
          </View>

          <View style={styles.checkItemRow}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#7A1380"
            />
            <Text style={styles.checkItemText}>
              1-on-1 Mentor capstone review (Finance & Tech tracks)
            </Text>
          </View>

          {/* Checkout CTA */}
          <TouchableOpacity
            style={styles.upgradeCtaBtn}
            activeOpacity={0.85}
            onPress={() => router.push("/upgrade")}
          >
            <Text style={styles.upgradeCtaText}>
              Upgrade via Paystack / Flutterwave
            </Text>
          </TouchableOpacity>

          <Text style={styles.saveNoticeText}>
            Save 33% by choosing ₦28,000 / annual bill
          </Text>
        </View>

        {/* ================= 8. Master Settings Hub ================= */}
        <TouchableOpacity
          style={styles.masterSettingsHubCard}
          activeOpacity={0.85}
          onPress={() => router.push("/settings")}
        >
          <View style={styles.rowCenter}>
            <MaterialCommunityIcons
              name="cog-outline"
              size={24}
              color="#FFFFFF"
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.settingsHubTitle}>Master Settings Hub</Text>
              <Text style={styles.settingsHubSubtitle}>
                Security, WhatsApp Alerts, Data Privacy & Exports
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  editForm: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#E4CFE2",
    borderRadius: 14,
    padding: 14,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1C101B",
    marginBottom: 6,
  },
  editInput: {
    minHeight: 44,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1C101B",
    backgroundColor: "#FFFFFF",
  },
  editInputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7A1380",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 44,
  },
  backBtn: {
    width: 36,
    justifyContent: "center",
  },
  bellBtn: {
    width: 36,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E5EE",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C101B",
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110, // accounts for the floating bottom tab bar
  },
  profileCard: {
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#7A1380",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1C101B",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#5B4E5A",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userLocation: {
    fontSize: 12,
    color: "#1C101B",
    marginLeft: 4,
    fontWeight: "500",
  },
  completionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 6,
  },
  completionLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  completionLabelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C101B",
    marginLeft: 6,
  },
  completionPercentText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1C101B",
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EBDDE9",
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#7A1380",
    borderRadius: 3,
  },
  completionPromptRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  completionPromptText: {
    fontSize: 11,
    color: "#5B4E5A",
    marginLeft: 6,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 20,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1C101B",
  },
  subSectionHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1C101B",
    marginTop: 2,
  },
  sectionHeadingPurple: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7A1380",
  },
  sectionHeaderSmall: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1C101B",
    letterSpacing: 0.5,
  },
  editBtnRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  editText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7A1380",
    marginLeft: 4,
  },
  channelPill: {
    backgroundColor: "#7A1380",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  channelLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  channelTextGroup: {
    marginLeft: 12,
  },
  channelTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  channelValue: {
    fontSize: 12,
    color: "#F0E5EE",
    marginTop: 1,
  },
  channelBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  channelBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  eduExpContainer: {
    backgroundColor: "#7A1380",
    borderRadius: 14,
    padding: 14,
  },
  eduItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 6,
  },
  eduIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  eduContent: {
    flex: 1,
  },
  eduInstitution: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  eduDegree: {
    fontSize: 12,
    color: "#E8D6E6",
    marginTop: 2,
    lineHeight: 16,
  },
  eduRole: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 2,
    lineHeight: 16,
  },
  eduLocation: {
    fontSize: 11,
    color: "#D8C2D6",
    marginTop: 2,
  },
  eduBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  eduDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    marginVertical: 10,
  },
  outlinedUpdateBtn: {
    borderWidth: 1,
    borderColor: "#7A1380",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  outlinedUpdateText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7A1380",
    marginLeft: 3,
  },
  activeCvBar: {
    backgroundColor: "#7A1380",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  activeCvName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  activeCvMeta: {
    fontSize: 11,
    color: "#E8D6E6",
    marginTop: 1,
  },
  reanalyzeBtn: {
    height: 42,
    borderRadius: 10,
    backgroundColor: "#F0E5F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 12,
  },
  reanalyzeBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7A1380",
  },
  reuploadCard: {
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  reuploadTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C101B",
    marginTop: 8,
    marginBottom: 10,
  },
  browseButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#7A1380",
    borderRadius: 6,
  },
  browseButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7A1380",
  },
  uploadFormatNotice: {
    fontSize: 11,
    color: "#6E616D",
    marginTop: 12,
  },
  gapBanner: {
    backgroundColor: "#7A1380",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  gapBannerText: {
    fontSize: 12,
    color: "#FFFFFF",
    lineHeight: 16,
    flex: 1,
    marginLeft: 8,
  },
  auditCard: {
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  auditRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineCol: {
    width: 18,
    alignItems: "center",
    marginRight: 10,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1C101B",
    marginTop: 4,
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: "#C5BAC4",
    minHeight: 38,
  },
  auditDetails: {
    flex: 1,
    paddingBottom: 14,
  },
  auditVersion: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1C101B",
  },
  auditDate: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1C101B",
  },
  auditDescription: {
    fontSize: 12,
    color: "#4B3F4B",
    lineHeight: 16,
    marginTop: 2,
  },
  basicPlanBadge: {
    backgroundColor: "#7A1380",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  basicPlanText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  membershipCard: {
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  tierName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1C101B",
  },
  tierSubtitle: {
    fontSize: 12,
    color: "#5B4E5A",
    marginTop: 1,
  },
  tierStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  tierStatBox: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#7A1380",
    borderRadius: 8,
    padding: 10,
  },
  tierStatLabel: {
    fontSize: 11,
    color: "#5B4E5A",
    fontWeight: "600",
  },
  tierStatValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1C101B",
    marginTop: 4,
  },
  upgradeCard: {
    borderWidth: 1.5,
    borderColor: "#0284C7", // accent highlight matching the design artboard border
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  growthBadge: {
    backgroundColor: "#7A1380",
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  growthBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 4,
  },
  pricingText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1C101B",
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1C101B",
    marginTop: 10,
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 12,
    color: "#5B4E5A",
    lineHeight: 16,
    marginBottom: 14,
  },
  checkItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  checkItemText: {
    fontSize: 12,
    color: "#1C101B",
    lineHeight: 16,
    flex: 1,
    marginLeft: 8,
    fontWeight: "500",
  },
  upgradeCtaBtn: {
    backgroundColor: "#7A1380",
    borderRadius: 10,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  upgradeCtaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  saveNoticeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7A1380",
    textAlign: "center",
    marginTop: 8,
  },
  masterSettingsHubCard: {
    backgroundColor: "#7A1380",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  settingsHubTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  settingsHubSubtitle: {
    fontSize: 11,
    color: "#E8D6E6",
    marginTop: 2,
    width: 220,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
});
