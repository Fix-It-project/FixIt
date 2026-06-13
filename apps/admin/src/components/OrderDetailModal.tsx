import { Ban, ExternalLink, Paperclip } from "lucide-react";
import { useState } from "react";
import { CancellationReasonModal } from "@/components/CancellationReasonModal";
import { CategoryTag } from "@/components/CategoryTag";
import { StarRating } from "@/components/StarRating";
import { StatusBadge } from "@/components/StatusBadge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import { humanizeStatus, statusVariant } from "@/lib/order-status";

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
			<p className="text-[11px] text-muted-foreground uppercase tracking-wider">
				{label}
			</p>
			<div className="mt-0.5 text-foreground text-sm">{value}</div>
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<p className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
				{title}
			</p>
			{children}
		</div>
	);
}

export function OrderDetailModal({
	orderId,
	open,
	onClose,
}: OrderDetailModalProps) {
	const { data: o, isLoading } = useOrderDetail(open ? orderId : null);
	const [reasonOpen, setReasonOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Order detail
						{o && (
							<span className="font-mono text-muted-foreground text-xs">
								{o.id.slice(0, 8)}
							</span>
						)}
						{o && (
							<StatusBadge
								variant={statusVariant(o.status)}
								label={humanizeStatus(o.status)}
							/>
						)}
					</DialogTitle>
				</DialogHeader>

				{isLoading || !o ? (
					<div className="py-10 text-center text-muted-foreground text-sm">
						Loading…
					</div>
				) : (
					<div className="flex flex-col gap-6">
						{/* Summary */}
						<Section title="Summary">
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
								<Field label="Customer" value={o.customer} />
								<Field label="Technician" value={o.tech} />
								<Field
									label="Category"
									value={
										<CategoryTag
											meta={getCategoryMetaBySpecialty(o.category)}
											fallbackLabel={o.category}
											size="sm"
										/>
									}
								/>
								<Field label="Created" value={fmt(o.createdAt)} />
								<Field
									label="Scheduled"
									value={
										o.scheduledStartAt
											? fmt(o.scheduledStartAt)
											: (o.scheduledDate ?? "—")
									}
								/>
								<Field label="Tech arrived" value={fmt(o.arrivedAt)} />
								<Field label="User completed" value={fmt(o.userCompletedAt)} />
								<Field
									label="Tech completed"
									value={fmt(o.technicianCompletedAt)}
								/>
							</div>
							{o.problemDescription && (
								<div className="mt-3">
									<Field
										label="Problem"
										value={
											<span className="text-muted-foreground">
												{o.problemDescription}
											</span>
										}
									/>
								</div>
							)}
						</Section>

						{/* Attachment */}
						{o.attachment && (
							<Section title="Attachment">
								<a
									href={o.attachment}
									target="_blank"
									rel="noreferrer"
									className="group inline-block"
								>
									<img
										src={o.attachment}
										alt="Order attachment"
										className="max-h-56 rounded-lg border border-border object-cover"
									/>
									<span className="mt-1 inline-flex items-center gap-1 text-primary text-xs">
										<ExternalLink className="h-3 w-3" /> Open full size
									</span>
								</a>
							</Section>
						)}
						{!o.attachment && (
							<Section title="Attachment">
								<p className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
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
											<span className="w-12 font-bold text-[11px] text-muted-foreground">
												R{q.round}
											</span>
											<span className="w-24 font-medium text-foreground capitalize">
												{q.proposedBy}
											</span>
											<span className="font-semibold text-foreground tabular-nums">
												{egp(q.amount)}
											</span>
											<StatusBadge
												variant={q.status === "accepted" ? "success" : "muted"}
												label={q.status}
												className="ml-auto"
											/>
											<span className="hidden whitespace-nowrap text-[11px] text-muted-foreground sm:inline">
												{fmt(q.createdAt)}
											</span>
										</div>
									))}
								</div>
							</Section>
						)}

						{/* Timeline */}
						{o.events.length > 0 && (
							<Section title="Timeline">
								<div className="flex flex-col gap-2 border-border border-l pl-4">
									{o.events.map((e, i) => (
										<div key={`${e.type}-${i}`} className="relative">
											<span className="absolute top-1.5 -left-[21px] h-2 w-2 rounded-full bg-primary" />
											<p className="text-foreground text-sm">
												{humanizeStatus(e.type)}
											</p>
											<p className="text-[11px] text-muted-foreground">
												{e.actorRole} · {fmt(e.createdAt)}
											</p>
										</div>
									))}
								</div>
							</Section>
						)}

						{/* Payment (always shown; payments not implemented yet) */}
						<Section title="Payment">
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
								<Field label="Final price" value={egp(o.finalPrice)} />
								<Field label="Method" value={o.paymentMethod ?? "—"} />
								<Field
									label="Status"
									value={o.payments[0]?.status ?? "Not available"}
								/>
							</div>
						</Section>

						{/* Review */}
						{o.review && (
							<Section title="Review">
								<div className="flex flex-col gap-1.5">
									<StarRating rating={o.review.rating} />
									{o.review.comment && (
										<p className="rounded-lg border-primary border-l-2 bg-muted/40 p-3 text-foreground text-sm">
											"{o.review.comment}"
										</p>
									)}
									<p className="text-[11px] text-muted-foreground">
										{o.review.date}
									</p>
								</div>
							</Section>
						)}

						{/* Cancellation */}
						{o.cancellationReason && (
							<Section title="Cancellation">
								<button
									type="button"
									onClick={() => setReasonOpen(true)}
									className="inline-flex items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/[0.04] px-3.5 py-2 font-medium text-destructive text-sm transition-colors hover:bg-destructive/10"
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
