import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ActiveTech } from "@/types/domain";
import { ActiveTab } from "./components/ActiveTab";
import { BlockedTab } from "./components/BlockedTab";
import { BlockReasonModal } from "./components/BlockReasonModal";
import { PendingTab } from "./components/PendingTab";
import { TechProfileModal } from "./components/TechProfileModal";
import { useTechState } from "./hooks/useTechState";

export const Route = createFileRoute("/_protected/technicians/")({
	component: TechniciansPage,
});

function TechniciansPage() {
	const { activeTechs, blockedTechs, pendingTechs, blockTech, unblockTech, approveTech, rejectTech } = useTechState();

	const [viewingTech, setViewingTech] = useState<ActiveTech | null>(null);
	const [blockingTech, setBlockingTech] = useState<ActiveTech | null>(null);

	function handleBlock(reason: string) {
		if (blockingTech) {
			blockTech(blockingTech.id, reason);
			setBlockingTech(null);
		}
	}

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 pb-12">
			{/* Header */}
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Technicians</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{activeTechs.length} active · {pendingTechs.length} pending verification · {blockedTechs.length} blocked
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
				</TabsList>

				<TabsContent value="active" className="mt-4">
					<ActiveTab
						techs={activeTechs}
						onView={setViewingTech}
						onBlock={setBlockingTech}
					/>
				</TabsContent>

				<TabsContent value="pending" className="mt-4">
					<PendingTab
						techs={pendingTechs}
						onApprove={approveTech}
						onReject={rejectTech}
					/>
				</TabsContent>

				<TabsContent value="blocked" className="mt-4">
					<BlockedTab
						techs={blockedTechs}
						onUnblock={unblockTech}
					/>
				</TabsContent>
			</Tabs>

			{/* Modals */}
			<TechProfileModal
				tech={viewingTech}
				open={!!viewingTech}
				onClose={() => setViewingTech(null)}
				onBlock={(id) => {
					const tech = activeTechs.find((t) => t.id === id);
					if (tech) { setViewingTech(null); setBlockingTech(tech); }
				}}
			/>

			<BlockReasonModal
				techName={blockingTech?.name ?? ""}
				open={!!blockingTech}
				onClose={() => setBlockingTech(null)}
				onConfirm={handleBlock}
			/>
		</div>
	);
}
