import api from "./api";

// ================= AUTHENTICATION =================
export const authService = {
  register: (userData) => api.post("/api/v1/auth/register", userData),
  login: (credentials) => api.post("/api/v1/auth/login", credentials),
  forgotPassword: (data) => api.post("/api/v1/auth/forgot-password", data),
  verifyResetCode: (data) => api.post("/api/v1/auth/verify-reset-code", data),
  resetPassword: (data) => api.post("/api/v1/auth/reset-password", data),
};

// ================= USER & PROFILES =================
export const profileService = {
  getMyProfile: () => api.get("/api/v1/profiles/me"),
  updateMyProfile: (data) => api.put("/api/v1/profiles/me", data),
  getCurrentUser: () => api.get("/api/v1/users/current"),
  deleteUserAccount: () => api.delete("/api/v1/users/me"),
};

// ================= SKILL GAPS & SKILLS =================
export const skillGapService = {
  getAllGaps: () => api.get("/api/v1/skill-gaps"),
  createGapAnalysis: (data) => api.post("/api/v1/skill-gaps", data),
  getMySkills: () => api.get("/api/v1/skills/me"),
  addSkillToProfile: (data) => api.post("/api/v1/skills/me", data),
  removeSkill: (skillId) => api.delete(`/api/v1/skills/me/${skillId}`),
};

// ================= CAREER ROADMAP =================
export const roadmapService = {
  generateRoadmap: (data) => api.post("/api/v1/roadmaps/generate", data),
  getMyRoadmaps: () => api.get("/api/v1/roadmaps"),
  getRoadmapById: (id) => api.get(`/api/v1/roadmaps/${id}`),
  updateTask: (roadmapId, taskId, data) =>
    api.patch(`/api/v1/roadmaps/${roadmapId}/tasks/${taskId}`, data),
};

// ================= OPPORTUNITIES & MATCHING =================
export const opportunityService = {
  getOpportunities: (params) => api.get("/api/v1/opportunities", { params }),
  getSavedMatches: () => api.get("/api/v1/matching"),
  generateMatches: (data) => api.post("/api/v1/matching/generate", data),
};

// ================= PROGRESS & TELEMETRY =================
export const progressService = {
  getMyProgress: () => api.get("/api/v1/progress"),
  updateProgress: (id, data) => api.patch(`/api/v1/progress/${id}`, data),
};

// ================= CV MANAGEMENT =================
export const cvService = {
  uploadCV: (formData) =>
    api.post("/api/v1/cvs/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMyCVs: () => api.get("/api/v1/cvs/my-cvs"),
  analyzeCV: (cvId) => api.post(`/api/v1/cvs/${cvId}/analyze`),
  getLatestAnalysis: (cvId) => api.get(`/api/v1/cvs/${cvId}/analysis`),
  downloadCV: (cvId) =>
    api.get(`/api/v1/cvs/${cvId}/download`, { responseType: "blob" }),
};
