# Orders Module

The orders module owns booking reads, legacy order mutations, reschedule
requests, and the newer lifecycle command surface backed by Supabase RPCs.
The database source of truth for the current lifecycle is
`supabase/migrations/20260512000000_order_state_machine_phase1_lean.sql`.

## Structure

```text
orders/
├── orders.routes.ts              # Mounts legacy, reschedule, and lifecycle routes
├── orders.controller.ts          # Legacy list/detail/create/PATCH handlers
├── orders.service.ts             # Legacy service orchestration and uploads
├── orders.repository.ts          # Order reads and legacy DB writes
├── reschedule.routes.ts          # Reschedule endpoints
├── reschedule.controller.ts      # Reschedule HTTP handlers
├── reschedule.service.ts         # Reschedule orchestration
├── reschedule.repository.ts      # Reschedule RPC wrappers
├── lifecycle/
│   ├── lifecycle.routes.ts       # Explicit lifecycle verb routes
│   ├── lifecycle.controller.ts   # Thin lifecycle HTTP handlers
│   ├── lifecycle.service.ts      # Lifecycle orchestration and derived reads
│   ├── lifecycle.repository.ts   # Supabase RPC wrappers
│   ├── legacy-patch-shim.ts      # Maps old PATCH verbs to lifecycle RPCs
│   └── README.md                 # Detailed DB lifecycle contract
└── index.ts
```

## Route Surfaces

Base path: `/api/orders`

### Legacy User Routes

These routes remain for compatibility with the existing native screens.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/user/orders` | Create an order. Uses the lifecycle `rpc_submit_order` path internally. |
| `GET` | `/user/orders` | List the authenticated user's orders. |
| `GET` | `/user/orders/:id` | Read one order with latest reschedule summary. |
| `PATCH` | `/user/orders/:id` | Legacy cancel shape: `{ "cancel": true }`. |

### Legacy Technician Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/technician/orders` | List the authenticated technician's orders. |
| `GET` | `/technician/orders/:id` | Read one assigned order. |
| `PATCH` | `/technician/orders/:id` | Legacy status update shim for accept/decline/cancel/complete. |

### Reschedule Routes

Available under both `/user/orders/:id/reschedule...` and
`/technician/orders/:id/reschedule...`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/:role/orders/:id/reschedule` | Request a new date. |
| `POST` | `/:role/orders/:id/reschedule/approve` | Counterparty approves. |
| `POST` | `/:role/orders/:id/reschedule/reject` | Counterparty rejects with reason. |
| `POST` | `/:role/orders/:id/reschedule/withdraw` | Requester withdraws. |

### Lifecycle Routes

These are the preferred explicit command routes. User routes use
`requireUserAuth`; technician routes use `requireTechnicianAuth`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/user/orders/:id/cancel` | User cancellation through `rpc_cancel_order`. |
| `POST` | `/user/orders/:id/quotes` | User counter quote. |
| `POST` | `/user/orders/:id/quotes/:quoteId/accept` | User accepts technician quote. |
| `POST` | `/user/orders/:id/confirm-completion` | User marks work complete. |
| `POST` | `/user/orders/:id/decline-completion` | User rejects or withdraws a pending completion mark. |
| `POST` | `/user/orders/:id/checkout` | User chooses payment method. Currently cash-only at DTO layer. |
| `GET` | `/user/orders/:id/events` | Paginated event log. |
| `GET` | `/user/orders/:id/quotes` | Quote history. |
| `GET` | `/user/orders/:id/distance` | Distance, ETA, and geofence flag. |
| `POST` | `/technician/orders/:id/accept` | Technician accepts pending order. |
| `POST` | `/technician/orders/:id/decline` | Technician declines pending order. |
| `POST` | `/technician/orders/:id/cancel` | Technician cancels an active order. |
| `POST` | `/technician/orders/:id/start-tracking` | Begin travel to destination. |
| `POST` | `/technician/orders/:id/location` | Upsert tracking point; may record arrival. |
| `POST` | `/technician/orders/:id/start-inspection` | Start inspection after arrival/geofence pass. |
| `POST` | `/technician/orders/:id/finish-inspection` | Move to final-cost negotiation. |
| `POST` | `/technician/orders/:id/quotes` | Technician submits quote or counter quote. |
| `POST` | `/technician/orders/:id/quotes/:quoteId/accept` | Technician accepts user quote. |
| `POST` | `/technician/orders/:id/confirm-completion` | Technician marks work complete. |
| `POST` | `/technician/orders/:id/decline-completion` | Technician rejects or withdraws a pending completion mark. |
| `POST` | `/technician/orders/:id/mark-cash-received` | Technician confirms cash payment. |
| `GET` | `/technician/orders/:id/events` | Paginated event log. |
| `GET` | `/technician/orders/:id/quotes` | Quote history. |
| `GET` | `/technician/orders/:id/distance` | Distance, ETA, and geofence flag. |

## Request Shapes

### Create Order

`POST /api/orders/user/orders` accepts JSON or `multipart/form-data` for legacy
compatibility. The current controller forwards body fields to
`lifecycleService.submitOrder`; multipart files are not uploaded by this shim.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `technician_id` | UUID | yes | Assigned technician. |
| `service_id` | UUID | yes | Requested service. |
| `scheduled_date` | `YYYY-MM-DD` | yes | Booking date. |
| `scheduled_start_at` | ISO datetime | no | Optional start time. |
| `destination_address_id` | UUID | no | If omitted, lifecycle service uses the user's active address. |
| `problem_description` | string | no | Max 1000 chars on lifecycle DTO. |
| `attachment` | file/string URL | no | The route accepts the field, but the current lifecycle create shim does not upload or forward files. |

