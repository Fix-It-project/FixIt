import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,background-color,box-shadow,color] duration-200 will-change-transform active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
	{
		variants: {
			variant: {
				primary:
					"bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.7)] hover:bg-primary-dark hover:shadow-glow",
				secondary:
					"bg-background text-foreground ring-1 ring-border hover:bg-surface",
				ghost: "text-foreground hover:bg-surface",
				onDark:
					"bg-background text-primary hover:bg-primary-light hover:text-primary-dark",
				onDarkGhost:
					"text-primary-foreground ring-1 ring-primary-foreground/30 hover:bg-primary-foreground/10",
			},
			size: {
				sm: "h-9 px-4 text-sm",
				md: "h-11 px-5 text-sm",
				lg: "h-12 px-7 text-base",
			},
		},
		defaultVariants: { variant: "primary", size: "md" },
	},
);

type ButtonProps = VariantProps<typeof buttonVariants> & {
	children: ReactNode;
	className?: string;
	href?: string;
	target?: string;
	rel?: string;
	type?: "button" | "submit";
	onClick?: () => void;
	"aria-label"?: string;
};

export function Button({
	variant,
	size,
	className,
	children,
	href,
	target,
	rel,
	type = "button",
	onClick,
	"aria-label": ariaLabel,
}: ButtonProps) {
	const classes = cn(buttonVariants({ variant, size }), className);

	if (href) {
		return (
			<a
				href={href}
				target={target}
				rel={rel}
				onClick={onClick}
				aria-label={ariaLabel}
				className={classes}
			>
				{children}
			</a>
		);
	}

	return (
		<button
			type={type}
			onClick={onClick}
			aria-label={ariaLabel}
			className={classes}
		>
			{children}
		</button>
	);
}
