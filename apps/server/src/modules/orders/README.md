# Orders Module

Manages the full lifecycle of a service booking — from creation through acceptance, completion, cancellation, and rescheduling.

## 📁 Structure

```
orders/
├── orders.repository.ts      # DB queries against `orders` table
├── orders.service.ts         # Business logic, state machine, validation
├── orders.controller.ts      # HTTP request handlers
├── orders.routes.ts          # Route definitions (user + technician namespaces)
├── reschedule.repository.ts  # DB queries against `reschedule_requests` table (RPC wrappers)
├── reschedule.service.ts     # Reschedule state machine, validation, auto-reject logic
├── reschedule.controller.ts  # Reschedule HTTP request handlers
├── reschedule.routes.ts      # Reschedule route definitions (user + technician namespaces)
├── reschedule-schema.sql     # DDL: reschedule_requests table + 5 plpgsql RPCs
└── index.ts                  # Module exports
```

---

## 🌐 Endpoints

Base path: `/api/orders`

### User routes — requires `requireUserAuth`

| Method  | Path                                  | Description                                        |
|---------|---------------------------------------|----------------------------------------------------|
| `POST`  | `/user/orders`                        | Create a new order (status: pending)               |
| `GET`   | `/user/orders`                        | List all orders for the logged-in user             |
| `GET`   | `/user/orders/:id`                    | Get a single order by id (embeds reschedule_request) |
| `PATCH` | `/user/orders/:id`                    | Cancel an order `{ cancel: true }`                 |
| `POST`  | `/user/orders/:id/reschedule`         | Request a reschedule                               |
| `POST`  | `/user/orders/:id/reschedule/approve` | Approve technician's reschedule request            |
| `POST`  | `/user/orders/:id/reschedule/reject`  | Reject technician's reschedule request             |
| `POST`  | `/user/orders/:id/reschedule/withdraw`| Withdraw own reschedule request                    |

### Technician routes — requires `requireTechnicianAuth`

| Method  | Path                                       | Description                                        |
|---------|--------------------------------------------|----------------------------------------------------|
| `GET`   | `/technician/orders`                       | List all orders for the logged-in technician       |
| `GET`   | `/technician/orders/:id`                   | Get a single order by id (embeds reschedule_request) |
| `PATCH` | `/technician/orders/:id`                   | Update order status (see state machine)            |
| `POST`  | `/technician/orders/:id/reschedule`        | Request a reschedule                               |
| `POST`  | `/technician/orders/:id/reschedule/approve`| Approve user's reschedule request                  |
| `POST`  | `/technician/orders/:id/reschedule/reject` | Reject user's reschedule request                   |
| `POST`  | `/technician/orders/:id/reschedule/withdraw`| Withdraw own reschedule request                   |

---

## 📋 Request / Response

### `POST /api/orders/user/orders`

Accepts `multipart/form-data`. All fields except `attachment` can also be sent as JSON when no file is attached.

| Field | Type | Required |
|---|---|---|
| `technician_id` | string (UUID) | yes |
| `service_id` | string (UUID) | yes |
| `scheduled_date` | string (YYYY-MM-DD) | yes |
| `problem_description` | string | no |
| `attachment` | file | no |

If a file is provided it is uploaded to the `ORDER_BUCKET` Supabase storage bucket under `{orderId}/attachment.{ext}` and its public URL is stored in `attachment`.

Returns `201` with the created order.

### `PATCH /api/orders/user/orders/:id` — cancel

```json
{ "cancel": true, "cancellation_reason": "Changed my mind" }
```

`cancellation_reason` is optional. Returns `400` if the order is not in a cancellable state (`pending`, `accepted`, `reschedule_requested_by_user`, `reschedule_requested_by_technician`). Any pending reschedule request is automatically cancelled when the order is cancelled.

### `PATCH /api/orders/technician/orders/:id` — update status

```json
{ "status": "accepted" }
```

For `rejected` and `cancelled_by_technician` a reason can be provided:

```json
{ "status": "rejected", "cancellation_reason": "Outside service area" }
```

Valid values: `accepted` · `rejected` · `cancelled_by_technician` · `completed`

Returns `400` if the transition is not allowed. Returns `409` if accepting would exceed the 5 active-orders-per-day limit.

### `POST /api/orders/user/orders/:id/reschedule` — request reschedule

```json
{ "proposed_scheduled_date": "2026-06-15", "reason": "Travel for work" }
```

| Field | Type | Required |
|---|---|---|
| `proposed_scheduled_date` | string (YYYY-MM-DD) | yes |
| `reason` | string (max 500 chars) | yes |

