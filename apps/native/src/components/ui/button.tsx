import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, type PressableProps } from "react-native";
import { cn } from "@/src/lib/utils";
import { TextClassContext } from "@/src/components/ui/text";
const buttonVariants = cva(
	"group flex items-center justify-center rounded-full",
	{
		variants: {
			variant: {
				default: "bg-app-primary active:opacity-90",
				destructive: "bg-destructive active:opacity-90",
				outline:
					"border border-input bg-background active:bg-accent",
				secondary: "bg-secondary active:opacity-80",
				ghost: "active:bg-accent",
				link: "",
			},
			size: {
				default: "h-14 px-6",
				sm: "h-9 px-3",
				lg: "h-16 px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

const buttonTextVariants = cva("font-bold text-[16px]", {
	variants: {
		variant: {
			default: "text-white",
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
>(
	(
		{ className, textClass, variant, size, disabled, ...props },
		ref
	) => {
		return (
			<TextClassContext.Provider
				value={cn(
					buttonTextVariants({ variant, size }),
					disabled && "opacity-70",
					textClass
				)}
			>
				<Pressable
					className={cn(
						buttonVariants({ variant, size }),
						disabled && "opacity-50",
						className
					)}
					ref={ref}
					disabled={disabled}
					{...props}
				/>
			</TextClassContext.Provider>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants, buttonTextVariants };
export type { ButtonProps };
