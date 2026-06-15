import { supabaseAdmin } from "../../shared/db/supabase.js";
import type {
	AdminReportRow,
	Report,
	SetReportStatusInput,
	SubmitReportInput,
} from "./reports.types.js";

export interface IReportsRepository {
	submitReport(input: SubmitReportInput): Promise<Report>;
	listForAdmin(status?: string): Promise<AdminReportRow[]>;
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

	async listForAdmin(status?: string): Promise<AdminReportRow[]> {
		let query = supabaseAdmin
			.from("admin_reports")
			.select("*")
			.order("created_at", { ascending: false });

		if (status) query = query.eq("status", status);

		const { data, error } = await query;
		if (error) throw new Error(error.message);
		return (data ?? []) as AdminReportRow[];
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
