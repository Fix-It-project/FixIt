import { CheckCircle, Clock } from "lucide-react";
import { CategoryTag } from "@/components/CategoryTag";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import type { AdminTechnician, AdminTechnicianDocument } from "@/types";

interface ApplicantReviewModalProps {
	tech: AdminTechnician | null;
	open: boolean;
	onClose: () => void;
	onApprove: (id: string) => void;
	onReject: (id: string) => void;
}

function DocStatusIcon({ status }: { status: AdminTechnicianDocument["status"] }) {
	if (status === "uploaded") return <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />;
	return <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />;
}

export function ApplicantReviewModal({ tech, open, onClose, onApprove, onReject }: ApplicantReviewModalProps) {
	if (!tech) return null;

	const uploadedCount = tech.documents.filter((d) => d.status === "uploaded").length;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Review Application — {tech.name}</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					{/* Info */}
					<div className="flex flex-col gap-1 text-sm">
						<div className="flex gap-2 items-center"><span className="text-muted-foreground w-20">Category</span><CategoryTag meta={getCategoryMetaBySpecialty(tech.specialty)} fallbackLabel={tech.specialty} size="sm" /></div>
						<div className="flex gap-2"><span className="text-muted-foreground w-20">City</span><span className="text-foreground">{tech.city}</span></div>
						<div className="flex gap-2"><span className="text-muted-foreground w-20">Experience</span><span className="text-foreground">{tech.yearsExperience != null ? `${tech.yearsExperience} years` : "—"}</span></div>
						<div className="flex gap-2"><span className="text-muted-foreground w-20">Applied</span><span className="text-foreground">{tech.appliedAt}</span></div>
						<div className="flex gap-2"><span className="text-muted-foreground w-20">Phone</span><span className="text-foreground">{tech.phone}</span></div>
						<div className="flex gap-2"><span className="text-muted-foreground w-20">Email</span><span className="text-foreground break-all">{tech.email}</span></div>
					</div>

					{/* Documents */}
					<div>
						<p className="text-sm font-semibold text-foreground mb-2">Documents ({uploadedCount}/{tech.documents.length})</p>
						<div className="flex flex-col gap-2">
							{tech.documents.map((doc) => (
								<div key={doc.kind} className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2">
									<DocStatusIcon status={doc.status} />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground">{doc.kind}</p>
										{doc.status === "missing" && <p className="text-xs text-amber-600 font-medium">Not uploaded</p>}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2 flex-col sm:flex-row">
					<Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
					<Button variant="destructive" onClick={() => { onReject(tech.id); onClose(); }} className="w-full sm:w-auto">Reject</Button>
					<Button onClick={() => { onApprove(tech.id); onClose(); }} className="w-full sm:w-auto">Approve</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
