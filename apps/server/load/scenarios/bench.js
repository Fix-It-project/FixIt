// Bench: fixed-count run for thesis figures — 20 VUs (≈20 concurrent users
// with 1s think time, within the free-tier ceiling) share exactly 10,000
// iterations, one GET request per iteration, rotating across the 3 read
// endpoints. Total = 10,000 HTTP requests.
//
// Defaults are overridable:
//   k6 run -e VUS=20 -e ITERS=10000 -e BASE=https://d25l1nu40gf2i5.cloudfront.net load/scenarios/bench.js
//
// Local instead:  start the server, then
//   k6 run load/scenarios/bench.js     (BASE defaults to http://localhost:3000)
import http from "k6/http";
import { check, sleep } from "k6";
import exec from "k6/execution";
import { thresholds, BASE } from "../lib/config.js";
import { resolveCatId } from "../lib/requests.js";
import { makeSummary } from "../lib/summary.js";

const VUS = Number(__ENV.VUS || 20);
const ITERS = Number(__ENV.ITERS || 10000);

export const options = {
  scenarios: {
    bench: {
      executor: "shared-iterations",
      vus: VUS,
      iterations: ITERS,
      maxDuration: "10m",
    },
  },
  thresholds: {
    ...thresholds,
    "http_req_duration{name:GET /api/categories}": ["p(95)<400"],
    "http_req_duration{name:GET /api/categories/:id/services}": ["p(95)<400"],
    "http_req_duration{name:GET /api/categories/:id/technicians}": ["p(95)<400"],
  },
};

const ok = (res) => check(res, { "status 2xx": (r) => r.status >= 200 && r.status < 300 });

export function setup() {
  return { catId: resolveCatId() };
}

export default function (data) {
  // Rotate endpoint by global iteration number -> even split across the 3.
  const pick = exec.scenario.iterationInTest % 3;

  if (pick === 0 || !data.catId) {
    ok(http.get(`${BASE}/api/categories`, { tags: { name: "GET /api/categories" } }));
  } else if (pick === 1) {
    ok(
      http.get(`${BASE}/api/categories/${data.catId}/services`, {
        tags: { name: "GET /api/categories/:id/services" },
      }),
    );
  } else {
    ok(
      http.get(`${BASE}/api/categories/${data.catId}/technicians`, {
        tags: { name: "GET /api/categories/:id/technicians" },
      }),
    );
  }

  // Think time: each VU pauses ~1s between requests, modelling a real user
  // rather than a zero-pause firehose. So 100 VUs ≈ 100 concurrent users.
  sleep(1);
}

export const handleSummary = makeSummary("bench");
