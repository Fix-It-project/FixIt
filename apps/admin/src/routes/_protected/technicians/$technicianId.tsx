import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { BlockedNotice } from "@/components/detail/BlockedNotice";
import { ContactCards } from "@/components/detail/ContactCards";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { KpiCard } from "@/components/detail/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import type { HistoryOrder } from "@/types";
import { BlockReasonModal } from "./components/BlockReasonModal";
import { OrderReasonModal } from "./components/OrderReasonModal";
import { useTechById, useTechStore } from "./hooks/useTechState";

export const Route = createFileRoute("/_protected/technicians/$technicianId")({
	component: TechnicianDetailPage,
});

function TechnicianDetailPage() {
	const { technicianId } = Route.useParams();
	const tech = useTechById(technicianId);
	const blockTech = useTechStore((s) => s.blockTech);
	const unblockTech = useTechStore((s) => s.unblockTech);

	const [blocking, setBlocking] = useState(false);
	const [unblocking, setUnblocking] = useState(false);
	const [reasonOrder, setReasonOrder] = useState<HistoryOrder | null>(null);

	if (!tech) {
		return (
			<div className="p-8 flex flex-col items-start gap-3">
				<p className="text-sm text-muted-foreground">Technician not found.</p>
				<Link to="/technicians" className="text-sm text-primary inline-flex items-center gap-1">
					<ArrowLeft className="h-4 w-4" /> Back to technicians
				</Link>
			</div>
		);
	}

	const t = tech;
	const total = t.history.length;
	const completed = t.history.filter((h) => h.status === "completed");
	const cancelled = t.history.filter((h) => h.status === "cancelled");
	const noShow = t.history.filter((h) => h.status === "no_show");
	const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
	const cancellationRate = total > 0 ? Math.round((cancelled.length / total) * 100) : 0;
	const noShowRate = total > 0 ? Math.round((noShow.length / total) * 100) : 0;

	const rated = completed.filter((h) => h.review !== null);
	const avgRating = rated.length > 0
		? rated.reduce((sum, h) => sum + (h.review?.rating ?? 0), 0) / rated.length
		: null;

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 pb-12">
			<Link to="/technicians" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 w-fit">
				<ArrowLeft className="h-4 w-4" /> Technicians
			</Link>

			<DetailHeader
				initials={t.initials}
				color={t.color}
				title={t.name}
				subtitle={
					<>
						<CategoryTag meta={getCategoryMetaBySpecialty(t.specialty)} fallbackLabel={t.specialty} size="sm" />
						<span>· {t.city} · Joined {t.joined}</span>
					</>
				}
				badges={
					<>
						<StatusBadge variant={t.availability === "online" ? "success" : "muted"} label={t.availability === "online" ? "Online" : "Offline"} />
						{t.blocked ? (
							<StatusBadge variant="danger" label="Blocked" />
						) : (
							<span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
								<ShieldCheck className="h-3 w-3" /> Active
							</span>
						)}
					</>
				}
				action={
					t.blocked ? (
						<Button variant="default" onClick={() => setUnblocking(true)}>Unblock technician</Button>
					) : (
						<Button variant="destructive" onClick={() => setBlocking(true)}>Block technician</Button>
					)
				}
			/>

			{/* KPI strip */}
			<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
				<KpiCard value={t.completed} label={`Completed · ${completionRate}%`} valueClassName="text-emerald-600 dark:text-emerald-400" />
				<KpiCard value={`EGP ${t.revenue}`} label="Revenue" />
				<KpiCard value={cancelled.length} label={`Cancelled · ${cancellationRate}%`} valueClassName="text-destructive" />
				<KpiCard value={`${noShowRate}%`} label="No-show rate" valueClassName="text-amber-500" />
				<KpiCard
					value={
						<span className="inline-flex items-center gap-1">
							{avgRating !== null ? avgRating.toFixed(2) : "—"}
							{avgRating !== null && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
						</span>
					}
					label={`Avg rating · ${rated.length} reviews`}
					valueClassName="text-amber-500"
				/>
			</div>

			<ContactCards phone={t.phone} email={t.email} />

			{t.blocked && <BlockedNotice reason={t.blockedReason} at={t.blockedAt} by={t.blockedBy} />}

			{/* Order history */}
			<div>
				<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Order history</p>
				<div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
								<TableHead className="pl-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Order</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Date</TableHead>
								<TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Service</TableHead>
								<TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Customer</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Status</TableHead>
								<TableHead className="text-right pr-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{total === 0 && (
								<TableRow>
									<TableCell colSpan={6} className="text-center text-muted-foreground py-10 text-sm">No order history.</TableCell>
								</TableRow>
							)}
							{t.history.map((h) => {
								const hasReason = (h.status === "cancelled" || h.status === "no_show") && !!h.cancelReason;
								return (
									<TableRow key={h.id} className="transition-colors hover:bg-muted/30">
										<TableCell className="pl-5 py-3 text-xs font-mono">{h.id}</TableCell>
										<TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">{h.date}</TableCell>
										<TableCell className="hidden sm:table-cell py-3 text-xs">{h.category}</TableCell>
										<TableCell className="hidden sm:table-cell py-3 text-xs">{h.customer}</TableCell>
										<TableCell className="py-3">
											<div className="flex flex-col items-start gap-1">
												<div className="flex items-center gap-1.5 flex-wrap">
													<StatusBadge
														variant={h.status === "completed" ? "success" : h.status === "cancelled" ? "danger" : "warn"}
														label={h.status === "no_show" ? "No show" : h.status}
													/>
													{hasReason && (
														<Button
															variant="outline"
															size="sm"
															className="h-6 gap-1 px-2 text-[11px]"
															onClick={() => setReasonOrder(h)}
														>
															View reason
														</Button>
													)}
												</div>
												{h.review && (
													<span className="flex items-center gap-0.5">
														{Array.from({ length: 5 }, (_, i) => (
															<Star
																key={i}
																className={`h-3 w-3 ${i < h.review!.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
															/>
														))}
														<span className="text-[11px] text-muted-foreground ml-0.5">{h.review.rating}.0</span>
													</span>
												)}
											</div>
										</TableCell>
										<TableCell className="text-right pr-5 py-3 text-xs font-medium tabular-nums">
											{h.amount > 0 ? `EGP ${h.amount}` : "—"}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Cancellation / no-show reason */}
			<OrderReasonModal order={reasonOrder} onClose={() => setReasonOrder(null)} />

			{/* Block reason */}
			<BlockReasonModal
				techName={t.name}
				open={blocking}
				onClose={() => setBlocking(false)}
				onConfirm={(reason) => {
					blockTech(t.id, reason);
					setBlocking(false);
				}}
			/>

			{/* Unblock confirm */}
			<AlertDialog open={unblocking} onOpenChange={() => setUnblocking(false)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unblock {t.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							This technician will be able to receive orders again. You can block them again at any time.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => { unblockTech(t.id); setUnblocking(false); }}>
							Unblock
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
