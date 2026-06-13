import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveTab } from "./components/ActiveTab";
import { BlockedTab } from "./components/BlockedTab";
import { PendingTab } from "./components/PendingTab";
import { RejectedTab } from "./components/RejectedTab";
import {
	useRejectTechnician,
	useTechnicians,
	useUnblockTechnician,
	useVerifyTechnician,
} from "./hooks/useTechnicians";

export const Route = createFileRoute("/_protected/technicians/")({
	component: TechniciansPage,
});

function TechniciansPage() {
	const navigate = useNavigate();
	const { data, isLoading } = useTechnicians();
	const verifyMutation = useVerifyTechnician();
	const rejectMutation = useRejectTechnician();
	const unblockMutation = useUnblockTechnician();

	const techs = data ?? [];
	const activeTechs = techs.filter((t) => t.status === "verified");
	const pendingTechs = techs.filter((t) => t.status === "pending");
	const blockedTechs = techs.filter((t) => t.status === "blocked");
	const rejectedTechs = techs.filter((t) => t.status === "rejected");

	const openDetail = (id: string) =>
		navigate({ to: "/technicians/$technicianId", params: { technicianId: id } });

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 pb-12">
			{/* Header */}
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Technicians</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{isLoading
						? "Loading…"
						: `${activeTechs.length} active · ${pendingTechs.length} pending verification · ${blockedTechs.length} blocked · ${rejectedTechs.length} rejected`}
				</p>
			</div>

			<Tabs defaultValue="active">
				<TabsList className="w-full sm:w-auto">
					<TabsTrigger value="active" className="flex-1 sm:flex-none">
						Active
						<span className="ml-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-1.5 py-0.5">
							{activeTechs.length}
						</span>
					</TabsTrigger>
					<TabsTrigger value="pending" className="flex-1 sm:flex-none">
						Pending
						{pendingTechs.length > 0 && (
							<span className="ml-1.5 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-semibold px-1.5 py-0.5">
								{pendingTechs.length}
							</span>
						)}
					</TabsTrigger>
					<TabsTrigger value="blocked" className="flex-1 sm:flex-none">
						Blocked
						{blockedTechs.length > 0 && (
							<span className="ml-1.5 rounded-full bg-destructive/10 text-destructive text-[11px] font-semibold px-1.5 py-0.5">
								{blockedTechs.length}
							</span>
						)}
					</TabsTrigger>
					<TabsTrigger value="rejected" className="flex-1 sm:flex-none">
						Rejected
						{rejectedTechs.length > 0 && (
							<span className="ml-1.5 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold px-1.5 py-0.5">
								{rejectedTechs.length}
							</span>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="active" className="mt-4">
					<ActiveTab techs={activeTechs} onView={(tech) => openDetail(tech.id)} />
				</TabsContent>

				<TabsContent value="pending" className="mt-4">
					<PendingTab
						techs={pendingTechs}
						onApprove={(id) => verifyMutation.mutate(id)}
						onReject={(id) => rejectMutation.mutate(id)}
					/>
				</TabsContent>

				<TabsContent value="blocked" className="mt-4">
					<BlockedTab
						techs={blockedTechs}
						onUnblock={(id) => unblockMutation.mutate(id)}
						onView={(tech) => openDetail(tech.id)}
					/>
				</TabsContent>

				<TabsContent value="rejected" className="mt-4">
					<RejectedTab techs={rejectedTechs} onVerify={(id) => verifyMutation.mutate(id)} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
