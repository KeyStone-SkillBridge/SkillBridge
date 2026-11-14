import axios from "axios";
import * as Network from "expo-network";

import { BASE_URL } from "./api";
import { log } from "./logger";

// ===========================================================================
// Network self-check (development builds only).
//
// Measures, from THIS phone, what it can reach and how reliably, so "network
// error" stops being a guess. It asks three things:
//   1. control sites  (Google, Cloudflare's edge)  -> is the phone's internet OK?
//   2. the API's static file (served by the Worker, no database)
//                                                    -> can the phone reach the Worker?
//   3. an API route that uses the database           -> does the backend itself crash?
// and prints one "[netcheck]" line per step plus a verdict. It uses its own
// plain client, so it has no retries, no alerts and no effect on app state.
// ===========================================================================
const TIMEOUT_MS = 15000;

// Any HTTP answer (even a 500) counts as "reached"; only a missing answer is a failure.
const client = axios.create({ timeout: TIMEOUT_MS, validateStatus: () => true });

async function probe(url) {
  const started = Date.now();
  try {
    // No query parameters: the API rejects ones it doesn't know with a 400.
    const res = await client.get(url);
    return { reached: true, status: res.status, ms: Date.now() - started, data: res.data };
  } catch (error) {
    return {
      reached: false,
      status: 0,
      ms: Date.now() - started,
      code: error?.code || error?.message || "error",
    };
  }
}

const label = (r) => (r.reached ? `${r.status} ${r.ms}ms` : `FAILED(${r.code}) ${r.ms}ms`);

// "colo" is the Cloudflare data centre answering you; "http" the protocol used.
function traceInfo(data) {
  if (typeof data !== "string") return "";
  const pick = (key) => (data.match(new RegExp(`^${key}=(.*)$`, "m")) || [])[1];
  return `edge=${pick("colo")} country=${pick("loc")} protocol=${pick("http")}`;
}

// One conclusion from the numbers. Deliberately cautious: it says what the
// numbers suggest, not what is certain.
export function verdictFrom({ controls, staticApi, dbApi }) {
  const rate = (rs) => rs.filter((r) => r.reached).length / (rs.length || 1);
  const serverErrors = dbApi.filter((r) => r.reached && r.status >= 500).length;

  if (rate(controls) < 1 && rate(staticApi) < 1) {
    return "The phone failed to reach even the control sites: this looks like a problem with the phone's own connection (Wi-Fi/router/carrier), not the SkillBridge server.";
  }
  if (rate(controls) === 1 && rate(staticApi) < 1) {
    return "Control sites are fine but the SkillBridge Worker was sometimes unreachable: the problem is on the path to the API (carrier/router routing to workers.dev, or the Worker itself), not your internet in general.";
  }
  if (serverErrors > 0) {
    return `The Worker is reachable, but ${serverErrors} of ${dbApi.length} database requests came back as server errors (5xx): that part is the backend crashing, not your connection.`;
  }
  if (rate(dbApi) < 1) {
    return "The static page was reachable but some database requests got no answer at all: the server (or the path to it) is dropping some requests.";
  }
  return "Everything answered fine just now. If errors still appear in the app, they are intermittent: run this again when it happens.";
}

export async function runNetworkCheck() {
  if (!__DEV__) return;

  try {
    const state = await Network.getNetworkStateAsync();
    log("netcheck", "Starting. The phone reports", {
      type: state.type,
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
    });
  } catch (_e) {
    log("netcheck", "Starting (could not read the phone's network state)");
  }

  const steps = [
    { key: "controls", name: "Control: Google", url: "https://www.google.com/generate_204", tries: 3 },
    { key: "controls", name: "Control: Cloudflare edge", url: "https://www.cloudflare.com/cdn-cgi/trace", tries: 3, info: traceInfo },
    { key: "staticApi", name: "API static file (no database)", url: `${BASE_URL}/api-docs.json`, tries: 6 },
    { key: "dbApi", name: "API database route", url: `${BASE_URL}/api/v1/skills`, tries: 6 },
  ];

  const grouped = { controls: [], staticApi: [], dbApi: [] };
  for (const step of steps) {
    const results = [];
    for (let i = 0; i < step.tries; i++) results.push(await probe(step.url));
    grouped[step.key].push(...results);

    const reached = results.filter((r) => r.reached).length;
    const extra = step.info && results.find((r) => r.reached) ? `  ${step.info(results.find((r) => r.reached).data)}` : "";
    log("netcheck", `${step.name}: ${reached}/${step.tries} answered | ${results.map(label).join("  ")}${extra}`);
  }

  log("netcheck", `VERDICT: ${verdictFrom(grouped)}`);
}
