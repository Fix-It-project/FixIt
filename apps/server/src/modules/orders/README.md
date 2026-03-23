# Orders Module

Manages the full lifecycle of a service booking — from creation through acceptance, completion, or cancellation.

## 📁 Structure

```
orders/
├── orders.repository.ts  # DB queries against `orders` table
├── orders.service.ts     # Business logic, state machine, validation
├── orders.controller.ts  # HTTP request handlers
├── orders.routes.ts      # Route definitions (user + technician namespaces)
└── index.ts              # Module exports
```

---

## 🌐 Endpoints

Base path: `/api/orders`

### User routes — requires `requireUserAuth`

| Method  | Path                  | Description                        |
|---------|-----------------------|------------------------------------|
| `POST`  | `/user/orders`        | Create a new order (status: pending) |
| `GET`   | `/user/orders`        | List all orders for the logged-in user |
| `GET`   | `/user/orders/:id`    | Get a single order by id           |
| `PATCH` | `/user/orders/:id`    | Cancel an order `{ cancel: true }` |

### Technician routes — requires `requireTechnicianAuth`

| Method  | Path                       | Description                            |
|---------|----------------------------|----------------------------------------|
| `GET`   | `/technician/orders`       | List all orders for the logged-in technician |
| `GET`   | `/technician/orders/:id`   | Get a single order by id               |
| `PATCH` | `/technician/orders/:id`   | Update order status (see state machine) |

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

`cancellation_reason` is optional. Returns `400` if the order is not in a cancellable state (`pending` or `accepted`).

### `PATCH /api/orders/technician/orders/:id` — update status

```json
{ "status": "accepted" }
```

For `rejected` and `cancelled_by_technician` a reason can be provided:

```json
{ "status": "rejected", "cancellation_reason": "Outside service area" }
```

Valid values: `accepted` · `rejected` · `cancelled_by_technician` · `completed`

`cancellation_reason` is optional and saved as-is whenever provided, regardless of the transition.

Returns `400` if the transition is not allowed (see state machine below).
Returns `409` if accepting would exceed the 5 active-orders-per-day limit.

### Order object

```json
{
  "id": "<uuid>",
  "technician_id": "<uuid>",
  "user_id": "<uuid>",
  "service_id": "<uuid>",
  "status": "pending",
  "problem_description": "AC not cooling",
  "attachment": "https://…/order attachment/{orderId}/attachment.jpg",
  "cancellation_reason": null,
  "scheduled_date": "2026-04-10",
  "active": false,
  "created_at": "2026-03-23T10:00:00Z"
}
```

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
           │   accepted   │              │    rejected    │
           │  active=true │              │  active=false  │
           └──┬───────┬───┘              └────────────────┘
   complete ▼ │       │ cancel (tech)
              │       ▼
              │  ┌────────────────────────┐
              │  │ cancelled_by_technician│
              │  │      active=false      │
              │  └────────────────────────┘
              ▼
       ┌──────────────┐
       │  completed   │
       │ active=false │
       └──────────────┘

  User can cancel from: pending or accepted → cancelled_by_user (active=false)
```

### Transition table

| Current status | Actor      | Allowed transitions                               |
|----------------|------------|---------------------------------------------------|
| `pending`      | Technician | `accepted`, `rejected`                            |
| `accepted`     | Technician | `completed`, `cancelled_by_technician`            |
| `pending`      | User       | `cancelled_by_user`                               |
| `accepted`     | User       | `cancelled_by_user`                               |
| any terminal   | —          | No further transitions allowed                    |

Terminal statuses: `rejected` · `completed` · `cancelled_by_user` · `cancelled_by_technician`

---

## 🏗️ Architecture

```
Request → orders.routes.ts         (multer parses multipart/form-data on POST)
              ↓
         orders.controller.ts      ← extracts req.user / req.technician / req.file
              ↓
         orders.service.ts         ← state machine, business rules, capacity checks
              ↓  (if file present)
         storageRepository         ← uploads to ORDER_BUCKET, returns public URL
              ↓
         orders.repository.ts      ← DB queries (orders + availability_templates tables)
```

---

## 🔒 Business Rules

**Order creation:**
- `scheduled_date` must be today or a future date
- User may not have an existing `pending` booking with the same technician
- Technician must have an availability template for that day of the week
- Technician must not have a holiday/exception on that specific date (via `technician-calendar` module)

**Acceptance:**
- Technician may not have more than **5 active orders** on the same `scheduled_date`
- Accepting sets `active = true`

**Deactivation:**
- `rejected`, `cancelled_by_technician`, `cancelled_by_user`, and `completed` all set `active = false`
- Only `accepted` orders count toward the daily capacity limit

---

## 🗄️ Database Table

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

`status` is one of: `pending` · `accepted` · `rejected` · `cancelled_by_user` · `cancelled_by_technician` · `completed`

`cancellation_reason` is `null` until a cancellation/rejection occurs; set by either party at that point.

`attachment` is `null` when no file was uploaded at order creation.

---

## 📖 Related Modules

- **technician-calendar** — consulted during order creation to check for holidays/exceptions
- **technicians** — `availability_templates` table queried to validate day-of-week availability
- **services** — `service_id` foreign key references the `services` table
