# Technician Calendar Module

Technician calendar exposes:
- recurring weekly availability templates (now slot-based),
- per-day calendar exceptions (holidays/blocked days),
- a public schedule endpoint used by booking/reschedule UIs.

## Structure

```text
technician-calendar/
├── technician-calendar.repository.ts
├── technician-calendar.service.ts
├── technician-calendar.controller.ts
├── technician-calendar.routes.ts
└── index.ts
```

## Base Path

`/api/technician-calendar`

## Endpoints

### Public (no auth)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/public/:technicianId` | Returns `{ templates, exceptions }` for booking/reschedule clients. |

Query params:
- `from` (optional `YYYY-MM-DD`)
- `to` (optional `YYYY-MM-DD`)

### Availability Templates (technician-auth required)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/:technicianId/templates` | List templates for technician. |
| `POST` | `/:technicianId/templates` | Create/upsert template row by `(day_of_week, slot_hour)`. |
| `GET` | `/:technicianId/templates/:id` | Get one template row. |
| `PATCH` | `/:technicianId/templates/:id` | Update one template row. |
| `DELETE` | `/:technicianId/templates/:id` | Delete one template row. |

Template body fields:
- `day_of_week`: `0..6` (Sunday..Saturday)
- `slot_hour`: one of `8, 11, 14, 17, 20` (optional in request; defaults to `8` server-side)
- `active`: `boolean` (optional; default `true`)

### Calendar Exceptions (technician-auth required)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/:technicianId` | List exception days. |
| `POST` | `/:technicianId` | Create exception day. |
| `GET` | `/:technicianId/:id` | Get one exception. |
| `PATCH` | `/:technicianId/:id` | Update exception date. |
| `DELETE` | `/:technicianId/:id` | Delete exception. |

Exception body fields:
- `date`: `YYYY-MM-DD`

## Current Behavior Rules

- Template granularity is per weekday + slot (`slot_hour`), not day-wide ranges.
- Creating a template uses upsert on conflict `(technician_id, day_of_week, slot_hour)`.
- Exception date cannot be in the past.
- Only one exception row is allowed per technician per date.
- Exception creation/update is rejected if active bookings already exist on that date.
- Public schedule endpoint is the source used by native booking and reschedule flows for date/slot disabling.

## Tables Used

- `availability_templates`
  - `technician_id`
  - `day_of_week`
  - `slot_hour`
  - `active`
- `calendar_exceptions`
  - `technician_id`
  - `date`

## Notes

- Ownership is enforced in controller: a technician can only mutate their own schedule.
- Public endpoint intentionally skips auth and should only return schedule metadata (templates + exceptions).
