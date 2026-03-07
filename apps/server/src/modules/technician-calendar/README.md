# Technician Calendar Module

Handles availability templates and calendar entries for technicians.

## 📁 Structure

```
technician-calendar/
├── technician-calendar.repository.ts  # Supabase queries — implements all DB access
├── technician-calendar.service.ts     # Business logic / validation / orchestration
├── technician-calendar.controller.ts  # HTTP request/response handlers
├── technician-calendar.routes.ts      # Express routes
└── index.ts                           # Re-exports
```

---

## 🌐 Endpoints

Base path: `/api/technician-calendar`

### 📅 Calendar Entries

| Method   | Path                                              | Auth Required | Description                   |
| -------- | ------------------------------------------------- | ------------- | ----------------------------- |
| `GET`    | [/:technicianId](http://_vscodecontentref_/1)     | Yes (Bearer)  | Get all calendar entries      |
| `POST`   | [/:technicianId](http://_vscodecontentref_/2)     | Yes (Bearer)  | Create a new calendar entry   |
| `GET`    | [/:technicianId/:id](http://_vscodecontentref_/3) | Yes (Bearer)  | Get a specific calendar entry |
| `PATCH`  | [/:technicianId/:id](http://_vscodecontentref_/4) | Yes (Bearer)  | Update a calendar entry       |
| `DELETE` | [/:technicianId/:id](http://_vscodecontentref_/5) | Yes (Bearer)  | Delete a calendar entry       |

### 🗓️ Availability Templates

| Method   | Path                                                         | Auth Required | Description                        |
| -------- | ------------------------------------------------------------ | ------------- | ---------------------------------- |
| `GET`    | [/:technicianId/templates](http://_vscodecontentref_/6)      | Yes (Bearer)  | Get all availability templates     |
| `POST`   | [/:technicianId/templates](http://_vscodecontentref_/7)      | Yes (Bearer)  | Create a new availability template |
| `GET`    | [/:technicianId/templates/:id](http://_vscodecontentref_/8)  | Yes (Bearer)  | Get a specific template            |
| `PATCH`  | [/:technicianId/templates/:id](http://_vscodecontentref_/9)  | Yes (Bearer)  | Update a template                  |
| `DELETE` | [/:technicianId/templates/:id](http://_vscodecontentref_/10) | Yes (Bearer)  | Delete a template                  |

---

## 📅 Calendar Entries

### GET [/:technicianId](http://_vscodecontentref_/11) — Get Calendar

Query parameters:

| Param                                | Type     | Required | Description                            |
| ------------------------------------ | -------- | -------- | -------------------------------------- |
| [from](http://_vscodecontentref_/12) | ISO 8601 | ❌       | Filter entries starting from this time |
| [to](http://_vscodecontentref_/13)   | ISO 8601 | ❌       | Filter entries up to this time         |
| [type](http://_vscodecontentref_/14) | string   | ❌       | Filter by type: `booking` or `blocked` |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "technician_id": "uuid",
      "time_range": "[2026-03-09T09:00:00Z,2026-03-09T11:00:00Z)",
      "type": "booking",
      "source": null,
      "created_at": "2026-03-07T10:00:00Z"
    }
  ]
}
```

---

### POST [/:technicianId](http://_vscodecontentref_/15) — Create Calendar Entry

**Request body:**

| Field                                  | Type     | Required | Description            |
| -------------------------------------- | -------- | -------- | ---------------------- |
| [start](http://_vscodecontentref_/16)  | ISO 8601 | ✅       | Entry start datetime   |
| [end](http://_vscodecontentref_/17)    | ISO 8601 | ✅       | Entry end datetime     |
| [type](http://_vscodecontentref_/18)   | string   | ✅       | `booking` or `blocked` |
| [source](http://_vscodecontentref_/19) | string   | ❌       | Origin of the entry    |

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "technician_id": "uuid",
    "time_range": "[2026-03-09T09:00:00Z,2026-03-09T11:00:00Z)",
    "type": "booking",
    "source": null,
    "created_at": "2026-03-07T10:00:00Z"
  }
}
```

**Validations:**

- [start](http://_vscodecontentref_/20) must be **after today** (today is rejected)
- [start](http://_vscodecontentref_/21) must be before [end](http://_vscodecontentref_/22)
- Entry must fall **within the technician's availability template** for that day
- A **3-hour buffer** is automatically created before and after the entry with [source: "blocking as defined"](http://_vscodecontentref_/23)
- Entry must not conflict with existing entries including their buffer zones

---

### PATCH [/:technicianId/:id](http://_vscodecontentref_/24) — Update Calendar Entry

**Request body (all optional):**

| Field                                  | Type     | Description            |
| -------------------------------------- | -------- | ---------------------- |
| [start](http://_vscodecontentref_/25)  | ISO 8601 | New start datetime     |
| [end](http://_vscodecontentref_/26)    | ISO 8601 | New end datetime       |
| [type](http://_vscodecontentref_/27)   | string   | `booking` or `blocked` |
| [source](http://_vscodecontentref_/28) | string   | Origin of the entry    |

> **Note:** [start](http://_vscodecontentref_/29) and [end](http://_vscodecontentref_/30) must always be provided **together**.

---

## 🗓️ Availability Templates

Templates define when a technician is available. There are two types:

| Type          | Description                                                                                |
| ------------- | ------------------------------------------------------------------------------------------ |
| **Recurring** | Repeats every week on a given [day_of_week](http://_vscodecontentref_/31)                  |
| **One-time**  | Applies to a single [specific_date](http://_vscodecontentref_/32) only (exception/holiday) |

**Priority:** If a one-time template exists for a date, it **overrides** the recurring template for that day.

---

### GET [/:technicianId/templates](http://_vscodecontentref_/33) — Get Templates

Query parameters:

| Param                                      | Type    | Default | Description                        |
| ------------------------------------------ | ------- | ------- | ---------------------------------- |
| [activeOnly](http://_vscodecontentref_/34) | boolean | `true`  | If `false`, includes inactive days |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "technician_id": "uuid",
      "day_of_week": 1,
      "time_range": "[09:00:00,17:00:00)",
      "active": true,
      "is_one_time": false,
      "specific_date": null
    }
  ]
}
```

---

### POST [/:technicianId/templates](http://_vscodecontentref_/35) — Create Template

**Request body:**

| Field                                         | Type       | Required                                          | Description                               |
| --------------------------------------------- | ---------- | ------------------------------------------------- | ----------------------------------------- |
| [day_of_week](http://_vscodecontentref_/36)   | integer    | ✅                                                | `0` (Sun) – `6` (Sat)                     |
| [start](http://_vscodecontentref_/37)         | HH:MM:SS   | ✅ (unless day off)                               | Start time                                |
| [end](http://_vscodecontentref_/38)           | HH:MM:SS   | ✅ (unless day off)                               | End time                                  |
| [active](http://_vscodecontentref_/39)        | boolean    | ❌ (default: `true`)                              | Set `false` to mark the entire day as off |
| [is_one_time](http://_vscodecontentref_/40)   | boolean    | ❌ (default: `false`)                             | Set `true` for a one-time exception       |
| [specific_date](http://_vscodecontentref_/41) | YYYY-MM-DD | ✅ if [is_one_time](http://_vscodecontentref_/42) | The specific date for the exception       |

**Validations:**

- Only **one template per [day_of_week](http://_vscodecontentref_/43)** allowed (recurring)
- Only **one template per [specific_date](http://_vscodecontentref_/44)** allowed (one-time)
- [specific_date](http://_vscodecontentref_/45) must be in the **future**
- If [active: false](http://_vscodecontentref_/46) and [is_one_time: true](http://_vscodecontentref_/47) → full day off, [start](http://_vscodecontentref_/48)/[end](http://_vscodecontentref_/49) are ignored
- [start](http://_vscodecontentref_/50) must be before [end](http://_vscodecontentref_/51)

---

### PATCH [/:technicianId/templates/:id](http://_vscodecontentref_/52) — Update Template

**Request body (all optional):**

| Field                                         | Type       | Description                           |
| --------------------------------------------- | ---------- | ------------------------------------- |
| [day_of_week](http://_vscodecontentref_/53)   | integer    | Change recurring day (0–6)            |
| [start](http://_vscodecontentref_/54)         | HH:MM:SS   | Update start time                     |
| [end](http://_vscodecontentref_/55)           | HH:MM:SS   | Update end time                       |
| [active](http://_vscodecontentref_/56)        | boolean    | Toggle day on/off                     |
| [specific_date](http://_vscodecontentref_/57) | YYYY-MM-DD | Change exception date (one-time only) |

**Validations:**

- Cannot update [start](http://_vscodecontentref_/58), [end](http://_vscodecontentref_/59), or [day_of_week](http://_vscodecontentref_/60) on an **inactive recurring** template — re-activate it first
- Cannot change [day_of_week](http://_vscodecontentref_/61) or [specific_date](http://_vscodecontentref_/62) to one that already has a template

---

## 🏗️ Architecture

```
Request → technician-calendar.routes.ts
                ↓
          technician-calendar.controller.ts
                ↓
          technician-calendar.service.ts
           ↓                        ↓
    (validation logic)    technician-calendar.repository.ts
                                    ↓
                              Supabase (DB)
```

---

## 📋 Business Rules Summary

| Rule                         | Details                                                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| No past scheduling           | Entries cannot be created on today or in the past                                                                                      |
| Template required            | Entries can only be created on days with an active template                                                                            |
| Within working hours         | Entry [start](http://_vscodecontentref_/63)/[end](http://_vscodecontentref_/64) must fall within the template's time range             |
| 3-hour buffer                | Two `blocked` slots ([source: "blocking as defined"](http://_vscodecontentref_/65)) are auto-created 3hrs before and after every entry |
| One template per day         | Only one recurring template per [day_of_week](http://_vscodecontentref_/66) per technician                                             |
| One exception per date       | Only one one-time template per [specific_date](http://_vscodecontentref_/67) per technician                                            |
| One-time overrides recurring | If a one-time template exists for a date, it takes priority                                                                            |
| Inactive day                 | [active: false](http://_vscodecontentref_/68) on a template blocks the entire day                                                      |

---

## 📖 Related Modules

- **Technician Auth** — authentication — `POST /api/technician-auth/signin`
- **Middleware** — [requireTechnicianAuth](http://_vscodecontentref_/69) in `shared/middlewares/technician-auth.middleware.ts`
- **Supabase Tables** — `technician_calendar`, `availability_templates`
