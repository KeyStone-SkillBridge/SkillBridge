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
import { logError } from "./logger";
import { getAppState, getCachedUser } from "./session";

// ===========================================================================
// Shared dashboard data. Every tab screen calls useSkillBridge(); the data is
// fetched once, cached in memory, and refreshed when a screen regains focus
// (if older than STALE_MS) or when the user pulls to refresh.
// ===========================================================================
const STALE_MS = 30 * 1000;

let cache = null; // { data, fetchedAt }
let inflight = null; // { promise, generation }
let generation = 0; // bumps on invalidate, so late results from a previous
//                     session / account never land in the cache
const listeners = new Set();

// ---- Small formatting helpers ------------------------------------------------
const byNewest = (a, b) =>
  new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();

const normalize = (value) => String(value || "").trim().toLowerCase();

export const titleCase = (text) =>
  String(text || "")
    .split(/\s+/)
    .map((word) =>
      word.length <= 3 && word === word.toUpperCase()
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");

export const initials = (name) =>
  String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("") || "SB";

// The server's analysisResult is free-form; pull out what the screens show.
// The live AI answer looks like { profile_summary, current_level,
// identified_skills[], skill_gaps[], recommended_career_path: { target_role,
// match_percentage, action_plan[] } }; older/other shapes are still accepted.
function readAnalysis(gap) {
  const result = gap?.analysisResult || {};
  const path = result.recommended_career_path || {};
  const score =
    result.matchScore ??
    result.match_score ??
    result.readinessScore ??
    result.readiness ??
    result.score ??
    path.match_percentage ??
    path.matchPercentage ??
    null;
  return {
    summary:
      result.summary || result.profile_summary || result.overview || result.feedback || null,
    score: typeof score === "number" ? Math.round(score <= 1 ? score * 100 : score) : null,
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
  };
}

// ---- Fetching ------------------------------------------------------------------
async function fetchAll() {
  const results = await Promise.allSettled([
    profileService.getMyProfile(),
    skillGapService.getAll(),
    matchingService.getSaved(),
    roadmapService.list(),
    progressService.list(),
    recommendationService.getPersonalized(),
    cvService.getMyCVs(),
  ]);
  const [profileR, gapsR, matchesR, roadmapsR, progressR, recsR, cvsR] = results;

  const succeeded = (result) => result.status === "fulfilled";
  const errors = results.filter((r) => !succeeded(r)).map((r) => r.reason);
  results.forEach((r) => {
    if (!succeeded(r)) logError("useSkillBridge", "loading dashboard data", r.reason);
  });

  const me = succeeded(profileR) ? unwrap(profileR.value) : await getCachedUser();
  const profile = me?.profile || null;
  const skillGaps = succeeded(gapsR) ? asList(gapsR.value).sort(byNewest) : [];
  const matches = succeeded(matchesR)
    ? asList(matchesR.value).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0))
    : [];
  const roadmaps = succeeded(roadmapsR) ? asList(roadmapsR.value).sort(byNewest) : [];
  const progress = succeeded(progressR) ? asList(progressR.value) : [];
  const cvs = succeeded(cvsR) ? asList(cvsR.value).sort(byNewest) : [];
  let recommendations = succeeded(recsR) ? asList(recsR.value) : [];

  // Personalized recommendations are empty for new users → use the public list.
  if (recommendations.length === 0) {
    try {
      recommendations = asList(await recommendationService.list());
    } catch (e) {
      logError("useSkillBridge", "loading public recommendations", e);
    }
  }

  // Load the tasks of the most relevant roadmap.
  const appState = await getAppState();
  const roadmapMeta =
    roadmaps.find((r) => r.id === appState.roadmapId) ||
    roadmaps.find((r) => r.status === "active") ||
    roadmaps[0] ||
    null;
  let activeRoadmap = roadmapMeta;
  if (roadmapMeta?.id) {
    try {
      activeRoadmap = unwrap(await roadmapService.getById(roadmapMeta.id));
    } catch (e) {
      logError("useSkillBridge", "loading the active roadmap", e);
    }
  }

  // Prefer the skill gap created during onboarding, else the newest completed.
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

// ---- Derived values used across screens ------------------------------------------
export function deriveStats(data) {
  const gap = data?.latestGap;
  const current = Array.isArray(gap?.currentSkills) ? gap.currentSkills : [];
  const required = Array.isArray(gap?.requiredSkills) ? gap.requiredSkills : [];
  const currentSet = new Set(current.map(normalize));
  const missing = Array.isArray(gap?.missingSkills)
    ? gap.missingSkills
    : required.filter((skill) => !currentSet.has(normalize(skill)));
  const matched = required.filter((skill) => currentSet.has(normalize(skill)));

  const analysis = readAnalysis(gap);
  const readiness =
    analysis.score ??
    (required.length
      ? Math.round((matched.length / required.length) * 100)
      : current.length
        ? 50
        : 0);

  // Roadmap tasks, in phase order (the API groups them as "30" / "60" / "90").
  const byPhase = data?.activeRoadmap?.tasksByPhase || {};
  const tasks = [...(byPhase["30"] || []), ...(byPhase["60"] || []), ...(byPhase["90"] || [])];
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  const progress = data?.progress || [];
  const completedProgress = progress.filter((p) => p.status === "completed").length;
  const inProgress = progress.filter((p) => p.status === "in_progress");

  const startDate = data?.activeRoadmap?.startDate || data?.activeRoadmap?.createdAt;
  const dayNumber = startDate
    ? Math.max(
        1,
        Math.min(90, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000) + 1),
      )
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

// ---- Cache ----------------------------------------------------------------------
export async function loadSkillBridge(force = false) {
  if (!force && cache && Date.now() - cache.fetchedAt < STALE_MS) return cache.data;

  // Share a running fetch — but only if it started after the last invalidate,
  // otherwise it would hand back data from before the change we just made.
  if (inflight && inflight.generation === generation) return inflight.promise;

  const startedIn = generation;
  const promise = fetchAll()
    .then((data) => {
      if (startedIn === generation) {
        cache = { data, fetchedAt: Date.now() };
        listeners.forEach((listener) => listener(data));
      }
      return data;
    })
    .finally(() => {
      if (inflight?.promise === promise) inflight = null;
    });
  inflight = { promise, generation: startedIn };
  return promise;
}

export function invalidateSkillBridge() {
  cache = null;
  generation += 1;
}

// ---- Hook -----------------------------------------------------------------------
export function useSkillBridge() {
  const [data, setData] = useState(cache?.data || null);
  const [loading, setLoading] = useState(!cache);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const listener = (next) => {
      if (mounted.current) setData(next);
    };
    listeners.add(listener);
    return () => {
      mounted.current = false;
      listeners.delete(listener);
    };
  }, []);

  const load = useCallback(async (force = false) => {
    try {
      setError(null);
      const next = await loadSkillBridge(force);
      if (mounted.current) setData(next);
    } catch (e) {
      logError("useSkillBridge", "refresh data", e);
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

  const reload = useCallback(() => load(true), [load]);

  return { data, stats: deriveStats(data), loading, refreshing, refresh, reload, error };
}
