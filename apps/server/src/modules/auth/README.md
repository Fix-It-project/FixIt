# Auth Module

Complete user authentication using Supabase Auth + JWT tokens.

## 📁 Structure

```
auth/
├── auth.repository.ts  # Supabase Auth API operations — implements IAuthRepository
├── auth.service.ts     # Business logic orchestration
├── auth.controller.ts  # HTTP request handlers
├── auth.routes.ts      # API endpoint definitions
└── index.ts            # Module exports
```

## 🌐 Endpoints

Base path: `/api/auth`

| Method | Path               | Auth Required | Description                          |
|--------|--------------------|---------------|--------------------------------------|
| `POST` | `/signup`          | No            | Register a new user                  |
| `POST` | `/signin`          | No            | Sign in and receive tokens           |
| `POST` | `/signout`         | Yes (Bearer)  | Invalidate the current session       |
| `GET`  | `/me`              | Yes (Bearer)  | Get the current authenticated user   |
| `POST` | `/refresh`         | No            | Refresh the access token             |
| `POST` | `/forgot-password` | No            | Send a password reset email          |
| `POST` | `/reset-password`  | Yes (Bearer)  | Set a new password                   |

---

## 📤 Signup

Signup creates records in **both** Supabase Auth and the `users` / `addresses` tables.

**No tokens are returned** — the client must call `/signin` immediately after.

### Request

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phone": "+201234567890",
  "city": "Cairo",
  "street": "El-Tahrir St",
  "building_no": "15",
  "apartment_no": "3A",
  "latitude": 30.0444,
  "longitude": 31.2357
}
```

| Field          | Required | Notes                           |
|----------------|----------|---------------------------------|
| `email`        | ✅       |                                 |
| `password`     | ✅       |                                 |
| `fullName`     | ❌       |                                 |
| `phone`        | ❌       |                                 |
| `city`         | ❌       | Goes into the `addresses` table |
| `street`       | ❌       | Goes into the `addresses` table |
| `building_no`  | ❌       |                                 |
| `apartment_no` | ❌       |                                 |
| `latitude`     | ❌       |                                 |
| `longitude`    | ❌       |                                 |

### Response `201`

```json
{
  "user": { "id": "<uuid>", "email": "john@example.com" },
  "message": "User registered successfully. Please sign in to continue."
}
```

---

## 🔑 Sign In

```http
POST /api/auth/signin
Content-Type: application/json

{ "email": "john@example.com", "password": "SecurePass123!" }
```

### Response `200`

```json
{
  "user": { "id": "<uuid>", "email": "john@example.com" },
  "session": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "v1.MjA...",
    "expiresAt": 1704673200
  }
}
```

---

## 🔒 Sign Out

```http
POST /api/auth/signout
Authorization: Bearer <access_token>
```

---

## 👤 Get Current User

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

---

## ♻️ Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{ "refreshToken": "v1.MjA..." }
```

---

## 🔐 Forgot / Reset Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{ "email": "john@example.com" }
```

```http
POST /api/auth/reset-password
Authorization: Bearer <access_token>
Content-Type: application/json

{ "newPassword": "NewPass456!" }
```

---

## 🏗️ Architecture

```
Request → auth.routes.ts  (no middleware — all public)
             ↓
          auth.controller.ts   ← validates fields, maps HTTP
             ↓
          auth.service.ts      ← orchestrates flow
             ↓                       ↓                        ↓
    authRepository        usersRepository         addressesRepository
    (Supabase Auth)         (users table)           (addresses table)
