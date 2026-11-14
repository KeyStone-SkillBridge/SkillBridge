import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";

import LogoSvg from "../../assets/images/logo.svg";
import {
  asList,
  matchingService,
  opportunityService,
  profileService,
} from "../services/endpoints";
import { getAppState, updateAppState } from "../services/session";
import { invalidateSkillBridge, titleCase } from "../services/useSkillBridge";
import { logError } from "../services/logger";
import { useSingleFlight } from "../services/singleFlight";

const toPath = (match) => {
  const opp = match.opportunity || match;
  const pct = match.matchPercentage;
  const place = [opp.company, opp.location || (opp.workMode ? titleCase(opp.workMode) : null)]
    .filter(Boolean)
    .join(", ");
  const bullets = [];
  if (match.matchedSkills?.length)
    bullets.push(`Matches your skills: ${match.matchedSkills.slice(0, 4).map(titleCase).join(", ")}`);
  if (match.missingSkills?.length)
    bullets.push(`Skills to build: ${match.missingSkills.slice(0, 3).map(titleCase).join(", ")}`);
  if (!bullets.length && match.explanation) bullets.push(match.explanation);
  if (!bullets.length && opp.requiredSkills?.length)
    bullets.push(`Requires: ${opp.requiredSkills.slice(0, 4).map(titleCase).join(", ")}`);
  return {
    id: String(match.id || opp.id),
    opportunityId: opp.id,
    title: typeof pct === "number" ? `${opp.title}, ${pct}%` : opp.title,
    company: place || "Open opportunity",
    bullets: bullets.length ? bullets : ["Recommended for your target role"],
    selected: false,
  };
};

