import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { BlockedNotice } from "@/components/detail/BlockedNotice";
import { ContactCards } from "@/components/detail/ContactCards";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { KpiCard } from "@/components/detail/KpiCard";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import { humanizeStatus, statusVariant } from "@/lib/order-status";
import { BlockReasonModal } from "./components/BlockReasonModal";
import { OrderDetailModal } from "./components/OrderDetailModal";
import {
	useBlockHomeowner,
	useHomeowners,
	useUnblockHomeowner,
} from "./hooks/useHomeowners";

export const Route = createFileRoute("/_protected/homeowners/$homeownerId")({
	component: HomeownerDetailPage,
});

function HomeownerDetailPage() {
	const { homeownerId } = Route.useParams();
	const { data, isLoading } = useHomeowners();
	const blockMutation = useBlockHomeowner();
	const unblockMutation = useUnblockHomeowner();

	const [blocking, setBlocking] = useState(false);
	const [unblocking, setUnblocking] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

	const homeowner = data?.find((h) => h.id === homeownerId);

	if (isLoading) {
		return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
	}
	if (!homeowner) {
		return (
			<div className="p-8 flex flex-col items-start gap-3">
				<p className="text-sm text-muted-foreground">Homeowner not found.</p>
				<Link to="/homeowners" className="text-sm text-primary inline-flex items-center gap-1">
					<ArrowLeft className="h-4 w-4" /> Back to homeowners
				</Link>
			</div>
		);
	}

	const h = homeowner;
	const completionRate = h.totalOrders > 0 ? Math.round((h.completed / h.totalOrders) * 100) : 0;
	const cancellationRate = h.totalOrders > 0 ? Math.round((h.cancelled / h.totalOrders) * 100) : 0;

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 pb-12">
			<Link to="/homeowners" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 w-fit">
				<ArrowLeft className="h-4 w-4" /> Homeowners
			</Link>

			<DetailHeader
				initials={h.initials}
				color={h.color}
				title={h.name}
				subtitle={<>{h.city} · Joined {h.joined}</>}
				badges={
					<>
						<Badge variant="secondary" className="gap-1">
							<UserRound className="h-3 w-3" /> Homeowner
						</Badge>
						{h.blocked ? (
							<StatusBadge variant="danger" label="Blocked" />
						) : (
							<Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
								<ShieldCheck className="h-3 w-3" /> Active
							</Badge>
						)}
					</>
				}
				action={
					h.blocked ? (
						<Button variant="default" onClick={() => setUnblocking(true)}>Unblock homeowner</Button>
					) : (
						<Button variant="destructive" onClick={() => setBlocking(true)}>Block homeowner</Button>
					)
				}
			/>

			{/* KPI strip */}
			<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
				<KpiCard value={h.totalOrders} label="Total orders" />
				<KpiCard value={h.completed} label={`Completed · ${completionRate}%`} valueClassName="text-emerald-600 dark:text-emerald-400" />
				<KpiCard value={h.cancelled} label={`Cancelled · ${cancellationRate}%`} valueClassName="text-destructive" />
				<KpiCard value={`EGP ${h.spend}`} label="Lifetime spend" />
				<KpiCard value={h.avgRatingGiven != null ? h.avgRatingGiven.toFixed(1) : "—"} label="Avg rating given" valueClassName="text-amber-500" />
			</div>

			<ContactCards phone={h.phone} email={h.email} />

			{h.blocked && <BlockedNotice reason={h.blockedReason} at={h.blockedAt} by={h.blockedBy} />}

			{/* Order history */}
			<div>
				<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Order history</p>
				<div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
								<TableHead className="pl-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Order</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Date</TableHead>
								<TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Category</TableHead>
								<TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Technician</TableHead>
								<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Status</TableHead>
								<TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Rating</TableHead>
								<TableHead className="text-right pr-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{h.history.length === 0 && (
								<TableRow>
									<TableCell colSpan={7} className="text-center text-muted-foreground py-10 text-sm">No order history.</TableCell>
								</TableRow>
							)}
							{h.history.map((o) => (
								<TableRow
									key={o.id}
									onClick={() => setSelectedOrderId(o.id)}
									className="cursor-pointer transition-colors hover:bg-muted/30"
								>
									<TableCell className="pl-5 py-3 text-xs font-mono">{o.id.slice(0, 8)}</TableCell>
									<TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">{o.date}</TableCell>
									<TableCell className="hidden sm:table-cell py-3">
										<CategoryTag meta={getCategoryMetaBySpecialty(o.category)} fallbackLabel={o.category} size="sm" />
									</TableCell>
									<TableCell className="hidden sm:table-cell py-3 text-xs">{o.tech}</TableCell>
									<TableCell className="py-3">
										<StatusBadge variant={statusVariant(o.status)} label={humanizeStatus(o.status)} />
									</TableCell>
									<TableCell className="hidden md:table-cell py-3">
										{o.rating != null ? (
											<StarRating rating={o.rating} />
										) : (
											<span className="text-xs text-muted-foreground/60">—</span>
										)}
									</TableCell>
									<TableCell className="text-right pr-5 py-3 text-xs font-medium tabular-nums">
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
							This homeowner will be able to place new orders again. You can block them again at any time.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => { unblockMutation.mutate(h.id); setUnblocking(false); }}>
							Unblock
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