```

### Signup flow (3 steps)

1. `authRepository.signUp()` — creates Supabase Auth user
2. `usersRepository.createUser()` — inserts row in `users` table (same UUID)
3. `addressesRepository.createAddress()` — inserts `CreateUserAddressData` row linked to `user_id`

---

## 🗄️ Database Schema

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY,   -- matches auth.users.id
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

The `addresses` table is owned by the **Addresses module**.

---

## 🧪 Error Reference

| Error                                 | Status | Cause                   |
|---------------------------------------|--------|-------------------------|
| `Email and password are required`     | 400    | Missing body fields     |
| `User with this email already exists` | 400    | Duplicate email         |
| `Invalid login credentials`           | 401    | Wrong password          |
| `No token provided`                   | 401    | Missing Authorization   |
| `Invalid token`                       | 401    | Expired / malformed JWT |

---

## 📖 Related Modules

- **Users** — profile read/update — `GET/PUT /api/users/profile`
- **Addresses** — address CRUD — `GET/POST/PUT/DELETE /api/addresses/user/addresses`
- **Middleware** — `requireUserAuth` in `shared/middlewares/user-auth.middleware.ts`


## 📁 Structure

```
auth/
├── auth.controller.ts      # HTTP request handlers
├── auth.service.ts         # Business logic orchestration
├── auth.repository.ts      # Supabase Auth API operations
├── auth.routes.ts          # API endpoint definitions
├── index.ts                # Module exports
└── models/
    ├── user.model.ts       # Database schema (Drizzle ORM)
    └── index.ts            # Model exports
```

## 🎯 Single Responsibility Principle

Each file handles **one specific concern**:

### `auth.repository.ts` - Authentication API Layer

**Responsibility:** Direct interaction with Supabase Auth API

```typescript
class AuthRepository {
  signUp(); // Register new user with Supabase Auth
  signIn(); // Authenticate user with email/password
  signOut(); // Invalidate user session
  getUser(); // Verify JWT and get user info
  refreshToken(); // Get new access token from refresh token
}
```

**What it does:**

- Talks to `supabase.auth` API
- Handles Supabase-specific errors
- Returns raw Supabase responses

**What it doesn't do:**

- ❌ Database operations (users table)
- ❌ Response formatting
- ❌ HTTP status codes

---

### `auth.service.ts` - Business Logic Layer

**Responsibility:** Orchestrate authentication flow + user data persistence

```typescript
class AuthService {
  async signUp(data) {
    // 1. Create auth user (via authRepository)
    // 2. Store user in database (via usersRepository)
    // 3. Return formatted response
  }

  async signIn(data) {
    // 1. Authenticate user (via authRepository)
    // 2. Return tokens + user info
  }

  signOut();
  getCurrentUser();
  refreshSession();
}
```

**What it does:**

- Coordinates between `authRepository` and `usersRepository`
- Implements business rules (e.g., store user after signup)
- Formats responses for controllers
- Handles inter-module communication

**What it doesn't do:**

- ❌ HTTP request/response handling
- ❌ Direct database/API calls

---

### `auth.controller.ts` - HTTP Layer

**Responsibility:** Handle HTTP requests/responses

```typescript
class AuthController {
  async signUp(req, res) {
    // 1. Validate input
    // 2. Call authService.signUp()
    // 3. Return HTTP response with status codes
  }

  // Similar for: signIn, signOut, getCurrentUser, refreshToken
}
```

**What it does:**

- Extracts data from `req.body`, `req.headers`
- Validates required fields
- Calls service layer
- Returns HTTP responses (status codes, JSON)
- Handles errors → HTTP error responses

**What it doesn't do:**

- ❌ Business logic
- ❌ Database/API calls

---

### `auth.routes.ts` - Route Configuration

**Responsibility:** Map URLs to controller methods

```typescript
router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);
router.post("/signout", authController.signOut);
router.get("/me", authController.getCurrentUser);
router.post("/refresh", authController.refreshToken);
```

**What it does:**

- Defines API endpoints
- Maps HTTP methods to controllers

---

### `models/user.model.ts` - Database Schema

**Responsibility:** Define user data structure

```typescript
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**What it does:**

- Drizzle ORM schema definition
- TypeScript type exports (`User`, `NewUser`)

---

## 🚀 API Endpoints

Base URL: `/api/auth`

### 1. Sign Up

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",           // Optional
  "phone": "+1234567890",           // Optional
  
}
```

**Response (201 Created):**

```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  },
  "message": "User registered successfully. Please sign in to continue."
}
```

**Notes:**

- Creates user in **both** Supabase Auth + custom users table
- No tokens returned (must sign in separately)
- Email verification disabled for development

---

### 2. Sign In

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  },
  "session": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "v1.MjA...",
    "expiresAt": 1704673200
  }
}
```

**Notes:**

- Returns JWT tokens
- Store tokens securely on client (AsyncStorage, SecureStore)
- Access token expires in 1 hour (default)

---

### 3. Sign Out

