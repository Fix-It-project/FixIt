import { UserRound, Wrench } from "lucide-react";
import type { ReportSource } from "@/types";

interface RoleChipProps {
	role: ReportSource;
	size?: "sm" | "md";
}

const STYLES: Record<ReportSource, { label: string; color: string; Icon: typeof UserRound }> = {
	customer: { label: "Customer", color: "#6366f1", Icon: UserRound },
	technician: { label: "Technician", color: "#f97316", Icon: Wrench },
};

export function RoleChip({ role, size = "sm" }: RoleChipProps) {
	const s = STYLES[role];
	const Icon = s.Icon;
	const padding = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";
	const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-md font-semibold ${padding}`}
			style={{ backgroundColor: `${s.color}1f`, color: s.color }}
		>
			<Icon className={iconSize} />
			{s.label}
		</span>
	);
}
