import type { ReactNode } from "react";
import { useSidebarState } from "@/hooks/useSidebarState";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
	children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	const { state, mobileOpen, toggle, toggleMobile, closeMobile } = useSidebarState();
	const collapsed = state === "collapsed";

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			{/* Mobile backdrop */}
			{mobileOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 md:hidden"
					onClick={closeMobile}
					aria-hidden="true"
				/>
			)}

			{/* Mobile drawer */}
			<div
				className={cn(
					"fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-200",
					mobileOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<Sidebar collapsed={false} onToggle={closeMobile} onClose={closeMobile} />
			</div>

			{/* Desktop sidebar — icon-only at md, full at lg */}
			<div className="hidden md:flex flex-shrink-0">
				{/* md: always collapsed icon-only */}
				<div className="lg:hidden">
					<Sidebar collapsed={true} onToggle={toggle} />
				</div>
				{/* lg+: respects user preference */}
				<div className="hidden lg:block">
					<Sidebar collapsed={collapsed} onToggle={toggle} />
				</div>
			</div>

			{/* Main column */}
			<div className="flex flex-1 flex-col min-w-0 overflow-hidden">
				<Topbar
					sidebarCollapsed={collapsed}
					onSidebarToggle={toggle}
					onMobileMenuToggle={toggleMobile}
				/>
				<main className="flex-1 overflow-y-auto">
					{children}
				</main>
			</div>
		</div>
	);
}
