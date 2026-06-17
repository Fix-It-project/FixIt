# FixIt

FixIt is a TypeScript monorepo for a home-services platform. It includes a Supabase-backed Express API, an Expo React Native mobile app, a React admin dashboard, shared workspace packages, and an optional AI/recommendation service stack.

For complete environment variables and setup details, see [documentation/setup.md](documentation/setup.md).

## Current Apps

- `apps/server`: Express API server for auth, users, technicians, orders, reports, admin dashboard data, storage, and related backend workflows.
- `apps/native`: Expo React Native app for users and technicians.
- `apps/admin`: Vite React admin dashboard.
- `packages/env`: shared environment validation for server, native, and web/admin apps.
- `packages/db`: shared database access package.
- `packages/errors`: shared error utilities.
- `packages/config`: shared TypeScript/config tooling.
- `FixIt Recommendation System/FixIt Recommendation System`: optional Python recommendation API, Ollama fallback service, and AI tooling.

## Tech Stack

- TypeScript
- pnpm workspaces
- Turborepo
- Express
- Supabase PostgreSQL, Auth, and Storage
- Expo and React Native
- React and Vite
- TanStack Router, Query, Form, and Table
- Biome
- Vitest
- Serverless Framework for optional AWS Lambda deployment
- Optional Python/FastAPI recommendation service and Ollama-based AI diagnosis stack

## Requirements

- Node.js 20 or later
- pnpm 10.33.0 or compatible
- Git
- Supabase project with PostgreSQL, Auth, and Storage
- Expo/Android Studio or a physical device for mobile development

Optional:

- Python 3.10 or later for the recommendation API
- Docker Desktop for the AI/recommendation compose stack
- EAS CLI 18.4.0 or later for Expo builds
- AWS CLI and Serverless Framework for backend deployment

## Quick Start

Install dependencies from the repository root:

```bash
pnpm install
```

Create the local environment files:

- `apps/server/.env`
- `apps/admin/.env`
- `apps/native/.env`

The full list of required variables is documented in [documentation/setup.md](documentation/setup.md).

Run the main services in separate terminals:

```bash
pnpm run dev:server
pnpm run dev:admin
pnpm run dev:native
```

Default local URLs:

- API server: `http://localhost:3000`
- Admin dashboard: usually `http://localhost:5173`
- Expo Metro: usually `http://localhost:8081`

## Useful Scripts

Root scripts:

```bash
pnpm run dev
pnpm run build
pnpm run check-types
pnpm run check
pnpm run dev:server
pnpm run dev:admin
pnpm run dev:native
```

App-specific scripts:

```bash
pnpm --filter server test
pnpm --filter server test:coverage

pnpm --filter admin test
pnpm --filter admin build

pnpm --filter native test
pnpm --filter native verify
pnpm --filter native android
pnpm --filter native ios
```

## Environment Summary

The server requires Supabase credentials, admin auth credentials, storage bucket names, CORS origins, and a port.

The admin dashboard requires:

```bash
VITE_SERVER_URL=http://localhost:3000
```

The native app requires at minimum:

```bash
EXPO_PUBLIC_SERVER_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

Feature-specific native variables include Google sign-in, Google Maps, Sentry, Locize, recommendation API, and AI diagnosis API settings. See [documentation/setup.md](documentation/setup.md) before creating production builds because `EXPO_PUBLIC_*` values are bundled into the app.

## Optional Recommendation and AI Services

The optional recommendation service can run locally from:

```text
FixIt Recommendation System/FixIt Recommendation System
```

Start the Python recommendation API:

```bash
pip install -r requirements.txt
python run.py
```

Default URL:

```text
http://localhost:8000
```

The Docker-based AI stack can be started from the same directory:

```bash
docker compose up --build
```

That stack exposes Ollama, the recommendation API, and the fallback diagnosis API. Details are in [documentation/setup.md](documentation/setup.md) and the recommendation-system docs.

## Documentation

- [Setup Guide](documentation/setup.md)
- [Architecture Diagram](documentation/archeticture_diagram.md)
- [Context Diagram](documentation/context_diagram.md)
- [Component Diagrams](documentation/component_diagrams.md)
- [Data Flow Diagram](documentation/data_flow_diagram.md)
- [Functional Requirements](documentation/functional_requirements.md)
- [Use Cases](documentation/Use_cases.md)

## Verification

Before submitting changes, run:

```bash
pnpm run check-types
pnpm run check
```

For app-specific behavior, run the relevant test command for `server`, `admin`, or `native`.
