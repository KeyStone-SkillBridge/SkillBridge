import api, { uploadMultipart } from "./api";
import { extractToken, extractUser, saveSession } from "./session";

// ---------------------------------------------------------------------------
// Response helpers. The API wraps everything as { success, message, data }.
// Lists come back in a few different shapes — normalise them all here:
//   skill-gaps / cvs / progress / skills catalogue → data: [...]   (flat array)
//   roadmaps / opportunities                       → data: { items: [...] }
//   recommendations                                → { count, data: [...] }  (data is top-level sibling)
// ---------------------------------------------------------------------------
export const unwrap = (res) => {
  const body = res?.data;
  if (body && typeof body === "object" && "data" in body) return body.data;
  return body;
};

export const asList = (res) => {
  const body = res?.data;
  // Some endpoints (recommendations) put the array in body.data directly
  // alongside a top-level `count` field rather than nesting under data.data.
  if (body && typeof body === "object" && Array.isArray(body.data)) return body.data;
  const d = unwrap(res);
  if (Array.isArray(d)) return d;
  if (d && typeof d === "object") {
    for (const key of ["items", "results", "rows", "matches", "roadmaps", "opportunities"]) {
      if (Array.isArray(d[key])) return d[key];
    }
  }
  return [];
};

// ================= AUTHENTICATION =================
export const authService = {
  register: (userData) => api.post("/api/v1/auth/register", userData),
  login: (credentials) => api.post("/api/v1/auth/login", credentials),
  verifyEmail: (data) => api.post("/api/v1/auth/verify-email", data), // { email, code }
  forgotPassword: (data) => api.post("/api/v1/auth/forgot-password", data),
  verifyResetCode: (data) => api.post("/api/v1/auth/verify-reset-code", data),
  resetPassword: (data) => api.post("/api/v1/auth/reset-password", data),

  // Log in and persist the JWT. Returns the user object.
  // NOTE: /register does NOT return a token — always call this after register.
  loginAndStore: async ({ email, password }) => {
    const res = await api.post("/api/v1/auth/login", { email, password });
    const token = extractToken(res?.data);
    if (!token) {
      const err = new Error("Login succeeded but no token was returned by the server.");
      err.userMessage = err.message;
      throw err;
    }
    const user = extractUser(res?.data);
    await saveSession(token, user);
    return user;
  },
};

// ================= USER ACCOUNT (/api/v1/users/...) =================
export const userService = {
  getMe: () => api.get("/api/v1/users/me"),
  updateMe: (data) => api.put("/api/v1/users/me", data), // { fullName, email }
  deleteMe: () => api.delete("/api/v1/users/me"),
  getCurrentUser: () => api.get("/api/v1/users/current"),
  getAdminDashboard: () => api.get("/api/v1/users/admin"),
};

// ================= PROFILES (/api/v1/profiles/...) =================
// GET returns the user + nested `profile` (or null); PUT creates/updates.
export const profileService = {
  getMyProfile: () => api.get("/api/v1/profiles/me"),
  updateMyProfile: (data) => {
    // API rejects unknown keys and undefined values → strip them.
    const allowed = ["bio", "phone", "location", "profileImage", "education", "experience", "careerGoal"];
    const payload = {};
    allowed.forEach((k) => {
      if (data?.[k] !== undefined) payload[k] = data[k];
    });
    return api.put("/api/v1/profiles/me", payload);
  },
};

// ================= CV MANAGEMENT (/api/v1/cvs/...) =================
// Build the multipart body from an expo-document-picker asset.
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
  getMyCVs: () => api.get("/api/v1/cvs/my-cvs"),
  // AI analysis can be slow → give it longer than the default 30s.
  analyzeCV: (cvId, data) =>
    api.post(`/api/v1/cvs/${cvId}/analyze`, data, { timeout: 120000 }), // { targetJobTitle, industryFocus, careerStage, primaryGoal }
  getLatestAnalysis: (cvId) => api.get(`/api/v1/cvs/${cvId}/analysis`),
  getAnalysisHistory: (cvId) => api.get(`/api/v1/cvs/${cvId}/analyses`),
  updateCV: (cvId, formData) => uploadMultipart(`/api/v1/cvs/${cvId}`, formData, "PUT"),
  deleteCV: (cvId) => api.delete(`/api/v1/cvs/${cvId}`),
  downloadCV: (cvId) =>
    api.get(`/api/v1/cvs/${cvId}/download`, { responseType: "blob" }),
};

