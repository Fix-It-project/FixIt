// Global test setup — dummy env vars prevent the supabase Proxy from throwing
// "Missing Supabase environment variables" if any module accidentally bypasses mocks.
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
