import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Homeowner } from "@/types";
import { ActiveTab } from "./components/ActiveTab";
import { BlockedTab } from "./components/BlockedTab";
import { BlockReasonModal } from "./components/BlockReasonModal";
import { HomeownerProfileModal } from "./components/HomeownerProfileModal";
import { useHomeownerState } from "./hooks/useHomeownerState";

export const Route = createFileRoute("/_protected/homeowners/")({
	component: HomeownersPage,
});

function HomeownersPage() {
	const { activeHomeowners, blockedHomeowners, blockHomeowner, unblockHomeowner } = useHomeownerState();

	const [viewing, setViewing] = useState<Homeowner | null>(null);
	const [blocking, setBlocking] = useState<Homeowner | null>(null);

	function handleBlock(reason: string) {
		if (blocking) {
			blockHomeowner(blocking.id, reason);
			setBlocking(null);
		}
	}

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 pb-12">
			{/* Header */}
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Homeowners</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{activeHomeowners.length} active · {blockedHomeowners.length} blocked
				</p>
			</div>

			<Tabs defaultValue="active">
				<TabsList className="w-full sm:w-auto">
					<TabsTrigger value="active" className="flex-1 sm:flex-none">
						Active
						<span className="ml-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-1.5 py-0.5">
							{activeHomeowners.length}
						</span>
					</TabsTrigger>
					<TabsTrigger value="blocked" className="flex-1 sm:flex-none">
						Blocked
						{blockedHomeowners.length > 0 && (
							<span className="ml-1.5 rounded-full bg-destructive/10 text-destructive text-[11px] font-semibold px-1.5 py-0.5">
								{blockedHomeowners.length}
							</span>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="active" className="mt-4">
					<ActiveTab homeowners={activeHomeowners} onView={setViewing} />
				</TabsContent>

				<TabsContent value="blocked" className="mt-4">
					<BlockedTab homeowners={blockedHomeowners} onUnblock={unblockHomeowner} />
				</TabsContent>
			</Tabs>

			{/* Modals */}
			<HomeownerProfileModal
				homeowner={viewing}
				open={!!viewing}
				onClose={() => setViewing(null)}
				onBlock={(id) => {
					const h = activeHomeowners.find((x) => x.id === id);
					if (h) { setViewing(null); setBlocking(h); }
				}}
				onUnblock={unblockHomeowner}
			/>

			<BlockReasonModal
				homeownerName={blocking?.name ?? ""}
				open={!!blocking}
				onClose={() => setBlocking(null)}
				onConfirm={handleBlock}
			/>
		</div>
	);
}