Returns `201` with the created `reschedule_request` object.

### `POST /api/orders/.../reschedule/reject` — reject reschedule

```json
{ "reason": "Not available that day" }
```

`reason` is required (max 500 chars). Returns `200` with the resolved `reschedule_request` object.

### `POST /api/orders/.../reschedule/approve` or `/withdraw`

No body required. Returns `200` with the resolved `reschedule_request` object.

### Order object (single-record GET)

```json
{
  "id": "<uuid>",
  "technician_id": "<uuid>",
  "user_id": "<uuid>",
  "service_id": "<uuid>",
  "status": "accepted",
  "problem_description": "AC not cooling",
  "attachment": null,
  "cancellation_reason": null,
  "scheduled_date": "2026-06-15",
  "active": true,
  "created_at": "2026-03-23T10:00:00Z",
  "reschedule_request": {
    "id": "<uuid>",
    "order_id": "<uuid>",
    "requested_by": "user",
    "original_scheduled_date": "2026-05-07",
    "proposed_scheduled_date": "2026-06-15",
    "request_reason": "Travel for work",
    "reject_reason": null,
    "resolution": "approved",
    "response_window_hours": 24,
    "created_at": "2026-05-02T13:40:53Z",
    "resolved_at": "2026-05-02T13:48:17Z"
  }
}
```

`reschedule_request` is `null` when no reschedule has ever been requested. Resolution is one of: `pending` · `approved` · `rejected` · `withdrawn` · `auto_rejected`.

### Order list object (GET list)

Same as above but `reschedule_request` is replaced by:

```json
{ "has_pending_reschedule": true }
```

Cheap boolean flag — no full reconcile per row.

---

## 🔄 Order State Machine

```
                  ┌──────────────┐
        create    │    pending   │
        ─────────►│  active=false│
                  └──────┬───┬──┘
           accept ▼       │   │ reject
                  ┌───────┘   └──────────────────┐
                  ▼                               ▼
           ┌──────────────┐              ┌────────────────┐
           │   accepted   │◄─────────────┤  (reschedule   │
           │  active=true │  approve     │   approved)    │
           └──┬──┬────────┘              └────────────────┘
   complete ▼ │  │ reschedule
              │  ▼
              │  ┌─────────────────────────────────────────┐
              │  │ reschedule_requested_by_user            │
              │  │ reschedule_requested_by_technician      │
              │  └─────────────────────────────────────────┘
              │       ▲ counterparty approves → accepted
              │       ▲ counterparty rejects  → accepted (original date restored)
              │       ▲ requester withdraws   → accepted
              │       ▲ 24h expires           → auto_rejected → accepted
              ▼
       ┌──────────────┐
       │  completed   │
       │ active=false │
       └──────────────┘

  User can cancel from: pending, accepted, either reschedule status → cancelled_by_user
  Tech can cancel from: accepted, either reschedule status → cancelled_by_technician
```

### Transition table

| Current status | Actor      | Allowed transitions                                                         |
|----------------|------------|-----------------------------------------------------------------------------|
| `pending`      | Technician | `accepted`, `rejected`                                                      |
| `accepted`     | Technician | `completed`, `cancelled_by_technician`, `reschedule_requested_by_technician`|
| `reschedule_requested_by_user` | Technician | `accepted` (approve)                              |
| `reschedule_requested_by_technician` | Technician | `accepted` (withdraw), `cancelled_by_technician` |
| `pending`      | User       | `cancelled_by_user`                                                         |
| `accepted`     | User       | `cancelled_by_user`, `reschedule_requested_by_user`                         |
| `reschedule_requested_by_technician` | User | `accepted` (approve)                              |
| `reschedule_requested_by_user` | User | `accepted` (withdraw), `cancelled_by_user`              |

Terminal statuses: `rejected` · `completed` · `cancelled_by_user` · `cancelled_by_technician`

---

## 🔄 Reschedule State Machine

```
  requestReschedule  →  reschedule_requests.resolution = pending
                             order.status = reschedule_requested_by_{actor}

  approve (counterparty) →  resolution = approved
                             order.scheduled_date = proposed_scheduled_date
                             order.status = accepted

  reject (counterparty)  →  resolution = rejected
                             order.scheduled_date = original_scheduled_date
                             order.status = accepted

  withdraw (requester)   →  resolution = withdrawn
                             order.scheduled_date = original_scheduled_date
                             order.status = accepted

  24h window expires     →  resolution = auto_rejected  (lazy, on next read)
                             order.scheduled_date = original_scheduled_date
                             order.status = accepted
```

