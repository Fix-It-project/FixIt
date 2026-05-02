import { supabaseAdmin } from '../../shared/db/supabase.js';
import { distanceKm } from '../../shared/utils/technicians/index.js';

export interface ReviewAggregate {
  avg_rating: number | null;  // null when review_count === 0
  review_count: number;       // integer
  sum_ratings: number;        // integer; needed for Bayesian sort in plan 02
}

export interface CreateTechnicianData {
  id: string;           // Must match the auth.users ID
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_available?: boolean;
  category_id: string;        // UUID foreign key → categories table
  criminal_record?: string;   // Supabase storage URL
  birth_certificate?: string; // Supabase storage URL
  national_id?: string;       // Supabase storage URL
}

export interface UpdateTechnicianData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_available?: boolean;
  criminal_record?: string;
  birth_certificate?: string;
  national_id?: string;
  description?: string;
}

/** Self-profile shape returned to the authenticated technician. */
export interface TechnicianSelfProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  description: string | null;
  category_name: string | null;
  total_orders: number;
  completed_orders: number;
  avg_rating: number | null;
  review_count: number;
}

export interface UpdateTechnicianSelfData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  description?: string;
}

/** API DTO shape returned by technician profile endpoint. */
export interface TechnicianProfile {
  name: string;
  profilePicture: string | null;
  description: string;
  completedOrders: number;
  totalBookings: number;
  reviews: number;        // backwards-compat; mirrors review_count
  phoneNumber: string;
  avg_rating: number | null;
  review_count: number;
}

/** Raw row shape selected for profile hydration. */
export interface TechnicianProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_available: boolean;
  category_id: string;
  profile_image: string | null;
  description: string | null;
  avg_rating?: number | null;   // hydrated by getReviewAggregatesByTechnicianIds
  review_count?: number;
}

/** Row shape returned when listing technicians with their active address. */
export interface TechnicianWithAddressRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_available: boolean;
  category_id: string;
  addresses: Array<{
    city: string;
    street: string;
    latitude: number | null;
    longitude: number | null;
    is_active: boolean;
  }>;
  avg_rating?: number | null;   // hydrated by getReviewAggregatesByTechnicianIds
  review_count?: number;
  sum_ratings?: number;         // hydrated by getReviewAggregatesByTechnicianIds; needed for Bayesian sort
}

export interface TechnicianListDTO {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_available: boolean;
  category_id: string;
  city: string | null;
  street: string | null;
  distance_km: number | null;
  avg_rating: number | null;   // null when review_count === 0
  review_count: number;        // default 0
  sum_ratings: number;         // needed for Bayesian sort; not exposed in API response
}

export function toDTO(row: TechnicianWithAddressRow, userLat?: number, userLng?: number): TechnicianListDTO {
  const activeAddr = row.addresses.find((a) => a.is_active) ?? row.addresses[0] ?? null;

  let distance_km: number | null = null;
  if (userLat != null && userLng != null && activeAddr?.latitude != null && activeAddr?.longitude != null) {
    distance_km = distanceKm(userLat, userLng, activeAddr.latitude, activeAddr.longitude);
  }

  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    is_available: row.is_available,
    category_id: row.category_id,
    city: activeAddr?.city ?? null,
    street: activeAddr?.street ?? null,
    distance_km,
    avg_rating: row.avg_rating ?? null,
    review_count: row.review_count ?? 0,
    sum_ratings: row.sum_ratings ?? 0,
  };
}

// ── Bayesian ranking helpers ──────────────────────────────────────────────────
/** Confidence constant: a technician needs at least C reviews to move the needle. */
export const BAYESIAN_C = 5;

/**
 * Compute a Bayesian-weighted rating to avoid the "5-stars with 1 review beats
 * 4.7-stars with 200 reviews" anti-pattern.
 *
 * Formula: (C * m + sum_ratings) / (C + review_count)
 *   - C = BAYESIAN_C (prior weight)
 *   - m = global mean rating
 *   - Technicians with 0 reviews collapse to m (the global mean) and rank below
 *     anyone with positive signal when m < any real reviewer's average.
 */
export function bayesianScore(agg: { sum_ratings: number; review_count: number }, m: number): number {
  return (BAYESIAN_C * m + agg.sum_ratings) / (BAYESIAN_C + agg.review_count);
}

