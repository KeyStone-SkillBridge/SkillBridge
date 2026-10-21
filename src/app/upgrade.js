import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LOGO from "../../assets/images/logo.svg";

const TUNDE_AVATAR = require("../../assets/images/TundeAlabi.png");
const CHIOMA_AVATAR = require("../../assets/images/ChiomaEze.png");

export default function UpgradeProScreen() {
  const router = useRouter();

  // Pricing Interval State
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' | 'sprint'

  // Selected Track State for Step 1
  const [selectedTrack, setSelectedTrack] = useState("Fintech Backend");

  const priceString =
    billingCycle === "monthly" ? "₦12,500/mo" : "₦28,000/sprint";

  const handleCheckout = () => {
    Alert.alert(
      "Checkout Gateway",
      `Routing to Paystack / Flutterwave for ${priceString}...`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color="#1C101B" />
        </TouchableOpacity>

        {/* SkillBridge Constellation Logo Mark */}
        <LOGO width={36} height={36} style={styles.headerLogo} />

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 1. Hero Card ================= */}
        <View style={styles.heroCard}>
          {/* Top Pill Badges */}
          <View style={styles.heroTopBadges}>
            <View style={styles.heroBadgeLeft}>
              <Feather name="award" size={12} color="#FFFFFF" />
              <Text style={styles.heroBadgeLeftText}>
                PRO CAREER ACCELERATION
              </Text>
            </View>

            <View style={styles.heroBadgeRight}>
              <Text style={styles.heroBadgeRightText}>Top 5% Cohort</Text>
            </View>
          </View>

          {/* Hero Headlines */}
          <Text style={styles.heroHeadline}>
            Accelerate into Lagos Fintech Leadership
          </Text>
          <Text style={styles.heroSubheadline}>
            Unlock 3× faster placement pipelines, direct recruiter fast-passes,
            and 1-on-1 code critiques with well recognized tech companies in
            Nigeria.
          </Text>

          {/* Metric Stats Cards */}
          <View style={styles.heroMetricsRow}>
            <View style={styles.metricCard}>
              <Ionicons name="rocket-outline" size={22} color="#FFFFFF" />
              <View style={styles.metricTextGroup}>
                <Text style={styles.metricLabel}>Average Placement</Text>
                <Text style={styles.metricValue}>21 Days</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#FFFFFF"
              />
              <View style={styles.metricTextGroup}>
                <Text style={styles.metricLabel}>Hiring Partners</Text>
                <Text style={styles.metricValue}>28+ FinTechs</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================= 2. Verified Hiring Partners Banner ================= */}
        <View style={styles.partnersBanner}>
          <Text style={styles.partnersLabel}>VERIFIED HIRING PARTNERS</Text>
          <Text style={styles.partnersValue}>Coming Soon</Text>
        </View>

        {/* ================= 3. Steps to Go Pro ================= */}
        <View style={styles.stepsHeaderRow}>
          <View>
            <Text style={styles.stepsTitle}>Steps to Go Pro</Text>
            <Text style={styles.stepsSubtitle}>
              Your roadmap to verified recruiter placement
            </Text>
          </View>

          <View style={styles.stagePill}>
            <Text style={styles.stagePillText}>Stage 1 of 3</Text>
          </View>
        </View>

        {/* Step 1 Card */}
        <View style={styles.stepCard}>
          <View style={styles.stepTopRow}>
            <View style={styles.stepNumberBadgeActive}>
              <Text style={styles.stepNumberTextActive}>1</Text>
            </View>
            <View style={styles.stepHeaderCol}>
              <View style={styles.stepLabelRow}>
                <Text style={styles.stepCategoryLabel}>
                  STEP 1 • READY TO CHOOSE
                </Text>
                <View style={styles.activeDot} />
              </View>
              <Text style={styles.stepTitle}>
                Select Your Track & Mentor Tier
              </Text>
            </View>
          </View>

          <Text style={styles.stepDescription}>
            Choose between Backend Engineering, Product Analytics, or Growth.
            Partnered with a Senior Staff Engineer for bi-weekly 1:1 code
            audits.
          </Text>

          {/* Track Selection Chips */}
          <View style={styles.chipRow}>
            {["Fintech Backend", "Data & Fraud ML", "Product Systems"].map(
              (track) => {
                const isSelected = selectedTrack === track;
                return (
                  <TouchableOpacity
                    key={track}
                    style={[
                      styles.trackChip,
                      isSelected
                        ? styles.trackChipSelected
                        : styles.trackChipUnselected,
                    ]}
                    onPress={() => setSelectedTrack(track)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.trackChipText,
                        isSelected
                          ? styles.trackChipTextSelected
                          : styles.trackChipTextUnselected,
                      ]}
                    >
                      {track}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

          {/* Mentor Profile Preview */}
          <View style={styles.mentorPreviewBox}>
            <Image source={TUNDE_AVATAR} style={styles.mentorAvatar} />
            <View style={styles.mentorInfoCol}>
              <Text style={styles.mentorName}>
                Tunde Alabi • Staff Architect
              </Text>
              <Text style={styles.mentorBio}>
                Ex-Paystack Core Payments • 4 slots left
              </Text>
            </View>
          </View>
        </View>

        {/* Step 2 Card */}
        <View style={styles.stepCard}>
          <View style={styles.stepTopRow}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepHeaderCol}>
              <View style={styles.stepLabelRow}>
                <Text style={styles.stepCategoryLabel}>
                  STEP 2 • INSTANT ACTIVATION
                </Text>
                <Feather name="zap" size={13} color="#1C101B" />
              </View>
              <Text style={styles.stepTitle}>
                Unlimited Cloud Sandboxes & Capstones
              </Text>
            </View>
          </View>

          <Text style={styles.stepDescription}>
            Gain access to production-grade telemetry through webhook
            simulators, card transaction feeds, and cloud-hosted PostgreSQL
            databases.
          </Text>

          <View style={styles.chipRow}>
            <View style={styles.featurePill}>
              <Feather name="terminal" size={13} color="#1C101B" />
              <Text style={styles.featurePillText}>Live NIBSS API</Text>
            </View>

            <View style={styles.featurePill}>
              <MaterialCommunityIcons
                name="shield-outline"
                size={14}
                color="#1C101B"
              />
              <Text style={styles.featurePillText}>Polygon Proof</Text>
            </View>
          </View>
        </View>

        {/* Step 3 Card */}
        <View style={styles.stepCard}>
          <View style={styles.stepTopRow}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepHeaderCol}>
              <View style={styles.stepLabelRow}>
                <Text style={styles.stepCategoryLabel}>
                  STEP 3 • PLACEMENT ENGINE
                </Text>
                <Feather name="shield" size={13} color="#1C101B" />
              </View>
              <Text style={styles.stepTitle}>
                Direct Recruiter Fast-Pass Placement
              </Text>
            </View>
          </View>

          <Text style={styles.stepDescription}>
            Candidates scoring 84% or higher on the assessment bypass initial HR
            screening. Their portfolios are sent directly to lead hiring
            managers at top financial institutions and fintech companies.
          </Text>

          {/* Quotient Banner */}
          <View style={styles.quotientCard}>
            <View style={styles.quotientCircle}>
              <Text style={styles.quotientPercent}>94%</Text>
            </View>
            <View style={styles.quotientDetails}>
              <Text style={styles.quotientTitle}>Fintech Match Quotient</Text>
              <Text style={styles.quotientSubtitle}>
                Top Tier-1 Eligibility
              </Text>
            </View>
            <MaterialCommunityIcons
              name="email-fast-outline"
              size={22}
              color="#1C101B"
            />
          </View>
        </View>

        {/* ================= 4. All-Inclusive Pass Pricing Card ================= */}
        <View style={styles.pricingCard}>
          {/* Floating Most Selected Ribbon */}
          <View style={styles.ribbonContainer}>
            <Text style={styles.ribbonText}>MOST SELECTED</Text>
          </View>

          <Text style={styles.passCategoryLabel}>ALL-INCLUSIVE PASS</Text>
          <Text style={styles.passTitle}>SkillBridge Pro Graduate</Text>
          <Text style={styles.passSubtitle}>
            Accelerated career jumpstart with high-signal credentials
          </Text>

          {/* Billing Switcher Toggle */}
          <View style={styles.billingToggleTrack}>
            <TouchableOpacity
              style={[
                styles.billingToggleBtn,
                billingCycle === "monthly" && styles.billingToggleBtnActive,
              ]}
              onPress={() => setBillingCycle("monthly")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.billingToggleText,
                  billingCycle === "monthly" && styles.billingToggleTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.billingToggleBtn,
                billingCycle === "sprint" && styles.billingToggleBtnActive,
              ]}
              onPress={() => setBillingCycle("sprint")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.billingToggleText,
                  billingCycle === "sprint" && styles.billingToggleTextActive,
                ]}
              >
                3–Month Sprint
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>-25%</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Price Header */}
          <View style={styles.priceRow}>
            <Text style={styles.mainPriceText}>
              {billingCycle === "monthly" ? "₦12,500" : "₦28,000"}
            </Text>
            <Text style={styles.perDurationText}>
              {billingCycle === "monthly" ? " / month" : " / 3 months"}
            </Text>
          </View>
          <Text style={styles.cancellationNotice}>
            Cancel or pause anytime. Full access starts immediately.
          </Text>

          {/* Checklist */}
          <View style={styles.checklist}>
            <View style={styles.checkRow}>
              <Ionicons name="checkmark-circle" size={18} color="#131B2A" />
              <Text style={styles.checkText}>
                Weekly 1-on-1 technical mock interview & systems design audit
              </Text>
            </View>

            <View style={styles.checkRow}>
              <Ionicons name="checkmark-circle" size={18} color="#131B2A" />
              <Text style={styles.checkText}>
                Verified Polygon-based credential endorsed by a recognized
                technology council.
              </Text>
            </View>

            <View style={styles.checkRow}>
              <Ionicons name="checkmark-circle" size={18} color="#131B2A" />
              <Text style={styles.checkText}>
                Priority InMail delivery to 28+ verified Lagos tech recruiters
              </Text>
            </View>

            <View style={styles.checkRow}>
              <Ionicons name="checkmark-circle" size={18} color="#131B2A" />
              <Text style={styles.checkText}>
                Full access to live Moniepoint, Cowry transit & Paystack sandbox
                webhooks
              </Text>
            </View>
          </View>

          {/* 100% Placement Guarantee Banner */}
          <View style={styles.guaranteeBox}>
            <MaterialCommunityIcons
              name="shield-check"
              size={22}
              color="#131B2A"
              style={{ marginTop: 2, marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeHeading}>
                100% Placement Guarantee
              </Text>
              <Text style={styles.guaranteeSub}>
                30-day money-back refund policy if not satisfied. NDPR
                compliant.
              </Text>
            </View>
          </View>

          {/* Payment Rails Logos */}
          <Text style={styles.railsHeader}>
            SECURED VIA CENTRAL BANK OF NIGERIA COMPLIANT RAILS
          </Text>
          <View style={styles.railsRow}>
            <Text style={styles.railName}>Paystack</Text>
            <View style={styles.railDot} />
            <Text style={styles.railName}>Flutterwave</Text>
            <View style={styles.railDot} />
            <Text style={styles.railName}>Bank Transfer</Text>
            <View style={styles.railDot} />
            <Text style={styles.railName}>USSD</Text>
          </View>
        </View>

        {/* ================= 5. Social Proof Testimonial Card ================= */}
        <View style={styles.testimonialCard}>
          <Image
            source={CHIOMA_AVATAR}
            style={styles.testimonialAvatar}
            resizeMode="cover"
          />

          <View style={styles.testimonialContent}>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name="star" size={13} color="#731F94" />
              ))}
              <Text style={styles.landedText}>Landed at Kuda</Text>
            </View>

            <Text style={styles.quoteText}>
              “The sandbox projects mirrored actual production webhooks. The
              mentor audit gave me the exact architecture responses for my final
              round.”
            </Text>

            <Text style={styles.authorText}>
              Chioma Eze • Graduate Software Engineer
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ================= 6. Sticky Floating Bottom CTA ================= */}
      <View style={styles.bottomCtaDock}>
        <TouchableOpacity
          style={styles.checkoutBtn}
          activeOpacity={0.88}
          onPress={handleCheckout}
        >
          <Feather name="zap" size={18} color="#FFFFFF" />
          <Text style={styles.checkoutBtnText}>
            Upgrade to Pro Pass • {priceString}
          </Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.footerGuaranteeRow}>
          <Feather name="lock" size={12} color="#6B7280" />
          <Text style={styles.footerGuaranteeText}>
            Instant activation • 30–day money-back guarantee
          </Text>
        </View>
      </View>
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
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 120, // accounts for sticky bottom button
  },

  /* 1. Hero Card */
  heroCard: {
    backgroundColor: "#6A1B87",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  heroTopBadges: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heroBadgeLeft: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 6,
  },
  heroBadgeLeftText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  heroBadgeRight: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  heroBadgeRightText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6A1B87",
  },
  heroHeadline: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 28,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  heroSubheadline: {
    fontSize: 12,
    color: "#E8D4F0",
    lineHeight: 18,
    marginBottom: 18,
  },
  heroMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricTextGroup: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: "#DDBCEB",
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
  },

  /* 2. Partners Banner */
  partnersBanner: {
    backgroundColor: "#F8F4FC",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  partnersLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7B6F84",
    letterSpacing: 0.6,
  },
  partnersValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#731F94",
    marginTop: 3,
  },

  /* 3. Steps to Go Pro */
  stepsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6A1B87",
  },
  stepsSubtitle: {
    fontSize: 11,
    color: "#556070",
    marginTop: 1,
  },
  stagePill: {
    backgroundColor: "#EAE1FA",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  stagePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6A1B87",
  },

  /* Step Card Elements */
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#F0E8F5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  stepTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  stepNumberBadgeActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6A1B87",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberTextActive: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  stepNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EAE1FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1C101B",
  },
  stepHeaderCol: {
    flex: 1,
  },
  stepLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepCategoryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1C101B",
    letterSpacing: 0.4,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#000000",
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#131B2A",
    marginTop: 2,
  },
  stepDescription: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  trackChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  trackChipSelected: {
    backgroundColor: "#000000",
  },
  trackChipUnselected: {
    backgroundColor: "#EAE1FA",
  },
  trackChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  trackChipTextSelected: {
    color: "#FFFFFF",
  },
  trackChipTextUnselected: {
    color: "#131B2A",
  },
  mentorPreviewBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F7FC",
    borderRadius: 10,
    padding: 8,
    marginTop: 4,
  },
  mentorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  mentorInfoCol: {
    flex: 1,
  },
  mentorName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#131B2A",
  },
  mentorBio: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 1,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2ECFA",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  featurePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#131B2A",
  },
  quotientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5EEFC",
    borderRadius: 12,
    padding: 10,
  },
  quotientCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E1D3F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  quotientPercent: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6A1B87",
  },
  quotientDetails: {
    flex: 1,
  },
  quotientTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#131B2A",
  },
  quotientSubtitle: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 1,
  },

  /* 4. Pricing Pass Card */
  pricingCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.4,
    borderColor: "#EAE1FA",
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 16,
    position: "relative",
  },
  ribbonContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#6A1B87",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 12,
  },
  ribbonText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  passCategoryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#131B2A",
    letterSpacing: 0.4,
    marginTop: 4,
  },
  passTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#131B2A",
    marginTop: 4,
  },
  passSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 16,
  },
  billingToggleTrack: {
    flexDirection: "row",
    backgroundColor: "#ECE3FA",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  billingToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  billingToggleBtnActive: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  billingToggleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#556070",
  },
  billingToggleTextActive: {
    color: "#131B2A",
  },
  discountBadge: {
    backgroundColor: "#E1D3F8",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#6A1B87",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  mainPriceText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#131B2A",
    letterSpacing: -0.5,
  },
  perDurationText: {
    fontSize: 13,
    color: "#556070",
    fontWeight: "600",
    marginLeft: 4,
  },
  cancellationNotice: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 16,
  },
  checklist: {
    gap: 10,
    marginBottom: 18,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkText: {
    flex: 1,
    fontSize: 12,
    color: "#1F2937",
    lineHeight: 18,
    fontWeight: "500",
  },
  guaranteeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F5EEFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  guaranteeHeading: {
    fontSize: 12,
    fontWeight: "800",
    color: "#131B2A",
  },
  guaranteeSub: {
    fontSize: 10,
    color: "#4B5563",
    lineHeight: 14,
    marginTop: 2,
  },
  railsHeader: {
    fontSize: 9,
    fontWeight: "700",
    color: "#7B6F84",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  railsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  railName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#556070",
  },
  railDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#9CA3AF",
  },

  /* 5. Testimonial Card */
  testimonialCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F2ECFA",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  testimonialAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  testimonialContent: {
    flex: 1,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },
  landedText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6A1B87",
    marginLeft: 6,
  },
  quoteText: {
    fontSize: 11,
    color: "#5B4075",
    lineHeight: 16,
    fontStyle: "italic",
    marginBottom: 6,
  },
  authorText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#131B2A",
  },

  /* 6. Sticky Floating Bottom CTA */
  bottomCtaDock: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0E5EE",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
  },
  checkoutBtn: {
    height: 50,
    backgroundColor: "#6A1B87",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 6,
  },
  checkoutBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  footerGuaranteeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerGuaranteeText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
});
