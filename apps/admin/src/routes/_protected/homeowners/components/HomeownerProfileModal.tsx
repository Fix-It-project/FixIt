import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { CategoryTag } from "@/components/CategoryTag";
import { StarRating } from "@/components/StarRating";
import { StatusBadge } from "@/components/StatusBadge";
import { TechAvatar } from "@/components/TechAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategoryMetaById } from "@/lib/category-icons";
import type { Homeowner } from "@/types";

interface HomeownerProfileModalProps {
	homeowner: Homeowner | null;
	open: boolean;
	onClose: () => void;
	onBlock: (id: string) => void;
	onUnblock: (id: string) => void;
}

export function HomeownerProfileModal({ homeowner, open, onClose, onBlock, onUnblock }: HomeownerProfileModalProps) {
	if (!homeowner) return null;

	const cancellationRate = homeowner.totalOrders > 0
		? Math.round((homeowner.cancelled / homeowner.totalOrders) * 100)
		: 0;
	const completionRate = homeowner.totalOrders > 0
		? Math.round((homeowner.completed / homeowner.totalOrders) * 100)
		: 0;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
				<DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-muted/30">
					<div className="flex items-start gap-4">
						<TechAvatar initials={homeowner.initials} color={homeowner.color} size="lg" />
						<div className="flex-1 min-w-0">
							<DialogTitle className="text-left text-xl">{homeowner.name}</DialogTitle>
							<p className="text-sm text-muted-foreground mt-0.5">{homeowner.city} · Joined {homeowner.joined}</p>
							<div className="flex items-center gap-2 mt-2">
								<Badge variant="secondary" className="gap-1">
									<UserRound className="h-3 w-3" />
									Homeowner
								</Badge>
								{homeowner.blocked ? (
									<StatusBadge variant="danger" label="Blocked" />
								) : (
									<Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
										<ShieldCheck className="h-3 w-3" />
										Active
									</Badge>
								)}
							</div>
						</div>
					</div>
				</DialogHeader>

				<div className="px-6 py-5 flex flex-col gap-6">
					{/* KPI strip */}
					<div>
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Lifetime activity</p>
						<div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
							<div className="rounded-lg border border-border px-3 py-2.5 text-center bg-card">
								<p className="text-lg font-bold text-foreground tabular-nums leading-tight">{homeowner.totalOrders}</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">Total orders</p>
							</div>
							<div className="rounded-lg border border-border px-3 py-2.5 text-center bg-card">
								<p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums leading-tight">{homeowner.completed}</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">Completed · {completionRate}%</p>
							</div>
							<div className="rounded-lg border border-border px-3 py-2.5 text-center bg-card">
								<p className="text-lg font-bold text-destructive tabular-nums leading-tight">{homeowner.cancelled}</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">Cancelled · {cancellationRate}%</p>
							</div>
							<div className="rounded-lg border border-border px-3 py-2.5 text-center bg-card">
								<p className="text-lg font-bold text-foreground tabular-nums leading-tight">EGP {homeowner.spend}</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">Lifetime spend</p>
							</div>
							<div className="rounded-lg border border-border px-3 py-2.5 text-center bg-card">
								<p className="text-lg font-bold text-amber-500 tabular-nums leading-tight">
									{homeowner.avgRatingGiven != null ? homeowner.avgRatingGiven.toFixed(1) : "—"}
								</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">Avg rating given</p>
							</div>
						</div>
					</div>

					{/* Contact strip */}
					<div>
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Contact</p>
						<div className="flex flex-col sm:flex-row gap-2">
							<a
								href={`tel:${homeowner.phone}`}
								className="flex items-center gap-3 flex-1 rounded-lg border border-border bg-card px-3 py-2.5 hover:bg-muted/40 transition-colors"
							>
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
									<Phone className="h-4 w-4" />
								</span>
								<div className="min-w-0">
									<p className="text-[11px] text-muted-foreground">Phone</p>
									<p className="text-sm text-foreground font-medium truncate">{homeowner.phone}</p>
								</div>
							</a>
							<a
								href={`mailto:${homeowner.email}`}
								className="flex items-center gap-3 flex-1 rounded-lg border border-border bg-card px-3 py-2.5 hover:bg-muted/40 transition-colors"
							>
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
									<Mail className="h-4 w-4" />
								</span>
								<div className="min-w-0">
									<p className="text-[11px] text-muted-foreground">Email</p>
									<p className="text-sm text-foreground font-medium truncate">{homeowner.email}</p>
								</div>
							</a>
						</div>
					</div>

					{/* Blocked notice */}
					{homeowner.blocked && (
						<div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
							<p className="text-xs font-semibold text-destructive uppercase tracking-widest mb-1">Blocked</p>
							<p className="text-sm text-foreground">{homeowner.blockedReason}</p>
							<p className="text-[11px] text-muted-foreground mt-1">On {homeowner.blockedAt} by {homeowner.blockedBy}</p>
						</div>
					)}

					{/* Order history */}
					<div>
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Order history</p>
						<div className="overflow-x-auto rounded-lg border border-border max-h-[320px] overflow-y-auto">
							<Table>
								<TableHeader className="sticky top-0 bg-card z-10">
									<TableRow>
										<TableHead className="pl-3">Order</TableHead>
										<TableHead>Date</TableHead>
										<TableHead className="hidden sm:table-cell">Category</TableHead>
										<TableHead className="hidden sm:table-cell">Technician</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right pr-3">Amount</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{homeowner.history.length === 0 && (
										<TableRow>
											<TableCell colSpan={6} className="text-center text-muted-foreground py-6 text-sm">No order history.</TableCell>
										</TableRow>
									)}
									{homeowner.history.map((h) => (
										<TableRow key={h.id}>
											<TableCell className="pl-3 text-xs font-mono">{h.id}</TableCell>
											<TableCell className="text-xs text-muted-foreground whitespace-nowrap">{h.date}</TableCell>
											<TableCell className="hidden sm:table-cell">
												<CategoryTag meta={getCategoryMetaById(h.category)} fallbackLabel={h.category} size="sm" />
											</TableCell>
											<TableCell className="hidden sm:table-cell text-xs">{h.tech}</TableCell>
											<TableCell>
												<StatusBadge
													variant={h.status === "completed" ? "success" : h.status === "cancelled" ? "danger" : "warn"}
													label={h.status === "no_show" ? "No show" : h.status}
												/>
											</TableCell>
											<TableCell className="text-right pr-3 text-xs font-medium tabular-nums">
												{h.amount > 0 ? `EGP ${h.amount}` : "—"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>

					{/* Avg rating shown as star line */}
					{homeowner.avgRatingGiven != null && (
						<div className="flex items-center gap-3 pt-1">
							<span className="text-xs text-muted-foreground">Rating given to technicians on average:</span>
							<StarRating rating={homeowner.avgRatingGiven} />
						</div>
					)}
				</div>

				<div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
					<Button variant="outline" onClick={onClose}>Close</Button>
					{homeowner.blocked ? (
						<Button variant="default" onClick={() => { onUnblock(homeowner.id); onClose(); }}>
							Unblock homeowner
						</Button>
					) : (
						<Button variant="destructive" onClick={() => { onBlock(homeowner.id); onClose(); }}>
							Block homeowner
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
