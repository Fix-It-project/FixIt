import { Star } from "lucide-react";

interface StarRatingProps {
	rating: number;
	reviews?: number;
	size?: "sm" | "md";
}

export function StarRating({ rating, reviews, size = "sm" }: StarRatingProps) {
	const starClass = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
	return (
		<span className="flex items-center gap-0.5 flex-wrap">
			{Array.from({ length: 5 }, (_, i) => (
				<Star
					key={i}
					className={`${starClass} ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
				/>
			))}
			<span className="text-[11px] text-muted-foreground ml-1 tabular-nums">{rating.toFixed(2)}</span>
			{reviews !== undefined && (
				<span className="text-[11px] text-muted-foreground">({reviews})</span>
			)}
		</span>
	);
}
