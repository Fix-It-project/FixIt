import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { BlockedNotice } from "@/components/detail/BlockedNotice";
import { ContactCards } from "@/components/detail/ContactCards";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { KpiCard } from "@/components/detail/KpiCard";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { StarRating } from "@/components/StarRating";
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
import { Badge } from "@/components/ui/badge";
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
import { BlockReasonModal } from "./components/BlockReasonModal";
import {
	useBlockHomeowner,
	useHomeownerHistory,
	useHomeowners,
	useUnblockHomeowner,
} from "./hooks/useHomeowners";

export const Route = createFileRoute("/_protected/homeowners/$homeownerId")({
	component: HomeownerDetailPage,
});

function HomeownerDetailPage() {
	const { homeownerId } = Route.useParams();
	const { data, isLoading } = useHomeowners();
	const { data: history = [], isLoading: historyLoading } =
		useHomeownerHistory(homeownerId);
	const blockMutation = useBlockHomeowner();
	const unblockMutation = useUnblockHomeowner();

	const [blocking, setBlocking] = useState(false);
	const [unblocking, setUnblocking] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

	const homeowner = data?.find((h) => h.id === homeownerId);

	if (isLoading) {
		return <div className="p-8 text-muted-foreground text-sm">Loading…</div>;
	}
	if (!homeowner) {
		return (
			<div className="flex flex-col items-start gap-3 p-8">
				<p className="text-muted-foreground text-sm">Homeowner not found.</p>
				<Link
					to="/homeowners"
					className="inline-flex items-center gap-1 text-primary text-sm"
				>
					<ArrowLeft className="h-4 w-4" /> Back to homeowners
				</Link>
			</div>
		);
	}

	const h = homeowner;
	const completionRate =
		h.totalOrders > 0 ? Math.round((h.completed / h.totalOrders) * 100) : 0;
	const cancellationRate =
		h.totalOrders > 0 ? Math.round((h.cancelled / h.totalOrders) * 100) : 0;

	return (
		<div className="flex flex-col gap-6 p-4 pb-12 sm:p-6 lg:p-8">
			<Link
				to="/homeowners"
				className="inline-flex w-fit items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
			>
				<ArrowLeft className="h-4 w-4" /> Homeowners
			</Link>

			<DetailHeader
				initials={h.initials}
				color={h.color}
				title={h.name}
				subtitle={
					<>
						{h.city} · Joined {h.joined}
					</>
				}
				badges={
					<>
						<Badge variant="secondary" className="gap-1">
							<UserRound className="h-3 w-3" /> Homeowner
						</Badge>
						{h.blocked ? (
							<StatusBadge variant="danger" label="Blocked" />
						) : h.blockPending ? (
							<StatusBadge variant="warn" label="Block scheduled" />
						) : (
							<Badge
								variant="outline"
								className="gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
							>
								<ShieldCheck className="h-3 w-3" /> Active
							</Badge>
						)}
					</>
				}
				action={
					h.blocked || h.blockPending ? (
						<Button variant="default" onClick={() => setUnblocking(true)}>
							Unblock homeowner
						</Button>
					) : (
						<Button variant="destructive" onClick={() => setBlocking(true)}>
							Block homeowner
						</Button>
					)
				}
			/>

			{/* KPI strip */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
				<KpiCard value={h.totalOrders} label="Total orders" />
				<KpiCard
					value={h.completed}
					label={`Completed · ${completionRate}%`}
					valueClassName="text-emerald-600 dark:text-emerald-400"
				/>
				<KpiCard
					value={h.cancelled}
					label={`Cancelled · ${cancellationRate}%`}
					valueClassName="text-destructive"
				/>
				<KpiCard value={`EGP ${h.spend}`} label="Lifetime spend" />
				<KpiCard
					value={h.avgRatingGiven != null ? h.avgRatingGiven.toFixed(1) : "—"}
					label="Avg rating given"
					valueClassName="text-amber-500"
				/>
			</div>

			<ContactCards phone={h.phone} email={h.email} />

			{h.blocked && (
				<BlockedNotice
					reason={h.blockedReason}
					at={h.blockedAt}
					by={h.blockedBy}
				/>
			)}

			{!h.blocked && h.blockPending && (
				<div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 text-sm dark:text-amber-400">
					Block scheduled. This homeowner is finishing their active orders and
					will be blocked automatically once the last one completes. Unblock to
					cancel.
				</div>
			)}

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
									Category
								</TableHead>
								<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider sm:table-cell">
									Technician
								</TableHead>
								<TableHead className="h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
									Status
								</TableHead>
								<TableHead className="hidden h-11 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider md:table-cell">
									Rating
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
										colSpan={7}
										className="py-10 text-center text-muted-foreground text-sm"
									>
										Loading…
									</TableCell>
								</TableRow>
							)}
							{!historyLoading && history.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={7}
										className="py-10 text-center text-muted-foreground text-sm"
									>
										No order history.
									</TableCell>
								</TableRow>
							)}
							{history.map((o) => (
								<TableRow
									key={o.id}
									onClick={() => setSelectedOrderId(o.id)}
									className="cursor-pointer transition-colors hover:bg-muted/30"
								>
									<TableCell className="py-3 pl-5 font-mono text-xs">
										{o.id.slice(0, 8)}
									</TableCell>
									<TableCell className="whitespace-nowrap py-3 text-muted-foreground text-xs">
										{o.date}
									</TableCell>
									<TableCell className="hidden py-3 sm:table-cell">
										<CategoryTag
											meta={getCategoryMetaBySpecialty(o.category)}
											fallbackLabel={o.category}
											size="sm"
										/>
									</TableCell>
									<TableCell className="hidden py-3 text-xs sm:table-cell">
										{o.tech}
									</TableCell>
									<TableCell className="py-3">
										<StatusBadge
											variant={statusVariant(o.status)}
											label={humanizeStatus(o.status)}
										/>
									</TableCell>
									<TableCell className="hidden py-3 md:table-cell">
										{o.rating != null ? (
											<StarRating rating={o.rating} />
										) : (
											<span className="text-muted-foreground/60 text-xs">
												—
											</span>
										)}
									</TableCell>
									<TableCell className="py-3 pr-5 text-right font-medium text-xs tabular-nums">
										{o.amount > 0 ? `EGP ${o.amount}` : "—"}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Order detail modal */}
			<OrderDetailModal
				orderId={selectedOrderId}
				open={!!selectedOrderId}
				onClose={() => setSelectedOrderId(null)}
			/>

			{/* Block reason modal */}
			<BlockReasonModal
				homeownerName={h.name}
				open={blocking}
				onClose={() => setBlocking(false)}
				onConfirm={(reason) => {
					blockMutation.mutate({ id: h.id, reason });
					setBlocking(false);
				}}
			/>

			{/* Unblock confirm */}
			<AlertDialog open={unblocking} onOpenChange={() => setUnblocking(false)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unblock {h.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							This homeowner will be able to place new orders again. You can
							block them again at any time.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								unblockMutation.mutate(h.id);
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
