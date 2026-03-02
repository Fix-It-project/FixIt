# Technician Auth Module

Handles authentication and document uploads for technicians.

## 📁 Structure

```
technician-auth/
├── technician-auth.repository.ts  # Supabase Auth calls — implements ITechnicianAuthRepository
├── technician-auth.service.ts     # Business logic / orchestration
├── technician-auth.controller.ts  # HTTP request/response handlers
├── technician-auth.routes.ts      # Express routes + multer middleware
└── index.ts                       # Re-exports
```

> **Storage** is handled by the shared `StorageRepository` in
> `shared/storage/storage.repository.ts` — document uploads were extracted
> there to satisfy SRP.

## 🌐 Endpoints

Base path: `/api/technician-auth`

| Method | Path           | Auth Required | Description                                     |
|--------|----------------|---------------|-------------------------------------------------|
| `POST` | `/check-email` | No            | Check if a technician email already exists      |
| `POST` | `/signup`      | No            | Register a new technician with document uploads |
| `POST` | `/signin`      | No            | Sign in and receive access/refresh tokens       |
| `POST` | `/signout`     | Yes (Bearer)  | Sign out the current technician                 |
| `GET`  | `/profile`     | Yes (Bearer)  | Get the current authenticated technician        |
| `POST` | `/refresh`     | No            | Refresh the access token                        |

## 📤 Signup Flow

The signup endpoint accepts `multipart/form-data` and performs these steps in order:

1. **Guard** — rejects if the email already exists in the `technicians` table (409)
2. **Supabase Auth** — creates a new auth user with `role: 'technician'` in metadata
3. **Storage upload** — uploads documents in parallel via `storageRepository.uploadDocuments()` to the configured `STORAGE_BUCKET` under `<technician-uuid>/<document_name>`
4. **DB insert** — inserts a row into `technicians` with document URLs and `is_available: false`
5. **Address insert** — inserts a row into `addresses` with `technician_id`

### Signup Request (`multipart/form-data`)

| Field               | Type | Required | Description                            |
|---------------------|------|----------|----------------------------------------|
| `email`             | Text | ✅       |                                        |
| `password`          | Text | ✅       |                                        |
| `first_name`        | Text | ✅       |                                        |
| `last_name`         | Text | ✅       |                                        |
| `category_id`       | Text | ✅       | UUID from the `categories` table       |
| `phone`             | Text | ❌       |                                        |
| `city`              | Text | ❌       | Goes into the `addresses` table        |
| `street`            | Text | ❌       | Goes into the `addresses` table        |
| `building_no`       | Text | ❌       |                                        |
| `apartment_no`      | Text | ❌       |                                        |
| `latitude`          | Text | ❌       |                                        |
| `longitude`         | Text | ❌       |                                        |
| `criminal_record`   | File | ❌       | Uploaded to Supabase Storage           |
| `birth_certificate` | File | ❌       | Uploaded to Supabase Storage           |
| `national_id`       | File | ❌       | Uploaded to Supabase Storage           |

### Signup Response `201`

```json
{
  "technician": {
    "id": "<supabase-auth-uuid>",
    "email": "tech@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "message": "Technician registered successfully. Please sign in to continue."
}
```

---

## 🏗️ Architecture

```
Request → technician-auth.routes.ts  (multer middleware for /signup)
                ↓
          technician-auth.controller.ts
                ↓
          technician-auth.service.ts
           ↓              ↓                  ↓                ↓
technicianAuthRepo  storageRepository  techniciansRepo  addressesRepo
(Supabase Auth)     (file uploads)      (DB row)         (DB row)
```

---

## 📝 Notes

- File uploads use **multer `memoryStorage`** — files stay in memory as buffers and are streamed directly to Supabase Storage without touching disk.
- Document files are typed as `DocumentFiles` (from `shared/storage/storage.repository.ts`).
- Storage and Auth admin calls use `supabaseAdmin` (service role key) to bypass RLS.
- `signIn`, `signOut`, `getUser`, `refreshSession` use the regular anon client.
- New technicians start with `is_available: false` and must be manually verified.
- Forgot/reset password is not yet implemented for technicians.

---

## 📖 Related Modules

- **Technicians** — DB CRUD for technician rows
- **Addresses** — address CRUD — `GET/POST/PUT/DELETE /api/addresses/technician/addresses`
- **Storage** — `shared/storage/storage.repository.ts`
- **Middleware** — `requireTechnicianAuth` in `shared/middlewares/technician-auth.middleware.ts`


## 📁 Structure

```
technician-auth/
├── technician-auth.repository.ts  # Supabase Auth calls + Storage uploads
├── technician-auth.service.ts     # Business logic / orchestration
├── technician-auth.controller.ts  # HTTP request/response handlers
├── technician-auth.routes.ts      # Express routes + multer middleware
└── index.ts                       # Re-exports
```

## 🌐 Endpoints

Base path: `/api/technician-auth`

| Method | Path            | Auth Required | Description                                      |
|--------|-----------------|---------------|--------------------------------------------------|
| `POST` | `/check-email`  | No            | Check if a technician email already exists       |
| `POST` | `/signup`       | No            | Register a new technician with document uploads  |
| `POST` | `/signin`       | No            | Sign in and receive access/refresh tokens        |
| `POST` | `/signout`      | Yes (Bearer)  | Sign out the current technician                  |
| `GET`  | `/profile`      | Yes (Bearer)  | Get the current authenticated technician         |
| `POST` | `/refresh`      | No            | Refresh the access token                         |

## 📤 Signup Flow

The signup endpoint accepts `multipart/form-data` and performs the following steps in order:

1. **Guard** — checks if the email already exists in the `technicians` table (409 if it does)
2. **Supabase Auth** — creates a new auth user with `email`, `password`, and metadata (`first_name`, `last_name`, `phone`, `role: 'technician'`)
3. **Storage upload** — uploads the 3 document files in parallel to the `technician data` Supabase Storage bucket under `<auth-user-uuid>/criminal_record`, etc. Uses the service role client to bypass RLS
4. **DB insert** — inserts a row into the `technicians` table with the document public URLs and `is_available: false`

### Signup Request Fields (`form-data`)

| Field              | Type   | Required | Description                            |
|--------------------|--------|----------|----------------------------------------|
| `email`            | Text   | ✅       |                                        |
| `password`         | Text   | ✅       |                                        |
| `first_name`       | Text   | ✅       |                                        |
| `last_name`        | Text   | ✅       |                                        |
| `category_id`      | Text   | ✅       | Valid UUID from the `categories` table |
| `phone`            | Text   | ❌       |                                        |
| `criminal_record`  | File   | ❌       | Uploaded to Supabase Storage           |
| `birth_certificate`| File   | ❌       | Uploaded to Supabase Storage           |
| `national_id`      | File   | ❌       | Uploaded to Supabase Storage           |

### Signup Response

```json
{
  "technician": {
    "id": "<supabase-auth-uuid>",
    "email": "tech@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "message": "Technician registered successfully. Please sign in to continue."
}
```

## 📝 Notes

- File uploads use **multer `memoryStorage`** — files are kept in memory as buffers and streamed directly to Supabase Storage without writing to disk.
- Storage uploads and Auth use **`supabaseAdmin`** (service role key) to bypass RLS.
- `supabase.auth.*` calls (signIn, signOut, getUser, refreshSession) use the regular anon client.
- Forgot password / reset password are **not implemented** in this module yet.
- New technicians are created with `is_available: false` and must be manually verified before being activated.
