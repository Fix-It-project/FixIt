import { cn } from "@/lib/utils";
import type { ReportLabel } from "@/types";

type Tone = "danger" | "warn" | "slate" | "neutral";

/** Severity tone per label. Destructive is reserved for genuine danger
 *  (safety / unsafe) so the red actually signals something. */
const LABEL_TONE: Record<ReportLabel, Tone> = {
	safety_concern: "danger",
	unsafe_dishonest: "danger",
	no_show: "warn",
	overcharged: "warn",
	refused_payment: "warn",
	unprofessional: "slate",
	abusive: "slate",
	poor_quality: "slate",
	other: "neutral",
};

const TONE_CLASS: Record<Tone, string> = {
	danger: "bg-destructive/10 text-destructive",
	warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
	neutral: "bg-muted text-muted-foreground",
};

interface ReasonChipProps {
	label: ReportLabel;
	labelText: string;
	size?: "sm" | "md";
	className?: string;
}

export function ReasonChip({
	label,
	labelText,
	size = "sm",
	className,
}: ReasonChipProps) {
	const tone = LABEL_TONE[label] ?? "neutral";
	const padding =
		size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full font-semibold",
				TONE_CLASS[tone],
				padding,
				className,
			)}
		>
			<span className="h-1.5 w-1.5 rounded-full bg-current" />
			{labelText}
		</span>
	);
}
