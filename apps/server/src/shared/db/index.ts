import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

let dbInstance: PostgresJsDatabase | null = null;

function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const connectionString = process.env.SUPABASE_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error('Missing SUPABASE_CONNECTION_STRING environment variable');
  }

  const queryClient = postgres(connectionString);
  dbInstance = drizzle(queryClient);
  return dbInstance;
}

export const db = new Proxy({} as PostgresJsDatabase, {
  get(_target, prop) {
    const client = getDb();
    return (client as any)[prop];
  }
});

export default db;
