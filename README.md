# FixIt — On-Demand Home Maintenance Platform for Egypt

FixIt is a full-stack, AI-assisted home-services platform that connects households in Egypt with verified, nearby maintenance technicians (plumbing, electrical, AC, appliances, and more), then manages the entire job lifecycle — from describing the problem, to matching, scheduling, on-site work, and secure payment.

---

## Team Members

| Role | Name | ID | Program |
|------|------|------|---------|
| Student | Amr Mamdouh | 202201393 | SWDAPD |
| Student | Abdullah Tamer | 202201240 | AI |
| Student | Mohamed Moataz | 202201393 | SWAPD |
| Student | Mohamed Ramadan | 202201773 | SWAPD |

**Supervisor:** Dr. / Prof. Yousry Abdelazeem

---

## Problem Statement

Finding a trustworthy home-maintenance technician in Egypt is still largely an informal, word-of-mouth process. When something breaks at home — a leaking sink, a faulty AC, an electrical fault — households typically rely on a neighbor's recommendation, a doorman's contact, or a number scribbled on a wall. This creates several recurring problems:

- **No trust signal.** There is no reliable way to judge a technician's quality, completion rate, or honesty before they arrive.
- **Opaque pricing.** Prices are negotiated on the spot with no transparency, leading to overcharging and disputes.
- **Poor matching.** Customers cannot easily find a technician who is genuinely close by, available, and specialized in their specific problem.
- **No accountability.** Scheduling, payment, and after-service follow-up are unmanaged, so there is no record, no guarantee, and no recourse.

Existing global gig platforms are not adapted to the Egyptian market (Arabic-first technicians, cash-dominant payments, Cairo geography, local pricing norms).

**FixIt addresses this gap** by providing a single mobile platform where customers describe their problem in plain language, get AI-ranked recommendations of verified nearby technicians, see transparent quotes, book a fixed time slot, and pay safely by cash or card — with reviews, trust scores, and an admin layer keeping the marketplace accountable.

---

## Features

### For Customers (Users)
- **Problem-first booking** — describe the issue in natural language and browse matching services/categories.
- **AI technician recommendations** — ranked list of nearby technicians based on the problem description, location, trust score, and history.
- **Transparent pricing** — distance-based inspection fee shown up front; negotiated work quotes accepted in-app.
- **Scheduling** — book technicians into fixed Cairo time slots; reschedule requests supported.
- **Dual payment** — pay by **cash** or **card** (Paymob), with a "switch to cash" fallback for stuck card checkouts.
- **Reviews & ratings** — rate completed jobs; ratings feed the technician trust score.
- **Live order tracking & notifications** — order events and push notifications across the job lifecycle.

### For Technicians
- **Technician onboarding** — dedicated sign-up and verification flow.
- **Service & custom-service catalog** — manage offered services, categories, and custom offerings.
- **Calendar & availability** — availability templates, calendar exceptions, and job scheduling.
- **Quotes & order lifecycle** — issue quotes, accept jobs, confirm completion (dual confirmation).
- **Wallet & earnings** — net earnings after platform fee, with cash vs. card settlement visibility.

### For Admins
- **Admin dashboard** — operational view over users, technicians, orders, and reports.
- **Moderation & reports** — review user-submitted reports and platform activity.

### AI / Intelligence Layer
- **Hybrid recommendation engine** — content-based + collaborative filtering with cold-start handling.
- **Market trust scoring** — reliability score derived from completion rate, ratings, and booking volume.
- **AI problem diagnosis (optional)** — local LLM (Ollama / ZeroClaw) that diagnoses a described home problem and suggests the right service, with audio-input support.

---

## System Architecture

FixIt is a **pnpm + Turborepo monorepo** composed of independently deployable apps that share typed packages, plus a standalone Python AI microservice. In production the API is **serverless**: it runs as per-module **AWS Lambda** functions behind **API Gateway** and **CloudFront**, not a single long-running server.

