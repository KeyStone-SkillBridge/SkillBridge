import api, { uploadMultipart } from "./api";
import { log } from "./logger";
import { extractToken, extractUser, saveSession } from "./session";

// ===========================================================================
// SkillBridge API — every route below is taken from the server's OpenAPI spec
// (GET /api-docs.json). All routes live under /api/v1 and answer with
//   { success, message, data }
// Exceptions: recommendations → { success, count, data[] };
//             roadmaps / opportunities → data.items[] (opportunities also
//             carry data.pagination).
//
// Most request bodies reject unknown keys, so every write goes through
// `pick()` with the exact field list from the spec.
// ===========================================================================

// Keep only the allowed keys, dropping undefined values.
const pick = (source, keys) => {
  const out = {};
  if (!source) return out;
  for (const key of keys) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return out;
};

// ---- Response helpers ------------------------------------------------------
// The payload of an axios response: body.data when present, else the body.
export const unwrap = (res) => {
  const body = res?.data;
  if (body && typeof body === "object" && "data" in body) return body.data;
  return body;
};

// Any list-shaped response → a plain array.
export const asList = (res) => {
  const body = res?.data;
  if (body && typeof body === "object" && Array.isArray(body.data)) return body.data;
  const payload = unwrap(res);
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    for (const key of ["items", "results", "rows", "matches", "roadmaps", "opportunities"]) {
      if (Array.isArray(payload[key])) return payload[key];
    }
  }
  return [];
};

// ===========================================================================
// AUTH — public routes. Only login returns a JWT (valid 7 days).
// ===========================================================================
export const authService = {
  // Body: { fullName, email, password }. Returns the user, NO token.
  register: (data) =>
    api.post("/api/v1/auth/register", pick(data, ["fullName", "email", "password"])),

  // Returns { user, token }.
  login: (data) => api.post("/api/v1/auth/login", pick(data, ["email", "password"])),

  // Body: { email, code }. The spec documents no response body (no token).
  verifyEmail: (data) =>
    api.post("/api/v1/auth/verify-email", pick(data, ["email", "code"])),

  forgotPassword: (data) =>
    api.post("/api/v1/auth/forgot-password", pick(data, ["email"])),

  verifyResetCode: (data) =>
    api.post("/api/v1/auth/verify-reset-code", pick(data, ["email", "code"])),

  resetPassword: (data) =>
    api.post(
      "/api/v1/auth/reset-password",
      pick(data, ["email", "code", "newPassword"]),
    ),

  // Log in and persist the session. Returns the user.
  loginAndStore: async ({ email, password }) => {
    const res = await authService.login({ email, password });
    const token = extractToken(res?.data);
    if (!token) {
      const err = new Error("Login succeeded but no token was returned by the server.");
      err.userMessage = err.message;
      throw err;
    }
    const user = extractUser(res?.data);
    await saveSession(token, user);
    log("auth", "Logged in and session stored");
    return user;
  },
};

// ===========================================================================
// USERS — /api/v1/users
// ===========================================================================
export const userService = {
  getMe: () => api.get("/api/v1/users/me"),
  updateMe: (data) => api.put("/api/v1/users/me", pick(data, ["fullName", "email"])),
  deleteMe: () => api.delete("/api/v1/users/me"),
  getCurrentUser: () => api.get("/api/v1/users/current"),
  getAdminDashboard: () => api.get("/api/v1/users/admin"), // admin role only
};

// ===========================================================================
// PROFILES — /api/v1/profiles/me (GET returns the user with a nested `profile`)
// ===========================================================================
const PROFILE_FIELDS = [
  "bio",
  "phone",
  "location",
  "profileImage",
  "education",
  "experience",
  "careerGoal",
];

export const profileService = {
  getMyProfile: () => api.get("/api/v1/profiles/me"),
  updateMyProfile: (data) => api.put("/api/v1/profiles/me", pick(data, PROFILE_FIELDS)),
};

// ===========================================================================
// CVS — /api/v1/cvs. Uploads are multipart with a single field named "cv".
// A CV is { id, userId, fileName, fileType, fileSize, createdAt, updatedAt }.
// ===========================================================================
export const buildCvFormData = (asset) => {
  const formData = new FormData();
  formData.append("cv", {
    uri: asset.uri,
    name: asset.name || "my-cv.pdf",
    type: asset.mimeType || "application/pdf",
  });
  return formData;
};

