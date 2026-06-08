import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveTab } from "./components/ActiveTab";
import { BlockedTab } from "./components/BlockedTab";
import { useHomeowners, useUnblockHomeowner } from "./hooks/useHomeowners";

export const Route = createFileRoute("/_protected/homeowners/")({
	component: HomeownersPage,
});

function HomeownersPage() {
	const navigate = useNavigate();
	const { data, isLoading } = useHomeowners();
	const unblockMutation = useUnblockHomeowner();

	const homeowners = data ?? [];
	const activeHomeowners = homeowners.filter((h) => !h.blocked);
	const blockedHomeowners = homeowners.filter((h) => h.blocked);

	const openDetail = (id: string) =>
		navigate({ to: "/homeowners/$homeownerId", params: { homeownerId: id } });

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 pb-12">
			{/* Header */}
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Homeowners</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{isLoading
						? "Loading…"
						: `${activeHomeowners.length} active · ${blockedHomeowners.length} blocked`}
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
					<ActiveTab homeowners={activeHomeowners} onView={(h) => openDetail(h.id)} />
				</TabsContent>

				<TabsContent value="blocked" className="mt-4">
					<BlockedTab homeowners={blockedHomeowners} onUnblock={(id) => unblockMutation.mutate(id)} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
