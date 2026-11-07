import AsyncStorage from "@react-native-async-storage/async-storage";

import { log, logError } from "./logger";

// ---------------------------------------------------------------------------
// Session storage — single source of truth for the JWT + cached user/app state
// ---------------------------------------------------------------------------
export const TOKEN_KEY = "user_token";
export const USER_KEY = "user_data";
export const APP_STATE_KEY = "skillbridge_state"; // { cvId, skillGapId, targetRole, roadmapId, careerPaths, onboardingComplete }

// In-memory copy so every request doesn't wait on AsyncStorage, and so a
// token saved a millisecond ago is visible immediately to the next request.
let memoryToken = null;
let memoryLoaded = false;

// Strip quotes / whitespace / an accidental "Bearer " prefix from a token.
export function sanitizeToken(raw) {
  if (!raw || typeof raw !== "string") return null;
  let t = raw.trim();
  if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1);
  if (/^bearer\s+/i.test(t)) t = t.replace(/^bearer\s+/i, "");
  return t || null;
}

// Find the JWT in any reasonable response shape.
// Live API (POST /api/v1/auth/login) → { success, message, data: { user, token } }
export function extractToken(body) {
  if (!body || typeof body !== "object") return null;
  const candidates = [
    body?.data?.token,
    body?.data?.accessToken,
    body?.data?.access_token,
    body?.data?.tokens?.accessToken,
    body?.token,
    body?.accessToken,
    body?.access_token,
  ];
  return sanitizeToken(candidates.find((c) => typeof c === "string" && c));
}

export function extractUser(body) {
  return body?.data?.user || body?.user || null;
}

export async function getToken() {
  if (memoryLoaded) return memoryToken;
  try {
    memoryToken = sanitizeToken(await AsyncStorage.getItem(TOKEN_KEY));
  } catch (e) {
    logError("session", "getToken (reading AsyncStorage)", e);
    memoryToken = null;
  }
  memoryLoaded = true;
  log("session", memoryToken ? "Token loaded from storage" : "No stored token found");
  return memoryToken;
}

export async function saveSession(token, user) {
  const clean = sanitizeToken(token);
  if (!clean) throw new Error("No authentication token was returned.");
  memoryToken = clean;
  memoryLoaded = true;
  await AsyncStorage.setItem(TOKEN_KEY, clean);
  if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  log("session", "Session saved", { hasUser: !!user });
}

// Credentials held in memory only, between signup and email verification, so
// we can log in once the code is confirmed (register/verify-email return no
// JWT). Never persisted; lost if the app is closed.
let pendingCredentials = null;

export function setPendingCredentials(email, password) {
  pendingCredentials = { email, password };
}

export function getPendingCredentials(email) {
  if (!pendingCredentials) return null;
  if (email && pendingCredentials.email !== String(email).trim().toLowerCase()) {
    return null;
  }
  return pendingCredentials;
}

export function clearPendingCredentials() {
  pendingCredentials = null;
}

export async function clearSession() {
  log("session", "Session cleared");
  pendingCredentials = null;
  memoryToken = null;
  memoryLoaded = true;
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, APP_STATE_KEY]);
}

export async function getCachedUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    logError("session", "getCachedUser", e);
    return null;
  }
}

export async function setCachedUser(user) {
  if (!user) return;
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getAppState() {
  try {
    const raw = await AsyncStorage.getItem(APP_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    logError("session", "getAppState", e);
    return {};
  }
}

export async function updateAppState(patch) {
  const current = await getAppState();
  const next = { ...current, ...patch };
  await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(next));
  return next;
}

// ---------------------------------------------------------------------------
// Unauthorized listener — the root layout registers a handler that sends the
// user back to /login when the server rejects the token.
// ---------------------------------------------------------------------------
let unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}
export function notifyUnauthorized() {
  if (typeof unauthorizedHandler === "function") unauthorizedHandler();
}
