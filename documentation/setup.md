# FixIt Setup Guide

This document describes the local development setup, environment requirements, and service startup steps for the FixIt monorepo.

## Project Overview

FixIt is a pnpm workspace with these main parts:

- `apps/server`: Express API server.
- `apps/native`: Expo React Native mobile app.
- `apps/admin`: Vite React admin dashboard.
- `packages/env`: shared environment validation.
- `packages/db`: shared database access package.
- `packages/errors` and `packages/config`: shared utilities/configuration.
- `FixIt Recommendation System/FixIt Recommendation System`: optional Python/AI recommendation and diagnosis services.

## Required Tools

Install these before running the project:

- Node.js 20 or later.
- pnpm 10.33.0 or compatible. The repo declares `packageManager: pnpm@10.33.0`.
- Git.
- Supabase project with PostgreSQL, Auth, and Storage enabled.
- Expo tooling for mobile development. Use `pnpm --filter native dev` or `npx expo` through the workspace scripts.
- Android Studio and an Android emulator, or a physical Android device, for `expo run:android`.
- Xcode and iOS Simulator for `expo run:ios` on macOS only.

Optional tools:

- Docker Desktop, for the recommendation/AI compose setup.
- Python 3.10 or later, for the recommendation API.
- EAS CLI 18.4.0 or later, for Expo builds.
- Maestro, for mobile end-to-end tests.
- AWS CLI and Serverless Framework, for Lambda deployment of the server.

## Install Dependencies

From the repository root:

```bash
pnpm install
```

The workspace installs dependencies for the server, mobile app, admin dashboard, and shared packages.

## Environment Files

Local environment files are intentionally not committed. Create the files below before starting the apps.

### Server Environment

Create `apps/server/.env`:

```bash
SUPABASE_CONNECTION_STRING=postgresql://postgres:<password>@<host>:5432/postgres
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>

CORS_ORIGIN=http://localhost:5173,http://localhost:8081

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=<bcrypt-password-hash>
ADMIN_JWT_SECRET=<at-least-16-characters>
ADMIN_SESSION_TTL_SECONDS=43200

STORAGE_BUCKET=<general-storage-bucket>
ORDER_BUCKET=<order-attachments-bucket>

PORT=3000
NODE_ENV=development

# Optional monitoring
SENTRY_DSN=
LOG_LEVEL=info
```

Required server variables are validated in `packages/env/src/server.ts`.

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is sensitive. Do not expose it to the mobile app or browser.
- `CORS_ORIGIN` is a comma-separated list of allowed frontend origins.
- `ADMIN_PASSWORD_HASH` must be a bcrypt hash, not a plain password.
- `ADMIN_SESSION_TTL_SECONDS` defaults to `43200` if omitted.
- `PORT` defaults to `3000` if omitted.
- `NODE_ENV` defaults to `development` and may be `development`, `production`, or `test`.

### Admin Dashboard Environment

Create `apps/admin/.env` or copy the existing example:

```bash
VITE_SERVER_URL=http://localhost:3000
```

`VITE_SERVER_URL` must point to the running Express API.

### Native App Environment

Create `apps/native/.env`:

```bash
EXPO_PUBLIC_SERVER_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>

# Optional services
EXPO_PUBLIC_RECOMMENDATION_API_URL=http://localhost:8000
EXPO_PUBLIC_AI_BASE_URL=http://localhost:3001
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_LOCIZE_PROJECT_ID=
EXPO_PUBLIC_LOCIZE_API_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
```

Required by shared validation:

- `EXPO_PUBLIC_SERVER_URL`

Also required by app code at runtime:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` if Google sign-in is used.

Optional feature variables:

- `EXPO_PUBLIC_RECOMMENDATION_API_URL`: enables technician recommendations.
- `EXPO_PUBLIC_AI_BASE_URL`: enables AI diagnosis endpoints.
- `EXPO_PUBLIC_SENTRY_DSN`: enables mobile Sentry monitoring.
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`: enables Google Maps/static map features. Restrict this key in Google Cloud Console because it ships in the app.
- `EXPO_PUBLIC_LOCIZE_PROJECT_ID` and `EXPO_PUBLIC_LOCIZE_API_KEY`: used for translation management. Do not set the Locize API key in production mobile builds.

Important: any `EXPO_PUBLIC_*` variable is bundled into the client app and must be treated as public.

## Supabase Requirements

The server and mobile app expect a Supabase project with:

- Project URL.
- Anonymous key for client auth.
- Service role key for trusted server/admin operations.
- Direct PostgreSQL connection string.
- Storage buckets matching `STORAGE_BUCKET` and `ORDER_BUCKET`.

Make sure database schema, RPC functions, policies, auth providers, and storage buckets are already provisioned in Supabase before testing full user flows.

## Running the Main Apps

Use separate terminals for each service.

### Start the API Server

```bash
pnpm run dev:server
```

Default URL:

```text
http://localhost:3000
```

### Start the Admin Dashboard

```bash
pnpm run dev:admin
```

Vite will print the local dashboard URL, usually:

```text
http://localhost:5173
```

### Start the Expo Native App

```bash
pnpm run dev:native
```

Then choose an emulator/device from the Expo terminal UI.

For native builds:

```bash
pnpm --filter native android
pnpm --filter native ios
```

The iOS command requires macOS and Xcode.

## Running Everything Through Turbo

