import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { AdminReport, ReportSourceFilter } from "@/types";
import { ReportCasePanel } from "./components/ReportCasePanel";
import { ReportQueue } from "./components/ReportQueue";
import {
	useDismissReport,
	useReopenReport,
	useReports,
	useResolveReport,
	useWarnReport,
} from "./hooks/useReports";

export const Route = createFileRoute("/_protected/reports/")({
	component: ReportsPage,
});

/** Tracks whether the viewport is at the `lg` split-view breakpoint. */
function useIsDesktop(): boolean {
	const [isDesktop, setIsDesktop] = useState(
		() =>
			typeof window !== "undefined" &&
			window.matchMedia("(min-width: 1024px)").matches,
	);
	useEffect(() => {
		const mq = window.matchMedia("(min-width: 1024px)");
		const onChange = () => setIsDesktop(mq.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);
	return isDesktop;
}

const SOURCES: { key: ReportSourceFilter; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "user", label: "From users" },
	{ key: "technician", label: "From technicians" },
];

function bySource(
	reports: AdminReport[],
	f: ReportSourceFilter,
): AdminReport[] {
	if (f === "all") return reports;
	return reports.filter((r) => r.reporterRole === f);
}

function ReportsPage() {
	const { data, isLoading } = useReports();
	const resolve = useResolveReport();
	const dismiss = useDismissReport();
	const reopen = useReopenReport();
	const warn = useWarnReport();
	const isDesktop = useIsDesktop();

	const reports = useMemo(() => data ?? [], [data]);
	const open = useMemo(
		() => reports.filter((r) => r.status === "open"),
		[reports],
	);
	const closed = useMemo(
		() => reports.filter((r) => r.status === "closed"),
		[reports],
	);

	const [tab, setTab] = useState<"open" | "closed">("open");
	const [source, setSource] = useState<ReportSourceFilter>("all");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [mobileOpen, setMobileOpen] = useState(false);

	const base = tab === "open" ? open : closed;
	const activeList = useMemo(() => bySource(base, source), [base, source]);

	// Keep a valid selection on desktop: hold the current one if still in the
	// active list, otherwise advance to the first (never an empty panel).
	useEffect(() => {
		if (!isDesktop) return;
		setSelectedId((prev) =>
			prev && activeList.some((r) => r.id === prev)
				? prev
				: (activeList[0]?.id ?? null),
		);
	}, [activeList, isDesktop]);

	const selected = activeList.find((r) => r.id === selectedId) ?? null;

	const handleSelect = (id: string) => {
		setSelectedId(id);
		if (!isDesktop) setMobileOpen(true);
	};

	const closeMobile = () => setMobileOpen(false);
	const handleResolve = (id: string) =>
		resolve.mutate(id, { onSuccess: closeMobile });
	const handleDismiss = (id: string) =>
		dismiss.mutate(id, { onSuccess: closeMobile });
	const handleReopen = (id: string) =>
		reopen.mutate(id, { onSuccess: closeMobile });
	const handleWarn = (id: string) => warn.mutate(id);

	const panelProps = {
		report: selected,
		onResolve: handleResolve,
		onDismiss: handleDismiss,
		onReopen: handleReopen,
		onWarn: handleWarn,
		resolvePending: resolve.isPending,
		dismissPending: dismiss.isPending,
		reopenPending: reopen.isPending,
		warnPending: warn.isPending,
	};

	return (
		<div className="flex flex-col gap-6 p-4 pb-12 sm:p-6 lg:p-8">
			<div>
				<h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
					Reports
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					{isLoading
						? "Loading…"
						: `${open.length} open · ${closed.length} closed · complaints between users and technicians`}
				</p>
			</div>

			<Tabs value={tab} onValueChange={(v) => setTab(v as "open" | "closed")}>
				<TabsList className="w-full sm:w-auto">
					<TabsTrigger value="open" className="flex-1 sm:flex-none">
						Open
						{open.length > 0 && (
							<span className="ml-1.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 font-semibold text-[11px] text-amber-600">
								{open.length}
							</span>
						)}
					</TabsTrigger>
					<TabsTrigger value="closed" className="flex-1 sm:flex-none">
						Closed
						{closed.length > 0 && (
							<span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 font-semibold text-[11px] text-muted-foreground">
								{closed.length}
							</span>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value={tab} className="mt-4 flex flex-col gap-4">
					{/* Source filter */}
					<div className="inline-flex w-fit items-center gap-1 rounded-lg border border-border bg-card p-1">
						{SOURCES.map((f) => {
							const count =
								f.key === "all" ? base.length : bySource(base, f.key).length;
							const active = source === f.key;
							return (
								<button
									key={f.key}
									type="button"
									onClick={() => setSource(f.key)}
									className={cn(
										"rounded-md px-3 py-1.5 font-medium text-xs transition-colors",
										active
											? "bg-primary/10 text-primary"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									{f.label}
									<span className="ml-1.5 text-[11px] tabular-nums opacity-70">
										{count}
									</span>
								</button>
							);
						})}
					</div>

					{isLoading ? (
						<QueueSkeleton />
					) : activeList.length === 0 ? (
						<EmptyState closed={tab === "closed"} />
					) : (
						<div className="grid gap-4 lg:grid-cols-[minmax(320px,380px)_1fr] lg:items-start">
							<div className="overflow-hidden rounded-xl border border-border bg-card">
								<ReportQueue
									reports={activeList}
									selectedId={selectedId}
									onSelect={handleSelect}
								/>
							</div>
							<div className="hidden rounded-xl border border-border bg-card lg:block">
								<ReportCasePanel {...panelProps} />
							</div>
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Mobile review (split view collapses to a dialog under lg) */}
			<Dialog open={mobileOpen && !isDesktop} onOpenChange={setMobileOpen}>
				<DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0">
					<ReportCasePanel {...panelProps} />
				</DialogContent>
			</Dialog>
		</div>
	);
}

function EmptyState({ closed }: { closed: boolean }) {
	return (
		<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border border-dashed bg-card px-6 py-16 text-center">
			<span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
				<ShieldCheck className="h-6 w-6" />
			</span>
			<p className="font-semibold text-foreground text-sm">
				{closed ? "Nothing closed yet" : "All clear"}
			</p>
			<p className="max-w-xs text-muted-foreground text-sm">
				{closed
					? "Resolved and dismissed reports will be archived here."
					: "No open complaints. Reports filed by users and technicians land here for review."}
			</p>
		</div>
	);
}

function QueueSkeleton() {
	return (
		<div className="grid gap-4 lg:grid-cols-[minmax(320px,380px)_1fr] lg:items-start">
			<div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
				{["s1", "s2", "s3", "s4", "s5"].map((k) => (
					<div key={k} className="flex items-center gap-2">
						<Skeleton className="h-7 w-7 rounded-full" />
						<Skeleton className="h-7 w-7 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-3 w-1/2" />
							<Skeleton className="h-3 w-2/3" />
						</div>
					</div>
				))}
			</div>
			<div className="hidden rounded-xl border border-border bg-card p-6 lg:block">
				<Skeleton className="h-16 w-full" />
				<Skeleton className="mt-4 h-6 w-1/3" />
				<Skeleton className="mt-4 h-20 w-full" />
			</div>
		</div>
	);
}
