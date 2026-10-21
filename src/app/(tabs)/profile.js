import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();

  const [activeCv, setActiveCv] = useState({
    name: "Amara_Ejike_CV.pdf",
    size: "1.2 MB",
    parsedText: "Parsed 3 days ago",
  });

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setActiveCv({
          name: file.name,
          size: `${sizeMb} MB`,
          parsedText: "Just updated",
        });
        Alert.alert("CV Updated", "AI is recalculating your skill gaps.");
      }
    } catch (err) {
      console.log("Error picking document:", err);
    }
  };

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 1. User Info & Completion Card ================= */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>AO</Text>
            </View>

            <View style={styles.profileDetails}>
              <Text style={styles.userName}>Amara Okafor</Text>
              <Text style={styles.userEmail}>amaka.okonkwo@email.com</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#5B4E5A" />
                <Text style={styles.userLocation}>Yaba Mainland, Lagos</Text>
              </View>
            </View>
          </View>

          {/* Profile Completion Bar */}
          <View style={styles.completionHeaderRow}>
            <View style={styles.completionLabelGroup}>
              <Feather name="shield" size={13} color="#1C101B" />
              <Text style={styles.completionLabelText}>Profile Completion</Text>
            </View>
            <Text style={styles.completionPercentText}>80%</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: "80%" }]} />
          </View>

          <View style={styles.completionPromptRow}>
            <Feather name="plus-circle" size={12} color="#5B4E5A" />
            <Text style={styles.completionPromptText}>
              Add your certifications to reach 100%.
            </Text>
          </View>
        </View>

        {/* ================= 2. Communication Channels ================= */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeading}>Edit profile data</Text>
            <Text style={styles.subSectionHeading}>Communication Channels</Text>
          </View>
          <TouchableOpacity style={styles.editBtnRow} hitSlop={8}>
            <MaterialCommunityIcons name="pencil" size={16} color="#7A1380" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Mobile Line */}
        <View style={styles.channelPill}>
          <View style={styles.channelLeft}>
            <Feather name="smartphone" size={18} color="#FFFFFF" />
            <View style={styles.channelTextGroup}>
              <Text style={styles.channelTitle}>Mobile Line</Text>
              <Text style={styles.channelValue}>+234 8145 000 0000</Text>
            </View>
          </View>
          <View style={styles.channelBadge}>
            <Text style={styles.channelBadgeText}>VERIFIED</Text>
          </View>
        </View>

        {/* WhatsApp Alert */}
        <View style={styles.channelPill}>
          <View style={styles.channelLeft}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color="#FFFFFF"
            />
            <View style={styles.channelTextGroup}>
              <Text style={styles.channelTitle}>WhatsApp Alert</Text>
              <Text style={styles.channelValue}>+234 8145 000 0000</Text>
            </View>
          </View>
          <View style={styles.channelBadge}>
            <Text style={styles.channelBadgeText}>Active</Text>
          </View>
        </View>

        {/* Target Jobs Relocation */}
        <View style={styles.channelPill}>
          <View style={styles.channelLeft}>
            <Ionicons name="location-outline" size={18} color="#FFFFFF" />
            <View style={styles.channelTextGroup}>
              <Text style={styles.channelTitle}>Target Jobs Relocation</Text>
              <Text style={styles.channelValue}>
                Lagos/ Remote (NG & Global)
              </Text>
            </View>
          </View>
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
        </View>

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
          {/* Degree */}
          <View style={styles.eduItem}>
            <View style={styles.eduIconBox}>
              <Ionicons name="school-outline" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.eduContent}>
              <Text style={styles.eduInstitution}>
                University of Lagos (UNILAG) 2019–2023
              </Text>
              <Text style={styles.eduDegree}>
                B.sc Economics (Second Class Upper Honor)
              </Text>
            </View>
          </View>

          <View style={styles.eduDivider} />

          {/* NYSC */}
          <View style={styles.eduItem}>
            <View style={styles.eduIconBox}>
              <Feather name="flag" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.eduContent}>
              <View style={styles.rowBetween}>
                <Text style={styles.eduInstitution}>NYSC (Discharged )</Text>
                <Text style={styles.eduBadge}>Completed</Text>
              </View>
              <Text style={styles.eduRole}>
                Lagos State Ministry of Finance - Budget Analyst Assistant
              </Text>
              <Text style={styles.eduLocation}>Alausa, Ikeja, Lagos State</Text>
            </View>
          </View>

          <View style={styles.eduDivider} />

          {/* GTBank */}
          <View style={styles.eduItem}>
            <View style={styles.eduIconBox}>
              <FontAwesome5 name="university" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.eduContent}>
              <View style={styles.rowBetween}>
                <Text style={styles.eduInstitution}>GTBank Nigeria</Text>
                <Text style={styles.eduBadge}>6 Months</Text>
              </View>
              <Text style={styles.eduRole}>
                Finance Intern - Retail Operations & Reconciliations
              </Text>
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
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={13}
              color="#7A1380"
            />
            <Text style={styles.outlinedUpdateText}>Update</Text>
          </TouchableOpacity>
        </View>

        {/* Active CV Bar */}
        <View style={styles.activeCvBar}>
          <View style={styles.rowCenter}>
            <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.activeCvName}>{activeCv.name}</Text>
              <Text style={styles.activeCvMeta}>
                {activeCv.size} • {activeCv.parsedText}
              </Text>
            </View>
          </View>
          <TouchableOpacity hitSlop={10}>
            <Feather name="download" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Re-upload Area */}
        <View style={styles.reuploadCard}>
          <Feather name="upload-cloud" size={40} color="#7A1380" />
          <Text style={styles.reuploadTitle}>
            Tap to Replace or Re-upload CV
          </Text>

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
            Updating your CV triggers an instant skill-recalculation across
            Lagos Tech & Remote Finance roles.
          </Text>
        </View>

        {/* ================= 5. Resume Audit Trail ================= */}
        <Text
          style={[
            styles.sectionHeaderSmall,
            { marginTop: 24, marginBottom: 10 },
          ]}
        >
          RESUME AUDIT TRAIL
        </Text>

        <View style={styles.auditCard}>
          {/* v2.1 */}
          <View style={styles.auditRow}>
            <View style={styles.timelineCol}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.auditDetails}>
              <View style={styles.rowBetween}>
                <Text style={styles.auditVersion}>v2.1 (Active)</Text>
                <Text style={styles.auditDate}>Oct 18</Text>
              </View>
              <Text style={styles.auditDescription}>
                Appended Lagos Ministry NYSC discharge certificate & SQL Data
                track.
              </Text>
            </View>
          </View>

          {/* v2.0 */}
          <View style={styles.auditRow}>
            <View style={styles.timelineCol}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.auditDetails}>
              <View style={styles.rowBetween}>
                <Text style={styles.auditVersion}>v2.0</Text>
                <Text style={styles.auditDate}>Aug 04</Text>
              </View>
              <Text style={styles.auditDescription}>
                UNILAG graduation credential added + GTBank finance internship
                portfolio.
              </Text>
            </View>
          </View>

          {/* v1.0 */}
          <View style={styles.auditRow}>
            <View style={styles.timelineCol}>
              <View style={styles.timelineDot} />
            </View>
            <View style={styles.auditDetails}>
              <View style={styles.rowBetween}>
                <Text style={styles.auditVersion}>v1.0</Text>
                <Text style={styles.auditDate}>Jun 12</Text>
              </View>
              <Text style={styles.auditDescription}>
                Initial scanner profile ingest.
              </Text>
            </View>
          </View>
        </View>

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
