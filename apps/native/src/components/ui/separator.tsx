import * as SeparatorPrimitive from "@rn-primitives/separator";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/src/lib/utils";

const separatorVariants = cva("shrink-0", {
	variants: {
		variant: {
			default: "bg-edge",
			brand: "bg-app-primary/20",
			muted: "bg-surface-elevated",
		},
		orientation: {
			horizontal: "h-px w-full",
			vertical: "h-full w-px",
		},
	},
	defaultVariants: {
		variant: "default",
		orientation: "horizontal",
	},
});

type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root> &
	VariantProps<typeof separatorVariants>;

function Separator({
	className,
	variant = "default",
	orientation = "horizontal",
	decorative = true,
	...props
}: SeparatorProps) {
	return (
		<SeparatorPrimitive.Root
			decorative={decorative}
			orientation={orientation}
			className={cn(separatorVariants({ variant, orientation }), className)}
			{...props}
		/>
	);
}

export type { SeparatorProps };
export { Separator, separatorVariants };
