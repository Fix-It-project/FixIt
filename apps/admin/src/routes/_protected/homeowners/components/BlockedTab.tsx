import { useState } from "react";
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
import type { Homeowner } from "@/types/domain";

interface BlockedTabProps {
	homeowners: Homeowner[];
	onUnblock: (id: string) => void;
}

export function BlockedTab({ homeowners, onUnblock }: BlockedTabProps) {
	const [unblocking, setUnblocking] = useState<Homeowner | null>(null);

	return (
		<>
			{/* Mobile card view */}
			<div className="md:hidden flex flex-col gap-3">
				{homeowners.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No blocked homeowners.</p>}
				{homeowners.map((h) => (
					<div key={h.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
						<TechAvatar initials={h.initials} color={h.color} size="md" />
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-foreground truncate">{h.name}</p>
							<p className="text-xs text-muted-foreground">{h.city}</p>
							<p className="text-xs text-destructive mt-0.5 line-clamp-2">{h.blockedReason}</p>
							<p className="text-[11px] text-muted-foreground mt-0.5">Blocked {h.blockedAt}</p>
						</div>
						<Button size="sm" variant="outline" onClick={() => setUnblocking(h)}>Unblock</Button>
					</div>
				))}
			</div>

			{/* Desktop table */}
			<div className="hidden md:block overflow-x-auto rounded-lg border border-border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-4">Homeowner</TableHead>
							<TableHead>Reason</TableHead>
							<TableHead className="hidden lg:table-cell">Blocked on</TableHead>
							<TableHead className="hidden xl:table-cell">Blocked by</TableHead>
							<TableHead className="text-right pr-4">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{homeowners.length === 0 && (
							<TableRow>
								<TableCell colSpan={5} className="text-center text-muted-foreground py-8">No blocked homeowners.</TableCell>
							</TableRow>
						)}
						{homeowners.map((h) => (
							<TableRow key={h.id}>
								<TableCell className="pl-4">
									<div className="flex items-center gap-2.5">
										<TechAvatar initials={h.initials} color={h.color} size="sm" />
										<div>
											<p className="text-sm font-semibold text-foreground">{h.name}</p>
											<p className="text-xs text-muted-foreground">{h.city}</p>
										</div>
									</div>
								</TableCell>
								<TableCell className="max-w-[260px]">
									<p className="text-sm text-destructive line-clamp-2">{h.blockedReason}</p>
								</TableCell>
								<TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{h.blockedAt}</TableCell>
								<TableCell className="hidden xl:table-cell text-xs text-muted-foreground">{h.blockedBy}</TableCell>
								<TableCell className="text-right pr-4">
									<Button size="sm" variant="outline" onClick={() => setUnblocking(h)}>Unblock</Button>
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
							This homeowner will be able to place new orders again. You can block them again at any time.
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
