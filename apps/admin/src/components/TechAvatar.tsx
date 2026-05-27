import { cn } from "@/lib/utils";

interface TechAvatarProps {
	initials: string;
	color: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizeClasses = {
	sm: "h-7 w-7 text-[11px]",
	md: "h-9 w-9 text-[13px]",
	lg: "h-11 w-11 text-[15px]",
};

export function TechAvatar({ initials, color, size = "md", className }: TechAvatarProps) {
	return (
		<span
			className={cn("inline-flex items-center justify-center rounded-full font-semibold text-white flex-shrink-0", sizeClasses[size], className)}
			style={{ backgroundColor: color }}
		>
			{initials}
		</span>
	);
}
