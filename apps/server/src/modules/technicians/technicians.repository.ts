import { supabaseAdmin } from "../../shared/db/supabase.js";
import { logger } from "../../shared/logger.js";
import { distanceKm } from "../../shared/utils/technicians/index.js";

export interface ReviewAggregate {
	avg_rating: number | null;
	review_count: number;
}

export interface CreateTechnicianData {
	id: string; // Must match the auth.users ID
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	is_available?: boolean;
	category_id: string; // UUID foreign key → categories table
	criminal_record?: string; // Supabase storage URL
	birth_certificate?: string; // Supabase storage URL
	national_id?: string; // Supabase storage URL
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
	reviews: number; // backwards-compat; mirrors review_count
	phoneNumber: string;
	city: string | null;
	street: string | null;
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
	addresses: AddressRow[];
	avg_rating?: number | null; // hydrated by getReviewAggregatesByTechnicianIds
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
	profile_image: string | null;
	description: string | null;
	addresses: Array<{
		city: string;
		street: string;
		latitude: number | null;
		longitude: number | null;
		is_active: boolean;
	}>;
	avg_rating?: number | null; // hydrated by getReviewAggregatesByTechnicianIds (or RPC)
	review_count?: number;
}

export interface TechnicianListDTO {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone: string | null;
	is_available: boolean;
	category_id: string;
	profile_image: string | null;
	description: string | null;
	city: string | null;
	street: string | null;
	distance_km: number | null;
	avg_rating: number | null;
	review_count: number;
}

/** A service a technician offers (price range), via technician_services. */
export interface TechnicianServiceDTO {
	id: string;
	name: string;
	description: string;
	min_price: number | null;
	max_price: number | null;
}

export function toDTO(
	row: TechnicianWithAddressRow,
	userLat?: number,
	userLng?: number,
): TechnicianListDTO {
	const activeAddr =
		row.addresses.find((a) => a.is_active) ?? row.addresses[0] ?? null;

	let distance_km: number | null = null;
	if (
		userLat != null &&
		userLng != null &&
		activeAddr?.latitude != null &&
		activeAddr?.longitude != null
	) {
		distance_km = distanceKm(
			userLat,
			userLng,
			activeAddr.latitude,
			activeAddr.longitude,
		);
	}

	return {
		id: row.id,
		first_name: row.first_name,
		last_name: row.last_name,
		email: row.email,
		phone: row.phone,
		is_available: row.is_available,
		category_id: row.category_id,
		profile_image: row.profile_image ?? null,
		description: row.description ?? null,
		city: activeAddr?.city ?? null,
		street: activeAddr?.street ?? null,
		distance_km,
		avg_rating: row.avg_rating ?? null,
		review_count: row.review_count ?? 0,
	};
}

export interface TopRatedFilters {
	categoryId: string;
	searchQuery?: string;
	isAvailable?: boolean;
	minReviewCount?: number;
	limit?: number;
	offset?: number;
}

/** Minimal read interface required by TechniciansService (ISP). */
export interface ITechnicianQueryRepository {
	getTechniciansByCategory(
		categoryId: string,
	): Promise<TechnicianWithAddressRow[]>;
	searchTechniciansByCategory(
		categoryId: string,
		query: string,
	): Promise<TechnicianWithAddressRow[]>;
	getTechnicianProfile(id: string): Promise<TechnicianProfileRow | null>;
	getServicesForTechnician(
		technicianId: string,
	): Promise<TechnicianServiceDTO[]>;
	getReviewAggregatesByTechnicianIds(
		technicianIds: string[],
	): Promise<Map<string, ReviewAggregate>>;
	getTechnicianIdsWithActiveAvailability(
		technicianIds: string[],
	): Promise<Set<string>>;
	/** Bayesian-ranked list via DB RPC (single source of truth for top-rated math). Order is final. */
	listTopRatedTechnicians(
		filters: TopRatedFilters,
	): Promise<TechnicianWithAddressRow[]>;
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
	updateTechnicianSelf(
		id: string,
		data: UpdateTechnicianSelfData,
	): Promise<any>;
	updateProfileImage(id: string, url: string): Promise<any>;
}

