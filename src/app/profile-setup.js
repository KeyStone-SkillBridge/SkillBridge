import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoSvg from "../../assets/images/logo.svg";
import { getErrorMessage } from "../services/api";
import {
  buildCvFormData,
  cvService,
  profileService,
  skillGapService,
  unwrap,
} from "../services/endpoints";
import { getAppState, getToken, updateAppState } from "../services/session";
import { invalidateSkillBridge, titleCase } from "../services/useSkillBridge";
import { logError } from "../services/logger";
import { useSingleFlight } from "../services/singleFlight";

const EXPERIENCE_OPTIONS = ["0–1 yrs", "1–3 yrs", "3–5 yrs", "5+ yrs"];
const STATUS_OPTIONS = [
  "Recent Graduate",
  "Undergraduate",
  "Early Career Professional",
  "Job Seeker",
  "Career Transitioner",
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- Step 1 State ---
  const [status, setStatus] = useState("Recent Graduate");
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [field, setField] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState("0–1 yrs");
  const [openToRemote, setOpenToRemote] = useState(true);

  // --- Step 2 State ---
  const [uploadedFile, setUploadedFile] = useState(null);
  const [cvDocAsset, setCvDocAsset] = useState(null);
  // Set once the CV is on the server, so a retry only re-runs the analysis
  // instead of uploading the same file again.
  const [uploadedCvId, setUploadedCvId] = useState(null);

  // --- Step 3 State ---
  const [experienceText, setExperienceText] = useState("");
  const [cvParsed, setCvParsed] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkillText, setNewSkillText] = useState("");
  const [skillModalVisible, setSkillModalVisible] = useState(false);

  // --- Handlers ---
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        const sizeMb = file.size
          ? (file.size / (1024 * 1024)).toFixed(1)
          : "1.2";
        setUploadedFile({
          name: file.name,
          size: `${sizeMb} MB`,
        });
        setCvDocAsset(file);
        setUploadedCvId(null); // a different file needs a fresh upload
      }
    } catch (err) {
      logError("profile-setup", "pick document", err);
      console.log("Error picking document:", err);
    }
  };

  const toggleSkill = (id) => {
    setSkills((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const removeSkill = (id) => {
    setSkills((prev) => prev.filter((item) => item.id !== id));
  };

  const addCustomSkill = () => {
    if (!newSkillText.trim()) return;
    setSkills((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newSkillText.trim(),
        selected: true,
      },
    ]);
    setNewSkillText("");
    setSkillModalVisible(false);
  };

  // Map onboarding answers → API enum: Student | Entry | Mid | Senior | Pivot
  const getCareerStage = () => {
    if (status === "Undergraduate") return "Student";
    if (status === "Career Transitioner") return "Pivot";
    if (experience === "5+ yrs") return "Senior";
    if (experience === "3–5 yrs") return "Mid";
    return "Entry";
  };

  const ensureSignedIn = async () => {
    const token = await getToken();
    if (!token) {
      Alert.alert(
        "Please log in",
        "Your session was not found. Log in to continue setting up your profile.",
        [{ text: "OK", onPress: () => router.replace("/login") }],
      );
      return false;
    }
    return true;
  };

  const handleNext = useSingleFlight(async () => {
    if (currentStep === 1) {
      if (!targetRole.trim()) {
        Alert.alert(
          "Target role needed",
          "Tell us the role you're aiming for (e.g. Data Analyst) so we can benchmark your skills.",
        );
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!cvDocAsset) {
        Alert.alert(
          "No CV Selected",
          "Browse and pick a file, or tap 'Fill Manually' to continue without one.",
        );
        return;
      }
      if (!(await ensureSignedIn())) return;

      setLoading(true);
      let cvId = uploadedCvId;
      setLoadingLabel(cvId ? "Analysing with AI..." : "Uploading CV...");
      try {
        if (cvId) {
          console.log("[CV DEBUG] CV already uploaded — skipping upload, retrying analysis:", cvId);
        } else {
          // 1) Upload CV (multipart key "cv")
          console.log("[CV DEBUG] Starting CV upload...");
          const uploadRes = await cvService.uploadCV(buildCvFormData(cvDocAsset));
          console.log("[CV DEBUG] CV upload successful!");
          console.log("[CV DEBUG] Upload response:", uploadRes?.data);

          const uploaded = unwrap(uploadRes);
          cvId = uploaded?.id;
          if (!cvId) {
            throw new Error("Upload succeeded but no CV id was returned.");
          }
          setUploadedCvId(cvId);

          console.log("[CV DEBUG] CV ID:", cvId);
          await updateAppState({ cvId });
          // The CV now exists on the server — make the profile reload it.
          invalidateSkillBridge();
        }

        // 2) AI skill-gap analysis
        setLoadingLabel("Analysing with AI...");
        console.log("[CV DEBUG] Starting CV analysis...");
        console.log("[CV DEBUG] Sending analysis request for CV:", cvId);

        const analysisRes = await cvService.analyzeCV(cvId, {
          targetJobTitle: targetRole.trim(),
          industryFocus: field.trim() || undefined,
          careerStage: getCareerStage(),
          primaryGoal: "Gap Analysis",
        });

        console.log("[CV DEBUG] CV analysis successful!");
        console.log("[CV DEBUG] Analysis response:", analysisRes?.data);

        const result = unwrap(analysisRes) || {};
        const gap = result.skillGap || {};
        const skillGapId = result.skillGapId || gap.id;

        await updateAppState({
          skillGapId,
          analysisId: result.analysisId,
          targetRole: targetRole.trim(),
        });

        const extracted = Array.isArray(gap.currentSkills)
          ? gap.currentSkills
          : [];
        if (extracted.length > 0) {
          setSkills(
            extracted.map((name, index) => ({
              id: `cv-${index}`,
              name:
                typeof name === "string"
                  ? titleCase(name)
                  : name?.name || String(name),
              selected: true,
            })),
          );
        }

        const ar = result.analysisResult || {};
        const summary =
          ar.summary ||
          ar.profile_summary ||
          ar.experienceSummary ||
          ar.experience ||
          ar.overview;
        if (typeof summary === "string" && summary.trim()) {
          setExperienceText(summary.trim());
        }
        setCvParsed(true);
        setCurrentStep(3);
      } catch (err) {
        logError("profile-setup", "CV upload/analysis", err);
        console.log("[CV DEBUG] REQUEST FAILED");
        console.log("[CV DEBUG] HTTP Status:", err?.response?.status);
        console.log("[CV DEBUG] Request URL:", err?.config?.url);
        console.log(
          "[CV DEBUG] Server Response:",
          JSON.stringify(err?.response?.data, null, 2),
        );

        console.log("[CV DEBUG] Response Status:", err?.response?.status);

        console.log("[CV DEBUG] Response URL:", err?.response?.config?.url);

        console.log(
          "[CV DEBUG] Request Method:",
          err?.response?.config?.method,
        );
        console.log("[CV DEBUG] Error Message:", err?.message);

        if (err?.response?.status === 401) return; // root layout redirects to login
        Alert.alert(
          "We couldn't analyse your CV",
          `${getErrorMessage(err)}\n\n${cvId ? "Your CV was uploaded. Tap \"Retry Analysis\" to run the analysis again, or " : "You can "}continue and add your skills manually.`,
          [
            { text: cvId ? "Retry Analysis" : "Try Again", style: "cancel" },
            { text: "Fill Manually", onPress: () => setCurrentStep(3) },
          ],
        );
      } finally {
        setLoading(false);
        setLoadingLabel("");
      }
      return;
    }

    // ---- Step 3: save profile + make sure a skill-gap analysis exists ----
    if (!(await ensureSignedIn())) return;
    const selectedSkills = skills.filter((s) => s.selected).map((s) => s.name);
    if (selectedSkills.length === 0) {
      Alert.alert(
        "Add your skills",
        "Select or add at least one skill to continue.",
      );
      return;
    }

    setLoading(true);
    try {
      await profileService.updateMyProfile({
        bio: `Skills: ${selectedSkills.join(", ")}`,
        education: `${status}${field.trim() ? ` • ${field.trim()}` : ""}`,
        experience: `${experienceText.trim() || "Not specified"} (${experience})`,
        location: openToRemote ? "Open to Remote" : "Onsite",
        careerGoal: targetRole.trim(),
      });

      // Manual path (no CV) → create a skill gap from the confirmed skills so
      // the dashboard, roadmap and matching screens have data to work with.
      const state = await getAppState();
      if (!state.skillGapId) {
        try {
          const gapRes = await skillGapService.create({
            targetJobTitle: targetRole.trim().toLowerCase(),
            currentSkills: selectedSkills.map((s) => s.toLowerCase()),
            requiredSkills: [],
          });
          const gap = unwrap(gapRes);
          if (gap?.id) await updateAppState({ skillGapId: gap.id });
        } catch (gapErr) {
          logError("profile-setup", "create skill gap", gapErr);
          console.log(
            "Skill gap create notice:",
            gapErr?.response?.data || gapErr?.message,
          );
        }
      }

      await updateAppState({
        onboardingComplete: true,
        targetRole: targetRole.trim(),
        confirmedSkills: selectedSkills,
      });
      invalidateSkillBridge();
      router.replace("/career-path");
    } catch (err) {
      logError("profile-setup", "save profile", err);
      if (err?.response?.status === 401) return;
      Alert.alert("Couldn't save your profile", getErrorMessage(err), [
        { text: "Retry", style: "cancel" },
        {
          text: "Skip for now",
          onPress: async () => {
            await updateAppState({
              onboardingComplete: true,
              targetRole: targetRole.trim(),
            });
            router.replace("/career-path");
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, "handleNext");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={28} color="#7A1380" />
        </TouchableOpacity>

        <View style={styles.logoWrapper}>
          <LogoSvg width={30} height={30} fill="#7A1380" />
        </View>

        <Text style={styles.stepIndicatorText}>Step {currentStep} of 3</Text>
      </View>

      {/* Stepper Progress Bar */}
      <View style={styles.stepperContainer}>
        {/* Step 1 Node */}
        <View style={[styles.stepCircle, styles.stepCircleActive]}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>

        {/* Line 1 */}
        <View
          style={[
            styles.stepLine,
            currentStep >= 2 ? styles.stepLineActive : styles.stepLineInactive,
          ]}
        />

        {/* Step 2 Node */}
        <View
          style={[
            styles.stepCircle,
            currentStep >= 2
              ? styles.stepCircleActive
              : styles.stepCircleInactive,
          ]}
        >
          {currentStep >= 2 ? (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          ) : (
            <View style={styles.innerInactiveCircle} />
          )}
        </View>

        {/* Line 2 */}
        <View
          style={[
            styles.stepLine,
            currentStep === 3 ? styles.stepLineActive : styles.stepLineInactive,
          ]}
        />

        {/* Step 3 Node */}
        <View
          style={[
            styles.stepCircle,
            currentStep === 3
              ? styles.stepCircleActive
              : styles.stepCircleInactive,
          ]}
        >
          {currentStep === 3 ? (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          ) : (
            <View style={styles.innerInactiveCircle} />
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= STEP 1: Tell Us About Yourself ================= */}
        {currentStep === 1 && (
          <View>
            <Text style={styles.title}>Tell Us About Yourself</Text>
            <Text style={styles.subtitle}>
              This helps us to tailor skill benchmarks to your exact career
              level
            </Text>

            {/* Current Status Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Status</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setStatusModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownText}>{status}</Text>
                <Feather name="chevron-down" size={18} color="#1C101B" />
              </TouchableOpacity>
            </View>

            {/* Primary Field / Discipline */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Primary Field / Discipline</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Finance, Software Engineering"
                placeholderTextColor="#A894A6"
                value={field}
                onChangeText={setField}
              />
            </View>

            {/* Target Role */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target Role</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Data Analyst, Backend Developer"
                placeholderTextColor="#A894A6"
                value={targetRole}
                onChangeText={setTargetRole}
              />
            </View>

            {/* Years Of Experience */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Years Of Experience</Text>
              <View style={styles.experienceRow}>
                {EXPERIENCE_OPTIONS.map((item) => {
                  const isSelected = experience === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={styles.checkboxItem}
                      onPress={() => setExperience(item)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkboxBox,
                          isSelected && styles.checkboxBoxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color="#FFFFFF"
                          />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Open to Remote Roles */}
            <TouchableOpacity
              style={styles.remoteRow}
              onPress={() => setOpenToRemote((prev) => !prev)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkboxBox,
                  openToRemote && styles.checkboxBoxSelected,
                ]}
              >
                {openToRemote && (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.remoteLabel}>Open to Remote Roles</Text>
            </TouchableOpacity>

            {/* Step 1 CTA */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleNext}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.ctaButtonText}>
                    Continue to CV Upload
                  </Text>
                  <Feather name="arrow-right" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STEP 2: Upload Your CV ================= */}
        {currentStep === 2 && (
          <View>
            <Text style={styles.title}>Upload Your Cv / Resume</Text>
            <Text style={styles.subtitle}>
              Our AI will extract your skills, tools, and experience
              automatically in seconds.
            </Text>

            {/* Drag & Drop / Upload Card */}
            <View style={styles.uploadCard}>
              <Feather name="upload-cloud" size={48} color="#7A1380" />
              <Text style={styles.uploadCardTitle}>
                Drag & Drop Your CV here
              </Text>
              <Text style={styles.uploadOrText}>Or</Text>

              <TouchableOpacity
                style={styles.browseButton}
                onPress={handlePickDocument}
                activeOpacity={0.8}
              >
                <Text style={styles.browseButtonText}>Browse Files</Text>
              </TouchableOpacity>

              <Text style={styles.uploadFormatNotice}>
                Supports PDF, DOCX (Max 5MB)
              </Text>
            </View>

            {/* Uploaded File Item */}
            {uploadedFile && (
              <View style={styles.filePreviewContainer}>
                <Text style={styles.filePreviewTitle}>Uploaded File</Text>
                <View style={styles.fileCard}>
                  <View style={styles.fileLeft}>
                    <Ionicons
                      name="document-text-outline"
                      size={24}
                      color="#7A1380"
                    />
                    <Text style={styles.fileName}>
                      {uploadedFile.name} ({uploadedFile.size})
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setUploadedFile(null);
                      setCvDocAsset(null);
                      setUploadedCvId(null);
                    }}
                    hitSlop={10}
                  >
                    <Feather name="trash-2" size={18} color="#7A1380" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Fill Manually Bypass */}
            <View style={styles.manualRow}>
              <Text style={styles.manualPrompt}>Don’t have CV? </Text>
              <TouchableOpacity onPress={() => setCurrentStep(3)}>
                <Text style={styles.manualLink}>Fill Manually</Text>
              </TouchableOpacity>
            </View>

            {/* Step 2 CTA */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleNext}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.ctaButtonText}>
                    {loadingLabel || "Uploading & Parsing..."}
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.ctaButtonText}>
                    {uploadedCvId ? "Retry Analysis & Continue" : "Parse CV & Continue"}
                  </Text>
                  <Feather name="arrow-right" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STEP 3: Verify Skills & Profile ================= */}
        {currentStep === 3 && (
          <View>
            <Text style={styles.title}>Verify Your Skills & Profile</Text>
            <Text style={styles.subtitle}>
              {cvParsed
                ? "Our AI extracted these from your CV. Tap (x) to remove or edit them before proceeding"
                : "Add the skills you already have and a short summary of your experience"}
            </Text>

            {/* Extracted Experience Card */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>
                Extracted Experience
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditingExperience((prev) => !prev)}
                style={styles.editBtnRow}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={16}
                  color="#7A1380"
                />
                <Text style={styles.editBtnText}>
                  {isEditingExperience ? "Done" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.experienceCard}>
              {isEditingExperience ? (
                <TextInput
                  style={styles.experienceInput}
                  value={experienceText}
                  onChangeText={setExperienceText}
                  placeholder="e.g. Graduate Trainee – First Bank Nigeria"
                  placeholderTextColor="#A894A6"
                  multiline
                  autoFocus
                />
              ) : (
                <Text
                  style={[
                    styles.experienceCardText,
                    !experienceText && { color: "#A894A6" },
                  ]}
                >
                  {experienceText || "Tap Edit to describe your experience"}
                </Text>
              )}
            </View>

            {/* Possessed Skills Chips */}
            <Text
              style={[
                styles.sectionHeaderTitle,
                { marginTop: 22, marginBottom: 12 },
              ]}
            >
              Possessed Skills ({skills.length})
            </Text>
            {skills.length === 0 && (
              <Text style={[styles.subtitle, { marginBottom: 8 }]}>
                No skills yet — tap below to add your first one.
              </Text>
            )}

            <View style={styles.skillsWrapper}>
              {skills.map((skill) => (
                <View key={skill.id} style={styles.skillChipContainer}>
                  <TouchableOpacity
                    style={[
                      styles.skillChip,
                      skill.selected && styles.skillChipActive,
                    ]}
                    onPress={() => toggleSkill(skill.id)}
                    activeOpacity={0.8}
                  >
                    {skill.selected && (
                      <View style={styles.skillSelectedBox}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                    <Text style={styles.skillChipText}>{skill.name}</Text>
                  </TouchableOpacity>

                  {/* Top-Right Remove (x) Badge */}
                  <TouchableOpacity
                    onPress={() => removeSkill(skill.id)}
                    style={styles.skillRemoveBadge}
                    hitSlop={6}
                  >
                    <Ionicons name="close" size={10} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            {/* Add Custom Skill / Interest Button */}
            <TouchableOpacity
              style={styles.addSkillButton}
              onPress={() => setSkillModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={24} color="#7A1380" />
              <Text style={styles.addSkillText}>
                Add Custom Skill... / Interest...
              </Text>
            </TouchableOpacity>

            {/* Final Complete CTA */}
            <TouchableOpacity
              style={[styles.ctaButton, { marginTop: 32 }]}
              onPress={handleNext}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.ctaButtonText}>
                    Confirm & Launch Dashboard
                  </Text>
                  <Feather name="arrow-right" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Status Picker Modal */}
      <Modal visible={statusModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStatusModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Select Your Current Status</Text>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.modalOption}
                onPress={() => {
                  setStatus(opt);
                  setStatusModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    status === opt && styles.modalOptionTextActive,
                  ]}
                >
                  {opt}
                </Text>
                {status === opt && (
                  <Ionicons name="checkmark" size={18} color="#7A1380" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Custom Skill Modal */}
      <Modal visible={skillModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSkillModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Add New Skill</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Python, UI Design"
              placeholderTextColor="#A894A6"
              value={newSkillText}
              onChangeText={setNewSkillText}
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSkillModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddBtn}
                onPress={addCustomSkill}
              >
                <Text style={styles.modalAddText}>Add Skill</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 48,
  },
  backBtn: {
    width: 36,
    justifyContent: "center",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndicatorText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C101B",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    marginVertical: 14,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: "#7A1380",
  },
  stepCircleInactive: {
    borderWidth: 1.5,
    borderColor: "#7A1380",
    backgroundColor: "#FFFFFF",
  },
  innerInactiveCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: "#7A1380",
  },
  stepLineInactive: {
    backgroundColor: "#E4CFE2",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1C101B",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "#4B3F4B",
    lineHeight: 18,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C101B",
    marginBottom: 8,
  },
  dropdown: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    fontSize: 14,
    color: "#1C101B",
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#1C101B",
    backgroundColor: "#FFFFFF",
  },
  experienceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  checkboxBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxBoxSelected: {
    backgroundColor: "#7A1380",
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#1C101B",
    fontWeight: "500",
  },
  remoteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  remoteLabel: {
    fontSize: 13,
    color: "#1C101B",
    fontWeight: "500",
  },
  ctaButton: {
    height: 48,
    backgroundColor: "#7A1380",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 8,
  },
  uploadCard: {
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  uploadCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C101B",
    marginTop: 12,
  },
  uploadOrText: {
    fontSize: 12,
    color: "#6E616D",
    marginVertical: 6,
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
    marginTop: 16,
  },
  filePreviewContainer: {
    marginBottom: 16,
  },
  filePreviewTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C101B",
    marginBottom: 6,
  },
  fileCard: {
    height: 48,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  fileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 13,
    color: "#1C101B",
    fontWeight: "500",
    marginLeft: 8,
  },
  manualRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  manualPrompt: {
    fontSize: 13,
    color: "#1C101B",
  },
  manualLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1C101B",
    textDecorationLine: "underline",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1C101B",
  },
  editBtnRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7A1380",
    marginLeft: 4,
  },
  experienceCard: {
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  experienceCardText: {
    fontSize: 13,
    color: "#1C101B",
    lineHeight: 18,
  },
  experienceInput: {
    fontSize: 13,
    color: "#1C101B",
    lineHeight: 18,
    padding: 0,
  },
  skillsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillChipContainer: {
    position: "relative",
    marginRight: 12,
    marginBottom: 14,
  },
  skillChip: {
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  skillChipActive: {
    borderColor: "#7A1380",
  },
  skillSelectedBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: "#7A1380",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  skillChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C101B",
  },
  skillRemoveBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#7A1380",
    alignItems: "center",
    justifyContent: "center",
  },
  addSkillButton: {
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 8,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginTop: 8,
    backgroundColor: "#FFFFFF",
  },
  addSkillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C101B",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C101B",
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0E5EE",
  },
  modalOptionText: {
    fontSize: 14,
    color: "#1C101B",
  },
  modalOptionTextActive: {
    fontWeight: "700",
    color: "#7A1380",
  },
  modalInput: {
    height: 46,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#1C101B",
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6E616D",
  },
  modalAddBtn: {
    backgroundColor: "#7A1380",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalAddText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
