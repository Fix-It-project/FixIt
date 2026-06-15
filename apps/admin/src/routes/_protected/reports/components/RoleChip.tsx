import { UserRound, Wrench } from "lucide-react";
import type { ReportRole } from "@/types";

interface RoleChipProps {
	role: ReportRole;
	size?: "sm" | "md";
}

/** Party role identity. Tints are reused for the avatar rings in the queue and
 *  the confrontation header so the report's direction reads pre-attentively. */
export const ROLE_META: Record<
	ReportRole,
	{ label: string; color: string; Icon: typeof UserRound }
> = {
	user: { label: "User", color: "#6366f1", Icon: UserRound },
	technician: { label: "Technician", color: "#f97316", Icon: Wrench },
};

export function roleColor(role: ReportRole): string {
	return ROLE_META[role].color;
}

export function RoleChip({ role, size = "sm" }: RoleChipProps) {
	const s = ROLE_META[role];
	const Icon = s.Icon;
	const padding =
		size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";
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