/** Address-with-flag shape hydrated alongside RPC results. */
type AddressRow = {
	city: string;
	street: string;
	latitude: number | null;
	longitude: number | null;
	is_active: boolean;
};

/** Row shape returned by list_top_rated_technicians RPC. */
interface TopRatedRpcRow {
	technician_id: string;
	created_at: string;
	first_name: string;
	last_name: string;
	profile_image: string | null;
	category_id: string;
	description: string | null;
	base_hourly_rate: number | string | null;
	years_experience: number | string | null;
	is_available: boolean;
	review_count: number | string;
	rating_sum: number | string;
	rating: number | string;
	bayesian_rating: number | string | null;
}

export class TechniciansRepository implements ITechniciansRepository {
	async getReviewAggregatesByTechnicianIds(
		technicianIds: string[],
	): Promise<Map<string, ReviewAggregate>> {
		if (technicianIds.length === 0) return new Map();

		const { data, error } = await supabaseAdmin
			.from("technician_rating_stats")
			.select("technician_id, review_count, rating")
			.in("technician_id", technicianIds);

		if (error) throw new Error(error.message);

		const byId = new Map<string, { review_count: number; rating: number }>();
		for (const row of (data ?? []) as Array<{
			technician_id: string;
			review_count: number | string;
			rating: number | string;
		}>) {
			byId.set(row.technician_id, {
				review_count: Number(row.review_count),
				rating: Number(row.rating),
			});
		}

		const result = new Map<string, ReviewAggregate>();
		for (const id of technicianIds) {
			const stats = byId.get(id);
			if (stats) {
				result.set(id, {
					avg_rating: stats.rating,
					review_count: stats.review_count,
				});
			} else {
				result.set(id, { avg_rating: 5, review_count: 0 });
			}
		}

		return result;
	}

	async getTechnicianIdsWithActiveAvailability(
		technicianIds: string[],
	): Promise<Set<string>> {
		if (technicianIds.length === 0) return new Set();

		const { data, error } = await supabaseAdmin
			.from("availability_templates")
			.select("technician_id")
			.in("technician_id", technicianIds)
			.eq("active", true);

		if (error) throw new Error(error.message);

		return new Set(
			((data ?? []) as Array<{ technician_id: string }>).map(
				(row) => row.technician_id,
			),
		);
	}

	async listTopRatedTechnicians(
		filters: TopRatedFilters,
	): Promise<TechnicianWithAddressRow[]> {
		const { data, error } = await supabaseAdmin.rpc(
			"list_top_rated_technicians",
			{
				p_category_id: filters.categoryId,
				p_search_query: filters.searchQuery ?? null,
				p_is_available: filters.isAvailable ?? null,
				p_prior_weight: 10,
				p_min_review_count: filters.minReviewCount ?? 0,
				p_limit: filters.limit ?? 20,
				p_offset: filters.offset ?? 0,
			},
		);

		if (error) throw new Error(error.message);
		const rpcRows = (data ?? []) as TopRatedRpcRow[];
		if (rpcRows.length === 0) return [];

		const ids = rpcRows.map((r) => r.technician_id);

		const { data: hydrationData, error: hydrationError } = await supabaseAdmin
			.from("technicians")
			.select(
				"id, email, phone, profile_image, addresses(city, street, latitude, longitude, is_active)",
			)
			.in("id", ids);

		if (hydrationError) throw new Error(hydrationError.message);

		const byId = new Map<
			string,
			{
				email: string;
				phone: string | null;
				profile_image: string | null;
				addresses: AddressRow[];
			}
		>();
		for (const row of (hydrationData ?? []) as Array<{
			id: string;
			email: string;
			phone: string | null;
			profile_image: string | null;
			addresses: AddressRow[] | null;
		}>) {
			byId.set(row.id, {
				email: row.email,
				phone: row.phone,
				profile_image: row.profile_image ?? null,
				addresses: row.addresses ?? [],
			});
		}

		return rpcRows.map((r) => {
			const hydration = byId.get(r.technician_id) ?? {
				email: "",
				phone: null,
				profile_image: r.profile_image ?? null,
				addresses: [],
			};
			return {
				id: r.technician_id,
				first_name: r.first_name,
				last_name: r.last_name,
				email: hydration.email,
				phone: hydration.phone,
				profile_image: hydration.profile_image ?? r.profile_image ?? null,
				is_available: r.is_available,
				category_id: r.category_id,
				description: r.description,
				addresses: hydration.addresses,
				avg_rating: Number(r.rating),
				review_count: Number(r.review_count),
			};
		});
	}