```
   ┌─────────────────────────────┐                      ┌─────────────────────────┐
   │   Expo / React Native App    │                      │   React + Vite          │
   │   (users + technicians)      │                      │   Admin Dashboard       │
   └──────┬───────────────┬───────┘                      └────────────┬────────────┘
          │               │                                           │
          │ HTTPS (AI)    │ HTTPS (core API, axios)                   │ HTTPS (core API)
          │               └─────────────────────┬─────────────────────┘
          │                                      ▼
          │                      ┌──────────────────────────────┐
          │                      │   AWS CloudFront (CDN edge)   │  d25l1nu40gf2i5.cloudfront.net
          │                      └───────────────┬──────────────┘
          │                                      ▼
          │                      ┌──────────────────────────────┐
          │                      │   AWS API Gateway (REST)      │  /api/* routes, X-Ray traced
          │                      └───────────────┬──────────────┘
          │                                      ▼
          │      ┌──────────────────────────────────────────────────────────────┐
          │      │   AWS Lambda — one function per domain module                 │
          │      │   (each = an Express app via @codegenie/serverless-express)   │
          │      │                                                               │
          │      │   auth · technician-auth · users · technicians · orders ·     │
          │      │   addresses · categories · reviews · reports · notifications ·│
          │      │   technician-calendar · admin-auth · admin-dashboard ·        │
          │      │   service-requests        (hot paths kept warm in prod)       │
          │      │          routes → controller → service → repository           │
          │      └───────────────────────┬───────────────┬──────────────────────┘
          │                              │               │
          │                              ▼               ▼
          │                  ┌───────────────────┐  ┌────────────────────────┐
          │                  │  Supabase         │  │  Paymob (card payments)│
          │                  │  PostgreSQL +     │◄─┤  ← webhooks → orders    │
          │                  │  Auth + Storage   │  │     Lambda              │
          │                  │  (RLS)            │  └────────────────────────┘
          │                  └─────────▲─────────┘
          │  AI flow (native only)     │
          ▼                            │ reads live data (DATABASE_URL)
   ┌──────────────────┐                │
   │  ngrok tunnel    │  public "front door" for the local AI stack
   └────────┬─────────┘
            ▼
   ┌──────────────────┐
   │  Gemma 3 4B      │  LLM (served by Ollama)
   │  (Ollama)        │
   └────────┬─────────┘
            ▼
   ┌─────────────────────────────────────────┐
   │  Chatbot = Agent + Recommendation        │
   │  • ZeroClaw / Node concierge agent       │
   │  • Python FastAPI recommendation engine  │──────────────┐
   │    (+ Whisper audio STT)                 │              │
   └─────────────────────────────────────────┘              │
                                            reads live data ─┘ (→ Supabase, above)
```

> **AI path is native-only.** The Expo app talks to the AI stack through an **ngrok** tunnel (`EXPO_PUBLIC_AI_BASE_URL`) at `POST /api/ai/diagnose` (stateless diagnoser) and `POST /api/ai/agent` (stateful ZeroClaw concierge). Behind the tunnel, the **Gemma 3 4B** model (via Ollama) drives the **chatbot** — the ZeroClaw/Node **agent** plus the Python **recommendation** engine (with Whisper audio transcription) — which reads technician/booking data from **Supabase**. The admin dashboard does **not** use this path; it only calls the core AWS API.

**Production deployment model.** The Express backend is bundled with **esbuild** and deployed via the **Serverless Framework** to AWS region `eu-west-3`. Rather than one monolithic function, each module ships as its **own Lambda** (`serverless-deploy/<module>-lambda.ts`): a shared Express app (`createSharedApp()`) mounts just that module's routes and is wrapped by `serverless-express`. API Gateway proxies `/api/<module>/{proxy+}` to the matching function, CloudFront sits in front as the public edge/CDN, and `serverless-plugin-warmup` pre-warms latency-sensitive functions (`auth`, `technician-auth`, `technician-calendar`, `orders`, `notifications`) in production. AWS X-Ray tracing is enabled on both Lambda and API Gateway. Locally, the same modules run together as a single Express process via `pnpm dev:server`.

**Monorepo layout**

```
apps/
  native/    # Expo / React Native app — feature-based architecture (users + technicians)
  server/    # Express API — modules/<feature>/ (routes → controller → service → repository)
  admin/     # React + Vite admin dashboard (TanStack Router/Query/Table)
packages/
  env/       # typed, validated environment access (shared)
  db/        # shared database types / access
  errors/    # shared AppError taxonomy + mappers (native + server)
  config/    # shared TypeScript / tooling config
FixIt Recommendation System/  # standalone Python FastAPI AI microservice
```

- **Backend** follows a strict `routes → controller → service → repository` layering, one module per domain (`orders`, `technicians`, `payments`, `reviews`, `notifications`, …).
- **Native app** uses a **feature-based architecture** — each `features/<name>/` owns its `api/`, `hooks/`, `schemas/`, `stores/`, and `components/`, with no cross-feature imports.
- **The AI stack is an independent, native-only microservice layer**: the Expo app reaches it over HTTP through an **ngrok** tunnel; the chatbot (ZeroClaw agent + Python recommendation engine, powered by Gemma via Ollama) reads from Supabase. The core app — including the admin dashboard — runs fully without it.

