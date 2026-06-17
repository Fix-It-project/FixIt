// Global test setup — dummy env vars prevent the supabase Proxy from throwing
// "Missing Supabase environment variables" if any module accidentally bypasses mocks.
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.SUPABASE_CONNECTION_STRING = 'postgresql://postgres:postgres@localhost:54322/postgres';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.STORAGE_BUCKET = 'test-storage-bucket';
process.env.ORDER_BUCKET = 'test-order-bucket';
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD_HASH = '$2b$10$abcdefghijklmnopqrstuv';
process.env.ADMIN_JWT_SECRET = 'test-admin-jwt-secret-1234567890';
process.env.PAYMOB_API_KEY = 'test-paymob-api-key';
process.env.PAYMOB_IFRAME_ID = 'test-paymob-iframe-id';
process.env.PAYMOB_INTEGRATION_ID = 'test-paymob-integration-id';
process.env.PAYMOB_PUBLIC_KEY = 'test-paymob-public-key';
process.env.PAYMOB_HMAC_SECRET = 'test-paymob-hmac-secret';
process.env.PAYMOB_BASE_URL = 'https://accept.paymob.com/api';
process.env.PAYMOB_IFRAME_BASE_URL = 'https://accept.paymob.com/api/acceptance/iframes';
process.env.PAYMOB_CURRENCY = 'EGP';
process.env.PAYMOB_PLATFORM_FEE_PERCENT = '5';
process.env.PAYMOB_SANDBOX_MODE = 'true';
process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE = 'false';
