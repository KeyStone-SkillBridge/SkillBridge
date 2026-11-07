import axios from "axios";

import { log, logError, warn } from "./logger";
import { clearSession, getToken, notifyUnauthorized } from "./session";

export const BASE_URL =
  "https://skillbridge-api.tb-skillbridge-backend.workers.dev";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Public endpoints never need (or get logged out by) a token.
const PUBLIC_PATHS = ["/api/v1/auth/"];
const isPublic = (url = "") => PUBLIC_PATHS.some((p) => url.includes(p));

// ---- Retries ----------------------------------------------------------------
// Connection failures (no response at all) are common on a flaky first request
// (slow DNS / router), so retry them — but only for requests that are safe to
// repeat. Registration, uploads and other writes are never retried.
const MAX_RETRIES = 2;
const HANG_MS = 8000; // an attempt that took this long counts as a hang
const RETRY_DELAY_MS = 1000;
const SAFE_RETRY_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/verify-email",
  "/api/v1/auth/verify-reset-code",
  "/api/v1/auth/forgot-password",
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const canRetry = (error) => {
  const config = error?.config;
  if (!config || (config.__retryCount || 0) >= MAX_RETRIES) return false;
  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";
  const idempotent =
    method === "get" ||
    method === "head" ||
    SAFE_RETRY_PATHS.some((p) => url.includes(p));
  if (!idempotent) return false;
  // No response = the request never reached the server (or the reply never
  // came back). A timeout is not retried: it already waited the full 30s.
  if (!error.response) {
    // Only retry quick failures. If the attempt hung for most of the timeout,
    // another attempt will most likely hang too — fail fast instead of
    // making the user wait through several full timeouts.
    const waited = config.__startedAt ? Date.now() - config.__startedAt : 0;
    return error.code !== "ECONNABORTED" && waited < HANG_MS;
  }
  // Gateway-style failures on reads are usually transient.
  return method === "get" && [502, 503, 504].includes(error.response.status);
};

const label = (config) =>
  `${(config?.method || "get").toUpperCase()} ${config?.url || ""}`;
const elapsed = (config) =>
  config?.__startedAt ? `${Date.now() - config.__startedAt}ms` : "?ms";

// ---- Request: attach Bearer token ----------------------------------------
api.interceptors.request.use(
  async (config) => {
    config.__startedAt = Date.now();

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
      } else {
        warn(
          "api",
          `No token stored — ${label(config)} will be rejected with 401`,
        );
      }
    }

    log(
      "api",
      `→ ${label(config)}${config.__retryCount ? ` (retry ${config.__retryCount})` : ""}`,
      {
        authenticated: !!config.headers?.Authorization,
        params: config.params,
        body:
          typeof config.data === "string" ? safeParse(config.data) : config.data,
      },
    );
    return config;
  },
  (error) => {
    logError("api", "request setup", error);
    return Promise.reject(error);
  },
);

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch (_e) {
    return text;
  }
}

// ---- Response: log, retry, normalise errors, handle bad tokens -------------
let handlingUnauthorized = false;

api.interceptors.response.use(
  (response) => {
    log("api", `← ${response.status} ${label(response.config)} (${elapsed(response.config)})`, {
      body: response.data,
    });
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    log(
      "api",
      `✗ ${status || error?.code || "no response"} ${label(error?.config)} (${elapsed(error?.config)})`,
      {
        message: error?.message,
        body: error?.response?.data,
      },
    );

    if (canRetry(error)) {
      error.config.__retryCount = (error.config.__retryCount || 0) + 1;
      const wait = RETRY_DELAY_MS * error.config.__retryCount;
      warn(
        "api",
        `Retrying ${label(error.config)} in ${wait}ms (attempt ${error.config.__retryCount}/${MAX_RETRIES})`,
      );
      await sleep(wait);
      return api.request(error.config);
    }

    // React Native reports a timed-out connection as a plain "Network Error",
    // which reads as "you're offline". Say what actually happened.
    const waited = error?.config?.__startedAt
      ? Date.now() - error.config.__startedAt
      : 0;
    if (!error.response && waited >= HANG_MS) {
      error.userMessage =
        "Couldn't reach the server (the connection timed out). Check your network and try again.";
    } else {
      error.userMessage = getErrorMessage(error);
    }

    if (status === 401 && !isPublic(url) && !handlingUnauthorized) {
      warn("api", `401 on ${url} — clearing session and sending user to login`);
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
export function getErrorMessage(
  error,
  fallback = "Something went wrong. Please try again.",
) {
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
    (Array.isArray(data?.errors)
      ? data.errors.map((e) => e.message || e).join("\n")
      : null);
  if (msg) return String(msg);
  if (error.code === "ECONNABORTED")
    return "The request timed out. Check your connection and try again.";
  if (error.message === "Network Error")
    return "No internet connection. Please check your network.";
  return error.message || fallback;
}

// ---------------------------------------------------------------------------
// Multipart upload via fetch — React Native's fetch sets the multipart boundary
// itself, which is more reliable than axios for file uploads.
// ---------------------------------------------------------------------------
export async function uploadMultipart(path, formData, method = "POST") {
  const token = await getToken();
  if (!token) {
    warn("upload", `No token stored — blocking ${method} ${path}`);
    const err = new Error("You're not signed in. Please log in again.");
    err.response = { status: 401 };
    err.userMessage = err.message;
    // Callers return silently on 401 and rely on the root layout to redirect,
    // so trigger that here (the response interceptor never sees this case).
    notifyUnauthorized();
    throw err;
  }

  log("upload", `${method} ${path}`, {
    sendingAuthHeader: true,
    bearerLength: token.length,
    fields: (formData?._parts || []).map(([key, value]) => ({
      key,
      name: value?.name,
      type: value?.type,
      uriScheme: typeof value?.uri === "string" ? value.uri.split(":")[0] : undefined,
    })),
  });

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
    logError("upload", `${method} ${path}`, e);
    const status = e?.response?.status;
    const serverMsg = e?.response?.data?.message;
    let message;
    if (status) {
      message = serverMsg || `Upload failed (${status}).`;
    } else if (e?.code === "ECONNABORTED") {
      message =
        "The upload timed out. Please try a smaller file or a better connection.";
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
