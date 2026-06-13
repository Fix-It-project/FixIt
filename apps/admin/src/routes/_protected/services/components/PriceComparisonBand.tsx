import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface PriceComparisonBandProps {
	minPrice: number;
	maxPrice: number;
	catalogMin: number | null;
	catalogMax: number | null;
}

function egp(n: number): string {
	return `EGP ${Math.round(n).toLocaleString("en-US")}`;
}

/**
 * Renders the technician's proposed price range against the price range of the
 * other services in the same category, so outlier pricing is obvious at a glance.
 * The proposed range is one continuous pill: primary where it sits inside the
 * category range, amber where it falls outside. Category bounds show as tick
 * markers. Degrades to a plain proposed bar when the category has no other
 * services to compare against.
 */
export function PriceComparisonBand({
	minPrice,
	maxPrice,
	catalogMin,
	catalogMax,
}: PriceComparisonBandProps) {
	const hasCatalog =
		catalogMin != null && catalogMax != null && catalogMax > catalogMin;

	if (!hasCatalog) {
		return (
			<div className="flex flex-col gap-2">
				<div className="relative h-2.5 rounded-full bg-primary/15">
					<div className="absolute inset-0 rounded-full bg-primary" />
				</div>
				<div className="flex justify-between text-xs tabular-nums">
					<span className="font-semibold text-foreground">{egp(minPrice)}</span>
					<span className="font-semibold text-foreground">{egp(maxPrice)}</span>
				</div>
				<p className="text-[11px] text-muted-foreground">
					No other services in this category yet to compare against.
				</p>
			</div>
		);
	}

	const cMin = catalogMin as number;
	const cMax = catalogMax as number;
	const domainMin = Math.min(cMin, minPrice);
	const domainMax = Math.max(cMax, maxPrice);
	const span = domainMax - domainMin || 1;
	const pct = (v: number) => ((v - domainMin) / span) * 100;

	// Edge-aware label placement: labels at the track ends align to the edge
	// instead of centering (which would overflow + wrap).
	const labelStyle = (value: number): CSSProperties => {
		const c = Math.max(0, Math.min(100, pct(value)));
		const transform =
			c <= 12
				? "translateX(0)"
				: c >= 88
					? "translateX(-100%)"
					: "translateX(-50%)";
		return { left: `${c}%`, transform };
	};

	const below = minPrice < cMin;
	const above = maxPrice > cMax;
	const inStart = Math.max(minPrice, cMin);
	const inEnd = Math.min(maxPrice, cMax);
	const hasInRange = inStart < inEnd;

	// Proposed range as a single continuous pill, colour-zoned by where it sits
	// relative to the category range (amber outside, primary inside).
	const belowW = below ? Math.min(maxPrice, cMin) - minPrice : 0;
	const inW = hasInRange ? inEnd - inStart : 0;
	const aboveW = above ? maxPrice - Math.max(minPrice, cMax) : 0;

	const note =
		below && above
			? { text: "Outside typical category prices", tone: "warn" as const }
			: below
				? { text: "Below typical category prices", tone: "warn" as const }
				: above
					? { text: "Above typical category prices", tone: "warn" as const }
					: { text: "In line with category prices", tone: "ok" as const };

	return (
		<div className="flex flex-col gap-2">
			{/* catalog endpoints */}
			<div className="relative h-4 text-[11px] text-muted-foreground tabular-nums">
				<span className="absolute whitespace-nowrap" style={labelStyle(cMin)}>
					{egp(cMin)}
				</span>
				<span className="absolute whitespace-nowrap" style={labelStyle(cMax)}>
					{egp(cMax)}
				</span>
			</div>

			{/* single faint domain track + category-range ticks + one proposed pill */}
			<div className="relative h-2.5 rounded-full bg-primary/10">
				{/* proposed range: one continuous pill, colour-zoned */}
				<div
					className="absolute inset-y-0 flex overflow-hidden rounded-full"
					style={{
						left: `${pct(minPrice)}%`,
						width: `${pct(maxPrice) - pct(minPrice)}%`,
					}}
				>
					{belowW > 0 && (
						<div className="h-full bg-amber-500" style={{ flexGrow: belowW }} />
					)}
					{inW > 0 && (
						<div className="h-full bg-primary" style={{ flexGrow: inW }} />
					)}
					{aboveW > 0 && (
						<div className="h-full bg-amber-500" style={{ flexGrow: aboveW }} />
					)}
				</div>
				{/* category range bounds, as subtle markers (not a second bar) */}
				<div
					className="absolute top-1/2 h-4 w-0.5 rounded-full bg-muted-foreground/50"
					style={{ left: `${pct(cMin)}%`, transform: "translate(-50%,-50%)" }}
				/>
				<div
					className="absolute top-1/2 h-4 w-0.5 rounded-full bg-muted-foreground/50"
					style={{ left: `${pct(cMax)}%`, transform: "translate(-50%,-50%)" }}
				/>
			</div>

			{/* proposed endpoints */}
			<div className="relative h-4 font-semibold text-foreground text-xs tabular-nums">
				<span
					className="absolute whitespace-nowrap"
					style={labelStyle(minPrice)}
				>
					{egp(minPrice)}
				</span>
				<span
					className="absolute whitespace-nowrap"
					style={labelStyle(maxPrice)}
				>
					{egp(maxPrice)}
				</span>
			</div>

			<div className="flex items-center gap-3 text-[11px]">
				<span className="inline-flex items-center gap-1.5 text-muted-foreground">
					<span className="h-2 w-2 rounded-full bg-primary" /> Proposed
				</span>
				<span className="inline-flex items-center gap-1.5 text-muted-foreground">
					<span className="h-3 w-0.5 rounded-full bg-muted-foreground/50" />{" "}
					Category range
				</span>
				<span
					className={cn(
						"ml-auto font-medium",
						note.tone === "warn"
							? "text-amber-600 dark:text-amber-400"
							: "text-emerald-600 dark:text-emerald-400",
					)}
				>
					{note.text}
				</span>
			</div>
		</div>
	);
}
