// Derived selectors for the technician Jobs page (Requests · Scheduled ·
// Reschedules). All three read from the SHARED `useTechnicianBookingsQuery`
// cache — no extra fetch — and bucket by the canonical status sets so the Jobs
// page never drifts from the dashboard / order-detail views.

import { useMemo } from "react";
import {
	ACTIVE_STATUSES,
	RESCHEDULE_PENDING_STATUSES,
} from "../schemas/order-status.schema";
import type { TechnicianBooking } from "../schemas/response.schema";
import { useTechnicianBookingsQuery } from "./useTechnicianBookingsQuery";

// Scheduled tab = everything the tech has committed to (accepted → in-progress)
// plus reschedule-pending orders (which keep their ORIGINAL date until the
// request resolves, so they belong on that date's group).
const SCHEDULED_JOB_STATUSES = new Set<string>([
	...ACTIVE_STATUSES,
	...RESCHEDULE_PENDING_STATUSES,
]);

export interface ScheduledJobGroup {
	readonly date: string; // YYYY-MM-DD
	readonly jobs: readonly TechnicianBooking[];
}

export type RescheduleDirection = "incoming" | "sent";

export interface RescheduleJob {
	readonly booking: TechnicianBooking;
	readonly direction: RescheduleDirection;
}

function byStartAtAsc(a: TechnicianBooking, b: TechnicianBooking): number {
	return (a.scheduled_start_at ?? "").localeCompare(b.scheduled_start_at ?? "");
}

/** Pending offers awaiting accept/decline, newest first. */
export function useJobRequests() {
	const query = useTechnicianBookingsQuery();
	const data = useMemo(
		() =>
			(query.data ?? [])
				.filter((b) => b.status === "pending")
				.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")),
		[query.data],
	);
	return { ...query, data };
}

/** Committed jobs grouped under their scheduled date (soonest date first). */
export function useScheduledJobGroups() {
	const query = useTechnicianBookingsQuery();
	const data = useMemo<ScheduledJobGroup[]>(() => {
		const byDate = new Map<string, TechnicianBooking[]>();
		for (const booking of query.data ?? []) {
			if (!SCHEDULED_JOB_STATUSES.has(booking.status)) continue;
			const list = byDate.get(booking.scheduled_date) ?? [];
			list.push(booking);
			byDate.set(booking.scheduled_date, list);
		}
		return [...byDate.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([date, jobs]) => ({ date, jobs: jobs.sort(byStartAtAsc) }));
	}, [query.data]);
	return { ...query, data };
}

/**
 * Reschedule requests bucketed by direction, derived from `status` alone (no
 * per-order fetch): `reschedule_requested_by_user` = INCOMING (tech responds),
 * `reschedule_requested_by_technician` = SENT (tech can withdraw). The proposal
 * detail is fetched lazily by the row's `RescheduleRequestPanel` only when the
 * row is mounted by the windowed list.
 */
export function useRescheduleJobs() {
	const query = useTechnicianBookingsQuery();
	const { incoming, sent } = useMemo(() => {
		const inc: RescheduleJob[] = [];
		const out: RescheduleJob[] = [];
		for (const booking of query.data ?? []) {
			if (booking.status === "reschedule_requested_by_user") {
				inc.push({ booking, direction: "incoming" });
			} else if (booking.status === "reschedule_requested_by_technician") {
				out.push({ booking, direction: "sent" });
			}
		}
		return { incoming: inc, sent: out };
	}, [query.data]);
	return { ...query, incoming, sent, total: incoming.length + sent.length };
}
