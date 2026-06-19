import { supabaseAdmin } from "../../shared/db/supabase.js";
import type { CustomServicesListQuery } from "../../shared/dtos/custom-service.dto.js";
import type {
	AdminCustomServiceRow,
	CustomService,
	SetCustomServiceStatusInput,
	SubmitCustomServiceInput,
} from "./custom-services.types.js";

export interface CustomServicesCounts {
	pending: number;
	decided: number;
}

export interface ICustomServicesRepository {
	submitRequest(input: SubmitCustomServiceInput): Promise<CustomService>;
	listByTechnician(technicianId: string): Promise<CustomService[]>;
	listForAdmin(
		params: CustomServicesListQuery,
	): Promise<{ rows: AdminCustomServiceRow[]; total: number }>;
	countRequests(): Promise<CustomServicesCounts>;
	setStatus(
		id: string,
		input: SetCustomServiceStatusInput,
	): Promise<CustomService | null>;
	approveAndPublish(id: string, reviewedBy: string): Promise<CustomService>;
}

export class CustomServicesRepository implements ICustomServicesRepository {
	/** One round trip: the `submit_custom_service` function inherits the
	 *  technician's category, enforces verified status, and inserts atomically. */
	async submitRequest(input: SubmitCustomServiceInput): Promise<CustomService> {
		const { data, error } = await supabaseAdmin.rpc("submit_custom_service", {
			p_technician_id: input.technicianId,
			p_name: input.name,
			p_description: input.description ?? null,
			p_min_price: input.minPrice,
			p_max_price: input.maxPrice,
		});

		if (error) {
			// Surface the verified-status guard distinctly so the service can map it.
			const err = new Error(error.message) as Error & { code?: string };
			err.code = error.code;
			throw err;
		}
		return (Array.isArray(data) ? data[0] : data) as CustomService;
	}

	async listByTechnician(technicianId: string): Promise<CustomService[]> {
		const { data, error } = await supabaseAdmin
			.from("technician_custom_services")
			.select("*")
			.eq("technician_id", technicianId)
			.order("created_at", { ascending: false });

		if (error) throw new Error(error.message);
		return (data ?? []) as CustomService[];
	}

	async listForAdmin(
		params: CustomServicesListQuery,
	): Promise<{ rows: AdminCustomServiceRow[]; total: number }> {
		// Pending = oldest-first (review queue); decided = newest-first (recent first).
		const decided = params.status === "decided";
		let query = supabaseAdmin
			.from("admin_custom_service_requests")
			.select("*", { count: "exact" })
			.order("created_at", { ascending: !decided });

		query = decided
			? query.neq("status", "pending")
			: query.eq("status", "pending");

		query = query.range(
			(params.page - 1) * params.pageSize,
			params.page * params.pageSize - 1,
		);

		const { data, error, count } = await query;
		if (error) throw new Error(error.message);
		return { rows: (data ?? []) as AdminCustomServiceRow[], total: count ?? 0 };
	}

	/** Pending vs decided counts for the queue tabs. */
	async countRequests(): Promise<CustomServicesCounts> {
		const headCount = async (apply: "pending" | "decided"): Promise<number> => {
			let q = supabaseAdmin
				.from("admin_custom_service_requests")
				.select("id", { count: "exact", head: true });
			q =
				apply === "decided"
					? q.neq("status", "pending")
					: q.eq("status", "pending");
			const { count, error } = await q;
			if (error) throw new Error(error.message);
			return count ?? 0;
		};
		const [pending, decided] = await Promise.all([
			headCount("pending"),
			headCount("decided"),
		]);
		return { pending, decided };
	}

	async setStatus(
		id: string,
		input: SetCustomServiceStatusInput,
	): Promise<CustomService | null> {
		const { data, error } = await supabaseAdmin
			.from("technician_custom_services")
			.update({
				status: input.status,
				reject_reason: input.rejectReason ?? null,
				reviewed_by: input.reviewedBy,
				reviewed_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select("*")
			.maybeSingle();

		if (error) throw new Error(error.message);
		return (data as CustomService | null) ?? null;
	}

	/** Approve = publish. The `approve_custom_service` function inserts the catalog
	 *  `services` row + the `technician_services` link. Keep status persistence here
	 *  too so older DB functions cannot publish while leaving the request pending. */
	async approveAndPublish(
		id: string,
		reviewedBy: string,
	): Promise<CustomService> {
		const { data, error } = await supabaseAdmin.rpc("approve_custom_service", {
			p_id: id,
			p_reviewed_by: reviewedBy,
		});

		if (error) {
			// Surface the not-found guard distinctly so the service can map it.
			const err = new Error(error.message) as Error & { code?: string };
			err.code = error.code;
			throw err;
		}
		const rpcRow = (Array.isArray(data) ? data[0] : data) as CustomService;
		const { data: approved, error: approveError } = await supabaseAdmin
			.from("technician_custom_services")
			.update({
				status: "approved",
				reject_reason: null,
				reviewed_by: reviewedBy,
				reviewed_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select("*")
			.maybeSingle();

		if (approveError) throw new Error(approveError.message);
		return (approved as CustomService | null) ?? rpcRow;
	}
}

export const customServicesRepository = new CustomServicesRepository();
