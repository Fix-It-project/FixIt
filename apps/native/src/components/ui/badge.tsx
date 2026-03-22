import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/src/lib/utils";
import { TextClassContext } from "@/src/components/ui/text";

const badgeVariants = cva(
	"flex-row items-center justify-center rounded-full",
	{
		variants: {
			variant: {
				default: "bg-brand",
				secondary: "bg-surface-gray",
				success: "bg-available-bg",
				destructive: "bg-danger-light",
				outline: "border border-edge bg-transparent",
			},
			size: {
				sm: "px-2 py-0.5",
				default: "px-2.5 py-1",
				lg: "px-3 py-1.5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

const badgeTextVariants = cva("font-semibold", {
	variants: {
		variant: {
			default: "text-white",
			secondary: "text-content",
			success: "text-success",
			destructive: "text-danger",
			outline: "text-content",
		},
		size: {
			sm: "text-[10px]",
			default: "text-[11px]",
			lg: "text-[12px]",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

type BadgeProps = ViewProps &
	VariantProps<typeof badgeVariants> & {
		className?: string;
		textClass?: string;
	};

const Badge = React.forwardRef<View, BadgeProps>(
	({ className, textClass, variant, size, ...props }, ref) => {
		return (
			<TextClassContext.Provider
				value={cn(badgeTextVariants({ variant, size }), textClass)}
			>
				<View
					ref={ref}
					className={cn(badgeVariants({ variant, size }), className)}
					{...props}
				/>
			</TextClassContext.Provider>
		);
	}
);
Badge.displayName = "Badge";

export { Badge, badgeVariants, badgeTextVariants };
export type { BadgeProps };
