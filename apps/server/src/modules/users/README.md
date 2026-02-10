# Users Module

Database CRUD operations for user data management.

## 📁 Structure

```
users/
├── users.repository.ts     # Database CRUD operations
├── index.ts                # Module exports
└── demo.ts                 # Placeholder file
```

## 🎯 Single Responsibility Principle

### `users.repository.ts` - Data Persistence Layer
**Responsibility:** Direct database operations for users table

```typescript
class UsersRepository {
  createUser()      // Insert new user record
  getUserById()     // Find by ID
  getUserByEmail()  // Find by email
  updateUser()      // Update user fields
  deleteUser()      // Remove user
}
```

**What it does:**
- Executes SQL queries via Drizzle ORM
- Handles database-specific operations
- Returns raw database results

**What it doesn't do:**
- ❌ Authentication logic
- ❌ Business rules
- ❌ HTTP handling

---

## 🔧 Repository Methods

### 1. Create User
```typescript
async createUser(data: CreateUserData): Promise<User>
```

**Parameters:**
```typescript
interface CreateUserData {
  id: string;          // UUID from Supabase Auth
  email: string;       // Required
  fullName?: string;   // Optional
  phone?: string;      // Optional
  address?: string;    // Optional
}
```

**Usage:**
```typescript
import { usersRepository } from '@/modules/users';

const user = await usersRepository.createUser({
  id: 'auth-user-id-uuid',
  email: 'john@example.com',
  fullName: 'John Doe',
  phone: '+1234567890',
  address: '123 Main St'
});

// Returns: { id, email, fullName, phone, address, createdAt }
```

**SQL Generated:**
```sql
INSERT INTO users (id, email, full_name, phone, address)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
```

---

### 2. Get User by ID
```typescript
async getUserById(id: string): Promise<User | undefined>
```

**Usage:**
```typescript
const user = await usersRepository.getUserById('uuid-here');

if (!user) {
  console.log('User not found');
}
```

**SQL Generated:**
```sql
SELECT * FROM users WHERE id = $1;
```

---

### 3. Get User by Email
```typescript
async getUserByEmail(email: string): Promise<User | undefined>
```

**Usage:**
```typescript
const user = await usersRepository.getUserByEmail('john@example.com');

if (user) {
  console.log('User exists:', user.fullName);
}
```

**SQL Generated:**
```sql
SELECT * FROM users WHERE email = $1;
```

**Use Cases:**
- Check if email already registered
- Find user for profile lookup
- Validate user existence before operations

---

### 4. Update User
```typescript
async updateUser(id: string, data: UpdateUserData): Promise<User>
```

**Parameters:**
```typescript
interface UpdateUserData {
  fullName?: string;
  phone?: string;
  address?: string;
}
```

**Usage:**
```typescript
const updatedUser = await usersRepository.updateUser('uuid-here', {
  fullName: 'John Updated',
  phone: '+9876543210'
});

// Returns updated user with new values
```

**SQL Generated:**
```sql
UPDATE users 
SET full_name = $1, phone = $2
WHERE id = $3
RETURNING *;
```

**Notes:**
- Only updates provided fields (partial update)
- Cannot update: `id`, `email`, `createdAt` (immutable)

---

### 5. Delete User
```typescript
async deleteUser(id: string): Promise<void>
```

**Usage:**
```typescript
await usersRepository.deleteUser('uuid-here');
// User permanently removed from database
```

**SQL Generated:**
```sql
DELETE FROM users WHERE id = $1;
```

**⚠️ Warning:**
- Permanent deletion (no soft delete)
- Does NOT delete from Supabase Auth (separate operation needed)
- Consider implementing soft delete for production

---

## 🗄️ Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,                          -- Matches auth.users.id
  email TEXT NOT NULL UNIQUE,                   -- User email
  full_name TEXT,                               -- Display name
  phone TEXT,                                   -- Contact number
  address TEXT,                                 -- User address
  created_at TIMESTAMP DEFAULT NOW() NOT NULL   -- Registration timestamp
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
```

### Column Details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Matches Supabase Auth user ID |
| `email` | TEXT | NOT NULL, UNIQUE | User email address |
| `full_name` | TEXT | Nullable | User's full name |
| `phone` | TEXT | Nullable | Contact phone number |
| `address` | TEXT | Nullable | User's address |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Registration date |

---

## 🔗 Integration with Auth Module

### During Signup
```typescript
// In auth.service.ts
async signUp(data: SignUpData) {
  // 1. Create auth user
  const authResult = await authRepository.signUp(data);
  
  // 2. Store in users table
  if (authResult.user) {
    await usersRepository.createUser({
      id: authResult.user.id,        // Same UUID
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
    });
  }
  
  return { user: authResult.user };
}
```

### Data Flow
```
Supabase Auth (auth.users)          Custom Users Table (users)
━━━━━━━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━━━━━━━━━
id: uuid                    ──────→  id: uuid (same)
email: text                 ──────→  email: text (duplicate)
encrypted_password: text             full_name: text
email_confirmed_at: timestamp        phone: text
auth_metadata: jsonb                 address: text
                                     created_at: timestamp
