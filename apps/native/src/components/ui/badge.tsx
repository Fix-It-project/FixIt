import { Slot } from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Platform, View } from "react-native";
import { TextClassContext } from "@/src/components/ui/text";
import { cn } from "@/src/lib/utils";

const badgeVariants = cva(
	cn(
		"group shrink-0 flex-row items-center justify-center gap-1 overflow-hidden rounded-chip border border-edge px-control-badge-x py-control-badge-y",
		Platform.select({
			web: "w-fit whitespace-nowrap transition-[color,box-shadow] focus-visible:border-app-primary focus-visible:ring-[3px] focus-visible:ring-app-primary/30 aria-invalid:border-danger aria-invalid:ring-danger/20 [&>svg]:pointer-events-none [&>svg]:size-3",
		}),
	),
	{
		variants: {
			variant: {
				default: cn(
					"border-transparent bg-app-primary",
					Platform.select({ web: "[a&]:hover:bg-app-primary-dark" }),
				),
				secondary: cn(
					"border-transparent bg-surface-elevated",
					Platform.select({ web: "[a&]:hover:bg-surface-elevated" }),
				),
				destructive: cn(
					"border-transparent bg-danger",
					Platform.select({ web: "[a&]:hover:bg-danger" }),
				),
				outline: Platform.select({
					web: "[a&]:hover:bg-surface-elevated",
				}),
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

const badgeTextVariants = cva("font-medium text-xs", {
	variants: {
		variant: {
			default: "text-surface-on-primary",
			secondary: "text-content",
			destructive: "text-surface-on-primary",
			outline: "text-content",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

type BadgeProps = React.ComponentProps<typeof View> &
	React.RefAttributes<View> & {
		asChild?: boolean;
	} & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, asChild, ...props }: BadgeProps) {
	const Component = asChild ? Slot : View;
	return (
		<TextClassContext.Provider value={badgeTextVariants({ variant })}>
			<Component
				className={cn(badgeVariants({ variant }), className)}
				{...props}
			/>
		</TextClassContext.Provider>
	);
}

export type { BadgeProps };
export { Badge, badgeTextVariants, badgeVariants };
