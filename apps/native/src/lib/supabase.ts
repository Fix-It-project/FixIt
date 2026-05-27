import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	throw new Error("Missing required Supabase environment variables");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
	auth: {
		autoRefreshToken: true,
		persistSession: false,
		detectSessionInUrl: false,
		storage: undefined,
	},
});

// Keep the realtime client's JWT in sync with the active session. Without
// this, an expired access_token persisted in SecureStore between app launches
// causes `.subscribe()` to fail with "InvalidJWTToken: Token has expired" —
// realtime then silently drops all postgres_changes events and the UI falls
// back to the 30s polling safety net.
supabase.auth.onAuthStateChange((_event, session) => {
	if (session?.access_token) {
		supabase.realtime.setAuth(session.access_token);
	}
});
