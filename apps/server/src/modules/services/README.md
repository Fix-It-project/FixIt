# Services Module

Read-only access to services within a category (e.g. AC Installation, Pipe Repair).

## 📁 Structure

```
services/
├── services.repository.ts  # DB queries against `services` table — implements IServicesRepository
├── services.service.ts     # Business logic + 404 handling
├── services.controller.ts  # HTTP request handlers
├── services.routes.ts      # Route definitions (mergeParams for :categoryId)
└── index.ts                # Module exports
```

---

## 🌐 Endpoints

Base path: `/api/categories/:categoryId/services`

No authentication required — services are public data.

| Method | Path            | Description                              |
|--------|-----------------|------------------------------------------|
| `GET`  | `/`             | List all services in a category          |
| `GET`  | `/:serviceId`   | Get a single service by id               |

---

## 📋 Responses

### `GET /api/categories/:categoryId/services`

```json
{
  "services": [
    {
      "id": "<uuid>",
      "name": "AC Installation",
      "description": "Install new air conditioning unit",
      "min_price": 200,
      "max_price": 500,
      "category_id": "<uuid>",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

Results are ordered alphabetically by `name`. Returns an empty array if the category has no services.

Returns `404` if the `categoryId` does not exist.

### `GET /api/categories/:categoryId/services/:serviceId`

```json
{
  "service": {
    "id": "<uuid>",
    "name": "AC Installation",
    "description": "Install new air conditioning unit",
    "min_price": 200,
    "max_price": 500,
    "category_id": "<uuid>",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

Returns `404` if the service does not exist.

---

## 🏗️ Architecture

```
Request → services.routes.ts  (mergeParams: true — inherits :categoryId)
               ↓
          services.controller.ts  ← reads req.params.categoryId / serviceId
               ↓
          services.service.ts     ← validates category exists via ICategoriesRepository
               ↓
          servicesRepository      ← DB queries (services table)
```

### Dependency Injection

`ServicesService` receives both dependencies through the constructor:

```typescript
constructor(
  private readonly repo: IServicesRepository,
  private readonly categoriesRepo: ICategoriesRepository,
)
```

No concrete imports are used inside the class — fully testable and decoupled.

---

## 🔧 Repository Interface

```typescript
interface IServicesRepository {
  getServicesByCategoryId(categoryId: string): Promise<Service[]>;
  getServiceById(id: string): Promise<Service | null>;
}
```

### `Service` type

```typescript
interface Service {
  id: string;
  name: string;
  description: string;
  min_price: number;
  max_price: number;
  category_id: string;
  created_at: string;
}
```

---

## 🗄️ Database Table

```sql
services (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  description  text,
  min_price    int4 NOT NULL,
  max_price    int4 NOT NULL,
  category_id  uuid NOT NULL REFERENCES categories(id),
  created_at   timestamptz DEFAULT now()
)
```

---

## 📖 Related Modules

- **Categories** — parent module; `ICategoriesRepository` is injected into `ServicesService` to validate category existence
