import {
	AlertTriangle,
	ArrowRight,
	Ban,
	CheckCircle2,
	ChevronRight,
	ClipboardList,
	RotateCcw,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { TechAvatar } from "@/components/TechAvatar";
import { Button } from "@/components/ui/button";
import { getCategoryMetaById } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { AdminReport } from "@/types";
import { useBlockHomeowner } from "../../homeowners/hooks/useHomeowners";
import { BlockReasonModal } from "../../technicians/components/BlockReasonModal";
import { useBlockTechnician } from "../../technicians/hooks/useTechnicians";
import { ReasonChip } from "./ReasonChip";
import { ROLE_META, RoleChip, roleColor } from "./RoleChip";

interface ReportCasePanelProps {
	report: AdminReport | null;
	onResolve: (id: string) => void;
	onDismiss: (id: string) => void;
	onReopen: (id: string) => void;
	onWarn: (id: string) => void;
	resolvePending?: boolean;
	dismissPending?: boolean;
	reopenPending?: boolean;
	warnPending?: boolean;
	className?: string;
}

function formatDate(iso: string | null): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function relativeAge(iso: string): string {
	const diffMs = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diffMs / 60000);
	if (mins < 60) return `${Math.max(mins, 1)} min`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.floor(hours / 24);
	return `${days}d`;
}

/** Avatar with a role-tinted ring — the building block of the confrontation header. */
function PartyAvatar({
	initials,
	color,
	ring,
}: {
	initials: string;
	color: string;
	ring: string;
}) {
	return (
		<span
			className="inline-flex shrink-0 rounded-full"
			style={{ boxShadow: `0 0 0 2px ${ring}` }}
		>
			<TechAvatar initials={initials} color={color} size="md" />
		</span>
	);
}

