import axios from "axios";

import { classifyFailure, reportConnectivityProblem } from "./connectivity";
import { log, logError, warn } from "./logger";
import { clearSession, getToken, notifyUnauthorized } from "./session";

export const BASE_URL = "https://skillbridge-api.tb-skillbridge-backend.workers.dev";

// ---- Tunables ---------------------------------------------------------------
const REQUEST_TIMEOUT_MS = 15000;
const UPLOAD_TIMEOUT_MS = 90000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
// The server has been measured crashing on ordinary read routes about half the
// time (Cloudflare error 1101, answered in ~250ms) and succeeding on the next
// call, so reads get more, and quicker, retries after a server error.
const SERVER_ERROR_RETRIES = 3;
const SERVER_ERROR_RETRY_DELAY_MS = 400;
// An attempt that took this long without an answer counts as a hang (React
// Native reports those as a plain "Network Error"). A hang is not retried.
const HANG_MS = 8000;

// Auth routes are public: they need no token and a 401 from them (wrong
// password) must never log the user out.
const PUBLIC_PATHS = ["/api/v1/auth/"];
const isPublic = (url = "") => PUBLIC_PATHS.some((path) => url.includes(path));

// Writes that are safe to repeat. Only login qualifies. Everything else is
// never retried automatically:
//   - register, uploads and other writes could create duplicates;
//   - verify-email / verify-reset-code use up a one-time code (and count
//     against an attempt limit), so a repeat can fail after the first attempt
//     actually succeeded;
//   - forgot-password would send the user several emails.
const RETRYABLE_WRITE_PATHS = ["/api/v1/auth/login"];

const api = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ---- Small helpers ---------------------------------------------------------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const describe = (config) => `${(config?.method || "get").toUpperCase()} ${config?.url || ""}`;
const waitedMs = (config) => (config?.__startedAt ? Date.now() - config.__startedAt : 0);

function parseBody(data) {
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data);
  } catch (_e) {
    return data;
  }
}

function setAuthorization(config, token) {
  // axios 1.x uses AxiosHeaders — .set() is the reliable way to write.
  if (config.headers && typeof config.headers.set === "function") {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
}

const isServerFailure = (error) => [500, 502, 503, 504].includes(error?.response?.status);

function canRetry(error) {
  const config = error?.config;
  const limit = isServerFailure(error) ? SERVER_ERROR_RETRIES : MAX_RETRIES;
  if (!config || (config.__retryCount || 0) >= limit) return false;

  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";
  const isRead = method === "get" || method === "head";
  const isRetryableWrite = RETRYABLE_WRITE_PATHS.some((path) => url.includes(path));
  if (!isRead && !isRetryableWrite) return false;

  // No response at all.
  if (!error.response) {
    const hung = error.code === "ECONNABORTED" || waitedMs(config) >= HANG_MS;
    // A quick failure is worth retrying. A hang costs a full timeout, so only
    // reads (safe to repeat) get one more try; everything else fails at once.
    if (!hung) return true;
    return isRead && (config.__retryCount || 0) < 1;
  }
  // The server itself has been seen to fail intermittently (500 / 502 / 503 /
  // 504) on routes that work moments later, so reads are retried.
  return isRead && [500, 502, 503, 504].includes(error.response.status);
}

// Human-readable message from any axios error.
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;
  if (error.userMessage) return error.userMessage;

  const data = error.response?.data;
  if (typeof data === "string" && data.trim().startsWith("<")) {
    return "The server is having trouble right now. Please try again shortly.";
  }
  const message =
    data?.message ||
    data?.error ||
    data?.detail ||
    (Array.isArray(data?.errors) ? data.errors.map((e) => e.message || e).join("\n") : null);
  if (message) return String(message);

  if (error.code === "ECONNABORTED") {
    return "The request timed out. Check your connection and try again.";
  }
  if (error.message === "Network Error") {
    return "No internet connection. Please check your network.";
  }
  return error.message || fallback;
}

