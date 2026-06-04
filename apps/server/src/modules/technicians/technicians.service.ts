import { supabaseAdmin } from "../../shared/db/supabase.js";
import type { TechnicianSort } from "../../shared/dtos/index.js";
import type { IStorageRepository } from "../../shared/storage/storage.repository.js";
import { sortByDistance } from "../../shared/utils/technicians/index.js";
import type { ICategoriesRepository } from "../categories/categories.repository.js";
import type {
	ITechnicianQueryRepository,
	ITechniciansRepository,
	TechnicianListDTO,
	TechnicianProfile,
	TechnicianSelfProfile,
	TechnicianServiceDTO,
	TechnicianWithAddressRow,
	UpdateTechnicianSelfData,
} from "./technicians.repository.js";
import { toDTO } from "./technicians.repository.js";

export interface TechnicianListOpts {
	lat?: number;
	lng?: number;
	sort?: TechnicianSort;
	limit?: number;
	offset?: number;
}

export interface ITechniciansService {
	getTechniciansByCategory(
		categoryId: string,
		opts?: TechnicianListOpts,
	): Promise<TechnicianListDTO[]>;
	searchTechniciansByCategory(
		categoryId: string,
		query: string,
		opts?: TechnicianListOpts,
	): Promise<TechnicianListDTO[]>;
	getTechnicianProfile(id: string): Promise<TechnicianProfile>;
	getTechnicianServices(id: string): Promise<TechnicianServiceDTO[]>;
	getSelf(technicianId: string): Promise<TechnicianSelfProfile>;
	updateSelf(
		technicianId: string,
		data: UpdateTechnicianSelfData,
	): Promise<TechnicianSelfProfile>;
	uploadProfileImage(
		technicianId: string,
		file: Express.Multer.File,
	): Promise<{ profile_image: string }>;
}

export class TechniciansService implements ITechniciansService {
	constructor(
		private readonly repo: ITechnicianQueryRepository &
			Pick<
				ITechniciansRepository,
				"getTechnicianSelf" | "updateTechnicianSelf" | "updateProfileImage"
			>,
		private readonly categoriesRepo: ICategoriesRepository,
		private readonly storageRepo: IStorageRepository,
	) {}

	async getTechniciansByCategory(
		categoryId: string,
		opts?: TechnicianListOpts,
	): Promise<TechnicianListDTO[]> {
		const { lat, lng, sort, limit, offset } = opts ?? {};
		const category = await this.categoriesRepo.getCategoryById(categoryId);
		if (!category)
			throw Object.assign(new Error("Category not found"), { status: 404 });

		if (sort === "top_rated") {
			const rows = await this.repo.listTopRatedTechnicians({
				categoryId,
				...(limit != null ? { limit } : {}),
				...(offset != null ? { offset } : {}),
			});
			return rows.map((r) => toDTO(r, lat, lng));
		}

		const rows = await this.repo.getTechniciansByCategory(categoryId);
		return this.buildListPage(rows, { lat, lng, sort, limit, offset });
	}

	async searchTechniciansByCategory(
		categoryId: string,
		query: string,
		opts?: TechnicianListOpts,
	): Promise<TechnicianListDTO[]> {
		const { lat, lng, sort, limit, offset } = opts ?? {};
		const category = await this.categoriesRepo.getCategoryById(categoryId);
		if (!category)
			throw Object.assign(new Error("Category not found"), { status: 404 });

		if (sort === "top_rated") {
			const rows = await this.repo.listTopRatedTechnicians({
				categoryId,
				searchQuery: query,
				...(limit != null ? { limit } : {}),
				...(offset != null ? { offset } : {}),
			});
			return rows.map((r) => toDTO(r, lat, lng));
		}

		const rows = await this.repo.searchTechniciansByCategory(categoryId, query);
		return this.buildListPage(rows, { lat, lng, sort, limit, offset });
	}

	private buildListPage(
		rows: TechnicianWithAddressRow[],
		opts: TechnicianListOpts,
	): TechnicianListDTO[] {
		const { lat, lng, sort, limit, offset } = opts;
		if (sort === "nearest") {
			const dtos = rows.map((r) => toDTO(r, lat, lng));
			return this.paginate(sortByDistance(dtos), limit, offset);
		}

		const sortedRows =
			sort === "most_reviews" ? this.sortRowsByMostReviews(rows) : rows;
		return this.paginate(sortedRows, limit, offset).map((r) =>
			toDTO(r, lat, lng),
		);
	}

	private sortRowsByMostReviews(
		rows: TechnicianWithAddressRow[],
	): TechnicianWithAddressRow[] {
		return [...rows].sort((a, b) => {
			const reviewCountA = a.review_count ?? 0;
			const reviewCountB = b.review_count ?? 0;
			if (reviewCountB !== reviewCountA) return reviewCountB - reviewCountA;
			const ratingA = a.avg_rating ?? -1;
			const ratingB = b.avg_rating ?? -1;
			if (ratingB !== ratingA) return ratingB - ratingA;
			return a.first_name.localeCompare(b.first_name);
		});
	}

	private paginate<T>(
		items: T[],
		limit: number | undefined,
		offset: number | undefined,
	): T[] {
		const start = offset ?? 0;
		if (limit == null) return start > 0 ? items.slice(start) : items;
		return items.slice(start, start + limit);
	}

	async getTechnicianProfile(id: string): Promise<TechnicianProfile> {
		const technician = await this.repo.getTechnicianProfile(id);
		if (!technician) {
			throw Object.assign(new Error("Technician not found"), { status: 404 });
		}

		const [{ count: totalBookings }, { count: completedOrders }] =
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

		const reviewCount = technician.review_count ?? 0;

		return {
			name: `${technician.first_name} ${technician.last_name}`,
			profilePicture: technician.profile_image ?? null,
			description: technician.description ?? "No description available",
			completedOrders: Number(completedOrders ?? 0),
			totalBookings: Number(totalBookings ?? 0),
			reviews: reviewCount,
			phoneNumber: technician.phone ?? "Not provided",
			avg_rating: technician.avg_rating ?? null,
			review_count: reviewCount,
		};
	}

	async getTechnicianServices(id: string): Promise<TechnicianServiceDTO[]> {
		return this.repo.getServicesForTechnician(id);
	}

	async getSelf(technicianId: string): Promise<TechnicianSelfProfile> {
		const profile = await this.repo.getTechnicianSelf(technicianId);
		if (!profile) {
			throw Object.assign(new Error("Technician not found"), { status: 404 });
		}
		return profile;
	}

	async updateSelf(
		technicianId: string,
		data: UpdateTechnicianSelfData,
	): Promise<TechnicianSelfProfile> {
		await this.repo.updateTechnicianSelf(technicianId, data);
		return this.getSelf(technicianId);
	}

	async uploadProfileImage(
		technicianId: string,
		file: Express.Multer.File,
	): Promise<{ profile_image: string }> {
		const url = await this.storageRepo.uploadFile(
			technicianId,
			"profile_image",
			file,
		);
		await this.repo.updateProfileImage(technicianId, url);
		return { profile_image: url };
	}
}
