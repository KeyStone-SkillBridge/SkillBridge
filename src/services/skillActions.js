import { progressService, roadmapService, unwrap } from "./endpoints";
import { getAppState, updateAppState } from "./session";
import { invalidateSkillBridge, titleCase } from "./useSkillBridge";

// Pick an icon (MaterialCommunityIcons names) that fits a skill name.
export function skillIcon(name = "") {
  const n = name.toLowerCase();
  if (/sql|database|postgres|mysql|mongo|redis/.test(n)) return "database-outline";
  if (/excel|sheet|spreadsheet|pivot/.test(n)) return "table-large";
  if (/python|java|javascript|typescript|node|react|code|program|c\+\+|go\b|rust|php/.test(n)) return "code-tags";
  if (/power ?bi|tableau|dashboard|visual|chart|looker/.test(n)) return "chart-pie";
  if (/financ|account|valuation|bank|econom/.test(n)) return "bank-outline";
  if (/data|analys|statistic|machine|ml|ai\b/.test(n)) return "chart-line";
  if (/design|ui|ux|figma/.test(n)) return "palette-outline";
  if (/cloud|aws|azure|gcp|docker|kubernetes|devops/.test(n)) return "cloud-outline";
  if (/communicat|present|writing|story|report/.test(n)) return "message-text-outline";
  if (/manage|lead|project|agile|scrum/.test(n)) return "account-group-outline";
  return "star-four-points-outline";
}

// Generate an AI roadmap from the latest skill gap. Returns the roadmap or
// throws with a friendly message (backend returns 503 until AI is configured).
export async function generateRoadmap(skillGapId) {
  if (!skillGapId) {
    const e = new Error("Complete your skill-gap analysis first (upload your CV in profile setup).");
    e.userMessage = e.message;
    throw e;
  }
  try {
    const roadmap = unwrap(await roadmapService.generate({ skillGapId }));
    if (roadmap?.id) await updateAppState({ roadmapId: roadmap.id });
    invalidateSkillBridge();
    return roadmap;
  } catch (err) {
    if (err?.response?.status === 503) {
      err.userMessage =
        "AI roadmap generation isn't switched on for the server yet. Your gaps have been saved to your plan instead.";
    }
    throw err;
  }
}

// Add a missing skill to the user's plan: a real roadmap task when a roadmap
// exists, otherwise a locally-saved "planned skill".
export async function addSkillToRoadmap(skill, data) {
  const roadmapId = data?.activeRoadmap?.id;
  const clean = String(skill).trim();
  if (roadmapId) {
    await roadmapService.createTask(roadmapId, {
      phase: 30,
      title: `Learn ${titleCase(clean)}`.slice(0, 200),
      description: `Close the ${clean} gap for your target role.`,
      taskType: "learn",
      skill: clean.toLowerCase().slice(0, 100),
      status: "todo",
    });
    invalidateSkillBridge();
    return { savedTo: "roadmap" };
  }
  const state = await getAppState();
  const planned = new Set(state.plannedSkills || []);
  planned.add(clean.toLowerCase());
  await updateAppState({ plannedSkills: [...planned] });
  invalidateSkillBridge();
  return { savedTo: "local" };
}

// Toggle a roadmap task between todo → in_progress → done.
export async function cycleTaskStatus(roadmapId, task) {
  const next = task.status === "done" ? "todo" : task.status === "in_progress" ? "done" : "in_progress";
  await roadmapService.updateTask(roadmapId, task.id, { status: next });
  invalidateSkillBridge();
  return next;
}

// Start tracking a learning recommendation (409 = already tracking → fine).
export async function startLearning(recommendationId) {
  try {
    await progressService.start({ recommendationId: Number(recommendationId) });
  } catch (err) {
    if (err?.response?.status !== 409) throw err;
  }
  invalidateSkillBridge();
}

export async function setLearningProgress(progressId, pct) {
  const value = Math.max(0, Math.min(100, Math.round(pct)));
  await progressService.update(progressId, {
    progressPercentage: value,
    status: value >= 100 ? "completed" : value > 0 ? "in_progress" : "not_started",
  });
  invalidateSkillBridge();
}
