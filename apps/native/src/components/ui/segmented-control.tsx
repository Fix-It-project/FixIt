import { cva } from "class-variance-authority";
import * as React from "react";
import {
	Pressable,
	type PressableProps,
	View,
	type ViewProps,
} from "react-native";
import { cn } from "@/src/lib/utils";

const segmentedControlVariants = cva(
	"flex-row rounded-control-segmented p-control-segmented-shell",
	{
		variants: {
			tone: {
				surface: "",
				overlay: "",
			},
		},
		defaultVariants: {
			tone: "surface",
		},
	},
);

const segmentedControlItemVariants = cva(
	"flex-1 flex-row items-center justify-center gap-control-segmented rounded-control-segmented-item px-control-segmented-x",
	{
		variants: {
			size: {
				default: "h-control-segmented-item",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

type SegmentedControlProps = ViewProps & {
	className?: string;
	tone?: "surface" | "overlay";
};

function SegmentedControl({
	className,
	tone,
	...props
}: Readonly<SegmentedControlProps>) {
	return (
		<View
			className={cn(segmentedControlVariants({ tone }), className)}
			{...props}
		/>
	);
}

type SegmentedControlItemProps = PressableProps & {
	className?: string;
	size?: "default";
};

const SegmentedControlItem = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	SegmentedControlItemProps
>(({ className, size, ...props }, ref) => {
	return (
		<Pressable
			ref={ref}
			className={cn(segmentedControlItemVariants({ size }), className)}
			{...props}
		/>
	);
});

SegmentedControlItem.displayName = "SegmentedControlItem";

export {
	SegmentedControl,
	SegmentedControlItem,
	segmentedControlItemVariants,
	segmentedControlVariants,
};
