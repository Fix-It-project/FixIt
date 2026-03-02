# Users Module

User profile read and update for authenticated users.

## 📁 Structure

```
users/
├── user-auth.repository.ts  # DB operations against `users` table — implements IUsersRepository
├── users.service.ts         # Profile business logic
├── users.controller.ts      # HTTP request handlers
├── users.routes.ts          # API endpoint definitions
└── index.ts                 # Module exports
```

## 🌐 Endpoints

Base path: `/api/users`

All endpoints require `Authorization: Bearer <access_token>` — validated by `requireUserAuth` middleware.

| Method | Path       | Description                                 |
|--------|------------|---------------------------------------------|
| `GET`  | `/profile` | Get current user profile + all addresses    |
| `PUT`  | `/profile` | Update `full_name`, `email`, and/or `phone` |

---

## 👤 Get Profile

```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

### Response `200`

```json
{
  "profile": {
    "id": "<uuid>",
    "email": "john@example.com",
    "full_name": "John Doe",
    "phone": "+201234567890",
    "created_at": "2026-03-01T10:00:00Z",
    "addresses": [
      {
        "id": "<uuid>",
        "user_id": "<uuid>",
        "city": "Cairo",
        "street": "El-Tahrir St",
        "building_no": "15",
        "apartment_no": "3A",
        "latitude": 30.0444,
        "longitude": 31.2357,
        "created_at": "2026-03-01T10:00:00Z"
      }
    ]
  }
}
```

---

## ✏️ Update Profile

```http
PUT /api/users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "full_name": "John Smith",
  "email": "johnsmith@example.com",
  "phone": "+201111111111"
}
```

At least one field is required. All fields are optional.

| Field       | Type   | Notes                                                |
|-------------|--------|------------------------------------------------------|
| `full_name` | string | Updates the `users` table                            |
| `email`     | string | Updates **both** the `users` table and Supabase Auth |
| `phone`     | string | Updates the `users` table                            |

### Response `200`

```json
{
  "profile": {
    "id": "<uuid>",
    "email": "johnsmith@example.com",
    "full_name": "John Smith",
    "phone": "+201111111111",
    "created_at": "2026-03-01T10:00:00Z"
  }
}
```

---

## 🏗️ Architecture

```
Request → users.routes.ts  (requireUserAuth middleware)
               ↓   req.user.id available
          users.controller.ts   ← reads req.user.id, maps HTTP
               ↓
          users.service.ts      ← orchestrates
               ↓
          usersRepository       ← DB queries (users table + Supabase Auth admin)
```

### Email update flow

When `email` is included in the PUT body:

1. `usersRepository.updateAuthEmail()` — updates `auth.users` via Supabase Admin API
2. `usersRepository.updateUserProfile()` — updates the `users` table row

Both steps happen inside the repository, keeping the service free of infrastructure dependencies.

---

## 🔧 Repository Interface

```typescript
interface IUsersRepository {
  createUser(data: CreateUserData): Promise<any>;
  getUserById(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  updateUser(id: string, data: UpdateUserData): Promise<any>;
  updateUserProfile(id: string, data: UpdateProfileData): Promise<any>;
  updateAuthEmail(id: string, email: string): Promise<void>;
  getProfileWithAddresses(id: string): Promise<any>;
  deleteUser(id: string): Promise<void>;
}
```

### `UpdateProfileData`

```typescript
interface UpdateProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
}
```

---

## 🗄️ Database Table

```sql
users (
  id          uuid PRIMARY KEY,   -- matches auth.users.id
  email       text NOT NULL UNIQUE,
  full_name   text,
  phone       text,
  created_at  timestamptz DEFAULT now()
)
```

---

## 📝 Notes

- Address management (add / edit / delete) is handled by the **Addresses module** at `/api/addresses/user/addresses`.
- The `GET /profile` response embeds addresses for convenience — ordered by `created_at ASC`.
- Email changes update Supabase Auth first; if that fails the `users` table is not touched.

---

## 📖 Related Modules

- **Auth** — signup / signin — `/api/auth`
- **Addresses** — address CRUD — `/api/addresses/user/addresses`
- **Middleware** — `requireUserAuth` in `shared/middlewares/user-auth.middleware.ts`
