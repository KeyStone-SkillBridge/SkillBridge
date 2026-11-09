import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import LogoSvg from "../../../assets/images/logo.svg";
import { EmptyCard, LoadingState } from "../../components/StateViews";
import { getErrorMessage } from "../../services/api";
import { asList, matchingService, opportunityService } from "../../services/endpoints";
import { initials, invalidateSkillBridge, titleCase, useSkillBridge } from "../../services/useSkillBridge";
import { logError } from "../../services/logger";

const BOOKMARKS_KEY = "skillbridge_bookmarks";
const TYPE_LABEL = {
  internship: "Internship",
  job: "Full-time",
  graduate_program: "Graduate Program",
  fellowship: "Fellowship",
  freelance: "Freelance",
};
const FILTERS = [
  { key: "All", icon: null, label: "All Roles" },
  { key: "Grad", icon: "school-outline", label: "Internship / Fresh Grad" },
  { key: "Remote", icon: "home", label: "Hybrid / Remote" },
];

// Active opportunities, optionally filtered by a search term.
const fetchOpportunities = (q) =>
  opportunityService.list({ q: q || undefined, status: "active", limit: 30 });

const formatDate = (d) => {
  if (!d) return "Open";
  const date = new Date(d);
  return isNaN(date) ? "Open" : date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

export default function JobsScreen() {
  const router = useRouter();
  const { data, stats, loading, refreshing, refresh, reload } = useSkillBridge();
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(true); // the first load starts on mount
  const [searchFailed, setSearchFailed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [bookmarks, setBookmarks] = useState({});

  useEffect(() => {
    AsyncStorage.getItem(BOOKMARKS_KEY)
      .then((raw) => raw && setBookmarks(JSON.parse(raw)))
      .catch((e) => logError("jobs", "load bookmarks", e));
  }, []);

  const onSearchResults = useCallback((res) => {
    setSearchResults(asList(res));
    setSearchFailed(false);
    setSearching(false);
  }, []);

  const onSearchError = useCallback((err) => {
    logError("jobs", "runSearch", err);
    // Keep whatever is already listed; just flag that this attempt failed so
    // the screen doesn't claim there are no roles.
    if (err?.response?.status !== 401) setSearchFailed(true);
    setSearching(false);
  }, []);

  // Search started by the user (search box, retry, pull to refresh).
  const runSearch = useCallback(
    (q) => {
      setSearching(true);
      setSearchFailed(false);
      return fetchOpportunities(q).then(onSearchResults, onSearchError);
    },
    [onSearchResults, onSearchError],
  );

  // Initial browse list (for users who don't have matches yet). `searching`
  // starts as true, so nothing needs setting before the request goes out, and
  // state is only updated once the request has answered.
  useEffect(() => {
    let active = true;
    fetchOpportunities("").then(
      (res) => active && onSearchResults(res),
      (err) => active && onSearchError(err),
    );
    return () => {
      active = false;
    };
  }, [onSearchResults, onSearchError]);

  // Merge matches (with %) and plain opportunities into one list of rows.
  const rows = useMemo(() => {
    const matchByOpp = {};
    (data?.matches || []).forEach((m) => {
      if (m.opportunity) matchByOpp[m.opportunity.id || m.opportunityId] = m;
    });
    const seen = new Set();
    const out = [];
    const push = (opp, match) => {
      if (!opp || seen.has(opp.id)) return;
      seen.add(opp.id);
      out.push({ opp, match: match || matchByOpp[opp.id] || null });
    };
    if (!query.trim()) (data?.matches || []).forEach((m) => push(m.opportunity, m));
    searchResults.forEach((o) => push(o));

    return out.filter(({ opp }) => {
      if (activeFilter === "Grad") return ["internship", "graduate_program", "fellowship"].includes(opp.type);
      if (activeFilter === "Remote") return ["remote", "hybrid"].includes(opp.workMode);
      return true;
    });
  }, [data?.matches, searchResults, activeFilter, query]);

  const featured = rows.find((r) => r.opp.id === selectedId) || rows[0] || null;
  const others = rows.filter((r) => r !== featured);

  const toggleBookmark = async (id) => {
    const next = { ...bookmarks, [id]: !bookmarks[id] };
    if (!next[id]) delete next[id];
    setBookmarks(next);
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    } catch (e) {
      logError("jobs", "save bookmarks", e);
    }
  };

  // The server answers 400 until the user has a *completed* skill-gap analysis
  // with skills in it. Say which part is actually missing.
  const matchErrorMessage = (err) => {
    const serverMessage = getErrorMessage(err);
    if (err?.response?.status !== 400) return serverMessage;

    const hasCv = (data?.cvs || []).length > 0;
    const hasCompletedGap = (data?.skillGaps || []).some(
      (g) => g.status === "completed" && (g.currentSkills || []).length > 0,
    );
    if (hasCompletedGap) return serverMessage;
    if (hasCv) {
      return `Your CV is uploaded, but its skill analysis hasn't completed yet. Open Profile Settings and tap "Re-run analysis", then try again.\n\nServer said: ${serverMessage}`;
    }
    return `You need a completed skill-gap analysis first. Upload your CV from profile setup.\n\nServer said: ${serverMessage}`;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await matchingService.generate();
      invalidateSkillBridge();
      await reload();
    } catch (err) {
      logError("jobs", "handleGenerate", err);
      Alert.alert("Couldn't generate matches", matchErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const apply = (opp) => {
    if (!opp?.applicationUrl) {
      Alert.alert("Apply", "This opportunity doesn't have an application link yet.");
      return;
    }
    Linking.openURL(opp.applicationUrl).catch((e) => {
      logError("jobs", "open application link", e);
      Alert.alert("Couldn't open link", opp.applicationUrl);
    });
  };

  const share = (opp) =>
    Share.share({
      message: `${opp.title} at ${opp.company}${opp.applicationUrl ? `\n${opp.applicationUrl}` : ""}`,
    }).catch((e) => logError("jobs", "share opportunity", e));

  // Gauge
  const circleSize = 60;
  const strokeWidth = 5;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const featuredPct = featured?.match?.matchPercentage;
  const strokeDashoffset =
    circumference - circumference * ((typeof featuredPct === "number" ? featuredPct : 0) / 100);

  const userSkillSet = new Set(stats.currentSkills.map((s) => s.toLowerCase()));
  const featuredMatched =
    featured?.match?.matchedSkills ||
    (featured?.opp?.requiredSkills || []).filter((s) => userSkillSet.has(String(s).toLowerCase()));
  const featuredMissing =
    featured?.match?.missingSkills ||
    (featured?.opp?.requiredSkills || []).filter((s) => !userSkillSet.has(String(s).toLowerCase()));
  const requiredCount = (featured?.opp?.requiredSkills || []).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FC" />

      {/* ================= Header Bar ================= */}
      <View style={styles.headerBar}>
        <View style={styles.headerBrandGroup}>
          <LogoSvg width={30} height={30} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.brandTitle}>SkillBridge</Text>
            <Text style={styles.brandSubtitle}>JOBS</Text>
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
        <LoadingState label="Finding roles for you..." />
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              refresh();
              runSearch(query);
            }}
            tintColor="#731F94"
          />
        }
      >
        {/* ================= Search Bar ================= */}
        <View style={styles.searchBarContainer}>
          <Feather
            name="search"
            size={18}
            color="#7B6F84"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={stats.targetRole ? `Search e.g. ${stats.targetRole}` : "Search roles, companies, skills"}
            placeholderTextColor="#7B6F84"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => runSearch(query.trim())}
          />
          {searching ? (
            <ActivityIndicator size="small" color="#731F94" />
          ) : (
            <TouchableOpacity hitSlop={8} onPress={() => runSearch(query.trim())}>
              <MaterialCommunityIcons
                name="tune-variant"
                size={20}
                color="#731F94"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ================= Filter Chips ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterChip,
                  active ? styles.filterChipActive : styles.filterChipInactive,
                ]}
                onPress={() => setActiveFilter(f.key)}
              >
                {f.icon === "school-outline" && (
                  <Ionicons
                    name="school-outline"
                    size={14}
                    color={active ? "#FFFFFF" : "#731F94"}
                    style={{ marginRight: 4 }}
                  />
                )}
                {f.icon === "home" && (
                  <Feather
                    name="home"
                    size={13}
                    color={active ? "#FFFFFF" : "#731F94"}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    active ? styles.filterTextActive : styles.filterTextInactive,
                  ]}
                >
                  {f.key === "All" ? `${f.label} (${rows.length})` : f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {(data?.matches || []).length === 0 && (
          <TouchableOpacity
            style={styles.generateBanner}
            onPress={handleGenerate}
            disabled={generating}
            activeOpacity={0.85}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#731F94" />
            ) : (
              <MaterialCommunityIcons name="creation" size={16} color="#731F94" />
            )}
            <Text style={styles.generateBannerText}>
              {generating ? "Calculating your match scores..." : "Get personalised match scores for these roles"}
            </Text>
            <Feather name="chevron-right" size={16} color="#731F94" />
          </TouchableOpacity>
        )}

        {!featured ? (
          <EmptyCard
            icon={searchFailed ? "wifi-off" : "briefcase"}
            title={
              searching ? "Searching..." : searchFailed ? "Couldn't load roles" : "No roles found"
            }
            message={
              searchFailed
                ? "We couldn't reach the server. Check your connection and try again."
                : query
                  ? "Try a different search term or filter."
                  : "New opportunities are added regularly. Pull down to refresh."
            }
            ctaLabel={searchFailed && !searching ? "Try again" : undefined}
            onPress={() => runSearch(query.trim())}
          />
        ) : (
        /* ================= Featured Main Job Card ================= */
        <View style={styles.featuredJobCard}>
          {/* Top Title Section */}
          <View style={styles.featuredHeaderRow}>
            <View style={[styles.featuredCompanyLogo, styles.logoInitialsBox]}>
              <Text style={styles.logoInitialsText}>{initials(featured.opp.company)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.fastTrackBadgeRow}>
                <Text style={styles.fastTrackText}>
                  {featured.match ? "TOP MATCH FOR YOU" : (TYPE_LABEL[featured.opp.type] || "OPPORTUNITY").toUpperCase()}
                </Text>
                {featured.match && <Ionicons name="checkmark-circle" size={13} color="#731F94" />}
              </View>
              <Text style={styles.featuredJobTitle}>{featured.opp.title}</Text>
              <Text style={styles.featuredCompanyText}>{featured.opp.company}</Text>
            </View>
          </View>

          {/* 4-Item Parameter Grid */}
          <View style={styles.jobSpecGrid}>
            <View style={styles.jobSpecItem}>
              <Ionicons name="location-outline" size={16} color="#731F94" />
              <View style={{ marginLeft: 6, flex: 1 }}>
                <Text style={styles.specLabel}>Location</Text>
                <Text style={styles.specValue} numberOfLines={1}>
                  {featured.opp.location || "Not specified"}
                </Text>
              </View>
            </View>

            <View style={styles.jobSpecItem}>
              <Feather name="home" size={15} color="#731F94" />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.specLabel}>Work Mode</Text>
                <Text style={styles.specValue}>{titleCase(featured.opp.workMode || "onsite")}</Text>
              </View>
            </View>

            <View style={styles.jobSpecItem}>
              <MaterialCommunityIcons
                name="badge-account-outline"
                size={16}
                color="#731F94"
              />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.specLabel}>Type</Text>
                <Text style={styles.specValue}>{TYPE_LABEL[featured.opp.type] || "Role"}</Text>
              </View>
            </View>

            <View style={styles.jobSpecItem}>
              <Ionicons name="calendar-outline" size={16} color="#731F94" />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.specLabel}>Deadline</Text>
                <Text style={styles.specValue}>{formatDate(featured.opp.deadline)}</Text>
              </View>
            </View>
          </View>

          {/* Nested SkillBridge Match Engine Card */}
          <View style={styles.matchEngineCard}>
            <View style={styles.engineHeaderRow}>
              <View style={styles.engineDotRow}>
                <View style={styles.tinyPurpleDot} />
                <Text style={styles.engineTitle}>SkillBridge Match Engine</Text>
              </View>
              <View style={styles.calibrationPill}>
                <Text style={styles.calibrationPillText}>
                  {typeof featuredPct !== "number"
                    ? "Not scored"
                    : featuredPct >= 75
                      ? "Strong Fit"
                      : featuredPct >= 50
                        ? "Good Fit"
                        : "Stretch Role"}
                </Text>
              </View>
            </View>

            {/* Match Gauge */}
            <View style={styles.gaugePassCard}>
              <View style={styles.gaugeWrap}>
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
                <View style={styles.gaugeCenterLabel}>
                  <Text style={styles.gaugePercent}>
                    {typeof featuredPct === "number" ? `${featuredPct}%` : "—"}
                  </Text>
                  <Text style={styles.gaugeMatchLabel}>Match</Text>
                </View>
              </View>

              <View style={styles.passInfoCol}>
                <View style={styles.passTitleRow}>
                  <Feather name="zap" size={12} color="#731F94" />
                  <Text style={styles.passTitleText}>
                    {featuredMatched.length}/{requiredCount || featuredMatched.length} REQUIRED SKILLS
                  </Text>
                </View>
                <Text style={styles.passDescText} numberOfLines={4}>
                  {featured.opp.description}
                </Text>
              </View>
            </View>

            {/* Plain Terms Explanation */}
            {!!featured.match?.explanation && (
              <View style={styles.plainTermsBox}>
                <View style={styles.plainTermsHeader}>
                  <MaterialCommunityIcons
                    name="lightbulb-on-outline"
                    size={16}
                    color="#731F94"
                  />
                  <Text style={styles.plainTermsTitle}>
                    Why you match in plain terms
                  </Text>
                </View>
                <Text style={styles.plainTermsBody}>{featured.match.explanation}</Text>
              </View>
            )}

            {/* Strong Skills Alignment */}
            {featuredMatched.length > 0 && (
              <>
                <View style={styles.alignmentHeaderRow}>
                  <Text style={styles.alignmentHeading}>
                    SKILL ALIGNMENT ({featuredMatched.length})
                  </Text>
                  <Text style={styles.alignmentSub}>From your profile</Text>
                </View>

                <View style={styles.skillPillsWrap}>
                  {featuredMatched.map((skill) => (
                    <View key={skill} style={styles.verifiedSkillPill}>
                      <Ionicons name="checkmark-circle" size={13} color="#731F94" />
                      <Text style={styles.verifiedSkillText}>{titleCase(skill)}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Growth Gaps to Close */}
            {featuredMissing.length > 0 && (
              <>
                <View style={[styles.alignmentHeaderRow, { marginTop: 14 }]}>
                  <Text style={styles.alignmentHeading}>GROWTH GAPS TO CLOSE</Text>
                  <TouchableOpacity onPress={() => router.push("/(tabs)/learn")}>
                    <Text style={styles.bridgeableSub}>Find courses →</Text>
                  </TouchableOpacity>
                </View>

                {featuredMissing.slice(0, 4).map((skill) => (
                  <View key={skill} style={styles.gapCard}>
                    <Feather
                      name="info"
                      size={14}
                      color="#D97706"
                      style={{ marginTop: 2 }}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.gapCardTitle}>{titleCase(skill)}</Text>
                      <Text style={styles.gapCardDesc}>
                        Required for this role — add it to your roadmap to raise your match.
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Preferred skills */}
            {(featured.opp.preferredSkills || []).length > 0 && (
              <View style={styles.perksRow}>
                {featured.opp.preferredSkills.slice(0, 3).map((s) => (
                  <View key={s} style={styles.perkItem}>
                    <Feather name="plus-circle" size={12} color="#556070" />
                    <Text style={styles.perkText}>Nice to have: {titleCase(s)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={() => toggleBookmark(featured.opp.id)}
              hitSlop={8}
            >
              <Ionicons
                name={bookmarks[featured.opp.id] ? "bookmark" : "bookmark-outline"}
                size={18}
                color="#731F94"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={() => share(featured.opp)}
              hitSlop={8}
            >
              <Feather name="share-2" size={18} color="#731F94" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              activeOpacity={0.88}
              onPress={() => apply(featured.opp)}
            >
              <Feather name="external-link" size={15} color="#FFFFFF" />
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}

        {/* ================= More Roles ================= */}
        {others.length > 0 && (
          <View style={styles.moreRolesHeaderRow}>
            <View>
              <Text style={styles.moreRolesTitle}>
                {data?.matches?.length ? "More Roles Calibrated for You" : "More Open Roles"}
              </Text>
              <Text style={styles.moreRolesSubtitle}>
                {stats.targetRole ? `Related to ${stats.targetRole}` : "Tap a role to see details"}
              </Text>
            </View>
            {(data?.matches || []).length > 0 && (
              <TouchableOpacity onPress={handleGenerate} disabled={generating}>
                <Text style={styles.viewAllText}>{generating ? "Updating..." : "Re-match"}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {others.map(({ opp, match }) => (
          <TouchableOpacity
            key={opp.id}
            style={styles.calibratedRoleCard}
            activeOpacity={0.85}
            onPress={() => setSelectedId(opp.id)}
          >
            <View style={styles.roleCardTopRow}>
              <View style={styles.roleLogoBox}>
                <Text style={styles.logoInitialsText}>{initials(opp.company)}</Text>
              </View>

              <View style={styles.roleInfoCol}>
                <Text style={styles.roleName}>{opp.title}</Text>
                <Text style={styles.roleCompany}>
                  {opp.company}
                  {opp.location ? ` • ${opp.location}` : ""}
                </Text>
              </View>

              {typeof match?.matchPercentage === "number" && (
                <View style={styles.matchPillBadge}>
                  <MaterialCommunityIcons name="creation" size={12} color="#731F94" />
                  <Text style={styles.matchPillText}>{match.matchPercentage}% Match</Text>
                </View>
              )}
            </View>

            <View style={styles.roleMetaRow}>
              <Text style={styles.roleSalary}>{TYPE_LABEL[opp.type] || "Role"}</Text>
              <Text style={styles.roleMetaTag}>
                {titleCase(opp.workMode || "onsite")}
                {opp.deadline ? ` • Closes ${formatDate(opp.deadline)}` : ""}
              </Text>
            </View>

            {(opp.requiredSkills || []).length > 0 && (
              <View style={styles.roleChipsRow}>
                {opp.requiredSkills.slice(0, 3).map((s) => (
                  <View key={s} style={styles.roleChip}>
                    <Text style={styles.roleChipText}>{titleCase(s)}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoInitialsBox: {
    backgroundColor: "#EAE0F5",
    alignItems: "center",
    justifyContent: "center",
  },
  logoInitialsText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#731F94",
  },
  generateBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F5EEFC",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  generateBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
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

  /* Search & Filters */
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFE5F7",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#131B2A",
  },
  filterChipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  filterChipActive: {
    backgroundColor: "#731F94",
  },
  filterChipInactive: {
    backgroundColor: "#EAE1FA",
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  filterTextInactive: {
    color: "#731F94",
  },

  /* Featured Job Card */
  featuredJobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  featuredHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  featuredCompanyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EBE0F7",
  },
  fastTrackBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  fastTrackText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#731F94",
    letterSpacing: 0.4,
  },
  featuredJobTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#131B2A",
    lineHeight: 20,
  },
  featuredCompanyText: {
    fontSize: 11,
    color: "#556070",
    marginTop: 2,
  },
  jobSpecGrid: {
    backgroundColor: "#FAF8FC",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  jobSpecItem: {
    width: "46%",
    flexDirection: "row",
    alignItems: "center",
  },
  specLabel: {
    fontSize: 9,
    color: "#7B6F84",
    fontWeight: "500",
  },
  specValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#131B2A",
    marginTop: 1,
  },

  /* Nested Match Engine Card */
  matchEngineCard: {
    backgroundColor: "#F5EEFC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  engineHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  engineDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tinyPurpleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#731F94",
  },
  engineTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#131B2A",
  },
  calibrationPill: {
    backgroundColor: "#EBE0F7",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  calibrationPillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#731F94",
  },
  gaugePassCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  gaugeWrap: {
    position: "relative",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  gaugeCenterLabel: {
    position: "absolute",
    alignItems: "center",
  },
  gaugePercent: {
    fontSize: 14,
    fontWeight: "800",
    color: "#731F94",
  },
  gaugeMatchLabel: {
    fontSize: 8,
    color: "#7B6F84",
    fontWeight: "600",
  },
  passInfoCol: {
    flex: 1,
  },
  passTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  passTitleText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
  },
  passDescText: {
    fontSize: 10,
    color: "#556070",
    lineHeight: 14,
  },
  plainTermsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  plainTermsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  plainTermsTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#131B2A",
  },
  plainTermsBody: {
    fontSize: 10,
    color: "#556070",
    lineHeight: 15,
  },
  boldText: {
    fontWeight: "700",
    color: "#131B2A",
  },
  alignmentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  alignmentHeading: {
    fontSize: 9,
    fontWeight: "800",
    color: "#131B2A",
    letterSpacing: 0.3,
  },
  alignmentSub: {
    fontSize: 9,
    color: "#731F94",
    fontWeight: "600",
  },
  bridgeableSub: {
    fontSize: 9,
    color: "#7B6F84",
    fontWeight: "500",
  },
  skillPillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  verifiedSkillPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  verifiedSkillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#731F94",
  },
  gapCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  gapCardTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#131B2A",
  },
  gapCardDesc: {
    fontSize: 9,
    color: "#556070",
    lineHeight: 13,
    marginTop: 2,
  },
  perksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EFE5F7",
  },
  perkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  perkText: {
    fontSize: 9,
    color: "#556070",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#731F94",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* More Roles Calibrated */
  moreRolesHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  moreRolesTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#131B2A",
  },
  moreRolesSubtitle: {
    fontSize: 10,
    color: "#7B6F84",
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#731F94",
  },
  calibratedRoleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  roleCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  roleLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F5F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  roleInfoCol: {
    flex: 1,
  },
  roleName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#131B2A",
  },
  roleCompany: {
    fontSize: 10,
    color: "#7B6F84",
    marginTop: 2,
  },
  matchPillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5EEFC",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 3,
  },
  matchPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#731F94",
  },
  roleMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roleSalary: {
    fontSize: 11,
    fontWeight: "800",
    color: "#131B2A",
  },
  roleMetaTag: {
    fontSize: 10,
    color: "#556070",
    fontWeight: "600",
  },
  roleChipsRow: {
    flexDirection: "row",
    gap: 6,
  },
  roleChip: {
    backgroundColor: "#F5EEFC",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#731F94",
  },
});
