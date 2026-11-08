import { progressService, roadmapService, unwrap } from "./endpoints";
import { logError } from "./logger";
import { getAppState, updateAppState } from "./session";
import { invalidateSkillBridge, titleCase } from "./useSkillBridge";

// MaterialCommunityIcons name that fits a skill.
const SKILL_ICONS = [
  [/sql|database|postgres|mysql|mongo|redis/, "database-outline"],
  [/excel|sheet|spreadsheet|pivot/, "table-large"],
  [/python|java|javascript|typescript|node|react|code|program|c\+\+|go\b|rust|php/, "code-tags"],
  [/power ?bi|tableau|dashboard|visual|chart|looker/, "chart-pie"],
  [/financ|account|valuation|bank|econom/, "bank-outline"],
  [/data|analys|statistic|machine|ml|ai\b/, "chart-line"],
  [/design|ui|ux|figma/, "palette-outline"],
  [/cloud|aws|azure|gcp|docker|kubernetes|devops/, "cloud-outline"],
  [/communicat|present|writing|story|report/, "message-text-outline"],
  [/manage|lead|project|agile|scrum/, "account-group-outline"],
];

export function skillIcon(name = "") {
  const text = String(name).toLowerCase();
  const match = SKILL_ICONS.find(([pattern]) => pattern.test(text));
  return match ? match[1] : "star-four-points-outline";
}

// ---- Roadmaps ----------------------------------------------------------------
// Generate an AI roadmap from a skill gap. The server answers 503 until an AI
// provider is configured, so that case gets a friendly message.
export async function generateRoadmap(skillGapId) {
  if (!skillGapId) {
    const err = new Error(
      "Complete your skill-gap analysis first (upload your CV in profile setup).",
    );
    err.userMessage = err.message;
    throw err;
  }
  try {
    const roadmap = unwrap(await roadmapService.generate({ skillGapId }));
    if (roadmap?.id) await updateAppState({ roadmapId: roadmap.id });
    invalidateSkillBridge();
    return roadmap;
  } catch (err) {
    logError("skillActions", "generate roadmap", err);
    if (err?.response?.status === 503) {
      err.userMessage =
        "AI roadmap generation isn't switched on for the server yet. Your gaps have been saved to your plan instead.";
    }
    throw err;
  }
}

// Add a missing skill to the user's plan: a real roadmap task when a roadmap
// exists, otherwise a locally saved "planned skill".
export async function addSkillToRoadmap(skill, data) {
  const clean = String(skill).trim();
  const roadmapId = data?.activeRoadmap?.id;

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

// todo → in_progress → done → todo
const NEXT_TASK_STATUS = { todo: "in_progress", in_progress: "done", done: "todo" };

export async function cycleTaskStatus(roadmapId, task) {
  const next = NEXT_TASK_STATUS[task.status] || "in_progress";
  await roadmapService.updateTask(roadmapId, task.id, { status: next });
  invalidateSkillBridge();
  return next;
}

// ---- Learning progress -----------------------------------------------------------
// Start tracking a recommendation. 409 means it is already tracked — fine.
export async function startLearning(recommendationId) {
  try {
    await progressService.start({ recommendationId });
  } catch (err) {
    logError("skillActions", "start learning", err);
    if (err?.response?.status !== 409) throw err;
  }
  invalidateSkillBridge();
}

export async function setLearningProgress(progressId, percent) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  await progressService.update(progressId, {
    progressPercentage: value,
    status: value >= 100 ? "completed" : value > 0 ? "in_progress" : "not_started",
  });
  invalidateSkillBridge();
}
