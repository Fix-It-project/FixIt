import * as React from "react";
import {
	Pressable,
	type PressableProps,
	View,
	type ViewProps,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { EASE_OUT_QUART } from "@/src/constants/animation";

const ACCORDION_DURATION_MS = 180;

interface AccordionContextValue {
	expanded: boolean;
	setExpanded: (expanded: boolean) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(
	null,
);

type AccordionProps = ViewProps & {
	expanded?: boolean;
	defaultExpanded?: boolean;
	onExpandedChange?: (expanded: boolean) => void;
};

function useAccordionContext() {
	const context = React.useContext(AccordionContext);
	if (!context) {
		throw new Error("Accordion components must be rendered inside Accordion.");
	}
	return context;
}

function Accordion({
	expanded,
	defaultExpanded = false,
	onExpandedChange,
	children,
	...props
}: AccordionProps) {
	const [internalExpanded, setInternalExpanded] =
		React.useState(defaultExpanded);
	const isExpanded = expanded ?? internalExpanded;

	const setExpanded = React.useCallback(
		(nextExpanded: boolean) => {
			if (expanded === undefined) {
				setInternalExpanded(nextExpanded);
			}
			onExpandedChange?.(nextExpanded);
		},
		[expanded, onExpandedChange],
	);

	const value = React.useMemo(
		() => ({ expanded: isExpanded, setExpanded }),
		[isExpanded, setExpanded],
	);

	return (
		<AccordionContext.Provider value={value}>
			<View {...props}>{children}</View>
		</AccordionContext.Provider>
	);
}

function AccordionTrigger({ onPress, ...props }: Readonly<PressableProps>) {
	const { expanded, setExpanded } = useAccordionContext();

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ expanded }}
			onPress={(event) => {
				onPress?.(event);
				setExpanded(!expanded);
			}}
			{...props}
		/>
	);
}

function AccordionContent({
	children,
	style,
	...props
}: Readonly<ViewProps>) {
	const { expanded } = useAccordionContext();
	const reducedMotion = useReducedMotion();
	const [contentHeight, setContentHeight] = React.useState(0);
	const height = useSharedValue(0);
	const opacity = useSharedValue(0);

	React.useEffect(() => {
		height.value = withTiming(expanded ? contentHeight : 0, {
			duration: reducedMotion ? 0 : ACCORDION_DURATION_MS,
			easing: EASE_OUT_QUART,
		});
		opacity.value = withTiming(expanded ? 1 : 0, {
			duration: reducedMotion ? 0 : ACCORDION_DURATION_MS,
			easing: EASE_OUT_QUART,
		});
	}, [contentHeight, expanded, height, opacity, reducedMotion]);

	const animatedStyle = useAnimatedStyle(() => ({
		height: height.value,
		opacity: opacity.value,
	}));

	return (
		<View
			style={{ position: "relative" }}
			pointerEvents={expanded ? "auto" : "none"}
		>
			<View
				pointerEvents="none"
				accessibilityElementsHidden
				importantForAccessibility="no-hide-descendants"
				collapsable={false}
				style={[
					{
						position: "absolute",
						left: 0,
						right: 0,
						opacity: 0,
						zIndex: -1,
					},
					style,
				]}
				onLayout={(event) => {
					setContentHeight(event.nativeEvent.layout.height);
				}}
			>
				{children}
			</View>

			<Animated.View style={[{ overflow: "hidden" }, animatedStyle]} {...props}>
				<View style={style}>{children}</View>
			</Animated.View>
		</View>
	);
}

export { Accordion, AccordionContent, AccordionTrigger };
