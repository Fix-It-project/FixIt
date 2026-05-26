import { useState } from "react";
import { CategoryTag } from "@/components/CategoryTag";
import { TechAvatar } from "@/components/TechAvatar";
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
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategoryMetaBySpecialty } from "@/lib/category-icons";
import type { ActiveTech } from "@/types/domain";

interface BlockedTabProps {
	techs: ActiveTech[];
	onUnblock: (id: string) => void;
}

export function BlockedTab({ techs, onUnblock }: BlockedTabProps) {
	const [unblocking, setUnblocking] = useState<ActiveTech | null>(null);

	return (
		<>
			{/* Mobile card view */}
			<div className="md:hidden flex flex-col gap-3">
				{techs.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No blocked technicians.</p>}
				{techs.map((tech) => (
					<div key={tech.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
						<TechAvatar initials={tech.initials} color={tech.color} size="md" />
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-foreground truncate">{tech.name}</p>
							<div className="mt-0.5">
								<CategoryTag meta={getCategoryMetaBySpecialty(tech.specialty)} fallbackLabel={tech.specialty} size="sm" />
							</div>
							<p className="text-xs text-destructive mt-0.5 line-clamp-2">{tech.blockedReason}</p>
							<p className="text-[11px] text-muted-foreground mt-0.5">Blocked {tech.blockedAt}</p>
						</div>
						<Button size="sm" variant="outline" onClick={() => setUnblocking(tech)}>Unblock</Button>
					</div>
				))}
			</div>

			{/* Desktop table */}
			<div className="hidden md:block overflow-x-auto rounded-lg border border-border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-4">Technician</TableHead>
							<TableHead>Reason</TableHead>
							<TableHead className="hidden lg:table-cell">Blocked on</TableHead>
							<TableHead className="hidden xl:table-cell">Blocked by</TableHead>
							<TableHead className="text-right pr-4">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{techs.length === 0 && (
							<TableRow>
								<TableCell colSpan={5} className="text-center text-muted-foreground py-8">No blocked technicians.</TableCell>
							</TableRow>
						)}
						{techs.map((tech) => (
							<TableRow key={tech.id}>
								<TableCell className="pl-4">
									<div className="flex items-center gap-2.5">
										<TechAvatar initials={tech.initials} color={tech.color} size="sm" />
										<div>
											<p className="text-sm font-semibold text-foreground">{tech.name}</p>
											<div className="mt-0.5">
												<CategoryTag meta={getCategoryMetaBySpecialty(tech.specialty)} fallbackLabel={tech.specialty} size="sm" />
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell className="max-w-[200px]">
									<p className="text-sm text-destructive line-clamp-2">{tech.blockedReason}</p>
								</TableCell>
								<TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{tech.blockedAt}</TableCell>
								<TableCell className="hidden xl:table-cell text-xs text-muted-foreground">{tech.blockedBy}</TableCell>
								<TableCell className="text-right pr-4">
									<Button size="sm" variant="outline" onClick={() => setUnblocking(tech)}>Unblock</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<AlertDialog open={!!unblocking} onOpenChange={() => setUnblocking(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unblock {unblocking?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							This technician will be able to receive orders again. You can block them again at any time.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => { if (unblocking) { onUnblock(unblocking.id); setUnblocking(null); } }}>
							Unblock
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
