import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, type PressableProps } from "react-native";
import { TextClassContext } from "@/src/components/ui/text";
import { cn } from "@/src/lib/utils";

const buttonVariants = cva("group flex-row items-center justify-center", {
	variants: {
		variant: {
			default: "bg-app-primary active:opacity-90",
			destructive: "bg-destructive active:opacity-90",
			outline: "border border-input bg-background active:bg-accent",
			secondary: "border border-edge bg-surface-elevated active:opacity-80",
			ghost: "active:bg-accent",
			link: "",
		},
		size: {
			default: "h-btn-lg rounded-pill px-button-x",
			sm: "h-btn-sm rounded-pill px-button-sm-x",
			lg: "h-btn-xl rounded-pill px-button-lg-x",
			action: "gap-control-action rounded-card py-control-action-y",
			cta: "gap-control-cta rounded-button py-control-cta-y",
			icon: "h-control-back-md w-control-back-md",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

const buttonTextVariants = cva("font-google-sans-bold text-base", {
	variants: {
		variant: {
			default: "text-surface-on-primary",
			destructive: "text-destructive-foreground",
			outline: "text-foreground",
			secondary: "text-secondary-foreground",
			ghost: "text-foreground",
			link: "text-app-primary underline",
		},
		size: {
			default: "",
			sm: "text-sm",
			lg: "text-lg",
			action: "text-base",
			cta: "text-sm",
			icon: "",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

type ButtonProps = PressableProps &
	VariantProps<typeof buttonVariants> & {
		className?: string;
		textClass?: string;
	};

const Button = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	ButtonProps
>(({ className, textClass, variant, size, disabled, ...props }, ref) => {
	return (
		<TextClassContext.Provider
			value={cn(
				buttonTextVariants({ variant, size }),
				disabled && "opacity-70",
				textClass,
			)}
		>
			<Pressable
				className={cn(
					buttonVariants({ variant, size }),
					disabled && "opacity-50",
					className,
				)}
				ref={ref}
				disabled={disabled}
				{...props}
			/>
		</TextClassContext.Provider>
	);
});
Button.displayName = "Button";

export type { ButtonProps };
export { Button, buttonTextVariants, buttonVariants };