### Reschedule business rules

- Only `accepted` orders can initiate a reschedule
- Only one pending reschedule per order at a time (enforced by partial unique index)
- Proposed date must be a valid future working day for the technician (availability template + no holiday)
- Proposed date must be ≥ 48 hours from now (Cairo timezone)
- Only the counterparty can approve or reject; the requester can only withdraw
- 24-hour response window — auto-rejected lazily on the next read of that order (no cron)
- Cancelling an order with a pending reschedule auto-cancels the reschedule first

---

## 🏗️ Architecture

```
Request → orders.routes.ts / reschedule.routes.ts
              ↓
         orders.controller.ts / reschedule.controller.ts
              ↓
         orders.service.ts / reschedule.service.ts
              ↓  (reschedule mutations)
         reschedule.repository.ts   ← Supabase RPC wrappers (atomic plpgsql functions)
              ↓  (order reads)
         orders.repository.ts       ← DB queries (orders + availability_templates)
```

Single-record GET enrichment flow:
```
GET /orders/:id  →  ordersService.getUserOrderById
                        ↓ lazy import (circular-safe)
                    rescheduleService.loadAndReconcile   ← auto-rejects expired pending
                        ↓
                    ordersRepository.getOrderById        ← re-fetch after possible reconcile
                        ↓
                    { ...order, reschedule_request }     ← embedded in response
```

---

## 🔒 Business Rules

**Order creation:**
- `scheduled_date` must be today or a future date (Cairo timezone)
- User may not have an existing `pending` booking with the same technician
- Technician must have an availability template for that day of the week
- Technician must not have a holiday/exception on that specific date

**Acceptance:**
- Technician may not have more than **5 active orders** on the same `scheduled_date`
- Accepting sets `active = true`

**Deactivation:**
- `rejected`, `cancelled_by_technician`, `cancelled_by_user`, and `completed` all set `active = false`

**Cancel cascade:**
- Any `pending` reschedule request is automatically cancelled (`auto_rejected_order_cancelled`) when the parent order is cancelled by either party

---

## 🗄️ Database Tables

### `orders`

```sql
orders (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id        uuid NOT NULL REFERENCES technicians(id),
  user_id              uuid NOT NULL REFERENCES auth.users(id),
  service_id           uuid NOT NULL REFERENCES services(id),
  status               text NOT NULL DEFAULT 'pending',
  problem_description  text,
  attachment           text,
  cancellation_reason  text,
  scheduled_date       date NOT NULL,
  active               boolean NOT NULL DEFAULT false,
  created_at           timestamptz DEFAULT now()
)
```

`status` values: `pending` · `accepted` · `rejected` · `cancelled_by_user` · `cancelled_by_technician` · `completed` · `reschedule_requested_by_user` · `reschedule_requested_by_technician`

### `reschedule_requests`

```sql
reschedule_requests (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                uuid NOT NULL REFERENCES orders(id),
  requested_by            text NOT NULL CHECK (requested_by IN ('user','technician')),
  original_scheduled_date date NOT NULL,
  proposed_scheduled_date date NOT NULL,
  request_reason          text NOT NULL,
  reject_reason           text,
  resolution              text NOT NULL DEFAULT 'pending',
  response_window_hours   integer NOT NULL DEFAULT 24,
  created_at              timestamptz NOT NULL DEFAULT now(),
  resolved_at             timestamptz
)
-- Partial unique index: only one pending reschedule per order at a time
-- UNIQUE (order_id) WHERE resolution = 'pending'
```

`resolution` values: `pending` · `approved` · `rejected` · `withdrawn` · `auto_rejected` · `auto_rejected_order_cancelled`

### Supabase RPCs (plpgsql, `SECURITY DEFINER`)

| Function | Description |
|---|---|
| `reschedule_create` | Validates + inserts reschedule request, flips order status |
| `reschedule_approve` | Validates counterparty, updates date, flips order to accepted |
| `reschedule_reject` | Validates counterparty, restores date, flips order to accepted |
| `reschedule_withdraw` | Validates requester, restores date, flips order to accepted |
| `auto_reject_if_expired` | Called on read; auto-rejects if 24h window has passed |

---

## 📖 Related Modules

- **technician-calendar** — consulted during order creation and reschedule validation to check for holidays/exceptions
- **technicians** — `availability_templates` table queried to validate day-of-week availability
- **services** — `service_id` foreign key references the `services` table
- **shared/time/cairo-time** — timezone-safe date arithmetic pinned to `Africa/Cairo` (DST-safe)