```http
POST /api/auth/signout
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Notes:**

- JWT is stateless, so client should delete tokens
- Server-side signout invalidates Supabase session

---

### 4. Get Current User

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "John Doe",
      "phone": "+1234567890"
    },
    "created_at": "2026-02-09T10:00:00Z"
  }
}
```

---

### 5. Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "v1.MjA..."
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  },
  "session": {
    "accessToken": "eyJhbGc...", // New token
    "refreshToken": "v1.MjA...", // New refresh token
    "expiresAt": 1704676800
  }
}
```

### 6. Request Password Reset

- **Endpoint:** `POST /api/auth/forgot-password`
- **Description:** Sends a password reset email to the user using Supabase.
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  - Success: `{ "message": "Password reset email sent. Please check your inbox." }`
  - Error: `{ "error": "..." }`

### 7. Reset Password

- **Endpoint:** `POST /api/auth/reset-password`
- **Description:** Updates the user's password. Requires authentication (access token).
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Request Body:**
  ```json
  {
    "newPassword": "yourNewPassword"
  }
  ```
- **Response:**
  - Success: `{ "message": "Password updated successfully", "user": { ... } }`
  - Error: `{ "error": "..." }`

---

## 🔒 Authentication Flow

### Registration Flow

```
1. Client sends email/password to POST /api/auth/signup
2. auth.controller validates input
3. auth.service.signUp():
   a. authRepository.signUp() → Creates Supabase Auth user
   b. usersRepository.createUser() → Stores in users table
4. Returns user info (no tokens)
5. Client must call /signin to get tokens
```

### Login Flow

```
1. Client sends email/password to POST /api/auth/signin
2. auth.controller validates input
3. auth.service.signIn():
   a. authRepository.signIn() → Verifies credentials
   b. Returns tokens + user info
4. Client stores tokens securely
```

### Protected Request Flow

```
1. Client includes: Authorization: Bearer <access_token>
2. Server verifies token via GET /api/auth/me
3. If valid → proceed with request
4. If expired → use refresh token to get new access token
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Relationship with Supabase Auth:**

- `users.id` matches `auth.users.id` (same UUID)
- Supabase Auth stores: password, email, auth metadata
- Custom `users` table stores: additional user data

---

## 🔧 Configuration

### Environment Variables (.env)

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...  # Used for auth operations
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Admin operations (unused in auth)
SUPABASE_CONNECTION_STRING=postgresql://...  # Direct DB connection
```

### Lazy Loading Pattern

Both database clients use **Proxy pattern** to avoid early initialization:

```typescript
// Connections only created when first accessed
const supabase = getSupabaseClient();
const db = getDb();
```

---

## 🛠️ Usage Examples

### In Other Modules

```typescript
import { authService } from "@/modules/auth";

// Check if user exists
const user = await authService.getCurrentUser(token);

// Validate authentication
try {
  await authService.getCurrentUser(token);
  // User authenticated
} catch (error) {
  // Invalid/expired token
}
```

### Testing with Postman

1. **Sign Up** → Copy user ID
2. **Sign In** → Copy `accessToken`
3. **Protected Routes** → Add header: `Authorization: Bearer <accessToken>`
4. **Token Expires** → Use `refreshToken` to get new access token

---

## 🧪 Error Handling

### Common Errors

| Error                                 | Status | Cause                        |
| ------------------------------------- | ------ | ---------------------------- |
| `Email and password are required`     | 400    | Missing fields               |
| `User with this email already exists` | 400    | Duplicate email              |
| `Invalid login credentials`           | 401    | Wrong password               |
| `No token provided`                   | 401    | Missing Authorization header |
| `Invalid token`                       | 401    | Expired/malformed JWT        |

---

## 📚 Dependencies

- **Supabase Client** (`@supabase/supabase-js`) - Auth API
- **Drizzle ORM** (`drizzle-orm`) - Database queries
- **Express** (`express`) - HTTP server

---

## 🔄 Future Enhancements

- [ ] Email verification
- [ ] Password reset
- [ ] OAuth providers (Google, GitHub)
- [ ] Role-based access control (user/technician/admin)
- [ ] Session management (active sessions list)
- [ ] Two-factor authentication (2FA)

---

## 📖 Related Modules

- **Users Module** - CRUD operations for user data
- **Middleware** (future) - Auth middleware for protected routes
