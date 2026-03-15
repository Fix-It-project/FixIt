# Technicians Module

Public listing and search of technicians scoped to a category, plus technician profile retrieval.

## 📁 Structure

```
technicians/
├── technicians.repository.ts  # DB operations — defines ITechnicianQueryRepository & ITechniciansRepository
├── technicians.service.ts     # Business logic — defines ITechniciansService, validates category
├── technicians.controller.ts  # HTTP handlers — depends on ITechniciansService (DIP)
├── technicians.routes.ts      # Composition root — wires all dependencies, registers routes
└── index.ts                   # Public module exports
```

Shared technician-specific helpers are grouped under `shared/utils/technicians/`:
- `parseCoords` (query parsing for `lat` / `lng`)
- `distanceKm` (geodesic distance calculation)
- `sortByDistance` (distance-first sorting)

---

## 🌐 Endpoints

Base paths:
- `/api/categories/:categoryId/technicians`
- `/api/technicians`

Category listing/search endpoints are public.  
Profile endpoint requires authenticated user.

| Method | Path                                      | Query params                                  | Description                                    |
|--------|-------------------------------------------|-----------------------------------------------|------------------------------------------------|
| `GET`  | `/api/categories/:categoryId/technicians` | `lat` (number, optional), `lng` (number, optional) | List all technicians in a category             |
| `GET`  | `/api/categories/:categoryId/technicians/search` | `q` (string, required), `lat` (number, optional), `lng` (number, optional) | Search technicians by name within the category |
| `GET`  | `/api/technicians/:id/profile`            | —                                             | Get technician profile by id                   |

Category endpoints return `404` if the `categoryId` does not exist.  
`/search` returns `400` if the `q` parameter is missing or empty.  
`/api/technicians/:id/profile` returns `404` if technician is not found.

### List response — `GET /`

```json
{
  "technicians": [
    {
      "id": "<uuid>",
      "first_name": "Ahmed",
      "last_name": "Hassan",
      "email": "ahmed@example.com",
      "phone": "+201234567890",
      "is_available": true,
      "category_id": "<uuid>",
      "city": "Cairo",
      "street": "Tahrir St.",
      "distance_km": 3.2
    }
  ]
}
```

### Search response — `GET /search?q=ahmed`

Same shape as above, filtered to technicians whose `first_name` or `last_name` matches the query (case-insensitive `ilike`).  
If `lat` and `lng` are provided, `distance_km` is computed and results are sorted by nearest distance.  
Without coordinates, DB ordering by `first_name` is preserved.

---

## 🏗️ Architecture

```
technicians.routes.ts   ← Composition root
│  creates: TechniciansRepository, CategoriesRepository
│  creates: TechniciansService(repo, categoriesRepo)
│  creates: TechniciansController(service)
│
├─ GET /           → controller.getByCategoryId()
└─ GET /search     → controller.searchInCategory()
technicianProfileRoutes
└─ GET /:id/profile → controller.getProfile()
        │
        ▼
TechniciansController
  depends on: ITechniciansService
  uses: parseCoords() from shared/utils/technicians
        │
        ▼
TechniciansService
  depends on: ITechnicianQueryRepository   (narrow — only listing & search)
  depends on: ICategoriesRepository        (validates category existence)
  uses: sortByDistance() from shared/utils/technicians
        │
        ▼
TechniciansRepository   (implements both ITechnicianQueryRepository & ITechniciansRepository)
  uses: distanceKm() from shared/utils/technicians
  ── supabaseAdmin ──▶ technicians table
```

All dependencies flow through constructor injection; no layer imports a concrete class from another layer.

---

## 🔧 Interfaces

### `ITechnicianQueryRepository` (narrow — ISP)
Used exclusively by `TechniciansService`.

```typescript
interface ITechnicianQueryRepository {
  getTechniciansByCategory(categoryId: string): Promise<any[]>;
  searchTechniciansByCategory(categoryId: string, query: string): Promise<any[]>;
  getTechnicianProfile(id: string): Promise<any | null>;
}
```

### `ITechniciansRepository` (full CRUD — extends the query interface)
Used by modules that manage technician records (e.g. `technician-auth`).

```typescript
interface ITechniciansRepository extends ITechnicianQueryRepository {
  createTechnician(data: CreateTechnicianData): Promise<any>;
  getTechnicianById(id: string): Promise<any>;
  getTechnicianByEmail(email: string): Promise<any>;
  emailExists(email: string): Promise<boolean>;
  updateTechnician(id: string, data: UpdateTechnicianData): Promise<any>;
  deleteTechnician(id: string): Promise<void>;
}
```

### `ITechniciansService`
Depended on by `TechniciansController`.

```typescript
interface ITechniciansService {
  getTechniciansByCategory(categoryId: string, userLat?: number, userLng?: number): Promise<any[]>;
  searchTechniciansByCategory(categoryId: string, query: string, userLat?: number, userLng?: number): Promise<any[]>;
  getTechnicianProfile(id: string): Promise<any>;
}
```

---

## 🗄️ Database Table

```sql
technicians (
  id                 uuid PRIMARY KEY,   -- matches auth.users.id
  first_name         text NOT NULL,
  last_name          text NOT NULL,
  email              text NOT NULL UNIQUE,
  phone              text,
  is_available       boolean DEFAULT false,
  category_id        uuid REFERENCES categories(id),
  criminal_record    text,               -- Supabase Storage public URL
  birth_certificate  text,               -- Supabase Storage public URL
  national_id        text,               -- Supabase Storage public URL
  created_at         timestamptz DEFAULT now()
)
```

---

## 📝 Notes

- All DB operations use `supabaseAdmin` (service role) to bypass RLS.
- `is_available` is always `false` on creation — technicians must be verified before activation.
- `emailExists()` uses a `count` query with `head: true` — no rows are fetched.
- Document URL columns store public Supabase Storage URLs uploaded during signup by `StorageRepository`.
- Search uses Supabase `ilike` (case-insensitive) on both `first_name` and `last_name` combined with `or`.
- `lat` and `lng` are parsed from query params; when valid, `distance_km` is computed per technician active address.
- Distance sorting uses `sortByDistance` and pushes missing distances to the end.

---

## 📖 Related Modules

- **Technician Auth** — signup/signin flow that calls `createTechnician()` via `ITechniciansRepository`
- **Categories** — `ICategoriesRepository` injected into `TechniciansService` to validate category existence
- **Storage** — `shared/storage/storage.repository.ts` — uploads document files during signup