/** Minimal read interface required by TechniciansService (ISP). */
export interface ITechnicianQueryRepository {
  getTechniciansByCategory(categoryId: string): Promise<TechnicianWithAddressRow[]>;
  searchTechniciansByCategory(categoryId: string, query: string): Promise<TechnicianWithAddressRow[]>;
  getTechnicianProfile(id: string): Promise<TechnicianProfileRow | null>;
  getReviewAggregatesByTechnicianIds(technicianIds: string[]): Promise<Map<string, ReviewAggregate>>;
  /** Returns the global mean rating across all reviews. Returns 0 when no reviews exist; service treats this as "neutral prior". */
  getGlobalReviewMean(): Promise<number>;
}

/** Full CRUD interface — used by modules that manage technician records. */
export interface ITechniciansRepository extends ITechnicianQueryRepository {
  createTechnician(data: CreateTechnicianData): Promise<any>;
  getTechnicianById(id: string): Promise<any>;
  getTechnicianByEmail(email: string): Promise<any>;
  emailExists(email: string): Promise<boolean>;
  updateTechnician(id: string, data: UpdateTechnicianData): Promise<any>;
  deleteTechnician(id: string): Promise<void>;
  getTechnicianSelf(id: string): Promise<TechnicianSelfProfile | null>;
  updateTechnicianSelf(id: string, data: UpdateTechnicianSelfData): Promise<any>;
  updateProfileImage(id: string, url: string): Promise<any>;
}

export class TechniciansRepository implements ITechniciansRepository {
  // In-memory aggregation chosen over RPC/view to avoid migration; revisit if reviews table > 100k rows.
  async getReviewAggregatesByTechnicianIds(technicianIds: string[]): Promise<Map<string, ReviewAggregate>> {
    if (technicianIds.length === 0) return new Map();

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('technician_id, rating')
      .in('technician_id', technicianIds)
      .not('rating', 'is', null);

    if (error) throw new Error(error.message);

    const accumulator = new Map<string, { sum: number; count: number }>();
    for (const row of data ?? []) {
      const entry = accumulator.get(row.technician_id) ?? { sum: 0, count: 0 };
      entry.sum += row.rating as number;
      entry.count += 1;
      accumulator.set(row.technician_id, entry);
    }

    const result = new Map<string, ReviewAggregate>();
    for (const id of technicianIds) {
      const entry = accumulator.get(id);
      if (entry && entry.count > 0) {
        result.set(id, {
          avg_rating: Math.round((entry.sum / entry.count) * 100) / 100,
          review_count: entry.count,
          sum_ratings: entry.sum,
        });
      } else {
        result.set(id, { avg_rating: null, review_count: 0, sum_ratings: 0 });
      }
    }

    return result;
  }

  // Returns 0 when no reviews exist; service treats this as "neutral prior".
  async getGlobalReviewMean(): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .not('rating', 'is', null);