export const cvService = {
  uploadCV: (formData) => uploadMultipart("/api/v1/cvs/upload", formData, "POST"),
  updateCV: (cvId, formData) => uploadMultipart(`/api/v1/cvs/${cvId}`, formData, "PUT"),
  getMyCVs: () => api.get("/api/v1/cvs/my-cvs"),
  deleteCV: (cvId) => api.delete(`/api/v1/cvs/${cvId}`),
  downloadCV: (cvId) => api.get(`/api/v1/cvs/${cvId}/download`, { responseType: "blob" }),

  // Body: { careerStage*, primaryGoal*, targetJobTitle?, industryFocus? }
  //   careerStage: Student | Entry | Mid | Senior | Pivot
  //   primaryGoal: CV Review | Gap Analysis | Roadmap (only Gap Analysis works)
  // The AI call is slow, so it gets a long timeout. 501/502 = analysis service
  // unavailable.
  analyzeCV: (cvId, data) =>
    api.post(
      `/api/v1/cvs/${cvId}/analyze`,
      pick(data, ["targetJobTitle", "industryFocus", "careerStage", "primaryGoal"]),
      { timeout: 120000 },
    ),
  getLatestAnalysis: (cvId) => api.get(`/api/v1/cvs/${cvId}/analysis`),
  getAnalysisHistory: (cvId) => api.get(`/api/v1/cvs/${cvId}/analyses`),
};

// ===========================================================================
// SKILL GAPS — /api/v1/skill-gaps
// ===========================================================================
const SKILL_GAP_FIELDS = ["cvId", "targetJobTitle", "currentSkills", "requiredSkills"];

export const skillGapService = {
  create: (data) => api.post("/api/v1/skill-gaps", pick(data, SKILL_GAP_FIELDS)),
  getAll: () => api.get("/api/v1/skill-gaps"),
  getById: (id) => api.get(`/api/v1/skill-gaps/${id}`),
  update: (id, data) => api.patch(`/api/v1/skill-gaps/${id}`, pick(data, SKILL_GAP_FIELDS)),
  delete: (id) => api.delete(`/api/v1/skill-gaps/${id}`),
};

// ===========================================================================
// SKILLS — /api/v1/skills. The catalogue list is public; creating, editing and
// deactivating catalogue skills is admin only. /skills/me is the user's own.
// ===========================================================================
export const skillsService = {
  getCatalogue: () => api.get("/api/v1/skills"),
  createCatalogueSkill: (data) =>
    api.post("/api/v1/skills", pick(data, ["name", "description", "category"])),
  updateCatalogueSkill: (id, data) =>
    api.patch(
      `/api/v1/skills/${id}`,
      pick(data, ["name", "description", "category", "isActive"]),
    ),
  deactivateCatalogueSkill: (id) => api.delete(`/api/v1/skills/${id}`),

  getMySkills: () => api.get("/api/v1/skills/me"),
  addSkillToMe: (data) =>
    api.post("/api/v1/skills/me", pick(data, ["skillId", "proficiencyLevel"])),
  updateMySkill: (skillId, data) =>
    api.patch(`/api/v1/skills/me/${skillId}`, pick(data, ["proficiencyLevel"])),
  removeMySkill: (skillId) => api.delete(`/api/v1/skills/me/${skillId}`),
};

// ===========================================================================
// ROADMAPS — /api/v1/roadmaps. list → data.items[]; get → roadmap with
// tasksByPhase { "30": [], "60": [], "90": [] }. generate answers 503 until an
// AI provider is configured on the server.
// ===========================================================================
const TASK_FIELDS = [
  "phase",
  "position",
  "title",
  "description",
  "taskType",
  "skill",
  "recommendationId",
  "resourceUrl",
  "estimatedHours",
  "dueDate",
  "status",
];

export const roadmapService = {
  generate: (data) =>
    api.post("/api/v1/roadmaps/generate", pick(data, ["skillGapId"]), { timeout: 120000 }),
  list: () => api.get("/api/v1/roadmaps"),
  getById: (id) => api.get(`/api/v1/roadmaps/${id}`),
  update: (id, data) =>
    api.patch(
      `/api/v1/roadmaps/${id}`,
      pick(data, ["title", "targetRole", "summary", "status", "startDate"]),
    ),
  delete: (id) => api.delete(`/api/v1/roadmaps/${id}`),

  // Task: phase 30|60|90, taskType learn|project|practice|apply,
  // status todo|in_progress|done.
  createTask: (id, data) => api.post(`/api/v1/roadmaps/${id}/tasks`, pick(data, TASK_FIELDS)),
  updateTask: (id, taskId, data) =>
    api.patch(`/api/v1/roadmaps/${id}/tasks/${taskId}`, pick(data, TASK_FIELDS)),
  deleteTask: (id, taskId) => api.delete(`/api/v1/roadmaps/${id}/tasks/${taskId}`),
};

