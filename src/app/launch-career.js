import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoSvg from "../../assets/images/logo.svg";

// Local asset image reference
const CHIOMA_AVATAR = require("../../assets/images/ChiomaEze.png");
export default function LaunchCareerScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FC" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= Header Icon & Titles ================= */}
        <View style={styles.headerSection}>
          <View style={styles.logoBadgeContainer}>
            <LogoSvg width={32} height={32} />
          </View>

          <View style={styles.skillbridgePill}>
            <View style={styles.purpleDot} />
            <Text style={styles.skillbridgePillText}>SKILLBRIDGE</Text>
          </View>

          <Text style={styles.mainTitle}>Launch Your Career</Text>
          <Text style={styles.subTitle}>
            Career Acceleration for Ambitious Nigerian Graduates
          </Text>
        </View>

        {/* ================= Tier-1 Direct Pipeline Hero Card ================= */}
        <View style={styles.heroCard}>
          <View style={styles.pipelinePill}>
            <Ionicons name="checkmark-circle" size={14} color="#731F94" />
            <Text style={styles.pipelinePillText}>Tier–1 Direct Pipeline</Text>
          </View>

          <View style={styles.heroContentRow}>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroTitle}>
                Fast–Track to Top FinTech & Tech Roles
              </Text>
              <Text style={styles.heroDesc}>
                Skip the entry-level void. Match straight with high-growth
                product teams.
              </Text>
            </View>

            <Image
              source={CHIOMA_AVATAR}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.activelyHiringPill}>
            <View style={styles.tinyPurpleDot} />
            <Text style={styles.activelyHiringText}>
              Moniepoint, Flutterwave, Paystack actively hir...
            </Text>
            <Feather name="arrow-right" size={12} color="#731F94" />
          </View>
        </View>

        {/* ================= 3-Column Key Metrics Row ================= */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>74%</Text>
            <Text style={styles.metricLabel}>Placed within 90 Days</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>₦320k</Text>
            <Text style={styles.metricLabel}>Avg. Monthly Stipend</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>48+</Text>
            <Text style={styles.metricLabel}>Partners in Lagos & ABJ</Text>
          </View>
        </View>

        {/* ================= Feature List Cards ================= */}
        {/* 1. Transcript Calibration */}
        <View style={styles.featureCard}>
          <View style={styles.featureIconBox}>
            <Ionicons name="school" size={20} color="#731F94" />
          </View>
          <View style={styles.featureContent}>
            <View style={styles.featureTitleRow}>
              <Text style={styles.featureTitle}>Transcript Calibration</Text>
              <View style={styles.officialBadge}>
                <Text style={styles.officialBadgeText}>Official</Text>
              </View>
            </View>
            <Text style={styles.featureDesc}>
              Direct digital verification with UNILAG, UI, OAU, Covenant, FUTA,
              and accredited institutions.
            </Text>
          </View>
        </View>

        {/* 2. Fintech Capstones */}
        <View style={styles.featureCard}>
          <View style={styles.featureIconBox}>
            <MaterialCommunityIcons
              name="code-tags"
              size={20}
              color="#731F94"
            />
          </View>
          <View style={styles.featureContent}>
            <View style={styles.featureTitleRow}>
              <Text style={styles.featureTitle}>Fintech Capstones</Text>
              <View style={styles.handsOnBadge}>
                <Text style={styles.handsOnBadgeText}>Hands-on</Text>
              </View>
            </View>
            <Text style={styles.featureDesc}>
              Build live-grade solutions modeled on Lagos BRT transit cards,
              Moniepoint POS logs, and Flutterwave APIs.
            </Text>
          </View>
        </View>

        {/* 3. Recruiter Fast-Pass */}
        <View style={styles.featureCard}>
          <View style={styles.featureIconBox}>
            <MaterialCommunityIcons
              name="speedometer"
              size={20}
              color="#731F94"
            />
          </View>
          <View style={styles.featureContent}>
            <View style={styles.featureTitleRow}>
              <Text style={styles.featureTitle}>Recruiter Fast–Pass</Text>
              <View style={styles.directBadge}>
                <Text style={styles.directBadgeText}>Direct</Text>
              </View>
            </View>
            <Text style={styles.featureDesc}>
              Bypass generic HR black holes. Your portfolio goes directly to
              verified lead engineering managers.
            </Text>
          </View>
        </View>

        {/* ================= Testimonial Card ================= */}
        <View style={styles.testimonialCard}>
          <View style={styles.testimonialTopRow}>
            <Image
              source={CHIOMA_AVATAR}
              style={styles.testimonialAvatar}
              resizeMode="cover"
            />
            <View style={styles.testimonialMetaCol}>
              <Text style={styles.testimonialName}>
                Tobi Adeyemi • UI Class of '23
              </Text>
              <Text style={styles.testimonialRole}>
                Associate Backend Eng @ Kuda Bank
              </Text>
            </View>
            <Ionicons name="star" size={16} color="#731F94" />
          </View>

          <Text style={styles.testimonialQuote}>
            “SkillBridge calibrated my university transcript and matched my
            capstone directly to Kuda’s lead engineer in 3 weeks.”
          </Text>
        </View>

        {/* ================= Next CTA Button ================= */}
        <TouchableOpacity
          style={styles.nextBtn}
          activeOpacity={0.88}
          onPress={() => router.push("/upgrade")}
        >
          <Text style={styles.nextBtnText}>Next</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF8FC",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* Header Section */
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoBadgeContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#6A1B87",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  skillbridgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFE5F7",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 5,
    marginBottom: 8,
  },
  purpleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#731F94",
  },
  skillbridgePillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.6,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#6A1B87",
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subTitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },

  /* Hero Card */
  heroCard: {
    backgroundColor: "#F3ECFA",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  pipelinePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  pipelinePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  heroContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  heroTextCol: {
    flex: 1,
    marginRight: 10,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#6A1B87",
    lineHeight: 22,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 11,
    color: "#556070",
    lineHeight: 16,
  },
  heroImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  activelyHiringPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 6,
  },
  tinyPurpleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#731F94",
  },
  activelyHiringText: {
    flex: 1,
    fontSize: 10,
    fontWeight: "600",
    color: "#1C101B",
  },

  /* 3-Column Metrics */
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6A1B87",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 13,
  },

  /* Feature List Cards */
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3ECFA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6A1B87",
  },
  officialBadge: {
    backgroundColor: "#EBE0F7",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  officialBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
  },
  handsOnBadge: {
    backgroundColor: "#F0E5F7",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  handsOnBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
  },
  directBadge: {
    backgroundColor: "#F0E5F7",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  directBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
  },
  featureDesc: {
    fontSize: 11,
    color: "#556070",
    lineHeight: 16,
  },

  /* Testimonial Card */
  testimonialCard: {
    backgroundColor: "#EFE5F7",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  testimonialTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  testimonialAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  testimonialMetaCol: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6A1B87",
  },
  testimonialRole: {
    fontSize: 10,
    color: "#731F94",
    marginTop: 1,
  },
  testimonialQuote: {
    fontSize: 11,
    color: "#5B4075",
    lineHeight: 16,
    fontStyle: "italic",
  },

  /* Next CTA */
  nextBtn: {
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
  nextBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
