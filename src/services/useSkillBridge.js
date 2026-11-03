import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  asList,
  cvService,
  matchingService,
  profileService,
  progressService,
  recommendationService,
  roadmapService,
  skillGapService,
  unwrap,
} from "./endpoints";
import { getAppState, getCachedUser } from "./session";

// ---------------------------------------------------------------------------
// Shared dashboard data. Every tab screen calls useSkillBridge(); data is
// fetched once, cached in memory, and refreshed when a tab regains focus
// (if older than STALE_MS) or when the user pulls to refresh.
// ---------------------------------------------------------------------------
const STALE_MS = 30 * 1000;

let cache = null; // { data, fetchedAt }
let inflight = null;
const listeners = new Set();

const byNewest = (a, b) =>
  new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();

const norm = (s) => String(s || "").trim().toLowerCase();

export const titleCase = (s) =>
  String(s || "")
    .split(/\s+/)
    .map((w) => (w.length <= 3 && w === w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

export const initials = (name) =>
  String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "SB";

// Turn the free-form analysisResult into something displayable.
function readAnalysis(gap) {
  const a = gap?.analysisResult || {};
  const score =
    a.matchScore ?? a.match_score ?? a.readinessScore ?? a.readiness ?? a.score ?? null;
  return {
    summary: a.summary || a.overview || a.feedback || null,
    score: typeof score === "number" ? Math.round(score <= 1 ? score * 100 : score) : null,
    strengths: Array.isArray(a.strengths) ? a.strengths : [],
    recommendations: Array.isArray(a.recommendations) ? a.recommendations : [],
  };
}

async function fetchAll() {
  const [profileR, gapsR, matchesR, roadmapsR, progressR, recsR, cvsR] =
    await Promise.allSettled([
      profileService.getMyProfile(),
      skillGapService.getAll(),
      matchingService.getSaved(),
      roadmapService.list(),
      progressService.list(),
      recommendationService.getPersonalized(),
      cvService.getMyCVs(),
    ]);

  const ok = (r) => r.status === "fulfilled";
  const errors = [profileR, gapsR, matchesR, roadmapsR, progressR, recsR, cvsR]
    .filter((r) => !ok(r))
    .map((r) => r.reason);

  const me = ok(profileR) ? unwrap(profileR.value) : await getCachedUser();
  const profile = me?.profile || null;
  const skillGaps = ok(gapsR) ? asList(gapsR.value).sort(byNewest) : [];
  const matches = ok(matchesR)
    ? asList(matchesR.value).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0))
    : [];
  const roadmaps = ok(roadmapsR) ? asList(roadmapsR.value).sort(byNewest) : [];
  const progress = ok(progressR) ? asList(progressR.value) : [];
  let recommendations = ok(recsR) ? asList(recsR.value) : [];
  const cvs = ok(cvsR) ? asList(cvsR.value).sort(byNewest) : [];

  // Personalized can be empty for new users → fall back to the public list.
  if (recommendations.length === 0) {
    try {
      recommendations = asList(await recommendationService.list());
    } catch (e) {
      // Public list currently 500s on the server — fine, show empty state.
    }
  }

  // Load tasks for the most relevant roadmap.
  const appState = await getAppState();
  const activeRoadmapMeta =
    roadmaps.find((r) => r.id === appState.roadmapId) ||
    roadmaps.find((r) => r.status === "active") ||
    roadmaps[0] ||
    null;
  let activeRoadmap = activeRoadmapMeta;
  if (activeRoadmapMeta?.id) {
    try {
      activeRoadmap = unwrap(await roadmapService.getById(activeRoadmapMeta.id));
    } catch (e) {
      // keep meta only
    }
  }

  // Prefer the skill gap we created during onboarding, else the newest.
  const latestGap =
    skillGaps.find((g) => g.id === appState.skillGapId) ||
    skillGaps.find((g) => g.status === "completed") ||
    skillGaps[0] ||
    null;

  return {
    me,
    profile,
    skillGaps,
    latestGap,
    matches,
    roadmaps,
    activeRoadmap,
    progress,
    recommendations,
    cvs,
    appState,
    errors,
  };
}

// ---- Derived values used across screens ----------------------------------
export function deriveStats(data) {
  const gap = data?.latestGap;
  const current = Array.isArray(gap?.currentSkills) ? gap.currentSkills : [];
  const required = Array.isArray(gap?.requiredSkills) ? gap.requiredSkills : [];
  let missing = Array.isArray(gap?.missingSkills) ? gap.missingSkills : null;
  const currentSet = new Set(current.map(norm));
  if (!missing) missing = required.filter((s) => !currentSet.has(norm(s)));
  const matched = required.filter((s) => currentSet.has(norm(s)));

  const analysis = readAnalysis(gap);
  const readiness =
    analysis.score ??
    (required.length ? Math.round((matched.length / required.length) * 100) : current.length ? 50 : 0);

  // Roadmap tasks
  const tbp = data?.activeRoadmap?.tasksByPhase || {};
  const tasks = [...(tbp["30"] || []), ...(tbp["60"] || []), ...(tbp["90"] || [])];
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  const completedProgress = (data?.progress || []).filter((p) => p.status === "completed").length;
  const inProgress = (data?.progress || []).filter((p) => p.status === "in_progress");

  const startDate = data?.activeRoadmap?.startDate || data?.activeRoadmap?.createdAt;
  const dayNumber = startDate
    ? Math.max(1, Math.min(90, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000) + 1))
    : 1;

  const fullName = data?.me?.fullName || "";
  return {
    fullName,
    firstName: fullName.split(" ")[0] || "there",
    targetRole: titleCase(
      gap?.targetJobTitle || data?.profile?.careerGoal || data?.appState?.targetRole || "",
    ),
    location: data?.profile?.location || "",
    currentSkills: current,
    requiredSkills: required,
    missingSkills: missing,
    matchedSkills: matched,
    readiness: Math.max(0, Math.min(100, readiness)),
    summary: analysis.summary,
    strengths: analysis.strengths,
    tasks,
    doneTasks,
    taskPct: tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0,
    completedProgress,
    inProgress,
    dayNumber,
    hasCV: (data?.cvs || []).length > 0,
    hasGap: !!gap,
    hasRoadmap: !!data?.activeRoadmap,
    topMatch: data?.matches?.[0] || null,
  };
}

export async function loadSkillBridge(force = false) {
  if (!force && cache && Date.now() - cache.fetchedAt < STALE_MS) return cache.data;
  if (inflight) return inflight;
  inflight = fetchAll()
    .then((data) => {
      cache = { data, fetchedAt: Date.now() };
      listeners.forEach((l) => l(data));
      return data;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function invalidateSkillBridge() {
  cache = null;
}

export function useSkillBridge() {
  const [data, setData] = useState(cache?.data || null);
  const [loading, setLoading] = useState(!cache);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const l = (d) => mounted.current && setData(d);
    listeners.add(l);
    return () => {
      mounted.current = false;
      listeners.delete(l);
    };
  }, []);

  const load = useCallback(async (force = false) => {
    try {
      setError(null);
      const d = await loadSkillBridge(force);
      if (mounted.current) setData(d);
    } catch (e) {
      if (mounted.current) setError(e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load]),
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    if (mounted.current) setRefreshing(false);
  }, [load]);

  const stats = deriveStats(data);
  return { data, stats, loading, refreshing, refresh, reload: () => load(true), error };
}
