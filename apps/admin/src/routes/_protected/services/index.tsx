import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PAGE_SIZE, Pagination } from "@/components/Pagination";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DecidedList } from "./components/DecidedList";
import { RequestQueue } from "./components/RequestQueue";
import { RequestReviewPanel } from "./components/RequestReviewPanel";
import {
	useApproveServiceRequest,
	useRejectServiceRequest,
	useServiceRequests,
} from "./hooks/useServiceRequests";

export const Route = createFileRoute("/_protected/services/")({
	component: ServicesPage,
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

function ServicesPage() {
	const [tab, setTab] = useState<"pending" | "decided">("pending");
	const [pendingPage, setPendingPage] = useState(1);
	const [decidedPage, setDecidedPage] = useState(1);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [mobileOpen, setMobileOpen] = useState(false);

	const page = tab === "pending" ? pendingPage : decidedPage;
	const { data, isLoading } = useServiceRequests({
		page,
		pageSize: PAGE_SIZE,
		status: tab,
	});
	const approve = useApproveServiceRequest();
	const reject = useRejectServiceRequest();
	const isDesktop = useIsDesktop();

	const requests = useMemo(() => data?.data ?? [], [data]);
	const counts = data?.counts;
	const total = data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	// Keep a valid selection on desktop while on the pending tab: hold the current
	// one if still in the list, otherwise advance to the first (never an empty panel).
	useEffect(() => {
		if (!isDesktop || tab !== "pending") return;
		setSelectedId((prev) =>
			prev && requests.some((r) => r.id === prev)
				? prev
				: (requests[0]?.id ?? null),
		);
	}, [requests, isDesktop, tab]);

	const selected = requests.find((r) => r.id === selectedId) ?? null;

	const handleSelect = (id: string) => {
		setSelectedId(id);
		if (!isDesktop) setMobileOpen(true);
	};

	const handleApprove = (id: string) =>
		approve.mutate(id, { onSuccess: () => setMobileOpen(false) });
	const handleReject = (id: string, reason?: string) =>
		reject.mutate({ id, reason }, { onSuccess: () => setMobileOpen(false) });

	return (
		<div className="flex flex-col gap-6 p-4 pb-12 sm:p-6 lg:p-8">
			<div>
				<h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
					Services
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					{!counts
						? "Loading…"
						: `${counts.pending} awaiting review · ${counts.decided} decided`}
				</p>
			</div>

			<Tabs
				value={tab}
				onValueChange={(v) => setTab(v as "pending" | "decided")}
			>
				<TabsList className="w-full sm:w-auto">
					<TabsTrigger value="pending" className="flex-1 sm:flex-none">
						Pending
						{counts && counts.pending > 0 && (
							<span className="ml-1.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 font-semibold text-[11px] text-amber-600">
								{counts.pending}
							</span>
						)}
					</TabsTrigger>
					<TabsTrigger value="decided" className="flex-1 sm:flex-none">
						Decided
						{counts && counts.decided > 0 && (
							<span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 font-semibold text-[11px] text-muted-foreground">
								{counts.decided}
							</span>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="pending" className="mt-4">
					{isLoading ? (
						<QueueSkeleton />
					) : requests.length === 0 ? (
						<EmptyState />
					) : (
						<div className="flex flex-col gap-4">
							<div className="grid gap-4 lg:grid-cols-[minmax(320px,380px)_1fr] lg:items-start">
								<div className="overflow-hidden rounded-xl border border-border bg-card">
									<RequestQueue
										requests={requests}
										selectedId={selectedId}
										onSelect={handleSelect}
									/>
								</div>
								<div className="hidden rounded-xl border border-border bg-card lg:block">
									<RequestReviewPanel
										request={selected}
										onApprove={handleApprove}
										onReject={handleReject}
										approvePending={approve.isPending}
										rejectPending={reject.isPending}
									/>
								</div>
							</div>
							<Pagination
								page={pendingPage}
								pageCount={pageCount}
								pageSize={PAGE_SIZE}
								totalItems={total}
								onPageChange={setPendingPage}
							/>
						</div>
					)}
				</TabsContent>

				<TabsContent value="decided" className="mt-4">
					{isLoading ? (
						<QueueSkeleton />
					) : (
						<div className="flex flex-col gap-4">
							<DecidedList requests={requests} />
							<Pagination
								page={decidedPage}
								pageCount={pageCount}
								pageSize={PAGE_SIZE}
								totalItems={total}
								onPageChange={setDecidedPage}
							/>
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Mobile review (split view collapses to a dialog under lg) */}
			<Dialog open={mobileOpen && !isDesktop} onOpenChange={setMobileOpen}>
				<DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0">
					<RequestReviewPanel
						request={selected}
						onApprove={handleApprove}
						onReject={handleReject}
						approvePending={approve.isPending}
						rejectPending={reject.isPending}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border border-dashed bg-card px-6 py-16 text-center">
			<span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<ClipboardList className="h-6 w-6" />
			</span>
			<p className="font-semibold text-foreground text-sm">All caught up</p>
			<p className="max-w-xs text-muted-foreground text-sm">
				New service requests from technicians land here for approval.
			</p>
		</div>
	);
}

function QueueSkeleton() {
	return (
		<div className="grid gap-4 lg:grid-cols-[minmax(320px,380px)_1fr] lg:items-start">
			<div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
				{["s1", "s2", "s3", "s4", "s5"].map((k) => (
					<div key={k} className="flex items-start gap-3">
						<Skeleton className="h-7 w-7 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-3.5 w-2/3" />
							<Skeleton className="h-3 w-1/2" />
						</div>
					</div>
				))}
			</div>
			<div className="hidden rounded-xl border border-border bg-card p-6 lg:block">
				<Skeleton className="h-6 w-1/2" />
				<Skeleton className="mt-4 h-16 w-full" />
				<Skeleton className="mt-4 h-10 w-full" />
			</div>
		</div>
	);
}
