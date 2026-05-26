import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/_protected/payouts/")({
	component: () => <PlaceholderPage title="Payouts" />,
});