// ---- Request: attach the Bearer token ----------------------------------------
api.interceptors.request.use(
  async (config) => {
    config.__startedAt = Date.now();

    if (!isPublic(config.url)) {
      const token = await getToken();
      if (token) {
        setAuthorization(config, token);
        config.__token = token; // remembered so a 401 can be matched to it
      } else {
        warn("api", `No token stored — ${describe(config)} will be rejected with 401`);
      }
    }

    log("api", `→ ${describe(config)}${config.__retryCount ? ` (retry ${config.__retryCount})` : ""}`, {
      authenticated: !!config.headers?.Authorization,
      params: config.params,
      body: parseBody(config.data),
    });
    return config;
  },
  (error) => {
    logError("api", "request setup", error);
    return Promise.reject(error);
  },
);

// ---- Response: log, retry, explain, and handle rejected tokens ----------------
let handlingUnauthorized = false;

// The server rejected the token we sent. Clear the session and send the user
// to login — unless a newer token has been saved since (a slow request from a
// previous account must not wipe a fresh login).
async function handleRejectedToken(config) {
  if (handlingUnauthorized) return;
  const current = await getToken();
  if (config?.__token && current && config.__token !== current) {
    warn("api", `Ignoring 401 on ${config.url} — it was sent with an older token`);
    return;
  }
  warn("api", `401 on ${config?.url} — clearing session and sending the user to login`);
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

api.interceptors.response.use(
  (response) => {
    log("api", `← ${response.status} ${describe(response.config)} (${waitedMs(response.config)}ms)`, {
      body: response.data,
    });
    return response;
  },
  async (error) => {
    const config = error?.config;
    const status = error?.response?.status;

    log("api", `✗ ${status || error?.code || "no response"} ${describe(config)} (${waitedMs(config)}ms)`, {
      message: error?.message,
      body: error?.response?.data,
    });

    if (canRetry(error)) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      const delay =
        (isServerFailure(error) ? SERVER_ERROR_RETRY_DELAY_MS : RETRY_DELAY_MS) * config.__retryCount;
      const limit = isServerFailure(error) ? SERVER_ERROR_RETRIES : MAX_RETRIES;
      warn("api", `Retrying ${describe(config)} in ${delay}ms (attempt ${config.__retryCount}/${limit})`);
      await sleep(delay);
      return api.request(config);
    }

    // React Native reports a timed-out connection as a plain "Network Error",
    // which reads as "you're offline". Say what actually happened.
    if (!error.response && waitedMs(config) >= HANG_MS) {
      error.userMessage =
        "Couldn't reach the server (the connection timed out). Check your network and try again.";
    } else {
      error.userMessage = getErrorMessage(error);
    }

    if (status === 401 && !isPublic(config?.url)) {
      await handleRejectedToken(config);
    }

    // Reads run in the background (dashboard, lists), so nothing else would
    // tell the user why data is missing. Writes show their own alert from the
    // screen that started them.
    if ((config?.method || "get").toLowerCase() === "get") {
      reportConnectivityProblem(classifyFailure(error));
    }
    return Promise.reject(error);
  },
);

// ---- Multipart upload ---------------------------------------------------------
// axios (not fetch) for multipart: React Native's fetch throws a generic
// "Network request failed" for some file URIs even on a good connection.
// Uploads are never retried.
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

  try {
    return await api.request({
      url: path,
      method,
      data: formData,
      timeout: UPLOAD_TIMEOUT_MS,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(body) => body],
    });
  } catch (e) {
    logError("upload", `${method} ${path}`, e);
    const status = e?.response?.status;

    let message;
    if (status) {
      message = e.response?.data?.message || `Upload failed (${status}).`;
    } else if (e?.code === "ECONNABORTED") {
      message = "The upload timed out. Please try a smaller file or a better connection.";
    } else {
      message = `Upload failed: ${e?.message || "unknown network error"}. Please check your connection and try again.`;
    }

    // The response interceptor has already handled a 401 (cleared the session
    // and redirected); here we only reshape the message for the caller.
    const err = new Error(message);
    err.response = e?.response;
    err.userMessage = message;
    throw err;
  }
}

export default api;
