// Monitor: sustained 25 VUs on GET (read-only) endpoints. Safe to run
// against a deployed/staging target to observe performance under steady
// concurrency — no writes, so no data mutation.
//
//   k6 run -e BASE=https://staging.example.com load/scenarios/monitor.js
//   k6 run -e BASE=... -e CAT_ID=<uuid> load/scenarios/monitor.js
//
// Reads only. Authed reads run only if LOAD_TEST_* creds are set; they are
// still GETs (orders/notifications/reviews), never mutations.
import { sleep } from "k6";
import { thresholds } from "../lib/config.js";
import { login } from "../lib/auth.js";
import { publicReads, authedReads, resolveCatId } from "../lib/requests.js";
import { makeSummary } from "../lib/summary.js";

export const options = {
  stages: [
    { duration: "30s", target: 25 }, // ramp up to 25 VUs (within free-tier ceiling)
    { duration: "3m", target: 25 }, // hold — this is the observation window
    { duration: "30s", target: 0 }, // ramp down
  ],
  thresholds,
};

export function setup() {
  return { token: login(), catId: resolveCatId() };
}

export default function (data) {
  publicReads(data.catId);
  authedReads(data.token);
  sleep(1);
}

export const handleSummary = makeSummary("monitor");
