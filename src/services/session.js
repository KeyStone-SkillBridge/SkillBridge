import AsyncStorage from "@react-native-async-storage/async-storage";

import { log, logError } from "./logger";

// ===========================================================================
// Session — the JWT, the cached user and the small bag of app state.
//
// The token lives in memory (so every request doesn't wait on AsyncStorage and
// a token saved a millisecond ago is visible to the next request) and in
// AsyncStorage (so it survives a restart).
// ===========================================================================
export const TOKEN_KEY = "user_token";
export const USER_KEY = "user_data";
// { cvId, skillGapId, analysisId, targetRole, roadmapId, plannedSkills,
//   careerPaths, onboardingComplete }
export const APP_STATE_KEY = "skillbridge_state";

// ---- Token parsing ---------------------------------------------------------
// Strip quotes, whitespace and an accidental "Bearer " prefix.
export function sanitizeToken(raw) {
  if (!raw || typeof raw !== "string") return null;
  let token = raw.trim();
  if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
  token = token.replace(/^bearer\s+/i, "");
  return token || null;
}

// POST /api/v1/auth/login → { success, message, data: { user, token } }.
// Other shapes are accepted too in case the server changes.
export function extractToken(body) {
  if (!body || typeof body !== "object") return null;
  const candidates = [
    body.data?.token,
    body.data?.accessToken,
    body.data?.access_token,
    body.data?.tokens?.accessToken,
    body.token,
    body.accessToken,
    body.access_token,
  ];
  return sanitizeToken(candidates.find((c) => typeof c === "string" && c));
}

export function extractUser(body) {
  return body?.data?.user || body?.user || null;
}

// ---- Token store -----------------------------------------------------------
let memoryToken = null;
let tokenLoaded = false;
let tokenLoading = null; // shared promise while the first read is in flight
let sessionVersion = 0; // bumps on every save / clear

async function loadStoredToken() {
  const versionAtStart = sessionVersion;
  let stored = null;
  try {
    stored = sanitizeToken(await AsyncStorage.getItem(TOKEN_KEY));
  } catch (e) {
    logError("session", "reading the stored token", e);
  }
  // A save or clear that happened while we were reading is newer than what we
  // just read — it must win.
  if (sessionVersion === versionAtStart) memoryToken = stored;
  tokenLoaded = true;
  tokenLoading = null;
  log("session", memoryToken ? "Token available" : "No stored token");
}

export async function getToken() {
  if (!tokenLoaded) {
    if (!tokenLoading) tokenLoading = loadStoredToken();
    await tokenLoading;
  }
  return memoryToken;
}

export async function saveSession(token, user) {
  const clean = sanitizeToken(token);
  if (!clean) throw new Error("No authentication token was returned.");
  sessionVersion += 1;
  memoryToken = clean;
  tokenLoaded = true;
  await AsyncStorage.setItem(TOKEN_KEY, clean);
  if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  log("session", "Session saved", { hasUser: !!user });
}

export async function clearSession() {
  sessionVersion += 1;
  memoryToken = null;
  tokenLoaded = true;
  pendingCredentials = null;
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, APP_STATE_KEY]);
  log("session", "Session cleared");
}

// ---- Credentials between signup and email verification ----------------------
// register and verify-email return no JWT, so the signup screen keeps the
// credentials here to log in once the code is confirmed. Memory only: never
// written to disk, gone when the app closes.
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

// ---- Cached user -------------------------------------------------------------
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

// ---- App state ---------------------------------------------------------------
export async function getAppState() {
  try {
    const raw = await AsyncStorage.getItem(APP_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    logError("session", "getAppState", e);
    return {};
  }
}

// Updates are read-modify-write, so run them one at a time — two overlapping
// updates (for example { cvId } and { skillGapId }) must not overwrite each
// other.
let appStateQueue = Promise.resolve();

export function updateAppState(patch) {
  const run = appStateQueue.then(async () => {
    const next = { ...(await getAppState()), ...patch };
    await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(next));
    return next;
  });
  appStateQueue = run.catch(() => {});
  return run;
}

// ---- Unauthorized listener ----------------------------------------------------
// The root layout registers a handler that sends the user to /login when the
// server rejects the token.
let unauthorizedHandler = null;

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

export function notifyUnauthorized() {
  if (typeof unauthorizedHandler === "function") unauthorizedHandler();
}
