interface BlockedNoticeProps {
	reason?: string;
	at?: string;
	by?: string;
}

/** Shared "blocked" banner for entity detail pages. */
export function BlockedNotice({ reason, at, by }: BlockedNoticeProps) {
	return (
		<div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
			<p className="text-xs font-semibold text-destructive uppercase tracking-widest mb-1">Blocked</p>
			<p className="text-sm text-foreground">{reason}</p>
			{(at || by) && <p className="text-[11px] text-muted-foreground mt-1">On {at} by {by}</p>}
		</div>
	);
}
