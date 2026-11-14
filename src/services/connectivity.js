import { log } from "./logger";

// ===========================================================================
// Connectivity messages.
//
// Three different problems look the same to the user ("network error"), so the
// app tells them apart:
//   offline      the phone itself reports no connection (expo-network)
//   unreachable  the phone is online but the server never answered
//   server       the server answered with a 5xx error
//
// The root layout registers the handler that shows the alert, and tells this
// module whether the phone is online. Alerts are throttled so a screen that
// fires many requests at once can't bury the user in pop-ups.
// ===========================================================================
export const COOLDOWN_MS = 2 * 60 * 1000;
const ALERT_MAX_OPEN_MS = 30 * 1000;

let deviceOnline = true; // assume online until the phone says otherwise
let alertHandler = null;
let alertOpen = false;
const lastShown = {}; // kind -> timestamp

export function setDeviceOnline(online) {
  const changed = deviceOnline !== online;
  deviceOnline = online;
  if (changed) log("connectivity", online ? "Phone is back online" : "Phone went offline");
  return changed;
}

export const isDeviceOnline = () => deviceOnline;

// fn(kind, done) — show the alert, then call done() when it is dismissed.
export function setConnectivityAlertHandler(fn) {
  alertHandler = fn;
}

// Which problem a failed request represents.
export function classifyFailure(error) {
  if (!error?.response) return deviceOnline ? "unreachable" : "offline";
  if (error.response.status >= 500) return "server";
  return null; // 4xx errors are the caller's business, not connectivity
}

// Show the alert for `kind` unless one is already open or the same kind was
// shown recently. Returns true if an alert was shown.
export function reportConnectivityProblem(kind) {
  if (!kind || !alertHandler || alertOpen) return false;
  const now = Date.now();
  if (lastShown[kind] && now - lastShown[kind] < COOLDOWN_MS) return false;

  lastShown[kind] = now;
  alertOpen = true;
  log("connectivity", `Showing "${kind}" alert`);
  const release = () => {
    alertOpen = false;
  };
  // Safety net: if the platform never reports the alert as dismissed, don't
  // block every future connectivity alert.
  setTimeout(release, ALERT_MAX_OPEN_MS);
  alertHandler(kind, release);
  return true;
}

// The wording for each kind.
export const CONNECTIVITY_MESSAGES = {
  offline: {
    title: "You're offline",
    message:
      "Your phone isn't connected to the internet. What's already on screen stays available, and we'll refresh it automatically when you're back online.",
  },
  unreachable: {
    title: "Can't reach SkillBridge",
    message:
      "Your phone is online, but the server didn't answer. This can be a slow or unstable connection. We'll keep what's on screen — pull down to try again.",
  },
  server: {
    title: "Server problem",
    message:
      "SkillBridge's server had a problem, so some data couldn't load. This isn't caused by your phone or your account. Pull down to try again in a moment.",
  },
};
