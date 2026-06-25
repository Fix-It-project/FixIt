import { env } from "@FixIt/env/server";
import type { CustomServicesListQuery } from "../../shared/dtos/custom-service.dto.js";
import { AppError } from "../../shared/errors/app-error.js";
import { logger } from "../../shared/logger.js";
import { notificationsService } from "../notifications/notifications.service.js";
import {
	type CustomServicesCounts,
	type CustomServicesRepository,
	customServicesRepository,
} from "./custom-services.repository.js";
import type {
	AdminCustomServiceRow,
	CustomService,
} from "./custom-services.types.js";

// Mirrors the admin-dashboard avatar helpers so technician avatars render
// identically across admin surfaces.
const AVATAR_PALETTE = [
	"#3b82f6",
	"#06b6d4",
	"#22c55e",
	"#f97316",
	"#a855f7",
	"#ef4444",
	"#f43f5e",
	"#6366f1",
	"#92400e",
	"#0ea5e9",
];

function colorForName(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = Math.trunc(hash * 31 + name.charCodeAt(i));
	}
	const idx = Math.abs(hash) % AVATAR_PALETTE.length;
	return AVATAR_PALETTE[idx] ?? AVATAR_PALETTE[0]!;
}

function initialsOf(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	const first = parts[0] ?? "";
	if (parts.length === 0) return "?";
	if (parts.length === 1) return first.slice(0, 2).toUpperCase() || "?";
	const last = parts[parts.length - 1] ?? "";
	return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "?";
}

/** DTO returned to the admin dashboard for the service-request queue. */
export interface AdminCustomServiceRequestDTO {
	id: string;
	technicianId: string;
	technicianName: string;
	technicianInitials: string;
	color: string;
	categoryName: string | null;
	name: string;
	description: string | null;
	minPrice: number;
	maxPrice: number;
	categoryCatalogMin: number | null;
	categoryCatalogMax: number | null;
	status: "pending" | "approved" | "rejected";
	rejectReason: string | null;
	reviewedBy: string | null;
	reviewedAt: string | null;
	createdAt: string;
}

function toAdminDTO(row: AdminCustomServiceRow): AdminCustomServiceRequestDTO {
	const name =
		`${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "Technician";
	return {
		id: row.id,
		technicianId: row.technician_id,
		technicianName: name,
		technicianInitials: initialsOf(name),
		color: colorForName(name),
		categoryName: row.category_name,
		name: row.name,
		description: row.description,
		minPrice: row.min_price,
		maxPrice: row.max_price,
		categoryCatalogMin: row.category_catalog_min,
		categoryCatalogMax: row.category_catalog_max,
		status: row.status,
		rejectReason: row.reject_reason,
		reviewedBy: row.reviewed_by,
		reviewedAt: row.reviewed_at,
		createdAt: row.created_at,
	};
}

export class CustomServicesService {
	constructor(private readonly repo: CustomServicesRepository) {}

	/** Technician submits a custom-service request. The DB function inherits the
	 *  technician's category and enforces verified status in one round trip. */
	async submitRequest(
		technicianId: string,
		body: {
			name: string;
			description?: string | null;
			min_price: number;
			max_price: number;
		},
	): Promise<CustomService> {
		try {
			return await this.repo.submitRequest({
				technicianId,
				name: body.name,
				description: body.description ?? null,
				minPrice: body.min_price,
				maxPrice: body.max_price,
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			if (/technician_not_verified/.test(message)) {
				throw AppError.forbidden(
					"Only verified technicians can request custom services.",
				);
			}
			throw err;
		}
	}

	async listOwn(technicianId: string): Promise<CustomService[]> {
		return this.repo.listByTechnician(technicianId);
	}

	async listRequests(params: CustomServicesListQuery): Promise<{
		data: AdminCustomServiceRequestDTO[];
		total: number;
		counts: CustomServicesCounts;
	}> {
		const [{ rows, total }, counts] = await Promise.all([
			this.repo.listForAdmin(params),
			this.repo.countRequests(),
		]);
		return { data: rows.map(toAdminDTO), total, counts };
	}

	/** Approve publishes the request as a bookable catalog service + technician
	 *  link (atomic, in the DB function), then notifies the technician. */
	async approve(id: string): Promise<CustomService> {
		let row: CustomService;
		try {
			row = await this.repo.approveAndPublish(id, env.ADMIN_EMAIL);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			if (/request_not_found/.test(message)) {
				throw AppError.notFound("Service request not found");
			}
			throw err;
		}
		this.notify(row.technician_id, "approved");
		return row;
	}

	async reject(id: string, reason?: string | null): Promise<CustomService> {
		const row = await this.repo.setStatus(id, {
			status: "rejected",
			rejectReason: reason ?? null,
			reviewedBy: env.ADMIN_EMAIL,
		});
		if (!row) throw AppError.notFound("Service request not found");
		this.notify(row.technician_id, "rejected");
		return row;
	}

	/** Fire-and-forget push (see admin-dashboard verifyTechnician): a slow/failed
	 *  push must never delay or fail the decision. */
	private notify(
		technicianId: string,
		decision: "approved" | "rejected",
	): void {
		const approved = decision === "approved";
		void Promise.resolve(
			notificationsService.sendPushToRecipient({
				recipientRole: "technician",
				recipientId: technicianId,
				type: approved ? "custom_service_approved" : "custom_service_rejected",
				title: approved ? "Service approved" : "Service update",
				body: approved
					? "Your custom service request was approved."
					: "Your custom service request was not approved. Open the app for details.",
			}),
		).catch((err) => {
			logger.warn(
				{ err, technicianId, decision },
				"[custom-services] decision push failed",
			);
		});
	}
}

export const customServicesService = new CustomServicesService(
	customServicesRepository,
);