// ===========================================================================
// RECOMMENDATIONS — /api/v1/recommendations. IDs are integers here.
// The list and `{id}` routes are public; `personalized` needs a token.
// ===========================================================================
export const recommendationService = {
  list: (params) =>
    api.get("/api/v1/recommendations", {
      params: pick(params, ["type", "skillId", "difficulty"]),
    }),
  getPersonalized: () => api.get("/api/v1/recommendations/personalized"),
  getById: (id) => api.get(`/api/v1/recommendations/${id}`),
};

// ===========================================================================
// PROGRESS — /api/v1/progress. recommendationId is an integer.
// status: not_started | in_progress | completed. 409 = already tracking.
// ===========================================================================
export const progressService = {
  start: (data) =>
    api.post("/api/v1/progress", {
      recommendationId: Number(data?.recommendationId),
    }),
  list: (params) => api.get("/api/v1/progress", { params: pick(params, ["status"]) }),
  getById: (id) => api.get(`/api/v1/progress/${id}`),
  update: (id, data) =>
    api.patch(`/api/v1/progress/${id}`, pick(data, ["status", "progressPercentage"])),
  delete: (id) => api.delete(`/api/v1/progress/${id}`),
};

// ===========================================================================
// OPPORTUNITIES — /api/v1/opportunities. list → data.items[] + data.pagination.
// create / update / delete / aggregate are admin only.
// ===========================================================================
const OPPORTUNITY_FIELDS = [
  "title",
  "company",
  "description",
  "type",
  "category",
  "location",
  "workMode",
  "applicationUrl",
  "deadline",
  "requiredSkills",
  "preferredSkills",
];

export const opportunityService = {
  list: (params) =>
    api.get("/api/v1/opportunities", {
      params: pick(params, [
        "page",
        "limit",
        "q",
        "type",
        "category",
        "location",
        "workMode",
        "skill",
        "status",
      ]),
    }),
  getById: (id) => api.get(`/api/v1/opportunities/${id}`),
  create: (data) => api.post("/api/v1/opportunities", pick(data, OPPORTUNITY_FIELDS)),
  update: (id, data) =>
    api.patch(`/api/v1/opportunities/${id}`, pick(data, [...OPPORTUNITY_FIELDS, "status"])),
  delete: (id) => api.delete(`/api/v1/opportunities/${id}`),
  aggregate: () => api.post("/api/v1/opportunities/aggregate"),
};

// ===========================================================================
// CAREER MATCHING — /api/v1/matching. generate answers 400 until the user has
// a completed skill gap with currentSkills.
// ===========================================================================
export const matchingService = {
  generate: () => api.post("/api/v1/matching/generate", null, { timeout: 60000 }),
  getSaved: () => api.get("/api/v1/matching"),
};

// ===========================================================================
// LEARNING — /api/v1/learning (courses and lessons)
// ===========================================================================
export const learningService = {
  getCourses: () => api.get("/api/v1/learning/courses"),
  getCourseById: (id) => api.get(`/api/v1/learning/courses/${id}`),
  enroll: (data) => api.post("/api/v1/learning/enrollments", pick(data, ["courseId"])),
  getMyCourses: () => api.get("/api/v1/learning/my-courses"),
  completeLesson: (lessonId) => api.patch(`/api/v1/learning/lessons/${lessonId}/complete`),
  getProgress: () => api.get("/api/v1/learning/progress"),
};

// ===========================================================================
// CERTIFICATIONS — /api/v1/certifications
// ===========================================================================
export const certificationService = {
  list: () => api.get("/api/v1/certifications"),
  issue: (data) => api.post("/api/v1/certifications/issue", pick(data, ["courseId"])),
  getMine: () => api.get("/api/v1/certifications/my-certificates"),
  verify: (code) => api.get(`/api/v1/certifications/verify/${code}`),
  getById: (id) => api.get(`/api/v1/certifications/${id}`),
};
