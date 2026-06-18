// Stress: climb through the free-tier break zone (15->30->45->60 VU) to pin
// the exact VU count where error rate climbs = capacity ceiling. Aborts once
// errors exceed 10%.
//
//   k6 run load/scenarios/stress.js
//   Read-only GETs, but this is the one scenario meant to push to failure.
import { sleep } from "k6";
import { login } from "../lib/auth.js";
import { publicReads, authedReads, resolveCatId } from "../lib/requests.js";
import { makeSummary } from "../lib/summary.js";

export const options = {
  stages: [
    { duration: "1m", target: 15 },
    { duration: "1m", target: 30 },
    { duration: "1m", target: 45 },
    { duration: "1m", target: 60 },
    { duration: "30s", target: 0 },
  ],
  // abortOnFail stops the test once errors exceed 10% — that's the ceiling.
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.10", abortOnFail: true }],
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

export const handleSummary = makeSummary("stress");
