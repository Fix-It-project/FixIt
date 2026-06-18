import http from "k6/http";
import { check, group } from "k6";
import { BASE, CAT_ID, headers } from "./config.js";

const ok = (res) => check(res, { "status 2xx": (r) => r.status >= 200 && r.status < 300 });

// Resolve a category id once (call from setup): use CAT_ID env if set,
// otherwise pick the first category from GET /api/categories. Returns ""
// if none found, in which case the nested endpoints are skipped.
// Response shape: { categories: [{ id, ... }] }.
export function resolveCatId() {
  if (CAT_ID) return CAT_ID;
  const res = http.get(`${BASE}/api/categories`);
  try {
    return res.json("categories.0.id") || "";
  } catch {
    return "";
  }
}

// Public read endpoints — highest-traffic surface, no auth.
// Pass the catId from setup() to include the nested category endpoints.
// Note: deployed "/" returns 403 (CloudFront only routes /api/*), so the
// liveness read is /api/categories rather than the root.
export function publicReads(catId) {
  group("public reads", () => {
    ok(http.get(`${BASE}/api/categories`, { tags: { name: "GET /api/categories" } }));

    if (catId) {
      ok(
        http.get(`${BASE}/api/categories/${catId}/services`, {
          tags: { name: "GET /api/categories/:id/services" },
        }),
      );
      // Geo distance + sort — prime latency suspect.
      ok(
        http.get(`${BASE}/api/categories/${catId}/technicians`, {
          tags: { name: "GET /api/categories/:id/technicians" },
        }),
      );
    }
  });
}

// Authed read endpoints — only run when a token is available.
export function authedReads(token) {
  if (!token) return;
  group("authed reads", () => {
    const h = { headers: headers(token) };
    ok(http.get(`${BASE}/api/orders`, { ...h, tags: { name: "GET /api/orders" } }));
    ok(http.get(`${BASE}/api/notifications`, { ...h, tags: { name: "GET /api/notifications" } }));
    ok(http.get(`${BASE}/api/reviews`, { ...h, tags: { name: "GET /api/reviews" } }));
  });
}
