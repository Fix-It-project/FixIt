# Categories Module

Read-only access to service categories (e.g. Air Condition, Plumbing, Electrician).

## 📁 Structure

```
categories/
├── categories.repository.ts  # DB queries against `categories` table — implements ICategoriesRepository
├── categories.service.ts     # Business logic + 404 handling
├── categories.controller.ts  # HTTP request handlers
├── categories.routes.ts      # Route definitions
└── index.ts                  # Module exports
```

---

## 🌐 Endpoints

Base path: `/api/categories`

No authentication required — categories are public data.

| Method | Path   | Description              |
|--------|--------|--------------------------|
| `GET`  | `/`    | List all categories      |
| `GET`  | `/:id` | Get a single category    |

---

## 📋 Responses

### `GET /api/categories`

```json
{
  "categories": [
    { "id": "<uuid>", "name": "Air Condition", "created_at": "2026-01-01T00:00:00Z" },
    { "id": "<uuid>", "name": "Carpenter",     "created_at": "2026-01-01T00:00:00Z" }
  ]
}
```

Results are ordered alphabetically by `name`.

### `GET /api/categories/:id`

```json
{
  "category": { "id": "<uuid>", "name": "Plumbing", "created_at": "2026-01-01T00:00:00Z" }
}
```

Returns `404` if the id does not exist.

---

## 🏗️ Architecture

```
Request → categories.routes.ts
               ↓
          categories.controller.ts  ← maps HTTP, typed Request<{ id: string }>
               ↓
          categories.service.ts     ← throws 404 if category not found
               ↓
          categoriesRepository      ← DB queries (categories table)
```

---

## 🔧 Repository Interface

```typescript
interface ICategoriesRepository {
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
}
```

### `Category` type

```typescript
interface Category {
  id: string;
  name: string;
  created_at: string;
}
```

---

## 🗄️ Database Table

```sql
categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  created_at  timestamptz DEFAULT now()
)
```

---

## 📖 Related Modules

- **Technician Auth** — each technician signs up with a `category_id` foreign key referencing this table
- **Technicians** — `technicians.category_id` references `categories.id`
