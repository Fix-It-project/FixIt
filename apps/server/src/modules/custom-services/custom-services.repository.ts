import { supabaseAdmin } from "../../shared/db/supabase.js";
import type {
	AdminCustomServiceRow,
	CustomService,
	SetCustomServiceStatusInput,
	SubmitCustomServiceInput,
} from "./custom-services.types.js";

export interface ICustomServicesRepository {
	submitRequest(input: SubmitCustomServiceInput): Promise<CustomService>;
	listByTechnician(technicianId: string): Promise<CustomService[]>;
	listForAdmin(status?: string): Promise<AdminCustomServiceRow[]>;
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

	async listForAdmin(status?: string): Promise<AdminCustomServiceRow[]> {
		let query = supabaseAdmin
			.from("admin_custom_service_requests")
			.select("*")
			.order("created_at", { ascending: true });

		if (status) query = query.eq("status", status);

		const { data, error } = await query;
		if (error) throw new Error(error.message);
		return (data ?? []) as AdminCustomServiceRow[];
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
	 *  `services` row + the `technician_services` link and flips status to approved,
	 *  atomically and idempotently, in one round trip. */
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
		return (Array.isArray(data) ? data[0] : data) as CustomService;
	}
}

export const customServicesRepository = new CustomServicesRepository();
