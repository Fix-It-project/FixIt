import { Ban, ExternalLink, Paperclip } from "lucide-react";
import { useState } from "react";
import { CancellationReasonModal } from "@/components/CancellationReasonModal";
import { CategoryTag } from "@/components/CategoryTag";
import { StarRating } from "@/components/StarRating";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import { humanizeStatus, statusVariant } from "@/lib/order-status";
import { useOrderDetail } from "../hooks/useOrderDetail";

interface OrderDetailModalProps {
	orderId: string | null;
	open: boolean;
	onClose: () => void;
}

function fmt(iso: string | null): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function egp(n: number | null): string {
	return n != null ? `EGP ${n.toLocaleString()}` : "—";
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div>
			<p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
			<div className="text-sm text-foreground mt-0.5">{value}</div>
		</div>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div>
			<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{title}</p>
			{children}
		</div>
	);
}

export function OrderDetailModal({ orderId, open, onClose }: OrderDetailModalProps) {
	const { data: o, isLoading } = useOrderDetail(open ? orderId : null);
	const [reasonOpen, setReasonOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Order detail
						{o && <span className="text-xs font-mono text-muted-foreground">{o.id.slice(0, 8)}</span>}
						{o && <StatusBadge variant={statusVariant(o.status)} label={humanizeStatus(o.status)} />}
					</DialogTitle>
				</DialogHeader>

				{isLoading || !o ? (
					<div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
				) : (
					<div className="flex flex-col gap-6">
						{/* Summary */}
						<Section title="Summary">
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
								<Field label="Customer" value={o.customer} />
								<Field label="Technician" value={o.tech} />
								<Field
									label="Category"
									value={<CategoryTag meta={getCategoryMetaBySpecialty(o.category)} fallbackLabel={o.category} size="sm" />}
								/>
								<Field label="Created" value={fmt(o.createdAt)} />
								<Field label="Scheduled" value={o.scheduledStartAt ? fmt(o.scheduledStartAt) : (o.scheduledDate ?? "—")} />
								<Field label="Tech arrived" value={fmt(o.arrivedAt)} />
								<Field label="User completed" value={fmt(o.userCompletedAt)} />
								<Field label="Tech completed" value={fmt(o.technicianCompletedAt)} />
							</div>
							{o.problemDescription && (
								<div className="mt-3">
									<Field label="Problem" value={<span className="text-muted-foreground">{o.problemDescription}</span>} />
								</div>
							)}
						</Section>

						{/* Attachment */}
						{o.attachment && (
							<Section title="Attachment">
								<a href={o.attachment} target="_blank" rel="noreferrer" className="inline-block group">
									<img
										src={o.attachment}
										alt="Order attachment"
										className="max-h-56 rounded-lg border border-border object-cover"
									/>
									<span className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
										<ExternalLink className="h-3 w-3" /> Open full size
									</span>
								</a>
							</Section>
						)}
						{!o.attachment && (
							<Section title="Attachment">
								<p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
									<Paperclip className="h-3.5 w-3.5" /> No attachment
								</p>
							</Section>
						)}

						{/* Negotiation */}
						{o.quotes.length > 0 && (
							<Section title="Negotiation">
								<div className="flex flex-col gap-1.5">
									{o.quotes.map((q, i) => (
										<div
											key={`${q.round}-${i}`}
											className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
										>
											<span className="text-[11px] font-bold text-muted-foreground w-12">R{q.round}</span>
											<span className="capitalize text-foreground font-medium w-24">{q.proposedBy}</span>
											<span className="tabular-nums font-semibold text-foreground">{egp(q.amount)}</span>
											<StatusBadge variant={q.status === "accepted" ? "success" : "muted"} label={q.status} className="ml-auto" />
											<span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:inline">{fmt(q.createdAt)}</span>
										</div>
									))}
								</div>
							</Section>
						)}

						{/* Timeline */}
						{o.events.length > 0 && (
							<Section title="Timeline">
								<div className="flex flex-col gap-2 border-l border-border pl-4">
									{o.events.map((e, i) => (
										<div key={`${e.type}-${i}`} className="relative">
											<span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
											<p className="text-sm text-foreground">{humanizeStatus(e.type)}</p>
											<p className="text-[11px] text-muted-foreground">{e.actorRole} · {fmt(e.createdAt)}</p>
										</div>
									))}
								</div>
							</Section>
						)}

						{/* Payment (always shown; payments not implemented yet) */}
						<Section title="Payment">
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
								<Field label="Final price" value={egp(o.finalPrice)} />
								<Field label="Method" value={o.paymentMethod ?? "—"} />
								<Field label="Status" value={o.payments[0]?.status ?? "Not available"} />
							</div>
						</Section>

						{/* Review */}
						{o.review && (
							<Section title="Review">
								<div className="flex flex-col gap-1.5">
									<StarRating rating={o.review.rating} />
									{o.review.comment && (
										<p className="text-sm text-foreground bg-muted/40 rounded-lg p-3 border-l-2 border-primary">"{o.review.comment}"</p>
									)}
									<p className="text-[11px] text-muted-foreground">{o.review.date}</p>
								</div>
							</Section>
						)}

						{/* Cancellation */}
						{o.cancellationReason && (
							<Section title="Cancellation">
								<button
									type="button"
									onClick={() => setReasonOpen(true)}
									className="inline-flex items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/[0.04] px-3.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
								>
									<Ban className="h-4 w-4" strokeWidth={2.25} />
									View cancellation reason
								</button>
							</Section>
						)}
					</div>
				)}
			</DialogContent>

			<CancellationReasonModal
				reason={o?.cancellationReason ?? null}
				open={reasonOpen}
				onClose={() => setReasonOpen(false)}
			/>
		</Dialog>
	);
}