export default function CareerPathScreen() {
  const router = useRouter();

  const [careerPaths, setCareerPaths] = useState([]);
  const [loadingPaths, setLoadingPaths] = useState(true);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const state = await getAppState();
      const target = state.targetRole || "";
      let paths = [];

      // 1) Real career matches (needs a completed skill-gap analysis)
      try {
        const matches = asList(await matchingService.generate());
        paths = matches.slice(0, 5).map(toPath);
      } catch (e) {
        logError("career-path", "load matches", e);
        if (e?.response?.status === 401) return;
        console.log("Matching notice:", e?.response?.data || e?.message);
      }

      // 2) Fallback: search active opportunities for the target role
      if (paths.length === 0 && target) {
        try {
          const opps = asList(
            await opportunityService.list({ q: target, status: "active", limit: 5 }),
          );
          paths = opps.map((o) => toPath(o));
          if (paths.length) setNotice("Based on open roles for your target. Upload a CV to get match scores.");
        } catch (e) {
          logError("career-path", "load opportunities", e);
          // ignore
        }
      }

      // 3) Always offer the user's own target role
      if (target && !paths.some((p) => p.title.toLowerCase().startsWith(target.toLowerCase()))) {
        paths.push({
          id: "target-role",
          title: titleCase(target),
          company: "Your target role",
          bullets: (state.confirmedSkills || []).length
            ? [`Building on: ${state.confirmedSkills.slice(0, 4).join(", ")}`]
            : ["Personalised roadmap and skill benchmarks"],
          selected: false,
        });
      }

      if (paths.length) paths[0].selected = true;
      if (alive) {
        setCareerPaths(paths);
        setLoadingPaths(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const toggleSelect = (id) => {
    setCareerPaths((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const handleAddCustomPath = () => {
    if (!newTitle.trim()) return;

    setCareerPaths((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newTitle.trim(),
        company: newCompany.trim() || "Preferred Industry",
        bullets: ["Your custom selection"],
        selected: true,
      },
    ]);

    setNewTitle("");
    setNewCompany("");
    setModalVisible(false);
  };

  const hasSelection = careerPaths.some((item) => item.selected);

  const handleConfirm = useSingleFlight(async () => {
    if (!hasSelection || saving) return;
    setSaving(true);
    try {
      const chosen = careerPaths.filter((p) => p.selected);
      await updateAppState({ careerPaths: chosen, onboardingComplete: true });
      const goal = chosen.map((p) => p.title.replace(/,\s*\d+%$/, "")).join(" / ");
      try {
        await profileService.updateMyProfile({ careerGoal: goal.slice(0, 250) });
      } catch (e) {
        logError("career-path", "save career goal", e);
        // non-blocking
      }
      invalidateSkillBridge();
      router.replace("/(tabs)");
    } finally {
      setSaving(false);
    }
  }, "handleConfirm");

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
          <Ionicons name="chevron-back" size={28} color="#7A1380" />
        </TouchableOpacity>

        <View style={styles.logoWrapper}>
          <LogoSvg width={30} height={30} fill="#7A1380" />
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Top Career Path</Text>
        {!!notice && <Text style={styles.noticeText}>{notice}</Text>}

        {loadingPaths ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#7A1380" />
            <Text style={styles.noticeText}>Matching you with opportunities...</Text>
          </View>
        ) : careerPaths.length === 0 ? (
          <Text style={styles.noticeText}>
            No matches yet — add a preferred career path below to continue.
          </Text>
        ) : (
        <View style={styles.cardContainer}>
          {careerPaths.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                style={styles.careerItem}
                onPress={() => toggleSelect(item.id)}
                activeOpacity={0.85}
              >
                {/* Header Row: Checkbox + Title */}
                <View style={styles.itemHeaderRow}>
                  <View
                    style={[
                      styles.checkbox,
                      item.selected && styles.checkboxSelected,
                    ]}
                  >
                    {item.selected && (
                      <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>

                {/* Body Content */}
                <View style={styles.itemBody}>
                  <Text style={styles.companyText}>{item.company}</Text>

                  {item.bullets.map((bullet, bIdx) => (
                    <View key={bIdx} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>

              {/* Internal Divider between items */}
              {index < careerPaths.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>
        )}

        {/* Add Preferred Career Path Button */}
        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={22} color="#7A1380" />
          <Text style={styles.addCustomText}>Add Preferred Career Path...</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom CTA Container */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            hasSelection ? styles.ctaButtonActive : styles.ctaButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!hasSelection || saving}
          activeOpacity={hasSelection ? 0.85 : 1}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
          <Text
            style={[
              styles.ctaButtonText,
              !hasSelection && styles.ctaButtonTextDisabled,
            ]}
          >
            Confirm & Launch Dashboard
          </Text>
          )}
          <Feather
            name="arrow-right"
            size={20}
            color={hasSelection ? "#FFFFFF" : "#8A7B87"}
          />
        </TouchableOpacity>
      </View>

      {/* Add Custom Career Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Add Preferred Career Path</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Product Manager, Frontend Developer"
              placeholderTextColor="#A894A6"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Company or Industry preference (optional)"
              placeholderTextColor="#A894A6"
              value={newCompany}
              onChangeText={setNewCompany}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalAddBtn}
                onPress={handleAddCustomPath}
              >
                <Text style={styles.modalAddText}>Add Role</Text>
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
  headerRightPlaceholder: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  noticeText: {
    fontSize: 13,
    color: "#5B4E5A",
    marginBottom: 14,
    lineHeight: 18,
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C101B",
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  cardContainer: {
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  careerItem: {
    paddingVertical: 6,
  },
  itemHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  checkboxSelected: {
    backgroundColor: "#7A1380",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1C101B",
    letterSpacing: -0.2,
  },
  itemBody: {
    marginLeft: 26,
    marginTop: 4,
  },
  companyText: {
    fontSize: 13,
    color: "#3C303B",
    fontWeight: "500",
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  bulletDot: {
    fontSize: 14,
    color: "#1C101B",
    lineHeight: 18,
    marginRight: 6,
  },
  bulletText: {
    fontSize: 13,
    color: "#1C101B",
    lineHeight: 18,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#7A1380",
    marginVertical: 14,
  },
  addCustomButton: {
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 6,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  addCustomText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1C101B",
    marginLeft: 8,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: "#FFFFFF",
  },
  ctaButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonActive: {
    backgroundColor: "#7A1380",
  },
  ctaButtonDisabled: {
    backgroundColor: "#D1C2CE",
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 8,
  },
  ctaButtonTextDisabled: {
    color: "#8A7B87",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    width: "100%",
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C101B",
    marginBottom: 14,
  },
  modalInput: {
    height: 46,
    borderWidth: 1.2,
    borderColor: "#7A1380",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#1C101B",
    marginBottom: 12,
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
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