	async getTechnicianProfile(id: string): Promise<TechnicianProfileRow | null> {
		const { data, error } = await supabaseAdmin
			.from("technicians")
			.select(
				"id, first_name, last_name, email, phone, is_available, category_id, profile_image, description, addresses(city, street, latitude, longitude, is_active)",
			)
			.eq("id", id)
			.maybeSingle();

		if (error) throw new Error(error.message);
		if (!data) return null;

		const aggregates = await this.getReviewAggregatesByTechnicianIds([id]);
		const agg = aggregates.get(id) ?? { avg_rating: 5, review_count: 0 };

		const row = data as TechnicianProfileRow;
		return {
			...row,
			addresses: row.addresses ?? [],
			avg_rating: agg.avg_rating,
			review_count: agg.review_count,
		};
	}

	async getServicesForTechnician(
		technicianId: string,
	): Promise<TechnicianServiceDTO[]> {
		const { data, error } = await supabaseAdmin
			.from("technician_services")
			.select("services(id, name, description, min_price, max_price)")
			.eq("technician_id", technicianId);

		if (error) throw new Error(error.message);

		const rows = (data ?? []) as Array<{
			services: TechnicianServiceDTO | TechnicianServiceDTO[] | null;
		}>;

		const services = rows
			.map((row) =>
				Array.isArray(row.services) ? (row.services[0] ?? null) : row.services,
			)
			.filter((s): s is TechnicianServiceDTO => s != null);

		if (services.length > 0) return this.sortTechnicianServices(services);

		// Existing production data may predate technician_services seeding. Fall back
		// to the technician's category services so the detail page remains real-data only.
		return this.getCategoryServicesForTechnician(technicianId);
	}

	private async getCategoryServicesForTechnician(
		technicianId: string,
	): Promise<TechnicianServiceDTO[]> {
		const { data: technician, error: technicianError } = await supabaseAdmin
			.from("technicians")
			.select("category_id")
			.eq("id", technicianId)
			.maybeSingle();

		if (technicianError) throw new Error(technicianError.message);
		if (!technician) return [];

		const { data, error } = await supabaseAdmin
			.from("services")
			.select("id, name, description, min_price, max_price")
			.eq("category_id", (technician as { category_id: string }).category_id);

		if (error) throw new Error(error.message);

		return this.sortTechnicianServices((data ?? []) as TechnicianServiceDTO[]);
	}

	private sortTechnicianServices(
		services: TechnicianServiceDTO[],
	): TechnicianServiceDTO[] {
		return [...services].sort((a, b) => a.name.localeCompare(b.name));
	}

	async getTechniciansByCategory(
		categoryId: string,
	): Promise<TechnicianWithAddressRow[]> {
		const { data, error } = await supabaseAdmin
			.from("technicians")
			.select(
				"id, first_name, last_name, email, phone, is_available, category_id, profile_image, description, addresses(city, street, latitude, longitude, is_active)",
			)
			.eq("category_id", categoryId)
			.order("first_name", { ascending: true });

		if (error) throw new Error(error.message);
		const rows = (data ?? []) as TechnicianWithAddressRow[];

		const aggregates = await this.getReviewAggregatesByTechnicianIds(
			rows.map((r) => r.id),
		);
		return rows.map((r) => {
			const agg = aggregates.get(r.id) ?? { avg_rating: 5, review_count: 0 };
			return {
				...r,
				avg_rating: agg.avg_rating,
				review_count: agg.review_count,
			};
		});
	}

