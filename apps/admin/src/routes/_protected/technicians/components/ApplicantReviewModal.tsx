import { CategoryTag } from "@/components/CategoryTag";
import { DocumentList } from "@/components/DocumentList";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import type { AdminTechnician } from "@/types";

interface ApplicantReviewModalProps {
	tech: AdminTechnician | null;
	open: boolean;
	onClose: () => void;
	onApprove: (id: string) => void;
	onReject: (id: string) => void;
}

export function ApplicantReviewModal({
	tech,
	open,
	onClose,
	onApprove,
	onReject,
}: ApplicantReviewModalProps) {
	if (!tech) return null;

	const uploadedCount = tech.documents.filter(
		(d) => d.status === "uploaded",
	).length;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Review Application — {tech.name}</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					{/* Info */}
					<div className="flex flex-col gap-1 text-sm">
						<div className="flex items-center gap-2">
							<span className="w-20 text-muted-foreground">Category</span>
							<CategoryTag
								meta={getCategoryMetaBySpecialty(tech.specialty)}
								fallbackLabel={tech.specialty}
								size="sm"
							/>
						</div>
						<div className="flex gap-2">
							<span className="w-20 text-muted-foreground">City</span>
							<span className="text-foreground">{tech.city}</span>
						</div>
						<div className="flex gap-2">
							<span className="w-20 text-muted-foreground">Experience</span>
							<span className="text-foreground">
								{tech.yearsExperience != null
									? `${tech.yearsExperience} years`
									: "—"}
							</span>
						</div>
						<div className="flex gap-2">
							<span className="w-20 text-muted-foreground">Applied</span>
							<span className="text-foreground">{tech.appliedAt}</span>
						</div>
						<div className="flex gap-2">
							<span className="w-20 text-muted-foreground">Phone</span>
							<span className="text-foreground">{tech.phone}</span>
						</div>
						<div className="flex gap-2">
							<span className="w-20 text-muted-foreground">Email</span>
							<span className="break-all text-foreground">{tech.email}</span>
						</div>
					</div>

					{/* Documents */}
					<div>
						<p className="mb-2 font-semibold text-foreground text-sm">
							Documents ({uploadedCount}/{tech.documents.length})
						</p>
						<DocumentList documents={tech.documents} />
					</div>
				</div>

				<DialogFooter className="flex-col gap-2 sm:flex-row">
					<Button
						variant="outline"
						onClick={onClose}
						className="w-full sm:w-auto"
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={() => {
							onReject(tech.id);
							onClose();
						}}
						className="w-full sm:w-auto"
					>
						Reject
					</Button>
					<Button
						onClick={() => {
							onApprove(tech.id);
							onClose();
						}}
						className="w-full sm:w-auto"
					>
						Approve
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
