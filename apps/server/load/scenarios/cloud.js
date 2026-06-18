// Cloud: hit the DEPLOYED API (CloudFront -> Lambda -> Supabase) on 3
// read-only GET endpoints. Moderate load (0->20 VU) to observe real-world
// latency without hammering production Supabase.
//
//   k6 run -e BASE=https://d25l1nu40gf2i5.cloudfront.net load/scenarios/cloud.js
//
// Note: the deployed root "/" returns 403 (CloudFront only routes /api/*),
// so this scenario does NOT hit "/". catId auto-resolves from /api/categories.
import http from "k6/http";
import { check, group, sleep } from "k6";
import { thresholds, BASE } from "../lib/config.js";
import { resolveCatId } from "../lib/requests.js";
import { makeSummary } from "../lib/summary.js";

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // ramp up
    { duration: "1m", target: 20 }, // hold — observation window
    { duration: "30s", target: 0 }, // ramp down
  ],
  // Global gates + per-endpoint p95 so the summary breaks latency down by
  // endpoint (reveals which one dominates).
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
  group("cloud GET reads", () => {
    // 1. category list
    ok(http.get(`${BASE}/api/categories`, { tags: { name: "GET /api/categories" } }));

    if (data.catId) {
      // 2. services in a category
      ok(
        http.get(`${BASE}/api/categories/${data.catId}/services`, {
          tags: { name: "GET /api/categories/:id/services" },
        }),
      );
      // 3. technicians in a category (geo distance + sort — latency suspect)
      ok(
        http.get(`${BASE}/api/categories/${data.catId}/technicians`, {
          tags: { name: "GET /api/categories/:id/technicians" },
        }),
      );
    }
  });
  sleep(1);
}

export const handleSummary = makeSummary("cloud");
