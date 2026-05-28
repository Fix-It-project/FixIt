import { Fragment, useState } from "react";
import { Ban, FileText, Star, User } from "lucide-react";
import { CategoryTag } from "@/components/CategoryTag";
import { StarRating } from "@/components/StarRating";
import { StatusBadge } from "@/components/StatusBadge";
import { TechAvatar } from "@/components/TechAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import type { ActiveTech, HistoryOrder } from "@/types";

interface TechProfileModalProps {
	tech: ActiveTech | null;
	open: boolean;
	onClose: () => void;
	onBlock: (id: string) => void;
}

export function TechProfileModal({ tech, open, onClose, onBlock }: TechProfileModalProps) {
	const [reasonOrder, setReasonOrder] = useState<HistoryOrder | null>(null);

	if (!tech) return null;

	const total = tech.history.length;
	const completedOrders = tech.history.filter((h) => h.status === "completed");
	const cancelledOrders = tech.history.filter((h) => h.status === "cancelled");
	const noShowOrders = tech.history.filter((h) => h.status === "no_show");

	const completionRate = total > 0 ? Math.round((completedOrders.length / total) * 100) : 0;
	const cancellationRate = total > 0 ? Math.round((cancelledOrders.length / total) * 100) : 0;
	const noShowRate = total > 0 ? Math.round((noShowOrders.length / total) * 100) : 0;

	const ratedOrders = completedOrders.filter((h) => h.review !== null);
	const avgRating = ratedOrders.length > 0
		? ratedOrders.reduce((sum, h) => sum + (h.review?.rating ?? 0), 0) / ratedOrders.length
		: null;

	const last10 = tech.history.slice(0, 10);
	const last10Completed = last10.filter((h) => h.status === "completed").length;
	const last10Cancelled = last10.filter((h) => h.status === "cancelled").length;
	const last10NoShow = last10.filter((h) => h.status === "no_show").length;
	const last10Rated = last10.filter((h) => h.review !== null);
	const last10AvgRating = last10Rated.length > 0
		? last10Rated.reduce((sum, h) => sum + (h.review?.rating ?? 0), 0) / last10Rated.length
		: null;

	return (
		<>
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<TechAvatar initials={tech.initials} color={tech.color} size="lg" />
						<div>
							<DialogTitle className="text-left">{tech.name}</DialogTitle>
							<div className="flex items-center gap-2 mt-0.5">
								<CategoryTag meta={getCategoryMetaBySpecialty(tech.specialty)} fallbackLabel={tech.specialty} size="sm" />
								<span className="text-sm text-muted-foreground">· {tech.city}</span>
							</div>
						</div>
					</div>
				</DialogHeader>

				<div className="flex flex-col gap-5">
					{/* Overall performance */}
					<div>
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Overall Performance</p>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							{[
								{ label: "Completed", value: String(tech.completed) },
								{ label: "Revenue", value: `EGP ${tech.revenue}` },
								{ label: "Completion", value: `${completionRate}%` },
								{ label: "Cancellation", value: `${cancellationRate}%` },
							].map(({ label, value }) => (
								<div key={label} className="rounded-lg bg-muted p-3 text-center">
									<p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
									<p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
								</div>
							))}
						</div>
						<div className="grid grid-cols-3 gap-3 mt-3">
							<div className="rounded-lg bg-muted p-3 text-center">
								<div className="flex items-center justify-center">
									<StarRating rating={tech.rating} reviews={tech.reviews} />
								</div>
								<p className="text-[11px] text-muted-foreground mt-0.5">Overall rating</p>
							</div>
							<div className="rounded-lg bg-muted p-3 text-center">
								<p className="text-lg font-bold text-amber-600 tabular-nums">{noShowRate}%</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">No-show rate</p>
							</div>
							<div className="rounded-lg bg-muted p-3 text-center">
								<p className="text-lg font-bold text-foreground tabular-nums">
									{avgRating !== null ? avgRating.toFixed(2) : "—"}
								</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">Avg rating ({ratedOrders.length} reviews)</p>
							</div>
						</div>
					</div>

					{/* Contact */}
					<div className="flex flex-col gap-1 text-sm">
						<div className="flex gap-2">
							<span className="text-muted-foreground w-16 flex-shrink-0">Phone</span>
							<span className="text-foreground">{tech.phone}</span>
						</div>
						<div className="flex gap-2">
							<span className="text-muted-foreground w-16 flex-shrink-0">Email</span>
							<span className="text-foreground break-all">{tech.email}</span>
						</div>
						<div className="flex gap-2">
							<span className="text-muted-foreground w-16 flex-shrink-0">Joined</span>
							<span className="text-foreground">{tech.joined}</span>
						</div>
					</div>

					{/* Last 10 performance mini-strip */}
					<div>
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
							Last {last10.length} Orders — Performance
						</p>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
							<div className="rounded-lg border border-border px-3 py-2 text-center">
								<p className="text-base font-bold text-foreground tabular-nums">{last10Completed}/{last10.length}</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">Completed</p>
							</div>
							<div className="rounded-lg border border-border px-3 py-2 text-center">
								<p className="text-base font-bold text-foreground tabular-nums">
									{last10AvgRating !== null ? last10AvgRating.toFixed(1) : "—"}
								</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">Avg rating</p>
							</div>
							<div className="rounded-lg border border-border px-3 py-2 text-center">
								<p className="text-base font-bold text-destructive tabular-nums">{last10Cancelled}</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">Cancelled</p>
							</div>
							<div className="rounded-lg border border-border px-3 py-2 text-center">
								<p className="text-base font-bold text-amber-600 tabular-nums">{last10NoShow}</p>
								<p className="text-[11px] text-muted-foreground mt-0.5">No-show</p>
							</div>
						</div>
					</div>

					{/* Orders table */}
					<div>
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Order History</p>
						<div className="overflow-x-auto rounded-lg border border-border max-h-[320px] overflow-y-auto">
							<Table>
								<TableHeader className="sticky top-0 bg-card z-10">
									<TableRow>
										<TableHead className="pl-3">Order</TableHead>
										<TableHead>Date</TableHead>
										<TableHead className="hidden sm:table-cell">Service</TableHead>
										<TableHead className="hidden sm:table-cell">Customer</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right pr-3">Amount</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{tech.history.map((h) => {
										const hasReason = (h.status === "cancelled" || h.status === "no_show") && !!h.cancelReason;
										return (
											<Fragment key={h.id}>
												<TableRow>
													<TableCell className="pl-3 text-xs font-mono">{h.id}</TableCell>
													<TableCell className="text-xs text-muted-foreground whitespace-nowrap">{h.date}</TableCell>
													<TableCell className="hidden sm:table-cell text-xs">{h.category}</TableCell>
													<TableCell className="hidden sm:table-cell text-xs">{h.customer}</TableCell>
													<TableCell>
														<div className="flex flex-col items-start gap-1">
															<div className="flex items-center gap-1.5 flex-wrap">
																<StatusBadge
																	variant={h.status === "completed" ? "success" : h.status === "cancelled" ? "danger" : "warn"}
																	label={h.status === "no_show" ? "No show" : h.status}
																/>
																{hasReason && (
																	<button
																		type="button"
																		onClick={() => setReasonOrder(h)}
																		className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
																		aria-label="View cancellation reason"
																	>
																		<FileText className="h-3 w-3" />
																		Reason
																	</button>
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
													<TableCell className="text-right pr-3 text-xs font-medium tabular-nums">
														{h.amount > 0 ? `EGP ${h.amount}` : "—"}
													</TableCell>
												</TableRow>
											</Fragment>
										);
									})}
								</TableBody>
							</Table>
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between">
						<Badge variant={tech.availability === "online" ? "default" : "secondary"}>
							<User className="h-3 w-3 mr-1" />
							{tech.availability === "online" ? "Online" : "Offline"}
						</Badge>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => { onBlock(tech.id); onClose(); }}
						>
							Block Technician
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>

		<Dialog open={!!reasonOrder} onOpenChange={(o) => { if (!o) setReasonOrder(null); }}>
			<DialogContent className="max-w-md p-0 overflow-hidden">
				<div className="bg-destructive/10 px-5 py-4 border-b border-destructive/15">
					<div className="flex items-center gap-3">
						<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive">
							<Ban className="h-4 w-4" />
						</span>
						<div>
							<DialogTitle className="text-base font-semibold leading-tight">
								{reasonOrder?.status === "no_show" ? "Tech no-show" : "Order cancelled"}
							</DialogTitle>
							<p className="text-[11px] text-muted-foreground font-mono mt-0.5">{reasonOrder?.id}</p>
						</div>
					</div>
				</div>

				<div className="px-5 py-4 flex flex-col gap-4">
					<div className="grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
						<span className="text-muted-foreground">Date</span>
						<span className="col-span-2 text-foreground">{reasonOrder?.date}</span>

						<span className="text-muted-foreground">Service</span>
						<span className="col-span-2 text-foreground">{reasonOrder?.category}</span>

						<span className="text-muted-foreground">Customer</span>
						<span className="col-span-2 text-foreground">{reasonOrder?.customer}</span>

						<span className="text-muted-foreground">Cancelled by</span>
						<span className="col-span-2 text-foreground font-medium capitalize">{reasonOrder?.cancelledBy ?? "—"}</span>
					</div>

					<div className="border-t border-border pt-3">
						<p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">Reason</p>
						<p className="text-sm text-foreground leading-relaxed">{reasonOrder?.cancelReason}</p>
					</div>
				</div>

				<div className="px-5 py-3 bg-muted/30 border-t border-border flex justify-end">
					<Button variant="outline" size="sm" onClick={() => setReasonOrder(null)}>Close</Button>
				</div>
			</DialogContent>
		</Dialog>
		</>
	);
}
