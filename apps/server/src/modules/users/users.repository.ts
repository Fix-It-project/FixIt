import { db } from '../../shared/db/index.js';
import { users } from '../auth/models/user.model.js';
import { eq } from 'drizzle-orm';

export interface CreateUserData {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  address?: string;
}

export class UsersRepository {
  async createUser(data: CreateUserData) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, data: UpdateUserData) {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string) {
    await db.delete(users).where(eq(users.id, id));
  }
}

export const usersRepository = new UsersRepository();
