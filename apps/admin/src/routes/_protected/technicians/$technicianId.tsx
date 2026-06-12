import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { DocumentList } from "@/components/DocumentList";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import { humanizeStatus, statusVariant } from "@/lib/order-status";
import { OrderDetailModal } from "../homeowners/components/OrderDetailModal";
import { BlockReasonModal } from "./components/BlockReasonModal";
import {
	useBlockTechnician,
	useTechnicianHistory,
	useTechnicians,
	useUnblockTechnician,
} from "./hooks/useTechnicians";

export const Route = createFileRoute("/_protected/technicians/$technicianId")({
	component: TechnicianDetailPage,
});

function TechnicianDetailPage() {
	const { technicianId } = Route.useParams();
	const { data, isLoading } = useTechnicians();
	const { data: history, isLoading: historyLoading } =
		useTechnicianHistory(technicianId);
	const blockMutation = useBlockTechnician();
	const unblockMutation = useUnblockTechnician();

	const [blocking, setBlocking] = useState(false);
	const [unblocking, setUnblocking] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

	const tech = data?.find((t) => t.id === technicianId);

	if (isLoading) {
		return <div className="p-8 text-muted-foreground text-sm">Loading…</div>;
	}
	if (!tech) {
		return (
			<div className="flex flex-col items-start gap-3 p-8">
				<p className="text-muted-foreground text-sm">Technician not found.</p>
				<Link
					to="/technicians"
					className="inline-flex items-center gap-1 text-primary text-sm"
				>
					<ArrowLeft className="h-4 w-4" /> Back to technicians
				</Link>
			</div>
		);
	}

	const t = tech;
	const completionRate =
		t.totalOrders > 0 ? Math.round((t.completed / t.totalOrders) * 100) : 0;
	const cancellationRate =
		t.totalOrders > 0 ? Math.round((t.cancelled / t.totalOrders) * 100) : 0;

	return (
		<div className="flex flex-col gap-6 p-4 pb-12 sm:p-6 lg:p-8">
			<Link
				to="/technicians"
				className="inline-flex w-fit items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
			>
				<ArrowLeft className="h-4 w-4" /> Technicians
			</Link>

			<DetailHeader
				initials={t.initials}
				color={t.color}
				title={t.name}
				subtitle={
					<>
						<CategoryTag
							meta={getCategoryMetaBySpecialty(t.specialty)}
							fallbackLabel={t.specialty}
							size="sm"
						/>
						<span>
							· {t.city} · Joined {t.joined}
						</span>
					</>
				}
				badges={
					<>
						<StatusBadge
							variant={t.availability === "online" ? "success" : "muted"}
							label={t.availability === "online" ? "Online" : "Offline"}
						/>
						{t.blocked ? (
							<StatusBadge variant="danger" label="Blocked" />
						) : t.blockPending ? (
							<StatusBadge variant="warn" label="Block scheduled" />
						) : (
							<span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 px-2 py-0.5 font-medium text-[11px] text-emerald-700 dark:text-emerald-400">
								<ShieldCheck className="h-3 w-3" /> Verified
							</span>
						)}
					</>
				}
				action={
					t.blocked || t.blockPending ? (
						<Button variant="default" onClick={() => setUnblocking(true)}>
							Unblock technician
						</Button>
					) : (
						<Button variant="destructive" onClick={() => setBlocking(true)}>
							Block technician
						</Button>
					)
				}
			/>

			{/* KPI strip */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
				<KpiCard
					value={t.completed}
					label={`Completed · ${completionRate}%`}
					valueClassName="text-emerald-600 dark:text-emerald-400"
				/>
				<KpiCard value={`EGP ${t.revenue}`} label="Revenue" />
				<KpiCard
					value={t.cancelled}
					label={`Cancelled · ${cancellationRate}%`}
					valueClassName="text-destructive"
				/>
				<KpiCard value={t.totalOrders} label="Total orders" />
				<KpiCard
					value={
						<span className="inline-flex items-center gap-1">
							{t.rating != null ? t.rating.toFixed(2) : "—"}
							{t.rating != null && (
								<Star className="h-4 w-4 fill-amber-400 text-amber-400" />
							)}
						</span>
					}
					label={`Avg rating · ${t.reviews} reviews`}
					valueClassName="text-amber-500"
				/>
			</div>

			<ContactCards phone={t.phone} email={t.email} />

			{t.blocked && (
				<BlockedNotice
					reason={t.blockedReason}
					at={t.blockedAt}
					by={t.blockedBy}
				/>
			)}

			{!t.blocked && t.blockPending && (
				<div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 text-sm dark:text-amber-400">
					Block scheduled. This technician is finishing their active orders and
					will be blocked automatically once the last one completes. Unblock to
					cancel.
				</div>
			)}

			{/* Verification documents */}
			<div>
				<p className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
					Verification documents
				</p>
				<DocumentList documents={t.documents} />
			</div>

			{/* Order history */}
			<div>
				<p className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
					Order history
				</p>
				<div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
					<Table>
						<TableHeader>
							<TableRow className="border-border border-b bg-muted/40 hover:bg-muted/40">
								<TableHead className="h-11 pl-5 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
									Order
								</TableHead>
								<TableHead className="h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
									Date
								</TableHead>
								<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider sm:table-cell">
									Service
								</TableHead>
								<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider sm:table-cell">
									Customer
								</TableHead>
								<TableHead className="h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
									Status
								</TableHead>
								<TableHead className="h-11 pr-5 text-right font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
									Amount
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{historyLoading && (
								<TableRow>
									<TableCell
										colSpan={6}
										className="py-10 text-center text-muted-foreground text-sm"
									>
										Loading…
									</TableCell>
								</TableRow>
							)}
							{!historyLoading && (history?.length ?? 0) === 0 && (
								<TableRow>
									<TableCell
										colSpan={6}
										className="py-10 text-center text-muted-foreground text-sm"
									>
										No order history.
									</TableCell>
								</TableRow>
							)}
							{history?.map((h) => (
								<TableRow
									key={h.id}
									onClick={() => setSelectedOrderId(h.id)}
									className="cursor-pointer transition-colors hover:bg-muted/30"
								>
									<TableCell className="py-3 pl-5 font-mono text-xs">
										{h.id.slice(0, 8)}
									</TableCell>
									<TableCell className="whitespace-nowrap py-3 text-muted-foreground text-xs">
										{h.date}
									</TableCell>
									<TableCell className="hidden py-3 text-xs sm:table-cell">
										{h.category}
									</TableCell>
									<TableCell className="hidden py-3 text-xs sm:table-cell">
										{h.customer}
									</TableCell>
									<TableCell className="py-3">
										<div className="flex flex-col items-start gap-1">
											<StatusBadge
												variant={statusVariant(h.status)}
												label={humanizeStatus(h.status)}
											/>
											{h.review && (
												<span className="flex items-center gap-0.5">
													{Array.from({ length: 5 }, (_, i) => (
														<Star
															key={i}
															className={`h-3 w-3 ${i < h.review!.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
														/>
													))}
													<span className="ml-0.5 text-[11px] text-muted-foreground">
														{h.review.rating}.0
													</span>
												</span>
											)}
										</div>
									</TableCell>
									<TableCell className="py-3 pr-5 text-right font-medium text-xs tabular-nums">
										{h.amount > 0 ? `EGP ${h.amount}` : "—"}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Order detail */}
			<OrderDetailModal
				orderId={selectedOrderId}
				open={!!selectedOrderId}
				onClose={() => setSelectedOrderId(null)}
			/>

			{/* Block reason */}
			<BlockReasonModal
				techName={t.name}
				open={blocking}
				onClose={() => setBlocking(false)}
				onConfirm={(reason) => {
					blockMutation.mutate({ id: t.id, reason });
					setBlocking(false);
				}}
			/>

			{/* Unblock confirm */}
			<AlertDialog open={unblocking} onOpenChange={() => setUnblocking(false)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unblock {t.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							This technician will be able to receive orders again. You can
							block them again at any time.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								unblockMutation.mutate(t.id);
								setUnblocking(false);
							}}
						>
							Unblock
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
