import type { TechHomeOrder } from "../schemas/orders.schema";

/**
 * Ascending by `scheduled_start_at`. The column is nullable, so orders without a
 * start time sort **last** (never first). Ties break on `created_at` then `id`
 * so ordering is stable when two same-day orders share (or lack) a start time.
 * ISO strings compare chronologically via localeCompare.
 */
export function byStartTime(a: TechHomeOrder, b: TechHomeOrder): number {
	const aStart = a.scheduled_start_at ?? null;
	const bStart = b.scheduled_start_at ?? null;

	if (aStart !== bStart) {
		if (aStart === null) return 1;
		if (bStart === null) return -1;
		const byStart = aStart.localeCompare(bStart);
		if (byStart !== 0) return byStart;
	}

	const byCreated = (a.created_at ?? "").localeCompare(b.created_at ?? "");
	if (byCreated !== 0) return byCreated;

	return a.id.localeCompare(b.id);
}
