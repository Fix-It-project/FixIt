// Small, real UI pieces pulled out of the FixIt app, shown floating off the
// portrait device in each feature row (one per feature). These are individual
// components, not whole screens. Token-only + Google Sans so they read as the
// app. Content mirrors the real screenshots; static (no data, no scroll-swap).

import {
	Camera,
	MapPin,
	Mic,
	Navigation,
	Search,
	Star,
	Type,
	Wallet,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

const CARD = "rounded-2xl bg-background p-3 font-display shadow-lift";

function Avatar({ initials, className }: { initials: string; className?: string }) {
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground",
				className,
			)}
		>
			{initials}
		</span>
	);
}

function Stars({ rating }: { rating: number }) {
	return (
		<span className="inline-flex items-center gap-0.5 font-display text-xs">
			<Star className="h-3.5 w-3.5 fill-star text-star" aria-hidden />
			<span className="font-bold text-foreground">{rating.toFixed(2)}</span>
		</span>
	);
}

// Ask FixIt — the search bar with its three input methods.
function SearchPopout() {
	const methods = [
		{ label: "Text", Icon: Type },
		{ label: "Photo", Icon: Camera },
		{ label: "Voice", Icon: Mic },
	];
	return (
		<div className={CARD}>
			<div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2">
				<Search className="h-4 w-4 text-muted-foreground" aria-hidden />
				<span className="text-[12px] text-muted-foreground">
					What do you want to do?
				</span>
			</div>
			<div className="mt-2 flex gap-1.5">
				{methods.map(({ label, Icon }) => (
					<span
						key={label}
						className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-1 font-semibold text-[10.5px] text-primary"
					>
						<Icon className="h-3 w-3" aria-hidden />
						{label}
					</span>
				))}
			</div>
		</div>
	);
}

// Browse & compare — a single technician card.
function TechCardPopout() {
	return (
		<div className={CARD}>
			<div className="flex items-center gap-2.5">
				<Avatar initials="MP" className="h-10 w-10 text-sm" />
				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between gap-2">
						<span className="truncate font-bold text-[13px] text-foreground">
							Mario Plumber
						</span>
						<Stars rating={3.5} />
					</div>
					<p className="truncate text-[11px] text-muted-foreground">
						Hello! It's a me, Mario da plumber!
					</p>
				</div>
			</div>
			<div className="mt-2 flex items-center gap-3 text-[10.5px] text-muted-foreground">
				<span className="inline-flex items-center gap-1">
					<Navigation className="h-3 w-3 text-primary" aria-hidden />
					0.0 km
				</span>
				<span className="inline-flex items-center gap-1">
					<Wallet className="h-3 w-3 text-primary" aria-hidden />
					100 EGP
				</span>
			</div>
			<button
				type="button"
				className="mt-2.5 w-full rounded-xl bg-primary py-1.5 text-center font-bold text-[12px] text-primary-foreground"
			>
				Book Now
			</button>
		</div>
	);
}

// Clear EGP pricing — service rows with price ranges.
function PricePopout() {
	return (
		<div className={CARD}>
			<div className="font-bold text-[12.5px] text-foreground">
				Low water pressure
			</div>
			<div className="text-[10.5px] text-muted-foreground">
				Diagnose and fix weak water flow.
			</div>
			<div className="mt-1 font-bold text-[13px] text-primary">EGP 150-400</div>
			<div className="mt-2 flex items-center justify-between border-border/70 border-t pt-2 text-[11px]">
				<span className="text-muted-foreground">Toilet leakage</span>
				<span className="font-bold text-primary">EGP 250-500</span>
			</div>
		</div>
	);
}

// Stay in the loop: the live-tracking card distilled from the map screen.
function TrackingPopout() {
	return (
		<div className={CARD}>
			<div className="flex items-center justify-between">
				<span className="font-bold text-[11.5px] text-foreground">On the way</span>
				<span className="inline-flex items-center gap-1 font-semibold text-[9.5px] text-primary">
					<span className="relative flex h-1.5 w-1.5" aria-hidden>
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />
						<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
					</span>
					Live
				</span>
			</div>

			{/* Mini route: technician to your door. */}
			<div className="mt-2.5 flex items-center gap-1.5" aria-hidden>
				<span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/20" />
				<span className="h-0 flex-1 border-primary/40 border-t-2 border-dotted" />
				<MapPin className="h-4 w-4 shrink-0 text-primary" />
			</div>

			<div className="mt-3 flex items-center gap-2.5">
				<Avatar initials="MP" className="h-9 w-9 text-[13px]" />
				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between gap-2">
						<span className="truncate font-bold text-[12.5px] text-foreground">
							Mo Plumber
						</span>
						<Stars rating={5} />
					</div>
					<div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground">
						<Navigation className="h-3 w-3 text-primary" aria-hidden />
						ETA 11 min · 4.6 km
					</div>
				</div>
			</div>
		</div>
	);
}

export const POPOUTS: Record<string, ComponentType> = {
	"ask-fixit": SearchPopout,
	compare: TechCardPopout,
	prices: PricePopout,
	updates: TrackingPopout,
};
