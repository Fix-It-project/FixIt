import http from "k6/http";
import { BASE, LOAD_USER, headers } from "./config.js";

// Sign in once and return the Supabase access token, or null if no creds
// are configured. Authed scenarios skip their authed requests when null,
// so the suite still runs without a seeded test user.
//
// Response shape (auth.service.signIn): { session: { access_token }, user }.
export function login() {
  if (!LOAD_USER.email || !LOAD_USER.password) return null;

  const res = http.post(
    `${BASE}/api/auth/signin`,
    JSON.stringify({ email: LOAD_USER.email, password: LOAD_USER.password }),
    { headers: headers(), tags: { name: "POST /api/auth/signin" } },
  );

  if (res.status !== 200) {
    console.warn(`login failed (${res.status}); authed requests skipped`);
    return null;
  }

  try {
    return res.json("session.access_token");
  } catch {
    return null;
  }
}
