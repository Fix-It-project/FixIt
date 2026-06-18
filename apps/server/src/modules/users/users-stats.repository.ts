import { supabaseAdmin } from '../../shared/db/supabase.js';

export interface UserStats {
  totalBookings: number;
  completedBookings: number;
  /** The category the user has booked the most, or null when they have no orders. */
  mostBookedCategory: { name: string; count: number } | null;
  /** users.created_at — the "member since" date. */
  memberSince: string | null;
}

export interface IUsersStatsRepository {
  getUserStats(userId: string): Promise<UserStats>;
}

/** Narrow shape of an order row joined to its service's category name. */
interface OrderCategoryRow {
  status: string;
  services: { categories: { name: string } | null } | null;
}

/** Supabase embeds to-one relations as either an object or a single-element array. */
function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export class UsersStatsRepository implements IUsersStatsRepository {
  async getUserStats(userId: string): Promise<UserStats> {
    const [orderResult, userResult] = await Promise.all([
      supabaseAdmin
        .from('orders')
        .select('status, services(category_id, categories(name))')
        .eq('user_id', userId),
      supabaseAdmin
        .from('users')
        .select('created_at')
        .eq('id', userId)
        .maybeSingle(),
    ]);

    if (orderResult.error) throw new Error(orderResult.error.message);
    if (userResult.error) throw new Error(userResult.error.message);

    const rows = (orderResult.data ?? []) as unknown as OrderCategoryRow[];
    const totalBookings = rows.length;
    let completedBookings = 0;

    const counts = new Map<string, number>();
    for (const row of rows) {
      if (row.status === 'completed') completedBookings += 1;
      const service = unwrap(row.services);
      const category = service ? unwrap(service.categories) : null;
      const name = category?.name;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    let mostBookedCategory: UserStats['mostBookedCategory'] = null;
    for (const [name, count] of counts) {
      if (!mostBookedCategory || count > mostBookedCategory.count) {
        mostBookedCategory = { name, count };
      }
    }

    return {
      totalBookings,
      completedBookings,
      mostBookedCategory,
      memberSince: userResult.data?.created_at ?? null,
    };
  }
}

export const usersStatsRepository = new UsersStatsRepository();
