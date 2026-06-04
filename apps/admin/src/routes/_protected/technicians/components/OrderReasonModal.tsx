import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { HistoryOrder } from "@/types";

interface OrderReasonModalProps {
	order: HistoryOrder | null;
	onClose: () => void;
}

/** Cancellation / no-show reason detail for a technician's order. */
export function OrderReasonModal({ order, onClose }: OrderReasonModalProps) {
	return (
		<Dialog open={!!order} onOpenChange={(o) => { if (!o) onClose(); }}>
			<DialogContent className="max-w-md p-0 overflow-hidden">
				<div className="bg-destructive/10 px-5 py-4 border-b border-destructive/15">
					<div className="flex items-center gap-3">
						<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive">
							<Ban className="h-4 w-4" />
						</span>
						<div>
							<DialogTitle className="text-base font-semibold leading-tight">
								{order?.status === "no_show" ? "Tech no-show" : "Order cancelled"}
							</DialogTitle>
							<p className="text-[11px] text-muted-foreground font-mono mt-0.5">{order?.id}</p>
						</div>
					</div>
				</div>

				<div className="px-5 py-4 flex flex-col gap-4">
					<div className="grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
						<span className="text-muted-foreground">Date</span>
						<span className="col-span-2 text-foreground">{order?.date}</span>

						<span className="text-muted-foreground">Service</span>
						<span className="col-span-2 text-foreground">{order?.category}</span>

						<span className="text-muted-foreground">Customer</span>
						<span className="col-span-2 text-foreground">{order?.customer}</span>

						<span className="text-muted-foreground">Cancelled by</span>
						<span className="col-span-2 text-foreground font-medium capitalize">{order?.cancelledBy ?? "—"}</span>
					</div>

					<div className="border-t border-border pt-3">
						<p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">Reason</p>
						<p className="text-sm text-foreground leading-relaxed">{order?.cancelReason}</p>
					</div>
				</div>

				<div className="px-5 py-3 bg-muted/30 border-t border-border flex justify-end">
					<Button variant="outline" size="sm" onClick={onClose}>Close</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
