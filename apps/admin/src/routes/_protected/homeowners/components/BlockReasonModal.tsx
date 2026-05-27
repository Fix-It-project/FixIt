import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const PRESET_REASONS = [
	"Repeated last-minute cancellations",
	"Abusive behavior toward technicians",
	"Fraudulent payment activity",
	"Falsified complaints (multiple)",
	"Policy violation",
	"Safety concerns",
];

interface BlockReasonModalProps {
	homeownerName: string;
	open: boolean;
	onClose: () => void;
	onConfirm: (reason: string) => void;
}

export function BlockReasonModal({ homeownerName, open, onClose, onConfirm }: BlockReasonModalProps) {
	const [selected, setSelected] = useState(PRESET_REASONS[0]);
	const [custom, setCustom] = useState("");

	const reason = selected === "custom" ? custom.trim() : selected;

	function handleConfirm() {
		if (!reason) return;
		onConfirm(reason);
		setSelected(PRESET_REASONS[0]);
		setCustom("");
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>Block {homeownerName}?</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-3">
					<p className="text-sm text-muted-foreground">Select a reason for blocking this homeowner. They will not be able to place new orders while blocked.</p>
					<RadioGroup value={selected} onValueChange={setSelected} className="flex flex-col gap-2">
						{PRESET_REASONS.map((r) => (
							<div key={r} className="flex items-center gap-2">
								<RadioGroupItem value={r} id={r} />
								<Label htmlFor={r} className="text-sm cursor-pointer">{r}</Label>
							</div>
						))}
						<div className="flex items-center gap-2">
							<RadioGroupItem value="custom" id="custom-ho" />
							<Label htmlFor="custom-ho" className="text-sm cursor-pointer">Custom reason…</Label>
						</div>
					</RadioGroup>

					{selected === "custom" && (
						<textarea
							value={custom}
							onChange={(e) => setCustom(e.target.value)}
							placeholder="Describe the reason…"
							rows={3}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
						/>
					)}
				</div>

				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={onClose}>Cancel</Button>
					<Button variant="destructive" onClick={handleConfirm} disabled={!reason}>Block</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
