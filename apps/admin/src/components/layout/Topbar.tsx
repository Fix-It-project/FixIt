import { useRouterState } from "@tanstack/react-router";
import { Bell, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
	"/dashboard": "Dashboard",
	"/orders": "Orders",
	"/categories": "Categories",
	"/technicians": "Technicians",
	"/users": "Homeowners",
	"/reviews": "Reviews",
	"/reports": "Reports",
	"/payouts": "Payouts",
	"/settings": "Settings",
	"/support": "Help & Support",
};

interface TopbarProps {
	sidebarCollapsed: boolean;
	onSidebarToggle: () => void;
	onMobileMenuToggle: () => void;
}

export function Topbar({ sidebarCollapsed, onSidebarToggle, onMobileMenuToggle }: TopbarProps) {
	const routerState = useRouterState();
	const pathname = routerState.location.pathname;
	const pageTitle = PAGE_TITLES[pathname] ?? "FixIt Admin";

	return (
		<header className="sticky top-0 z-20 h-[60px] bg-card border-b border-border flex items-center gap-3 px-4 md:px-6">
			{/* Mobile hamburger */}
			<Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuToggle} aria-label="Open menu">
				<Menu className="h-5 w-5" />
			</Button>

			{/* Desktop collapse toggle */}
			<Button variant="ghost" size="icon" className="hidden md:flex" onClick={onSidebarToggle} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
				{sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
			</Button>

			<h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>

			<div className="ml-auto flex items-center gap-1">
				{/* Search — hidden on mobile, shown on sm+ */}
				<div className={cn("hidden sm:flex items-center gap-2 h-9 w-64 rounded-full bg-muted px-3 text-sm text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors")}>
					<Search className="h-4 w-4 flex-shrink-0" />
					<span>Search…</span>
				</div>

				{/* Notifications */}
				<Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
					<Bell className="h-5 w-5" />
					<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-card" />
				</Button>

				<ThemeToggle />
			</div>
		</header>
	);
}