// ================= SKILL GAPS (/api/v1/skill-gaps/...) =================
export const skillGapService = {
  create: (data) => api.post("/api/v1/skill-gaps", data), // { cvId?, targetJobTitle, currentSkills, requiredSkills }
  getAll: () => api.get("/api/v1/skill-gaps"),
  getById: (skillGapId) => api.get(`/api/v1/skill-gaps/${skillGapId}`),
  update: (skillGapId, data) =>
    api.patch(`/api/v1/skill-gaps/${skillGapId}`, data),
  delete: (skillGapId) => api.delete(`/api/v1/skill-gaps/${skillGapId}`),
};

// ================= SKILLS CATALOGUE (/api/v1/skills/...) =================
export const skillsService = {
  getCatalogue: () => api.get("/api/v1/skills"), // data: { skills: [...] }
  createCatalogueSkill: (data) => api.post("/api/v1/skills", data),
  getMySkills: () => api.get("/api/v1/skills/me"),
  addSkillToMe: (data) => api.post("/api/v1/skills/me", data), // { skillId, proficiencyLevel }
  updateMySkill: (skillId, data) =>
    api.patch(`/api/v1/skills/me/${skillId}`, data), // { proficiencyLevel }
  removeMySkill: (skillId) => api.delete(`/api/v1/skills/me/${skillId}`),
  updateCatalogueSkill: (id, data) => api.patch(`/api/v1/skills/${id}`, data),
  deactivateCatalogueSkill: (id) => api.delete(`/api/v1/skills/${id}`),
};

// ================= ROADMAPS (/api/v1/roadmaps/...) =================
// list → data.items ; getById → roadmap + tasksByPhase { "30": [], "60": [], "90": [] }
export const roadmapService = {
  generate: (data) =>
    api.post("/api/v1/roadmaps/generate", data, { timeout: 120000 }), // { skillGapId } — 503 until AI provider configured
  list: () => api.get("/api/v1/roadmaps"),
  getById: (id) => api.get(`/api/v1/roadmaps/${id}`),
  update: (id, data) => api.patch(`/api/v1/roadmaps/${id}`, data),
  delete: (id) => api.delete(`/api/v1/roadmaps/${id}`),
  createTask: (id, data) => api.post(`/api/v1/roadmaps/${id}/tasks`, data),
  updateTask: (id, taskId, data) =>
    api.patch(`/api/v1/roadmaps/${id}/tasks/${taskId}`, data), // { status: todo|in_progress|done }
  deleteTask: (id, taskId) =>
    api.delete(`/api/v1/roadmaps/${id}/tasks/${taskId}`),
};

// ================= RECOMMENDATIONS (/api/v1/recommendations/...) =================
export const recommendationService = {
  list: (params) => api.get("/api/v1/recommendations", { params }), // { type, skillId, difficulty }
  getPersonalized: () => api.get("/api/v1/recommendations/personalized"),
  getById: (id) => api.get(`/api/v1/recommendations/${id}`),
};

// ================= PROGRESS TRACKING (/api/v1/progress/...) =================
export const progressService = {
  start: (data) => api.post("/api/v1/progress", data), // { recommendationId: integer }
  list: (params) => api.get("/api/v1/progress", { params }), // { status }
  getById: (id) => api.get(`/api/v1/progress/${id}`),
  update: (id, data) => api.patch(`/api/v1/progress/${id}`, data), // { status, progressPercentage }
  delete: (id) => api.delete(`/api/v1/progress/${id}`),
};

// ================= OPPORTUNITIES (/api/v1/opportunities/...) =================
export const opportunityService = {
  list: (params) => api.get("/api/v1/opportunities", { params }), // { page, limit, q, type, category, location, workMode, skill, status }
  getById: (id) => api.get(`/api/v1/opportunities/${id}`),
  create: (data) => api.post("/api/v1/opportunities", data),
  update: (id, data) => api.patch(`/api/v1/opportunities/${id}`, data),
  delete: (id) => api.delete(`/api/v1/opportunities/${id}`),
  aggregate: () => api.post("/api/v1/opportunities/aggregate"),
};

// ================= CAREER MATCHING (/api/v1/matching/...) =================
// generate → 400 if the user has no *completed* skill-gap with currentSkills.
export const matchingService = {
  generate: () => api.post("/api/v1/matching/generate", null, { timeout: 60000 }),
  getSaved: () => api.get("/api/v1/matching"),
};
