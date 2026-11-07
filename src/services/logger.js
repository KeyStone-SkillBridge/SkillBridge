// ---------------------------------------------------------------------------
// Dev-only logger. Every line is tagged ("[api]", "[signup]", ...) so Metro
// output can be filtered. Secrets (passwords, tokens, codes) are redacted and
// nothing is logged in production builds.
// ---------------------------------------------------------------------------
const SECRET_KEYS = /pass(word)?|token|authorization|code|otp|secret/i;

export function redact(value, depth = 0) {
  if (value == null || depth > 4) return value;
  if (typeof value === "string") {
    return value.length > 400 ? `${value.slice(0, 400)}…(${value.length} chars)` : value;
  }
  if (Array.isArray(value)) return value.slice(0, 10).map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    // FormData can't be inspected safely on RN — just say what it is.
    if (typeof FormData !== "undefined" && value instanceof FormData) return "[FormData]";
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SECRET_KEYS.test(k) ? "[redacted]" : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

const stamp = () => new Date().toISOString().slice(11, 23);

export function log(tag, message, data) {
  if (!__DEV__) return;
  if (data === undefined) console.log(`${stamp()} [${tag}] ${message}`);
  else console.log(`${stamp()} [${tag}] ${message}`, redact(data));
}

export function warn(tag, message, data) {
  if (!__DEV__) return;
  if (data === undefined) console.warn(`${stamp()} [${tag}] ${message}`);
  else console.warn(`${stamp()} [${tag}] ${message}`, redact(data));
}

// Log any caught error with everything useful: where it happened, HTTP status,
// server body, axios error code and message.
export function logError(tag, context, error) {
  if (!__DEV__) return;
  console.warn(`${stamp()} [${tag}] ERROR in ${context}`, {
    status: error?.response?.status,
    body: redact(error?.response?.data),
    code: error?.code,
    message: error?.message,
    url: error?.config?.url,
  });
}
