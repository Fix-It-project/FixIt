# Addresses Module

Address CRUD for users and technicians.

## 📁 Structure

```
addresses/
├── addresses.repository.ts  # DB operations against `addresses` table — implements IAddressesRepository
├── addresses.service.ts     # Address business logic
├── addresses.controller.ts  # HTTP request handlers
├── addresses.routes.ts      # API endpoint definitions
└── index.ts                 # Module exports
```

---

## 🌐 Endpoints

Base path: `/api/addresses`

### User endpoints

Require `Authorization: Bearer <access_token>` — validated by `requireUserAuth` middleware.

| Method   | Path                         | Description                  |
|----------|------------------------------|------------------------------|
| `GET`    | `/user/addresses`            | List all addresses for user  |
| `POST`   | `/user/addresses`            | Add a new address            |
| `PUT`    | `/user/addresses/:id`        | Update an address            |
| `DELETE` | `/user/addresses/:id`        | Delete an address            |

### Technician endpoints

Require `Authorization: Bearer <access_token>` — validated by `requireTechnicianAuth` middleware.

| Method   | Path                         | Description                          |
|----------|------------------------------|--------------------------------------|
| `GET`    | `/technician/addresses`      | List all addresses for technician    |
| `POST`   | `/technician/addresses`      | Add a new address                    |
| `PUT`    | `/technician/addresses/:id`  | Update an address                    |
| `DELETE` | `/technician/addresses/:id`  | Delete an address                    |

---

## 📋 Request Bodies

### Add address (POST)

```json
{
  "city": "Cairo",
  "street": "El-Tahrir St",
  "building_no": "15",
  "apartment_no": "3A",
  "latitude": 30.0444,
  "longitude": 31.2357
}
```

### Update address (PUT)

All fields optional — include only those to change.

```json
{
  "city": "Giza",
  "street": "Pyramids Rd",
  "building_no": "7",
  "apartment_no": "2B",
  "latitude": 29.9773,
  "longitude": 31.1325
}
```

---

## 🏗️ Architecture

```
Request → addresses.routes.ts  (requireUserAuth / requireTechnicianAuth)
               ↓   req.user.id or req.technician.id available
          addresses.controller.ts   ← reads owner id from req, maps HTTP
               ↓
          addresses.service.ts      ← orchestrates, enforces business rules
               ↓
          addressesRepository       ← DB queries (addresses table)
```

### Ownership model

- User addresses: stored with `user_id` set; `technician_id` is `null`
- Technician addresses: stored with `technician_id` set; `user_id` is `null`
- A row can belong to exactly one owner type

---

## 🔧 Type System

```typescript
// Shared address fields
interface AddressFields {
  city: string;
  street: string;
  building_no: string;
  apartment_no?: string;
  latitude?: number;
  longitude?: number;
}

// Discriminated union used in the repository
type CreateAddressData =
  | CreateUserAddressData
  | CreateTechnicianAddressData;

interface CreateUserAddressData extends AddressFields {
  user_id: string;
}

interface CreateTechnicianAddressData extends AddressFields {
  technician_id: string;
}

// Used during signup flows (no owner id yet)
type SignUpAddressData = AddressFields;

interface UpdateAddressData {
  city?: string;
  street?: string;
  building_no?: string;
  apartment_no?: string;
  latitude?: number;
  longitude?: number;
}
```

---

## 🔧 Repository Interface

```typescript
interface IAddressesRepository {
  createAddress(data: CreateAddressData): Promise<any>;
  getUserAddresses(userId: string): Promise<any[]>;
  getTechnicianAddresses(technicianId: string): Promise<any[]>;
  updateAddress(id: string, data: UpdateAddressData): Promise<any>;
  deleteAddress(id: string): Promise<void>;
  getAddressById(id: string): Promise<any>;
  countUserAddresses(userId: string): Promise<number>;
  countTechnicianAddresses(technicianId: string): Promise<number>;
}
```

---

## 🗄️ Database Table

```sql
addresses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES users(id),
  technician_id  uuid REFERENCES technicians(id),
  city           text NOT NULL,
  street         text NOT NULL,
  building_no    text NOT NULL,
  apartment_no   text,
  latitude       numeric,
  longitude      numeric,
  created_at     timestamptz DEFAULT now()
)
```

---

## 📝 Business Rules

- A user/technician must have **at least one address** — the last address cannot be deleted.
  - `DELETE` returns `400` if a count check finds only 1 remaining address.
- Ownership is enforced by the middleware; the controller reads `req.user.id` or `req.technician.id` and passes it to the service — no id is accepted from the request body.
- `PUT` and `DELETE` operations verify the address belongs to the authenticated owner before proceeding.

---

## 📖 Related Modules

- **Auth** — creates first user address during signup via `createAddress({ user_id, ...addressData })`
- **Technician Auth** — creates first technician address during signup via `createAddress({ technician_id, ...addressData })`
- **Users** — `GET /api/users/profile` embeds all user addresses inline
- **Middleware** — `requireUserAuth` / `requireTechnicianAuth` in `shared/middlewares/`
