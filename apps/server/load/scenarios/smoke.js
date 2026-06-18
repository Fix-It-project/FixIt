// Smoke: 1 VU, 1 iteration. Sanity-check that every target endpoint is
// reachable and returns 2xx. Run this first / on every PR.
//
//   k6 run load/scenarios/smoke.js
import { sleep } from "k6";
import { login } from "../lib/auth.js";
import { publicReads, authedReads, resolveCatId } from "../lib/requests.js";
import { makeSummary } from "../lib/summary.js";

export const options = {
  vus: 1,
  iterations: 1,
  // Smoke checks reachability only — latency SLOs (p95/p99) live in
  // load.js/stress.js. A single cold-start request would otherwise breach them.
  thresholds: {
    http_req_failed: ["rate<0.01"],
    checks: ["rate==1.0"],
  },
};

export function setup() {
  return { token: login(), catId: resolveCatId() };
}

export default function (data) {
  publicReads(data.catId);
  authedReads(data.token);
  sleep(1);
}

export const handleSummary = makeSummary("smoke");