To run all dev scripts declared in the workspace:

```bash
pnpm run dev
```

For day-to-day work, running only the services you need is usually easier:

```bash
pnpm run dev:server
pnpm run dev:admin
pnpm run dev:native
```

## Type Checking, Formatting, and Tests

From the repository root:

```bash
pnpm run check-types
pnpm run check
pnpm run build
```

App-specific checks:

```bash
pnpm --filter server test
pnpm --filter server test:coverage

pnpm --filter admin test
pnpm --filter admin check-types
pnpm --filter admin build

pnpm --filter native test
pnpm --filter native verify
pnpm --filter native test:e2e
```

`pnpm run check` runs Biome with writes enabled across the repository.

## Optional Recommendation and AI Services

The optional recommendation/AI service lives in:

```text
FixIt Recommendation System/FixIt Recommendation System
```

### Python Recommendation API

From that directory:

```bash
pip install -r requirements.txt
python run.py
```

Default URL:

```text
http://localhost:8000
```

Health check:

```bash
curl http://localhost:8000/health
```

The native app can call this service when:

```bash
EXPO_PUBLIC_RECOMMENDATION_API_URL=http://localhost:8000
```

Recommendation service environment variables:

```bash
DATABASE_URL=sqlite:///fixit.db
HOST=0.0.0.0
PORT=8000
```

It can also use `SUPABASE_CONNECTION_STRING` for database-backed mode.

### Docker Compose AI Stack

From `FixIt Recommendation System/FixIt Recommendation System`:

```bash
docker compose up --build
```

Services exposed by the compose stack:

- Ollama: `http://localhost:11434`
- Python recommendation API: `http://localhost:8000`
- Ollama fallback diagnosis API: `http://localhost:3001`

If using the fallback diagnosis API from the mobile app:

```bash
EXPO_PUBLIC_AI_BASE_URL=http://localhost:3001
```

The Docker stack may require NVIDIA GPU support for acceptable local LLM performance.

## EAS Build Requirements

The native app has `apps/native/eas.json` profiles for `development`, `preview`, and `production`.

Requirements:

- EAS CLI 18.4.0 or later.
- Expo account and project linked with EAS.
- Required `EXPO_PUBLIC_*` variables configured in EAS environment/secrets.
- `SENTRY_AUTH_TOKEN` configured for preview/production builds if Sentry source map upload is enabled.

Common commands from `apps/native`:

```bash
eas build --profile development --platform android
eas build --profile preview --platform android
eas build --profile production --platform android
```

Use the matching iOS platform on macOS or EAS when iOS credentials are configured.

## Serverless Deployment Requirements

The server includes a Serverless Framework setup in `apps/server/serverless.yml`.

Deployment requirements:

- AWS credentials configured.
- Serverless Framework available.
- Server env vars available to the deploy process.

Required deployment variables:

```bash
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_CONNECTION_STRING
SUPABASE_SERVICE_ROLE_KEY
CORS_ORIGIN
STORAGE_BUCKET
ORDER_BUCKET
ADMIN_EMAIL
ADMIN_PASSWORD_HASH
ADMIN_JWT_SECRET
ADMIN_SESSION_TTL_SECONDS
```

Deploy from `apps/server`:

```bash
serverless deploy
```

## Port Reference

Default local ports:

- Server API: `3000`
- Admin dashboard: usually `5173`
- Expo Metro: usually `8081`
- Recommendation API: `8000`
- AI fallback API: `3001`
- Ollama: `11434`

Avoid running the Express server and AI fallback on the same port.

## Verification Checklist

1. `pnpm install` completes successfully.
2. `apps/server/.env`, `apps/admin/.env`, and `apps/native/.env` exist.
3. `pnpm run dev:server` starts on `http://localhost:3000`.
4. `pnpm run dev:admin` loads and can reach the server URL.
5. `pnpm run dev:native` starts Expo and the app can authenticate through Supabase.
6. Supabase storage buckets match `STORAGE_BUCKET` and `ORDER_BUCKET`.
7. Optional recommendation API returns a successful response from `/health`.
8. `pnpm run check-types` passes before submitting changes.

## Common Troubleshooting

### Missing Supabase Environment Variables

Check `apps/server/.env` and `apps/native/.env`. The server needs non-public Supabase variables; the native app needs only public URL and anonymous key.

### Admin Dashboard Cannot Reach API

Verify:

- `apps/admin/.env` has `VITE_SERVER_URL=http://localhost:3000`.
- The server is running.
- `CORS_ORIGIN` in `apps/server/.env` includes the admin dashboard origin.

### Mobile App Cannot Reach Local Server

On a physical device, `localhost` points to the device, not your computer. Use your computer's LAN IP address:

```bash
EXPO_PUBLIC_SERVER_URL=http://<your-computer-lan-ip>:3000
```

Also add that origin to `CORS_ORIGIN` if needed.

### Google Sign-In Fails

Verify `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and, for iOS, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. The iOS client ID must match the bundle configuration in `apps/native/app.config.ts`.

### Recommendation Features Fail

Verify the optional recommendation API is running and `EXPO_PUBLIC_RECOMMENDATION_API_URL` points to it.

### AI Diagnosis Features Fail

Verify the fallback or ZeroClaw/Ollama stack is running and `EXPO_PUBLIC_AI_BASE_URL` points to the service used by the app.