The RPC verifies that `destination_address_id` belongs to the user. In the
lean migration, unpaid fee obligations block order submission unless the
temporary testing override migration has been applied.

### Lifecycle Bodies

| Route family | Body |
| --- | --- |
| `/cancel`, `/decline` | `{ "reason": "optional, max 500 chars" }` |
| `/quotes` | `{ "amount": 150, "notes": "optional" }` |
| `/checkout` | `{ "method": "cash" }` |
| `/location` | `{ "latitude": 30.0, "longitude": 31.0, "heading": 90, "accuracy": 12 }` |
| `/confirm-completion`, `/decline-completion`, `/accept`, `/start-*`, `/mark-cash-received` | Empty body |

## Current Order State Machine

The active lifecycle states are:

```text
pending
  ├─ tech_accept -> accepted
  └─ tech_decline -> declined_by_technician

accepted
  ├─ tech_start_tracking -> tracking
  ├─ reschedule_create -> reschedule_requested_by_user|technician
  └─ cancel -> cancelled_no_fee

tracking
  ├─ location ping within 1km -> arrived_at + tech_arrived event
  ├─ tech_start_inspection -> arrived_inspection
  └─ cancel -> cancelled_no_fee

arrived_inspection
  ├─ tech_finish_inspection -> awaiting_final_cost
  └─ user cancel -> cancelled_with_fee

awaiting_final_cost
  ├─ technician quote -> negotiating
  └─ cancel -> cancelled_with_fee

negotiating
  ├─ quote/counter quote up to round 5
  ├─ accept quote -> in_progress
  └─ cancel -> cancelled_with_fee

in_progress
  ├─ one party confirm -> stays in_progress with *_completed_at set
  ├─ other party decline/withdraw -> clears one *_completed_at
  ├─ both parties confirm -> awaiting_payment
  └─ cancel -> cancelled_with_fee

awaiting_payment
  ├─ choose cash -> payment row created
  ├─ mark cash received -> completed
  └─ future card flow -> completed after PSP success
```

Terminal statuses are `completed`, `declined_by_technician`,
`cancelled_no_fee`, and `cancelled_with_fee`. Legacy compatibility statuses
still exist in the database enum for older code paths:
`rejected`, `cancelled`, `cancelled_by_user`, `cancelled_by_technician`,
`reschedule_requested_by_user`, and `reschedule_requested_by_technician`.

## Database Tables

The lean migration extends `orders` with lifecycle snapshot columns:

| Column | Purpose |
| --- | --- |
| `status public.order_status` | Canonical enum status. |
| `active boolean` | Compatibility projection maintained by trigger. |
| `destination_address_id` | Address used for geofence and destination validation. |
| `scheduled_start_at` | Optional precise booking start time. |
| `arrived_at` | First time technician enters the 1km destination geofence. |
| `final_price` | Accepted quote amount. |
| `payment_method` | `cash` or `card`; DTO currently allows cash only. |
| `user_completed_at` | User completion confirmation timestamp. |
| `technician_completed_at` | Technician completion confirmation timestamp. |

Lifecycle support tables:

| Table | Purpose |
| --- | --- |
| `order_events` | Append-only audit trail for lifecycle events. |
| `order_locations` | Latest technician location per active tracking order. |
| `order_quotes` | Quote and counter-quote rounds, capped at 5. |
| `payments` | Payment attempt records and cash confirmation state. |
| `user_fee_obligations` | Inspection cancellation fees for user cancellations after arrival/inspection. |
| `reschedule_requests` | Existing reschedule workflow, preserved and enum-compatible. |

See `lifecycle/README.md` for the full database contract: every index, trigger,
RPC, helper function, RLS policy, realtime publication entry, and permission
rule.

## Architecture

```text
Request
  -> orders.routes.ts
    -> legacy orders.controller.ts / reschedule.controller.ts / lifecycle.controller.ts
      -> service layer
        -> repository layer
          -> Supabase tables or lifecycle/reschedule RPCs
```

Lifecycle writes should flow through `lifecycle.repository.ts` and the
database RPCs. Controllers should not query Supabase directly except for the
documented read-only lifecycle sub-resources (`events`, `quotes`, `distance`)
where the controller first asserts order ownership.

## Business Rules To Keep In Mind

- Native clients must not spoof actor IDs; lifecycle RPCs are `SECURITY DEFINER`
  and execute permission is revoked from `anon` and `authenticated`.
- Service-role backend calls remain the write path for lifecycle mutations.
- Direct native Supabase reads are limited by RLS policies on `orders`,
  `order_quotes`, and `order_locations`.
- A technician can only have one in-flight active lifecycle order from
  `tracking` through `awaiting_payment`.
- A technician cannot start a later accepted booking while an earlier accepted
  or in-flight booking remains unfinished.
- Location writes are only valid while the order is `tracking`.
- Inspection can start only after a `tech_arrived` event and a fresh distance
  check within 1km.
- Quote rounds alternate technician/user and stop after round 5.
- Completion requires both parties unless smoke auto-finalization is enabled.
- `LIFECYCLE_SMOKE_AUTO_COMPLETE` defaults on; set it to `false` to disable
  cash auto-finalization during development.

## Related Modules

- `technician-calendar` supplies holidays/calendar exceptions.
- `technicians` owns availability templates and technician fees.
- `services` owns service/category data referenced by orders.
- `shared/dtos/lifecycle.dto.ts` defines lifecycle request schemas.
- `shared/errors/app-error.ts` receives mapped lifecycle RPC error tokens.
