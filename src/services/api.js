import axios from "axios";

import {
  clearSession,
  getToken,
  notifyUnauthorized,
} from "./session";

export const BASE_URL =
  "https://skillbridge-api.tb-skillbridge-backend.workers.dev";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Public endpoints never need (or get logged out by) a token.
const PUBLIC_PATHS = ["/api/v1/auth/"];
const isPublic = (url = "") => PUBLIC_PATHS.some((p) => url.includes(p));

// ---- Request: attach Bearer token ----------------------------------------
api.interceptors.request.use(
  async (config) => {
    if (!isPublic(config.url)) {
      const token = await getToken();
      if (token) {
        // axios 1.x uses AxiosHeaders — .set() is the reliable way to write.
        if (config.headers && typeof config.headers.set === "function") {
          config.headers.set("Authorization", `Bearer ${token}`);
        } else {
          config.headers = {
            ...(config.headers || {}),
            Authorization: `Bearer ${token}`,
          };
        }
      } else if (__DEV__) {
        console.warn(`[api] No token stored — ${config.method?.toUpperCase()} ${config.url} will be rejected with 401`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---- Response: normalise errors, handle expired/invalid tokens -----------
let handlingUnauthorized = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    error.userMessage = getErrorMessage(error);

    if (status === 401 && !isPublic(url) && !handlingUnauthorized) {
      handlingUnauthorized = true;
      try {
        await clearSession();
        notifyUnauthorized();
      } finally {
        // Let other in-flight 401s settle before re-arming.
        setTimeout(() => {
          handlingUnauthorized = false;
        }, 1500);
      }
    }
    return Promise.reject(error);
  },
);

// Human-readable message from any axios / fetch error.
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;
  if (error.userMessage) return error.userMessage;
  const data = error.response?.data;
  if (typeof data === "string" && data.trim().startsWith("<")) {
    return "The server is having trouble right now. Please try again shortly.";
  }
  const msg =
    data?.message ||
    data?.error ||
    data?.detail ||
    (Array.isArray(data?.errors) ? data.errors.map((e) => e.message || e).join("\n") : null);
  if (msg) return String(msg);
  if (error.code === "ECONNABORTED") return "The request timed out. Check your connection and try again.";
  if (error.message === "Network Error") return "No internet connection. Please check your network.";
  return error.message || fallback;
}

// ---------------------------------------------------------------------------
// Multipart upload via fetch — React Native's fetch sets the multipart boundary
// itself, which is more reliable than axios for file uploads.
// ---------------------------------------------------------------------------
export async function uploadMultipart(path, formData, method = "POST") {
  const token = await getToken();
  if (!token) {
    const err = new Error("You're not signed in. Please log in again.");
    err.response = { status: 401 };
    err.userMessage = err.message;
    throw err;
  }

  // axios (not fetch) for multipart: RN's fetch + FormData throws a generic
  // "Network request failed" for some file URIs, even on a good connection.
  try {
    const res = await api.request({
      url: path,
      method,
      data: formData,
      timeout: 90000,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(d) => d],
    });
    return res;
  } catch (e) {
    const status = e?.response?.status;
    const serverMsg = e?.response?.data?.message;
    let message;
    if (status) {
      message = serverMsg || `Upload failed (${status}).`;
    } else if (e?.code === "ECONNABORTED") {
      message = "The upload timed out. Please try a smaller file or a better connection.";
    } else {
      // Include the underlying reason so we can see it if it persists.
      message = `Upload failed: ${e?.message || "unknown network error"}. Please check your connection and try again.`;
    }
    const err = new Error(message);
    err.response = e?.response;
    err.userMessage = message;
    if (status === 401) {
      await clearSession();
      notifyUnauthorized();
    }
    throw err;
  }
}

export default api;