> Detailed diagrams: [Architecture](documentation/archeticture_diagram.md) · [Context](documentation/context_diagram.md) · [Components](documentation/component_diagrams.md) · [Data Flow](documentation/data_flow_diagram.md) · [Use Cases](documentation/Use_cases.md)

---

## Technologies Used

**Frontend (Mobile)**
- Expo / React Native, Expo Router
- NativeWind (Tailwind for RN) + design tokens
- TanStack Query (server state) · Zustand (client state) · Zod (validation)

**Frontend (Admin Web)**
- React 19 + Vite
- TanStack Router, Query, Form, Table · Radix UI

**Backend**
- TypeScript + Express
- Layered modular architecture, shared `AppError` taxonomy
- Pino logging · Sentry monitoring

**Database & Auth**
- Supabase — PostgreSQL 17, Auth, and Storage (Row-Level Security enabled on all tables)
- ~23 domain tables (`users`, `technicians`, `orders`, `payments`, `reviews`, `availability_templates`, …)

**Payments**
- Paymob (card checkout + webhooks) · cash settlement flow

**AI / ML** (native-only, exposed via **ngrok**)
- Python · FastAPI · Pandas · scikit-learn-style content + collaborative filtering recommendation engine
- **Gemma 3 4B** via **Ollama** driving the chatbot — **ZeroClaw** concierge agent (`/api/ai/agent`) + stateless diagnoser (`/api/ai/diagnose`)
- Whisper audio transcription (STT) · MLflow experiment tracking
- Reads live technician/booking data from **Supabase** (`DATABASE_URL`)

**Tooling & DevOps**
- pnpm workspaces · Turborepo · Biome · Vitest
- Docker / Docker Compose (AI stack)
- **AWS** — Lambda (per-module) + API Gateway + CloudFront + X-Ray, deployed via Serverless Framework (esbuild) · EAS (mobile builds)
- GitHub Actions (CI, PR checks, release-please)

---

## Setup Instructions

### Requirements

- Node.js 20 or later
- pnpm 10.33.0 (or compatible)
- Git
- A Supabase project (PostgreSQL, Auth, Storage)
- Expo / Android Studio or a physical device for mobile development

*Optional (AI services):* Python 3.10+, Docker Desktop, and Ollama.

### 1. Install dependencies

From the repository root:

```bash
pnpm install
```

### 2. Configure environment files

Create the following local env files (see [documentation/setup.md](documentation/setup.md) for the full variable list):

- `apps/server/.env`
- `apps/admin/.env`
- `apps/native/.env`

Minimum values:

```bash
# apps/admin/.env
VITE_SERVER_URL=http://localhost:3000

# apps/native/.env
EXPO_PUBLIC_SERVER_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
# Optional: enables AI technician recommendations
EXPO_PUBLIC_RECOMMENDATION_API_URL=http://localhost:8000
```

The server requires Supabase credentials, admin auth secrets, storage bucket names, CORS origins, a port, and (for card payments) Paymob keys.

> ⚠️ `EXPO_PUBLIC_*` values are **bundled into the mobile app** — review [documentation/setup.md](documentation/setup.md) before creating production builds.

### 3. Run the services (separate terminals)

```bash
pnpm run dev:server   # API → http://localhost:3000
pnpm run dev:admin    # Admin → http://localhost:5173
pnpm run dev:native   # Expo Metro → http://localhost:8081
```

### 4. (Optional) Run the AI / recommendation services

From `FixIt Recommendation System/FixIt Recommendation System`:

```bash
# Python recommendation API
pip install -r requirements.txt
python run.py          # → http://localhost:8000  (Swagger at /docs)

# Or the full AI stack (Ollama + recommendation + diagnosis) via Docker
docker compose up --build
# Ollama: http://localhost:11434
# Recommendation API: http://localhost:8000
# AI diagnosis fallback: http://localhost:3001
```

---

## Deployment Instructions

### API Server — AWS Lambda + API Gateway + CloudFront

The backend deploys to AWS via the **Serverless Framework** (`apps/server/serverless.yml`). It is **not** a single server — each domain module is packaged individually (esbuild, ESM, `nodejs24.x`) as its own Lambda function and exposed through API Gateway; CloudFront fronts the whole API as the public CDN edge.

