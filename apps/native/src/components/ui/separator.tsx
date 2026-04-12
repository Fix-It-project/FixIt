import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { View, type ViewProps } from "react-native";
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

type SeparatorProps = ViewProps &
	VariantProps<typeof separatorVariants> & {
		/** Accessibility: when true the separator is purely visual */
		decorative?: boolean;
	};

const Separator = React.forwardRef<View, SeparatorProps>(
	(
		{
			className,
			variant,
			orientation = "horizontal",
			decorative = true,
			...props
		},
		ref
	) => {
		return (
			<View
				ref={ref}
				accessible={!decorative}
				accessibilityLabel={decorative ? undefined : "separator"}
				className={cn(separatorVariants({ variant, orientation }), className)}
				{...props}
			/>
		);
	}
);
Separator.displayName = "Separator";

export { Separator, separatorVariants };
export type { SeparatorProps };