export function ReportCasePanel({
	report,
	onResolve,
	onDismiss,
	onReopen,
	onWarn,
	resolvePending,
	dismissPending,
	reopenPending,
	warnPending,
	className,
}: ReportCasePanelProps) {
	const [blocking, setBlocking] = useState(false);
	const [orderOpen, setOrderOpen] = useState(false);

	const blockTech = useBlockTechnician();
	const blockHome = useBlockHomeowner();
	const blockPending = blockTech.isPending || blockHome.isPending;

	// Reset transient affordances whenever the selected report changes.
	// biome-ignore lint/correctness/useExhaustiveDependencies: report?.id is the intended reset trigger
	useEffect(() => {
		setBlocking(false);
		setOrderOpen(false);
	}, [report?.id]);

	if (!report) {
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
					Select a report to review.
				</p>
			</div>
		);
	}

	const r = report;
	const isOpen = r.status === "open";

	function confirmBlock(reason: string) {
		const opts = {
			onSuccess: () => {
				setBlocking(false);
				onResolve(r.id);
			},
		};
		if (r.reportedRole === "technician") {
			blockTech.mutate({ id: r.reportedId, reason }, opts);
		} else {
			blockHome.mutate({ id: r.reportedId, reason }, opts);
		}
	}

	return (
		<div className={cn("flex flex-col", className)}>
			<div className="flex flex-1 flex-col gap-6 p-5 sm:p-6">
				{/* Confrontation header — who reported whom, read at a glance */}
				<div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
					<div className="flex min-w-0 flex-1 items-center gap-3">
						<PartyAvatar
							initials={r.reporterInitials}
							color={r.reporterColor}
							ring={roleColor(r.reporterRole)}
						/>
						<div className="min-w-0">
							<p className="truncate font-semibold text-foreground text-sm">
								{r.reporterName}
							</p>
							<div className="mt-1">
								<RoleChip role={r.reporterRole} />
							</div>
						</div>
					</div>

					<div className="flex flex-col items-center gap-1 px-1">
						<span className="font-semibold text-[9px] text-muted-foreground uppercase tracking-widest">
							reported
						</span>
						<span className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border">
							<ArrowRight className="h-4 w-4" />
						</span>
					</div>

					<div className="flex min-w-0 flex-1 items-center justify-end gap-3 text-right">
						<div className="min-w-0">
							<p className="truncate font-semibold text-foreground text-sm">
								{r.reportedName}
							</p>
							<div className="mt-1 flex justify-end">
								<RoleChip role={r.reportedRole} />
							</div>
						</div>
						<PartyAvatar
							initials={r.reportedInitials}
							color={r.reportedColor}
							ring={roleColor(r.reportedRole)}
						/>
					</div>
				</div>

				{/* Reason + age + warned marker */}
				<div className="flex flex-wrap items-center gap-3">
					<ReasonChip label={r.label} labelText={r.labelText} size="md" />
					<span className="text-muted-foreground text-xs">
						Filed {relativeAge(r.createdAt)} ago
					</span>
					{r.warnedAt && (
						<span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 font-semibold text-[11px] text-amber-600">
							<AlertTriangle className="h-3 w-3" /> Warned
						</span>
					)}
				</div>

				{/* Summary */}
				<div>
					<p className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
						Summary
					</p>
					<p className="rounded-lg bg-muted/40 px-4 py-3 text-foreground text-sm leading-relaxed">
						{r.summary}
					</p>
				</div>

				{/* Linked order */}
				<div>
					<p className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
						Linked order
					</p>
					<button
						type="button"
						onClick={() => setOrderOpen(true)}
						className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/40"
					>
						<CategoryTag
							meta={getCategoryMetaById(r.orderCategoryId ?? "")}
							fallbackLabel={r.orderCategoryName ?? "Service"}
							size="sm"
							hideLabel
						/>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-foreground text-sm">
								{r.orderServiceName ?? r.orderCategoryName ?? "Order"}
							</p>
							<p className="text-muted-foreground text-xs">
								Order {r.orderId.slice(0, 8)} · {formatDate(r.orderCreatedAt)}
							</p>
						</div>
						<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
					</button>
				</div>

				{/* Decision record (closed reports) */}
				{!isOpen && (
					<div className="rounded-lg border border-border px-4 py-3 text-sm">
						<p className="text-muted-foreground text-xs">
							{r.resolution === "resolved" ? "Resolved" : "Dismissed"}
							{r.resolvedBy ? ` by ${r.resolvedBy}` : ""}
							{r.resolvedAt ? ` on ${formatDate(r.resolvedAt)}` : ""}
						</p>
					</div>
				)}
			</div>

			{/* Decision footer */}
			<div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-border border-t bg-card/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
				{isOpen ? (
					<>
						<Button
							variant="outline"
							disabled={dismissPending}
							onClick={() => onDismiss(r.id)}
						>
							<XCircle className="mr-1.5 h-4 w-4" /> Dismiss
						</Button>
						{r.warnedAt ? (
							<Button
								variant="outline"
								disabled
								className="text-amber-600 disabled:opacity-100"
							>
								<AlertTriangle className="mr-1.5 h-4 w-4" /> Warned ·{" "}
								{relativeAge(r.warnedAt)}
							</Button>
						) : (
							<Button
								variant="outline"
								disabled={warnPending}
								onClick={() => onWarn(r.id)}
							>
								<AlertTriangle className="mr-1.5 h-4 w-4" />{" "}
								{warnPending ? "Warning…" : "Warn"}
							</Button>
						)}
						<Button
							variant="outline"
							className="text-destructive hover:bg-destructive/10"
							disabled={blockPending}
							onClick={() => setBlocking(true)}
						>
							<Ban className="mr-1.5 h-4 w-4" /> Block{" "}
							{ROLE_META[r.reportedRole].label.toLowerCase()}
						</Button>
						<Button disabled={resolvePending} onClick={() => onResolve(r.id)}>
							<CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark resolved
						</Button>
					</>
				) : (
					<Button
						variant="outline"
						disabled={reopenPending}
						onClick={() => onReopen(r.id)}
					>
						<RotateCcw className="mr-1.5 h-4 w-4" /> Reopen
					</Button>
				)}
			</div>

			<BlockReasonModal
				techName={r.reportedName}
				open={blocking}
				onClose={() => setBlocking(false)}
				onConfirm={confirmBlock}
			/>
			<OrderDetailModal
				orderId={orderOpen ? r.orderId : null}
				open={orderOpen}
				onClose={() => setOrderOpen(false)}
			/>
		</div>
	);
}