- **Region:** `eu-west-3` · **Stage:** `dev` (override with `--stage prod`)
- **Functions:** `auth`, `technician-auth`, `users`, `technicians`, `orders`, `addresses`, `categories`, `reviews`, `reports`, `notifications`, `technician-calendar`, `admin-auth`, `admin-dashboard`, `service-requests`
- **Warm-up:** `serverless-plugin-warmup` keeps hot paths warm in prod; **tracing:** AWS X-Ray on Lambda + API Gateway
- **Env/secrets:** Supabase keys, admin auth secrets, storage buckets, CORS origin, and Paymob keys are injected from the deploy environment (see `provider.environment` in `serverless.yml`)

```bash
# One-time: install the CLI and configure AWS credentials
npm install -g serverless
aws configure

# Deploy all functions (run from apps/server, with env vars set)
cd apps/server
serverless deploy                 # dev stage
serverless deploy --stage prod    # production
```

Deployment is also wired into CI via GitHub Actions ([.github/workflows/deploy-server.yml](.github/workflows/deploy-server.yml)).

> Note: the older overview at `apps/server/serverless-deploy/serverless.md` is out of date (it describes a single `api` handler in `eu-north-1` on Node 20). The authoritative source is `serverless.yml` itself — per-module Lambdas in `eu-west-3` on Node 24.

### Mobile App — EAS Build

Build profiles (`development`, `preview`, `production`) live in `apps/native/eas.json`. Requires EAS CLI 18.4.0+, a linked Expo project, and `EXPO_PUBLIC_*` variables configured as EAS secrets.

```bash
eas build --profile preview --platform android
eas build --profile production --platform android
```

### Admin Dashboard — Static Build

```bash
pnpm --filter admin build   # outputs dist/ for any static host
```

### Recommendation Service — Docker

```bash
cd "FixIt Recommendation System/FixIt Recommendation System"
docker build -t fixit-recommendation .
docker run -p 8000:8000 fixit-recommendation
```

In production, set `DATABASE_URL` so the service reads live data from Supabase instead of the bundled CSV/SQLite fixtures.

---

## Usage Guide

### As a Customer
1. **Sign up / log in** in the mobile app and grant location access.
2. **Describe your problem** (e.g. "My kitchen sink is leaking continuously") and pick the matching service.
3. **Review recommended technicians** — ranked by match score, distance, and trust score — and select one.
4. **Confirm the booking**, choosing a time slot and a payment method (cash or card).
5. **Track the job** through its lifecycle; accept the technician's work quote when sent.
6. **Complete & pay** — after both sides confirm completion, cash orders close immediately, while card orders open a Paymob checkout.
7. **Leave a review** to help future customers and update the technician's trust score.

### As a Technician
1. Complete the **technician sign-up & verification** flow.
2. Set up your **services, custom offerings, and availability** (calendar templates + exceptions).
3. Receive and **accept job requests**, send **quotes**, and confirm completion.
4. Track **earnings** in your wallet (net of platform fee; cash vs. card settlement).

### As an Admin
1. Sign in to the **admin dashboard**.
2. Monitor **users, technicians, and orders**, and act on **reports**.

### Useful Scripts

```bash
# Root
pnpm run dev            # run all apps via Turborepo
pnpm run build
pnpm run check-types
pnpm run check          # Biome lint/format

# Per app
pnpm --filter server test
pnpm --filter server test:coverage
pnpm --filter admin test
pnpm --filter native test
pnpm --filter native android
```

---

## Screenshots / Demo

> 📸 **Screenshots and demo GIFs to be added.** Reference UI assets are available in [documentation/fig/](documentation/fig/) — Welcome, Sign up, Login, Home, Services, Technicians, Scheduling, and Confirmation screens — and can be embedded here for the final submission.

---

## Documentation

- [Setup Guide](documentation/setup.md)
- [Backend Architecture](documentation/agent_docs/backend_architecture.md)
- [Frontend Conventions](documentation/agent_docs/frontend_conventions.md)
- [Theming & Design Tokens](documentation/agent_docs/theming.md)
- [Testing Guide](documentation/agent_docs/TESTING.md)
- [Functional Requirements](documentation/functional_requirements.md) · [Use Cases](documentation/Use_cases.md)
- [Recommendation API Integration Guide](FixIt%20Recommendation%20System/FixIt%20Recommendation%20System/API_INTEGRATION_GUIDE.md)
- Domain glossary & payment flow: [CONTEXT.md](CONTEXT.md)

## License

See [LICENSE](LICENSE).
