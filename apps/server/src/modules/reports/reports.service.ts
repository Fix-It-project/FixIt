import { env } from "@FixIt/env/server";
import type { ReportsListQuery } from "../../shared/dtos/report.dto.js";
import { AppError } from "../../shared/errors/app-error.js";
import { logger } from "../../shared/logger.js";
import { notificationsService } from "../notifications/notifications.service.js";
import {
	type ReportsCounts,
	type ReportsRepository,
	reportsRepository,
} from "./reports.repository.js";
import type {
	AdminReportRow,
	Report,
	ReporterRole,
	ReportLabel,
	ReportResolution,
} from "./reports.types.js";

// Mirrors the admin-dashboard / custom-services avatar helpers so reporter and
// reported avatars render identically across admin surfaces.
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
		hash = (hash * 31 + name.charCodeAt(i)) | 0;
	}
	const idx = Math.abs(hash) % AVATAR_PALETTE.length;
	return AVATAR_PALETTE[idx] ?? AVATAR_PALETTE[0] ?? "#3b82f6";
}

function initialsOf(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	const first = parts[0] ?? "";
	if (parts.length === 0) return "?";
	if (parts.length === 1) return first.slice(0, 2).toUpperCase() || "?";
	const last = parts[parts.length - 1] ?? "";
	return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "?";
}

/** Human-readable label text shared with the admin UI. */
const LABEL_TEXT: Record<ReportLabel, string> = {
	no_show: "No-show",
	unprofessional: "Unprofessional conduct",
	overcharged: "Overcharged",
	poor_quality: "Poor quality work",
	safety_concern: "Safety concern",
	abusive: "Abusive behavior",
	refused_payment: "Refused payment",
	unsafe_dishonest: "Unsafe / dishonest",
	other: "Other",
};

/** DTO returned to the admin reports queue. */
export interface AdminReportDTO {
	id: string;
	reporterId: string;
	reporterRole: ReporterRole;
	reporterName: string;
	reporterInitials: string;
	reporterColor: string;
	reportedId: string;
	reportedRole: ReporterRole;
	reportedName: string;
	reportedInitials: string;
	reportedColor: string;
	orderId: string;
	orderServiceName: string | null;
	orderCategoryId: string | null;
	orderCategoryName: string | null;
	orderCreatedAt: string | null;
	label: ReportLabel;
	labelText: string;
	summary: string;
	status: "open" | "closed";
	resolution: ReportResolution | null;
	resolvedBy: string | null;
	resolvedAt: string | null;
	warnedAt: string | null;
	createdAt: string;
}

function toAdminDTO(row: AdminReportRow): AdminReportDTO {
	return {
		id: row.id,
		reporterId: row.reporter_id,
		reporterRole: row.reporter_role,
		reporterName: row.reporter_name,
		reporterInitials: initialsOf(row.reporter_name),
		reporterColor: colorForName(row.reporter_name),
		reportedId: row.reported_id,
		reportedRole: row.reported_role,
		reportedName: row.reported_name,
		reportedInitials: initialsOf(row.reported_name),
		reportedColor: colorForName(row.reported_name),
		orderId: row.order_id,
		orderServiceName: row.order_service_name,
		orderCategoryId: row.order_category_id,
		orderCategoryName: row.order_category_name,
		orderCreatedAt: row.order_created_at,
		label: row.label,
		labelText: LABEL_TEXT[row.label] ?? row.label,
		summary: row.summary,
		status: row.status,
		resolution: row.resolution,
		resolvedBy: row.resolved_by,
		resolvedAt: row.resolved_at,
		warnedAt: row.warned_at,
		createdAt: row.created_at,
	};
}

export class ReportsService {
	constructor(private readonly repo: ReportsRepository) {}

	/** A user or technician files a report. The DB function validates order
	 *  membership and the label direction in one round trip. */
	async submit(
		reporterId: string,
		reporterRole: ReporterRole,
		body: { orderId: string; label: ReportLabel; summary: string },
	): Promise<Report> {
		try {
			return await this.repo.submitReport({
				reporterId,
				reporterRole,
				orderId: body.orderId,
				label: body.label,
				summary: body.summary,
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			if (/not_order_party/.test(message)) {
				throw AppError.forbidden(
					"You can only report someone from an order you were part of.",
				);
			}
			if (/invalid_label/.test(message)) {
				throw AppError.badRequest("That reason isn't valid for this report.");
			}
			if (/no_counterparty/.test(message)) {
				throw AppError.badRequest(
					"This order has no counterparty to report yet.",
				);
			}
			if (/order_not_found/.test(message)) {
				throw AppError.notFound("Order not found.");
			}
			if (/duplicate_report/.test(message)) {
				throw AppError.conflict(
					"You've already filed this report for this order.",
				);
			}
			throw err;
		}
	}

	async listReports(params: ReportsListQuery): Promise<{
		data: AdminReportDTO[];
		total: number;
		counts: ReportsCounts;
	}> {
		const [{ rows, total }, counts] = await Promise.all([
			this.repo.listForAdmin(params),
			this.repo.countReports(params.status),
		]);
		return { data: rows.map(toAdminDTO), total, counts };
	}

	async resolve(id: string): Promise<Report> {
		return this.close(id, "resolved");
	}

	async dismiss(id: string): Promise<Report> {
		return this.close(id, "dismissed");
	}

	private async close(
		id: string,
		resolution: ReportResolution,
	): Promise<Report> {
		const row = await this.repo.setStatus(id, {
			status: "closed",
			resolution,
			resolvedBy: env.ADMIN_EMAIL,
		});
		if (!row) throw AppError.notFound("Report not found");
		this.notifyReporter(row.reporter_id, row.reporter_role, resolution);
		return row;
	}

	async reopen(id: string): Promise<Report> {
		const row = await this.repo.setStatus(id, {
			status: "open",
			resolution: null,
			resolvedBy: null,
		});
		if (!row) throw AppError.notFound("Report not found");
		return row;
	}

	async warn(id: string): Promise<Report> {
		const row = await this.repo.markWarned(id);
		if (!row) throw AppError.notFound("Report not found");
		this.notifyReported(row.reported_id, row.reported_role);
		return row;
	}

	/** Fire-and-forget: a slow/failed push must never delay or fail the decision. */
	private notifyReporter(
		reporterId: string,
		reporterRole: ReporterRole,
		resolution: ReportResolution,
	): void {
		void Promise.resolve(
			notificationsService.sendPushToRecipient({
				recipientRole: reporterRole,
				recipientId: reporterId,
				type: "report_reviewed",
				title: "Report reviewed",
				body:
					resolution === "resolved"
						? "Your report was reviewed and action was taken."
						: "Your report was reviewed and closed.",
			}),
		).catch((err) => {
			logger.warn(
				{ err, reporterId, resolution },
				"[reports] reporter push failed",
			);
		});
	}

	private notifyReported(reportedId: string, reportedRole: ReporterRole): void {
		void Promise.resolve(
			notificationsService.sendPushToRecipient({
				recipientRole: reportedRole,
				recipientId: reportedId,
				type: "report_warning",
				title: "Warning issued",
				body: "You've received a warning following a report. Please review the FixIt guidelines.",
			}),
		).catch((err) => {
			logger.warn({ err, reportedId }, "[reports] warning push failed");
		});
	}
}

export const reportsService = new ReportsService(reportsRepository);