	async searchTechniciansByCategory(
		categoryId: string,
		query: string,
	): Promise<TechnicianWithAddressRow[]> {
		// Escape ilike wildcards in the user input, then escape backslashes/quotes and wrap
		// the value in double quotes so commas/parens are treated as literal text inside .or().
		const escaped = query.replace(/[\\%_]/g, (ch) => `\\${ch}`);
		const term = `"%${escaped.replace(/["\\]/g, (ch) => `\\${ch}`)}%"`;
		const { data, error } = await supabaseAdmin
			.from("technicians")
			.select(
				"id, first_name, last_name, email, phone, is_available, category_id, profile_image, description, addresses(city, street, latitude, longitude, is_active)",
			)
			.eq("category_id", categoryId)
			.or(`first_name.ilike.${term},last_name.ilike.${term}`)
			.order("first_name", { ascending: true });

		if (error) throw new Error(error.message);
		const rows = (data ?? []) as TechnicianWithAddressRow[];

		const aggregates = await this.getReviewAggregatesByTechnicianIds(
			rows.map((r) => r.id),
		);
		return rows.map((r) => {
			const agg = aggregates.get(r.id) ?? { avg_rating: 5, review_count: 0 };
			return {
				...r,
				avg_rating: agg.avg_rating,
				review_count: agg.review_count,
			};
		});
	}

	async createTechnician(data: CreateTechnicianData) {
		try {
			logger.info({
				...data,
				criminal_record: "[file]",
				birth_certificate: "[file]",
				national_id: "[file]",
			});

			const { data: technician, error } = await supabaseAdmin
				.from("technicians")
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
			logger.info({ technician }, "Inserted technician");
			return technician;
		} catch (error) {
			logger.error({ error }, "Error inserting technician");
			throw error;
		}
	}

	async getTechnicianById(id: string) {
		const { data, error } = await supabaseAdmin
			.from("technicians")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;
		return data;
	}

	async getTechnicianByEmail(email: string) {
		const { data, error } = await supabaseAdmin
			.from("technicians")
			.select("*")
			.eq("email", email)
			.maybeSingle(); // returns null instead of error when not found

		if (error) throw error;
		return data; // null if not found
	}

	async emailExists(email: string): Promise<boolean> {
		const { count, error } = await supabaseAdmin
			.from("technicians")
			.select("*", { count: "exact", head: true })
			.eq("email", email);

		if (error) throw error;
		return (count ?? 0) > 0;
	}

	async updateTechnician(id: string, data: UpdateTechnicianData) {
		const { data: technician, error } = await supabaseAdmin
			.from("technicians")
			.update(data)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return technician;
	}

	async deleteTechnician(id: string) {
		const { error } = await supabaseAdmin
			.from("technicians")
			.delete()
			.eq("id", id);

		if (error) throw error;
	}

	async getTechnicianSelf(id: string): Promise<TechnicianSelfProfile | null> {
		const { data, error } = await supabaseAdmin
			.from("technicians")
			.select(
				"id, first_name, last_name, email, phone, profile_image, description, categories(name)",
			)
			.eq("id", id)
			.maybeSingle();

		if (error) throw new Error(error.message);
		if (!data) return null;

		const [{ count: totalOrders }, { count: completedOrders }] =
			await Promise.all([
				supabaseAdmin
					.from("orders")
					.select("*", { count: "exact", head: true })
					.eq("technician_id", id),
				supabaseAdmin
					.from("orders")
					.select("*", { count: "exact", head: true })
					.eq("technician_id", id)
					.eq("status", "completed"),
			]);
		const aggregates = await this.getReviewAggregatesByTechnicianIds([id]);
		const reviewAggregate = aggregates.get(id) ?? {
			avg_rating: 5,
			review_count: 0,
		};

		const categoriesRaw = data.categories as unknown as
			| { name: string }[]
			| { name: string }
			| null;
		const categories = Array.isArray(categoriesRaw)
			? (categoriesRaw[0] ?? null)
			: categoriesRaw;

		return {
			id: data.id,
			first_name: data.first_name ?? "",
			last_name: data.last_name ?? "",
			email: data.email ?? "",
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
			.from("technicians")
			.update(payload)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return technician;
	}

	async updateProfileImage(id: string, url: string) {
		const { data: technician, error } = await supabaseAdmin
			.from("technicians")
			.update({ profile_image: url })
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return technician;
	}
}

export const techniciansRepository = new TechniciansRepository();
