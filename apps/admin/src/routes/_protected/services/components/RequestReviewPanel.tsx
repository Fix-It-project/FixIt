import { Ban, Check, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { StatusBadge } from "@/components/StatusBadge";
import { TechAvatar } from "@/components/TechAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { AdminServiceRequest, ServiceRequestStatus } from "@/types";
import { PriceComparisonBand } from "./PriceComparisonBand";

interface RequestReviewPanelProps {
	request: AdminServiceRequest | null;
	onApprove: (id: string) => void;
	onReject: (id: string, reason?: string) => void;
	approvePending?: boolean;
	rejectPending?: boolean;
	className?: string;
}

const statusVariant: Record<
	ServiceRequestStatus,
	"warn" | "success" | "danger"
> = {
	pending: "warn",
	approved: "success",
	rejected: "danger",
};

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function RequestReviewPanel({
	request,
	onApprove,
	onReject,
	approvePending,
	rejectPending,
	className,
}: RequestReviewPanelProps) {
	const [rejecting, setRejecting] = useState(false);
	const [reason, setReason] = useState("");

	// Reset the reject affordance whenever the selected request changes.
	useEffect(() => {
		setRejecting(false);
		setReason("");
	}, [request?.id]);

	if (!request) {
		return (
			<div
				className={cn(
					"flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
					className,
				)}
			>
				<span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
					<ClipboardList className="h-6 w-6" />
				</span>
				<p className="text-muted-foreground text-sm">
					Select a request to review.
				</p>
			</div>
		);
	}

	const r = request;
	const isPending = r.status === "pending";

	return (
		<div className={cn("flex flex-col", className)}>
			<div className="flex flex-1 flex-col gap-6 p-5 sm:p-6">
				{/* Title + status */}
				<div className="flex items-start justify-between gap-3">
					<h2 className="font-semibold text-foreground text-xl tracking-tight">
						{r.name}
					</h2>
					<StatusBadge variant={statusVariant[r.status]} label={r.status} />
				</div>

				{/* Technician identity */}
				<div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
					<TechAvatar
						initials={r.technicianInitials}
						color={r.color}
						size="md"
					/>
					<div className="min-w-0 flex-1">
						<p className="truncate font-semibold text-foreground text-sm">
							{r.technicianName}
						</p>
						<div className="mt-0.5">
							<CategoryTag
								meta={getCategoryMetaBySpecialty(r.categoryName ?? "")}
								fallbackLabel={r.categoryName ?? "Uncategorized"}
								size="sm"
							/>
						</div>
					</div>
					<span className="whitespace-nowrap text-muted-foreground text-xs">
						Submitted {formatDate(r.createdAt)}
					</span>
				</div>

				{/* Description */}
				<div>
					<p className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
						Description
					</p>
					{r.description ? (
						<p className="rounded-lg bg-muted/40 px-4 py-3 text-foreground text-sm leading-relaxed">
							{r.description}
						</p>
					) : (
						<p className="text-muted-foreground text-sm italic">
							No description provided.
						</p>
					)}
				</div>

				{/* Pricing */}
				<div>
					<p className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
						Proposed pricing
					</p>
					<PriceComparisonBand
						minPrice={r.minPrice}
						maxPrice={r.maxPrice}
						catalogMin={r.categoryCatalogMin}
						catalogMax={r.categoryCatalogMax}
					/>
				</div>

				{/* Decision record (decided requests) */}
				{!isPending && (
					<div className="rounded-lg border border-border px-4 py-3 text-sm">
						<p className="text-muted-foreground text-xs">
							{r.status === "approved" ? "Approved" : "Rejected"}
							{r.reviewedBy ? ` by ${r.reviewedBy}` : ""}
							{r.reviewedAt ? ` on ${formatDate(r.reviewedAt)}` : ""}
						</p>
						{r.status === "rejected" && r.rejectReason && (
							<p className="mt-1.5 text-foreground">{r.rejectReason}</p>
						)}
					</div>
				)}
			</div>

			{/* Decision footer */}
			{isPending && (
				<div className="sticky bottom-0 border-border border-t bg-card/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
					{rejecting ? (
						<div className="flex flex-col gap-3">
							<Textarea
								autoFocus
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								placeholder="Reason for rejection (optional, shared with the technician)"
								maxLength={500}
							/>
							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									onClick={() => {
										setRejecting(false);
										setReason("");
									}}
								>
									Cancel
								</Button>
								<Button
									variant="destructive"
									disabled={rejectPending}
									onClick={() => onReject(r.id, reason.trim() || undefined)}
								>
									<Ban className="mr-1.5 h-4 w-4" /> Confirm reject
								</Button>
							</div>
						</div>
					) : (
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								className="text-destructive hover:bg-destructive/10"
								onClick={() => setRejecting(true)}
							>
								<Ban className="mr-1.5 h-4 w-4" /> Reject
							</Button>
							<Button disabled={approvePending} onClick={() => onApprove(r.id)}>
								<Check className="mr-1.5 h-4 w-4" /> Approve
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
