// Shared config for k6 load/performance scenarios.
//
// BASE  — target server root. Defaults to the deployed CloudFront API so
//         every scenario tests the cloud endpoint under its own load shape.
//         Override for local:  k6 run -e BASE=http://localhost:3000 scenarios/load.js
//
// CAT_ID — a real category UUID, needed for the
//          /api/categories/:id/services and /:id/technicians targets.
//          Auto-resolved from the first category if unset.
//
// Caution: stress.js at 200 VUs hits the real Supabase behind the deployed
// API. Read-only, but watch DB CPU / connection limits.

export const BASE = __ENV.BASE || "https://d25l1nu40gf2i5.cloudfront.net";

// A category id for the nested read endpoints. Empty => those endpoints
// are skipped by the scenarios so a missing seed doesn't fail the run.
export const CAT_ID = __ENV.CAT_ID || "";

// Test-user creds for authed scenarios (see lib/auth.js).
export const LOAD_USER = {
  email: __ENV.LOAD_TEST_EMAIL || "",
  password: __ENV.LOAD_TEST_PASSWORD || "",
};

// Pass/fail gates. k6 exits non-zero if any threshold is breached -> CI gate.
// Tune p95/p99 after the first baseline run (see README).
export const thresholds = {
  http_req_failed: ["rate<0.01"], // <1% errors
  http_req_duration: ["p(95)<400", "p(99)<800"], // milliseconds
};

// Standard JSON headers, optionally with a bearer token.
export function headers(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}
