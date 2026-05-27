interface FixItLogoProps {
	size?: number;
	showText?: boolean;
}

export function FixItLogo({ size = 32, showText = true }: FixItLogoProps) {
	return (
		<div className="flex items-center gap-2.5">
			<img
				src="/logo.png"
				alt="FixIt"
				width={size}
				height={size}
				className="rounded-[10px] flex-shrink-0"
			/>
			{showText && (
				<div className="min-w-0">
					<div className="font-bold text-[17px] leading-tight text-foreground tracking-tight">FixIt</div>
					<div className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">Operator</div>
				</div>
			)}
		</div>
	);
}