```

**Why Two Tables?**
- **Supabase Auth** - Handles authentication, security, password hashing
- **Custom Users** - Stores app-specific data (profile, preferences)

---

## 🛠️ Usage Examples

### Example 1: Profile Update Feature
```typescript
import { usersRepository } from '@/modules/users';

// API endpoint: PUT /api/users/:id
async updateUserProfile(req, res) {
  const { id } = req.params;
  const { fullName, phone, address } = req.body;
  
  try {
    const user = await usersRepository.updateUser(id, {
      fullName,
      phone,
      address
    });
    
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

### Example 2: Check User Exists
```typescript
const existingUser = await usersRepository.getUserByEmail('test@example.com');

if (existingUser) {
  throw new Error('Email already registered');
}
```

### Example 3: Get User Profile
```typescript
// After authentication, fetch full profile
const userId = req.user.id; // From JWT
const profile = await usersRepository.getUserById(userId);

res.json({
  email: profile.email,
  fullName: profile.fullName,
  phone: profile.phone,
  address: profile.address,
  memberSince: profile.createdAt
});
```

---

## 🔄 Query Patterns

### Using Drizzle ORM
```typescript
import { db } from '@/shared/db';
import { users } from '@/modules/auth/models/user.model';
import { eq, like, and } from 'drizzle-orm';

// Select with condition
const user = await db.select()
  .from(users)
  .where(eq(users.id, userId));

// Search by partial name
const results = await db.select()
  .from(users)
  .where(like(users.fullName, '%John%'));

// Multiple conditions
const admins = await db.select()
  .from(users)
  .where(and(
    eq(users.role, 'admin'),
    eq(users.isActive, true)
  ));
```

---

## 🧪 Error Handling

### Common Scenarios

| Scenario | Handling |
|----------|----------|
| User not found | Returns `undefined` (check before use) |
| Duplicate email | Database throws unique constraint error |
| Invalid UUID | Database throws invalid UUID error |
| Network error | Drizzle throws connection error |

### Recommended Pattern
```typescript
try {
  const user = await usersRepository.getUserById(id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Use user data
} catch (error) {
  console.error('Database error:', error);
  return res.status(500).json({ error: 'Internal server error' });
}
```

---

## 📚 Dependencies

- **Drizzle ORM** (`drizzle-orm`) - Type-safe SQL queries
- **Postgres** (`postgres`) - Database driver
- **User Model** - Shared schema from `auth/models/user.model.ts`

---

## 🔄 Future Enhancements

- [ ] **Pagination** - List users with limit/offset
- [ ] **Search** - Full-text search on names
- [ ] **Soft Delete** - Mark users as deleted (keep records)
- [ ] **Audit Logs** - Track all user changes
- [ ] **Role Management** - Add user roles (user/technician/admin)
- [ ] **User Stats** - Count, active users, etc.
- [ ] **Bulk Operations** - Create/update multiple users
- [ ] **Relations** - Link to orders, reviews, etc.

### Potential New Methods
```typescript
// Pagination
async getAllUsers(page: number, limit: number)

// Search
async searchUsers(query: string)

// Soft delete
async softDeleteUser(id: string)
async restoreUser(id: string)

// Filtering
async getActiveUsers()
async getUsersByRole(role: string)

// Statistics
async getUserCount()
async getRecentUsers(days: number)
```

---

## 🔗 Related Modules

- **Auth Module** - Creates users during signup
- **Orders Module** (future) - Link users to orders
- **Reviews Module** (future) - User-generated content
- **Admin Module** (future) - User management dashboard

---

## 📖 Key Principles

✅ **Separation of Concerns**
- Only handles database operations
- No authentication logic
- No HTTP handling

✅ **Reusability**
- Can be used by any module
- Not tied to auth flow

✅ **Type Safety**
- TypeScript interfaces for all operations
- Drizzle ORM provides compile-time type checking

✅ **Testability**
- Pure data access layer
- Easy to mock for unit tests