    if (error) throw new Error(error.message);
    const rows = (data ?? []) as Array<{ rating: number }>;
    if (rows.length === 0) return 0;
    const sum = rows.reduce((acc, r) => acc + r.rating, 0);
    return sum / rows.length;
  }

  async getTechnicianProfile(id: string): Promise<TechnicianProfileRow | null> {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('id, first_name, last_name, email, phone, is_available, category_id, profile_image, description')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const aggregates = await this.getReviewAggregatesByTechnicianIds([id]);
    const agg = aggregates.get(id) ?? { avg_rating: null, review_count: 0, sum_ratings: 0 };

    return { ...(data as TechnicianProfileRow), avg_rating: agg.avg_rating, review_count: agg.review_count };
  }

  async getTechniciansByCategory(categoryId: string): Promise<TechnicianWithAddressRow[]> {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('id, first_name, last_name, email, phone, is_available, category_id, addresses(city, street, latitude, longitude, is_active)')
      .eq('category_id', categoryId)
      .order('first_name', { ascending: true });

    if (error) throw new Error(error.message);
    const rows = (data ?? []) as TechnicianWithAddressRow[];

    const aggregates = await this.getReviewAggregatesByTechnicianIds(rows.map((r) => r.id));
    return rows.map((r) => {
      const agg = aggregates.get(r.id) ?? { avg_rating: null, review_count: 0, sum_ratings: 0 };
      return { ...r, avg_rating: agg.avg_rating, review_count: agg.review_count, sum_ratings: agg.sum_ratings };
    });
  }

  async searchTechniciansByCategory(categoryId: string, query: string): Promise<TechnicianWithAddressRow[]> {
    const term = `%${query}%`;
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('id, first_name, last_name, email, phone, is_available, category_id, addresses(city, street, latitude, longitude, is_active)')
      .eq('category_id', categoryId)
      .or(`first_name.ilike.${term},last_name.ilike.${term}`)
      .order('first_name', { ascending: true });

    if (error) throw new Error(error.message);
    const rows = (data ?? []) as TechnicianWithAddressRow[];

    const aggregates = await this.getReviewAggregatesByTechnicianIds(rows.map((r) => r.id));
    return rows.map((r) => {
      const agg = aggregates.get(r.id) ?? { avg_rating: null, review_count: 0, sum_ratings: 0 };
      return { ...r, avg_rating: agg.avg_rating, review_count: agg.review_count, sum_ratings: agg.sum_ratings };
    });
  }

  async createTechnician(data: CreateTechnicianData) {
    try {
      console.log('Creating technician with data:', { ...data, criminal_record: '[file]', birth_certificate: '[file]', national_id: '[file]' });

      const { data: technician, error } = await supabaseAdmin
        .from('technicians')
        .insert({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone ?? null,
          is_available: data.is_available ?? false,
          category_id: data.category_id,
          criminal_record: data.criminal_record ?? null,
          birth_certificate: data.birth_certificate ?? null,
          national_id: data.national_id ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      console.log('Inserted technician:', technician);
      return technician;
    } catch (error) {
      console.error('Error inserting technician:', error);
      throw error;
    }
  }

  async getTechnicianById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getTechnicianByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('*')
      .eq('email', email)
      .maybeSingle(); // returns null instead of error when not found

    if (error) throw error;
    return data; // null if not found
  }

  async emailExists(email: string): Promise<boolean> {
    const { count, error } = await supabaseAdmin
      .from('technicians')
      .select('*', { count: 'exact', head: true })
      .eq('email', email);

    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async updateTechnician(id: string, data: UpdateTechnicianData) {
    const { data: technician, error } = await supabaseAdmin
      .from('technicians')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return technician;
  }

  async deleteTechnician(id: string) {
    const { error } = await supabaseAdmin
      .from('technicians')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getTechnicianSelf(id: string): Promise<TechnicianSelfProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('id, first_name, last_name, email, phone, profile_image, description, categories(name)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const [{ count: totalOrders }, { count: completedOrders }] = await Promise.all([
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('technician_id', id),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('technician_id', id).eq('status', 'completed'),
    ]);
    const aggregates = await this.getReviewAggregatesByTechnicianIds([id]);
    const reviewAggregate = aggregates.get(id) ?? { avg_rating: null, review_count: 0, sum_ratings: 0 };

    const categoriesRaw = data.categories as unknown as { name: string }[] | { name: string } | null;
    const categories = Array.isArray(categoriesRaw) ? categoriesRaw[0] ?? null : categoriesRaw;

    return {
      id: data.id,
      first_name: data.first_name ?? '',
      last_name: data.last_name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? null,
      profile_image: data.profile_image ?? null,
      description: data.description ?? null,
      category_name: categories?.name ?? null,
      total_orders: totalOrders ?? 0,
      completed_orders: completedOrders ?? 0,
      avg_rating: reviewAggregate.avg_rating,
      review_count: reviewAggregate.review_count,
    };
  }

  async updateTechnicianSelf(id: string, data: UpdateTechnicianSelfData) {
    const payload: Partial<UpdateTechnicianSelfData> = {};
    if (data.first_name !== undefined) payload.first_name = data.first_name;
    if (data.last_name !== undefined) payload.last_name = data.last_name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.description !== undefined) payload.description = data.description;

    const { data: technician, error } = await supabaseAdmin
      .from('technicians')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return technician;
  }

  async updateProfileImage(id: string, url: string) {
    const { data: technician, error } = await supabaseAdmin
      .from('technicians')
      .update({ profile_image: url })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return technician;
  }
}

export const techniciansRepository = new TechniciansRepository();
