import { StatusBadge } from "@/components/StatusBadge";
import { TechAvatar } from "@/components/TechAvatar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { AdminServiceRequest } from "@/types";

interface DecidedListProps {
	requests: AdminServiceRequest[];
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function DecidedList({ requests }: DecidedListProps) {
	if (requests.length === 0) {
		return (
			<p className="py-12 text-center text-muted-foreground text-sm">
				No decided requests yet.
			</p>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border bg-card">
			<Table>
				<TableHeader>
					<TableRow className="border-border border-b bg-muted/40 hover:bg-muted/40">
						<TableHead className="pl-4">Service</TableHead>
						<TableHead className="hidden sm:table-cell">Technician</TableHead>
						<TableHead className="hidden md:table-cell">Price</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="hidden pr-4 lg:table-cell">
							Reviewed
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{requests.map((r) => (
						<TableRow key={r.id}>
							<TableCell className="pl-4">
								<p className="font-medium text-foreground text-sm">{r.name}</p>
								{r.status === "rejected" && r.rejectReason && (
									<p className="mt-0.5 line-clamp-1 max-w-[260px] text-muted-foreground text-xs">
										{r.rejectReason}
									</p>
								)}
							</TableCell>
							<TableCell className="hidden sm:table-cell">
								<div className="flex items-center gap-2">
									<TechAvatar
										initials={r.technicianInitials}
										color={r.color}
										size="sm"
									/>
									<span className="text-foreground text-sm">
										{r.technicianName}
									</span>
								</div>
							</TableCell>
							<TableCell className="hidden text-muted-foreground text-xs tabular-nums md:table-cell">
								EGP {r.minPrice.toLocaleString("en-US")}–
								{r.maxPrice.toLocaleString("en-US")}
							</TableCell>
							<TableCell>
								<StatusBadge
									variant={r.status === "approved" ? "success" : "danger"}
									label={r.status}
								/>
							</TableCell>
							<TableCell className="hidden pr-4 text-muted-foreground text-xs lg:table-cell">
								{r.reviewedAt ? formatDate(r.reviewedAt) : "—"}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
