import { Apple, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

// Custom "coming soon" chip — deliberately NOT an official App Store / Play badge,
// because the apps are not listed yet. Rendered as disabled.
export function StoreChip({
	platform,
	note,
	tone = "light",
	className,
}: {
	platform: string;
	note: string;
	tone?: Tone;
	className?: string;
}) {
	const isApple = platform.toLowerCase().includes("app store");
	const Icon = isApple ? Apple : Play;

	return (
		<span
			aria-disabled="true"
			title={`${platform} — ${note}`}
			className={cn(
				"inline-flex cursor-default select-none items-center gap-3 rounded-2xl px-4 py-2.5 opacity-90",
				tone === "light"
					? "bg-foreground text-background"
					: "bg-primary-foreground/10 text-primary-foreground ring-1 ring-primary-foreground/20",
				className,
			)}
		>
			<Icon className="h-6 w-6 shrink-0" aria-hidden />
			<span className="flex flex-col leading-tight">
				<span className="font-mono text-[10px] uppercase tracking-wider opacity-70">
					{note}
				</span>
				<span className="font-semibold text-sm">{platform}</span>
			</span>
		</span>
	);
}
