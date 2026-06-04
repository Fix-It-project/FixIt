import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
	BarChart2,
	Home,
	List,
	LogOut,
	Star,
	Users,
	Wallet,
	Wrench,
} from "lucide-react";
import { FixItLogo } from "@/components/FixItLogo";
import { apiClient } from "@/lib/api-client";
import { meQuery } from "@/lib/auth-query";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface NavItem {
	key: string;
	href: string;
	icon: React.ReactNode;
	label: string;
	badge?: number;
}

interface SidebarProps {
	collapsed: boolean;
	onToggle: () => void;
	onClose?: () => void;
}

const NAV_SECTIONS = [
	{
		label: "Overview",
		items: [
			{ key: "dashboard", href: "/dashboard", icon: <Home className="h-[18px] w-[18px]" />, label: "Dashboard" },
			{ key: "orders", href: "/orders", icon: <List className="h-[18px] w-[18px]" />, label: "Orders" },
		] satisfies NavItem[],
	},
	{
		label: "People",
		items: [
			{ key: "technicians", href: "/technicians", icon: <Wrench className="h-[18px] w-[18px]" />, label: "Technicians" },
			{ key: "homeowners", href: "/homeowners", icon: <Users className="h-[18px] w-[18px]" />, label: "Homeowners" },
			{ key: "reviews", href: "/reviews", icon: <Star className="h-[18px] w-[18px]" />, label: "Reviews" },
		] satisfies NavItem[],
	},
	{
		label: "Insights",
		items: [
			{ key: "reports", href: "/reports", icon: <BarChart2 className="h-[18px] w-[18px]" />, label: "Reports" },
			{ key: "payouts", href: "/payouts", icon: <Wallet className="h-[18px] w-[18px]" />, label: "Payouts" },
		] satisfies NavItem[],
	},
];

const BOTTOM_ITEMS: NavItem[] = [];

function NavItemRow({ item, collapsed, active, onClick }: { item: NavItem; collapsed: boolean; active: boolean; onClick?: () => void }) {
	return (
		<Link
			to={item.href}
			onClick={onClick}
			title={collapsed ? item.label : undefined}
			className={cn(
				"flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors w-full",
				collapsed ? "justify-center px-2.5" : "",
				active
					? "bg-primary/10 text-primary font-semibold"
					: "text-muted-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			<span className="flex-shrink-0">{item.icon}</span>
			{!collapsed && <span className="flex-1 min-w-0 truncate">{item.label}</span>}
			{!collapsed && item.badge && (
				<span className="ml-auto bg-primary text-primary-foreground text-[11px] font-semibold leading-none px-1.5 py-0.5 rounded-full">
					{item.badge}
				</span>
			)}
		</Link>
	);
}

export function Sidebar({ collapsed, onClose }: SidebarProps) {
	const routerState = useRouterState();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const pathname = routerState.location.pathname;
	const { user, clearSession } = useAuthStore();

	const handleLogout = async () => {
		try {
			await apiClient.post("/api/admin/auth/logout");
		} catch {
			// Ignore network errors; clear local session regardless.
		}
		clearSession();
		// Drop the cached /me result so the login route's beforeLoad re-verifies
		// against the (now cleared) cookie instead of redirecting back on stale data.
		queryClient.removeQueries({ queryKey: meQuery.queryKey });
		navigate({ to: "/login" });
	};

	const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

	const initials = user?.email
		? user.email.slice(0, 2).toUpperCase()
		: "AD";

	return (
		<div className={cn("flex flex-col h-full bg-card border-r border-border overflow-y-auto overflow-x-hidden transition-all duration-200", collapsed ? "w-16" : "w-[248px]")}>
			{/* Brand */}
			<div className={cn("flex items-center px-4 py-5 flex-shrink-0", collapsed ? "justify-center px-2" : "gap-3")}>
				<FixItLogo size={32} showText={!collapsed} />
			</div>

			<div className="h-px bg-border mx-3" />

			{/* Nav sections */}
			<nav className="flex-1 px-2 py-3 flex flex-col gap-4">
				{NAV_SECTIONS.map((section) => (
					<div key={section.label} className="flex flex-col gap-0.5">
						{!collapsed && (
							<p className="px-3 mb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
								{section.label}
							</p>
						)}
						{section.items.map((item) => (
							<NavItemRow key={item.key} item={item} collapsed={collapsed} active={isActive(item.href)} onClick={onClose} />
						))}
					</div>
				))}

				<div className="mt-auto flex flex-col gap-0.5">
					{BOTTOM_ITEMS.map((item) => (
						<NavItemRow key={item.key} item={item} collapsed={collapsed} active={isActive(item.href)} onClick={onClose} />
					))}
				</div>
			</nav>

			<div className="h-px bg-border mx-3" />

			{/* User block */}
			<div className={cn("px-2 py-3 flex flex-col gap-2 flex-shrink-0")}>
				{!collapsed ? (
					<div className="flex items-center gap-3 bg-muted rounded-xl px-3 py-2.5">
						<span className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
							{initials}
						</span>
						<div className="flex-1 min-w-0">
							<div className="text-sm font-semibold text-foreground truncate">{user?.email ?? "admin@fixit.com"}</div>
							<div className="text-[11px] text-muted-foreground capitalize">{user?.role ?? "Admin"}</div>
						</div>
					</div>
				) : (
					<div className="flex justify-center">
						<span className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
							{initials}
						</span>
					</div>
				)}

				<button
					type="button"
					onClick={handleLogout}
					title={collapsed ? "Sign out" : undefined}
					className={cn(
						"flex items-center gap-2 w-full rounded-[10px] border border-border px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors",
						collapsed && "justify-center px-2",
					)}
				>
					<LogOut className="h-4 w-4 flex-shrink-0" />
					{!collapsed && <span>Sign out</span>}
				</button>
			</div>
		</div>
	);
}
