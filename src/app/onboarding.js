import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoSvg from "../../assets/images/logo.svg";
import { logError } from "../services/logger";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDES = [
  {
    id: "1",
    topTitle: "See exactly what\nyou are missing",
    topSubtitle: "Compare your skills with the role you want.",
    bottomTitle: "See exactly what you are missing",
    bottomSubtitle: "Compare your skills with the role you want.",
    topBg: "#FCECEB",
    bottomBg: "#731F94",
    topTextColor: "#731F94",
    bottomTextColor: "#FFFFFF",
    bottomSubTextColor: "#E6C6E4",
    buttonBg: "#FCECEB",
    buttonTextColor: "#731F94",
    buttonBorder: "transparent",
    buttonLabel: "Next",
    dotsTheme: "light",
    hasTopIllustration: true,
  },
  {
    id: "2",
    topTitle: "Get matched to\nreal jobs",
    topSubtitle: "Every match comes with a clear reason.",
    bottomTitle: "Get matched to real jobs",
    bottomSubtitle: "Every match comes with a clear reason.",
    topBg: "#FCECEB",
    bottomBg: "#731F94",
    topTextColor: "#731F94",
    bottomTextColor: "#FFFFFF",
    bottomSubTextColor: "#E6C6E4",
    buttonBg: "#731F94",
    buttonTextColor: "#FFFFFF",
    buttonBorder: "#FFFFFF",
    buttonLabel: "Next",
    dotsTheme: "light",
    hasTopIllustration: true,
  },
  {
    id: "3",
    topTitle: "",
    topSubtitle: "",
    bottomTitle: "Land Roles That Match Your Potential",
    bottomSubtitle:
      "Get matched with jobs and internships – and see exactly why you fit",
    topBg: "#7D6467", // muted placeholder card
    bottomBg: "#FCECEB", // inverted light bottom sheet
    topTextColor: "transparent",
    bottomTextColor: "#1C101B",
    bottomSubTextColor: "#483C47",
    buttonBg: "#731F94",
    buttonTextColor: "#FFFFFF",
    buttonBorder: "transparent",
    buttonLabel: "Get Started",
    dotsTheme: "dark",
    hasTopIllustration: false,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("already_onboarded", "true");
    } catch (e) {
      logError("onboarding", "handleFinishOnboarding", e);
      console.error(e);
    }
    router.replace("/signup"); 
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleFinishOnboarding();
    }
  };

  const handleSkip = () => {
    handleFinishOnboarding();
  };

  const onMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const currentSlide = SLIDES[currentIndex];

  const renderSlideItem = ({ item }) => {
    return (
      <View
        style={[
          styles.slideCanvas,
          { width: SCREEN_WIDTH, backgroundColor: item.topBg },
        ]}
      >
        <SafeAreaView style={styles.topSafeArea}>
          {/* Top Bar with Center Logo and Skip */}
          <View style={styles.navBar}>
            <View style={styles.navPlaceholder} />
            <View style={styles.logoContainer}>
              <LogoSvg width={30} height={30} fill="#731F94" />
            </View>
            <TouchableOpacity
              onPress={handleSkip}
              hitSlop={12}
              style={styles.skipButton}
            >
              <Text
                style={[
                  styles.skipText,
                  { color: item.topTextColor || "#731F94" },
                ]}
              >
                Skip
              </Text>
            </TouchableOpacity>
          </View>

          {/* Central Visual / Illustration Area */}
          {item.hasTopIllustration ? (
            <View style={styles.illustrationArea}>
              <View style={[styles.pill, styles.pillTop]} />
              <View style={styles.pillRow}>
                <View style={[styles.pill, styles.pillLeft]} />
                <View style={[styles.pill, styles.pillRight]} />
              </View>
            </View>
          ) : (
            <View style={styles.emptyIllustration} />
          )}

          {/* Upper Text */}
          {item.topTitle ? (
            <View style={styles.heroTextContainer}>
              <Text style={[styles.heroTitle, { color: item.topTextColor }]}>
                {item.topTitle}
              </Text>
              <Text style={[styles.heroSubtitle, { color: item.topTextColor }]}>
                {item.topSubtitle}
              </Text>
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: currentSlide.topBg }]}>
      <StatusBar barStyle="dark-content" />

      {/* Main Top Swiper Section */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          renderItem={renderSlideItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />
      </View>

      {/* Bottom Sheet Modal / Drawer */}
      <View
        style={[styles.bottomSheet, { backgroundColor: currentSlide.bottomBg }]}
      >
        {/* Pagination Indicators */}
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, i) => {
            const isActive = i === currentIndex;
            const isDark = currentSlide.dotsTheme === "dark";
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isActive && styles.activeDotPill,
                  {
                    backgroundColor: isActive
                      ? isDark
                        ? "#731F94"
                        : "#FCECEB"
                      : isDark
                        ? "#2A202A"
                        : "rgba(255, 255, 255, 0.4)",
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Bottom Sheet Information */}
        <View style={styles.sheetContent}>
          <Text
            style={[styles.sheetTitle, { color: currentSlide.bottomTextColor }]}
          >
            {currentSlide.bottomTitle}
          </Text>
          <Text
            style={[
              styles.sheetSubtitle,
              { color: currentSlide.bottomSubTextColor },
            ]}
          >
            {currentSlide.bottomSubtitle}
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={[
            styles.ctaButton,
            {
              backgroundColor: currentSlide.buttonBg,
              borderColor: currentSlide.buttonBorder,
              borderWidth:
                currentSlide.buttonBorder === "transparent" ? 0 : 1.5,
            },
          ]}
        >
          <Text
            style={[
              styles.ctaButtonText,
              { color: currentSlide.buttonTextColor },
            ]}
          >
            {currentSlide.buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  carouselContainer: {
    flex: 1,
  },
  slideCanvas: {
    flex: 1,
  },
  topSafeArea: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    marginTop: 8,
  },
  navPlaceholder: {
    width: 44,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  skipButton: {
    minWidth: 44,
    alignItems: "flex-end",
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
  },
  illustrationArea: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  emptyIllustration: {
    flex: 1,
  },
  pill: {
    backgroundColor: "#731F94",
  },
  pillTop: {
    width: 90,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  pillLeft: {
    width: 88,
    height: 62,
    borderRadius: 31,
  },
  pillRight: {
    width: 88,
    height: 62,
    borderRadius: 31,
  },
  heroTextContainer: {
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 8,
    lineHeight: 21,
  },
  bottomSheet: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDotPill: {
    width: 18,
    height: 7,
    borderRadius: 4,
  },
  sheetContent: {
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  ctaButton: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
