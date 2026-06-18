// Load: ramp 0->50 VUs, sustain, ramp down. Models normal expected traffic.
// Use the output to record a baseline (RPS, p95/p99) in the README.
//
//   k6 run load/scenarios/load.js
//   k6 run -e CAT_ID=<uuid> -e LOAD_TEST_EMAIL=.. -e LOAD_TEST_PASSWORD=.. load/scenarios/load.js
import { sleep } from "k6";
import { thresholds } from "../lib/config.js";
import { login } from "../lib/auth.js";
import { publicReads, authedReads, resolveCatId } from "../lib/requests.js";
import { makeSummary } from "../lib/summary.js";

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // ramp up
    { duration: "1m", target: 20 }, // sustain
    { duration: "30s", target: 0 }, // ramp down
  ],
  thresholds,
};

// Authenticate once per VU init, reuse the token across iterations.
export function setup() {
  return { token: login(), catId: resolveCatId() };
}

export default function (data) {
  publicReads(data.catId);
  authedReads(data.token);
  sleep(1);
}

export const handleSummary = makeSummary("load");
