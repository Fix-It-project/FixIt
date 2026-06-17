import { supabaseAdmin } from "../../shared/db/supabase.js";
import type { ReportsListQuery } from "../../shared/dtos/report.dto.js";
import type {
	AdminReportRow,
	Report,
	SetReportStatusInput,
	SubmitReportInput,
} from "./reports.types.js";

export interface ReportsCounts {
	open: number;
	closed: number;
	all: number;
	user: number;
	technician: number;
}

export interface IReportsRepository {
	submitReport(input: SubmitReportInput): Promise<Report>;
	listForAdmin(
		params: ReportsListQuery,
	): Promise<{ rows: AdminReportRow[]; total: number }>;
	countReports(status: "open" | "closed"): Promise<ReportsCounts>;
	setStatus(id: string, input: SetReportStatusInput): Promise<Report | null>;
	markWarned(id: string): Promise<Report | null>;
}

export class ReportsRepository implements IReportsRepository {
	/** One round trip: `submit_report` validates the reporter is a party to the
	 *  order, infers the counterparty, checks the label, and inserts atomically. */
	async submitReport(input: SubmitReportInput): Promise<Report> {
		const { data, error } = await supabaseAdmin.rpc("submit_report", {
			p_reporter_id: input.reporterId,
			p_reporter_role: input.reporterRole,
			p_order_id: input.orderId,
			p_label: input.label,
			p_summary: input.summary,
		});

		if (error) {
			// Surface the guard exceptions distinctly so the service can map them.
			const err = new Error(error.message) as Error & { code?: string };
			err.code = error.code;
			throw err;
		}
		return (Array.isArray(data) ? data[0] : data) as Report;
	}

	async listForAdmin(
		params: ReportsListQuery,
	): Promise<{ rows: AdminReportRow[]; total: number }> {
		let query = supabaseAdmin
			.from("admin_reports")
			.select("*", { count: "exact" })
			.eq("status", params.status)
			.order("created_at", { ascending: false });

		if (params.source !== "all") {
			query = query.eq("reporter_role", params.source);
		}

		query = query.range(
			(params.page - 1) * params.pageSize,
			params.page * params.pageSize - 1,
		);

		const { data, error, count } = await query;
		if (error) throw new Error(error.message);
		return { rows: (data ?? []) as AdminReportRow[], total: count ?? 0 };
	}

	/** Tab counts (open/closed, all sources) + source counts within `status`. */
	async countReports(status: "open" | "closed"): Promise<ReportsCounts> {
		const headCount = async (eqs: Record<string, string>): Promise<number> => {
			let q = supabaseAdmin
				.from("admin_reports")
				.select("id", { count: "exact", head: true });
			for (const [col, val] of Object.entries(eqs)) q = q.eq(col, val);
			const { count, error } = await q;
			if (error) throw new Error(error.message);
			return count ?? 0;
		};

		const [open, closed, all, user, technician] = await Promise.all([
			headCount({ status: "open" }),
			headCount({ status: "closed" }),
			headCount({ status }),
			headCount({ status, reporter_role: "user" }),
			headCount({ status, reporter_role: "technician" }),
		]);
		return { open, closed, all, user, technician };
	}

	async setStatus(
		id: string,
		input: SetReportStatusInput,
	): Promise<Report | null> {
		const closing = input.status === "closed";
		const { data, error } = await supabaseAdmin
			.from("reports")
			.update({
				status: input.status,
				resolution: input.resolution ?? null,
				resolved_by: input.resolvedBy ?? null,
				resolved_at: closing ? new Date().toISOString() : null,
			})
			.eq("id", id)
			.select("*")
			.maybeSingle();

		if (error) throw new Error(error.message);
		return (data as Report | null) ?? null;
	}

	async markWarned(id: string): Promise<Report | null> {
		const { data, error } = await supabaseAdmin
			.from("reports")
			.update({ warned_at: new Date().toISOString() })
			.eq("id", id)
			.select("*")
			.maybeSingle();

		if (error) throw new Error(error.message);
		return (data as Report | null) ?? null;
	}
}

export const reportsRepository = new ReportsRepository();
