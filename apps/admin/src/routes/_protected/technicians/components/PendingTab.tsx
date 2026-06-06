import { useEffect, useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { PAGE_SIZE, Pagination } from "@/components/Pagination";
import { TechAvatar } from "@/components/TechAvatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import type { AdminTechnician } from "@/types";
import { ApplicantReviewModal } from "./ApplicantReviewModal";

interface PendingTabProps {
	techs: AdminTechnician[];
	onApprove: (id: string) => void;
	onReject: (id: string) => void;
}

function docProgress(tech: AdminTechnician): { uploaded: number; total: number } {
	const total = tech.documents.length;
	const uploaded = tech.documents.filter((d) => d.status === "uploaded").length;
	return { uploaded, total: total || 1 };
}

export function PendingTab({ techs, onApprove, onReject }: PendingTabProps) {
	const [selected, setSelected] = useState<AdminTechnician | null>(null);
	const [page, setPage] = useState(1);

	const pageCount = Math.max(1, Math.ceil(techs.length / PAGE_SIZE));
	useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
	const pageStart = (page - 1) * PAGE_SIZE;
	const paged = techs.slice(pageStart, pageStart + PAGE_SIZE);

	return (
		<>
			{/* Mobile card view */}
			<div className="md:hidden flex flex-col gap-3">
				{techs.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No pending applicants.</p>}
				{paged.map((tech) => {
					const { uploaded, total } = docProgress(tech);
					return (
						<div key={tech.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
							<TechAvatar initials={tech.initials} color={tech.color} size="md" />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-semibold text-foreground truncate">{tech.name}</p>
								<div className="mt-0.5">
									<CategoryTag meta={getCategoryMetaBySpecialty(tech.specialty)} fallbackLabel={tech.specialty} size="sm" />
								</div>
								<div className="mt-1 flex items-center gap-2">
									<div className="flex-1 bg-muted rounded-full h-1.5">
										<div className="bg-primary rounded-full h-1.5" style={{ width: `${(uploaded / total) * 100}%` }} />
									</div>
									<span className="text-[11px] text-muted-foreground">{uploaded}/{total}</span>
								</div>
							</div>
							<Button size="sm" variant="outline" onClick={() => setSelected(tech)}>Review</Button>
						</div>
					);
				})}
			</div>

			{/* Desktop table */}
			<div className="hidden md:block overflow-x-auto rounded-lg border border-border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-4">Applicant</TableHead>
							<TableHead className="hidden lg:table-cell">Category</TableHead>
							<TableHead>Applied</TableHead>
							<TableHead>Docs</TableHead>
							<TableHead className="text-right pr-4">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{techs.length === 0 && (
							<TableRow>
								<TableCell colSpan={5} className="text-center text-muted-foreground py-8">No pending applicants.</TableCell>
							</TableRow>
						)}
						{paged.map((tech) => {
							const { uploaded, total } = docProgress(tech);
							return (
								<TableRow key={tech.id}>
									<TableCell className="pl-4">
										<div className="flex items-center gap-2.5">
											<TechAvatar initials={tech.initials} color={tech.color} size="sm" />
											<div>
												<p className="text-sm font-semibold text-foreground">{tech.name}</p>
												<p className="text-xs text-muted-foreground">{tech.city}</p>
											</div>
										</div>
									</TableCell>
									<TableCell className="hidden lg:table-cell">
										<CategoryTag meta={getCategoryMetaBySpecialty(tech.specialty)} fallbackLabel={tech.specialty} size="sm" />
									</TableCell>
									<TableCell className="text-xs text-muted-foreground">{tech.appliedAt}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<div className="w-16 bg-muted rounded-full h-1.5 flex-shrink-0">
												<div className="bg-primary rounded-full h-1.5" style={{ width: `${(uploaded / total) * 100}%` }} />
											</div>
											<span className="text-xs text-muted-foreground tabular-nums">{uploaded}/{total}</span>
										</div>
									</TableCell>
									<TableCell className="text-right pr-4">
										<Button size="sm" variant="outline" onClick={() => setSelected(tech)}>Review</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>

			{techs.length > 0 && (
				<div className="mt-3">
					<Pagination
						page={page}
						pageCount={pageCount}
						pageSize={PAGE_SIZE}
						totalItems={techs.length}
						onPageChange={setPage}
					/>
				</div>
			)}

			<ApplicantReviewModal
				tech={selected}
				open={!!selected}
				onClose={() => setSelected(null)}
				onApprove={(id) => { onApprove(id); setSelected(null); }}
				onReject={(id) => { onReject(id); setSelected(null); }}
			/>
		</>
	);
}
