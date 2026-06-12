import { Ban } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type CancelledBy = "customer" | "technician" | "system" | null;

interface CancellationReasonModalProps {
	reason: string | null;
	cancelledBy?: CancelledBy;
	open: boolean;
	onClose: () => void;
}

const BY_LABEL: Record<NonNullable<CancelledBy>, string> = {
	customer: "Cancelled by the customer",
	technician: "Cancelled by the technician",
	system: "Cancelled by the system",
};

export function CancellationReasonModal({
	reason,
	cancelledBy = null,
	open,
	onClose,
}: CancellationReasonModalProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md gap-0 overflow-hidden p-0">
				{/* Emblem header */}
				<div className="flex flex-col items-center px-6 pt-8 pb-5 text-center">
					<div className="relative mb-4 flex h-14 w-14 items-center justify-center">
						<span className="absolute inset-0 rounded-full bg-destructive/10" />
						<span className="absolute inset-1.5 rounded-full bg-destructive/15" />
						<Ban
							className="relative h-6 w-6 text-destructive"
							strokeWidth={2.25}
						/>
					</div>
					<h2 className="font-semibold text-foreground text-lg tracking-tight">
						Order cancelled
					</h2>
					{cancelledBy && (
						<p className="mt-1 font-medium text-muted-foreground text-xs uppercase tracking-wider">
							{BY_LABEL[cancelledBy]}
						</p>
					)}
				</div>

				{/* Reason panel */}
				<div className="px-6 pb-7">
					<div className="rounded-xl border border-destructive/15 bg-destructive/[0.04] px-5 py-4">
						<p className="mb-1.5 font-semibold text-[11px] text-destructive/80 uppercase tracking-widest">
							Reason
						</p>
						<p className="text-foreground text-sm leading-relaxed">
							{reason?.trim() || "No reason was provided."}
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
