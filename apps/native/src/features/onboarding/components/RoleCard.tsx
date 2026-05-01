import { Check } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { Colors, elevation, shadowStyle, space } from "@/src/lib/theme";
import { cn } from "@/src/lib/utils";
import { PressableScale } from "./PressableScale";

export type RoleVariant = "user" | "tech";

interface RoleCardProps {
	variant: RoleVariant;
	eyebrow?: string;
	title: React.ReactNode;
	description: string;
	features: string[];
	illustration: React.ReactNode;
	onPress: () => void;
	enterIndex: number;
	horizontal?: boolean;
	svgSide?: "left" | "right";
	illustrationPanelWidth?: number;
	cardMinHeight?: number;
	contentPadding?: number;
}

export function RoleCard({
	variant,
	eyebrow,
	title,
	description,
	features,
	illustration,
	onPress,
	enterIndex,
	horizontal = false,
	svgSide = "left",
	illustrationPanelWidth = 142,
	cardMinHeight,
	contentPadding,
}: RoleCardProps) {
	const reducedMotion = useReducedMotion();
	const isUser = variant === "user";
	const direction = horizontal && svgSide === "right" ? 1 : -1;
	const enterDelay = 120 + enterIndex * 180;
	const enterOpacity = useSharedValue(reducedMotion ? 1 : 0);
	const enterTranslateX = useSharedValue(reducedMotion ? 0 : direction * 28);

	const containerClass = "overflow-hidden rounded-hero border border-edge";

	const titleClass = cn("font-google-sans-bold leading-tight", "text-content");
	const descriptionClass = "text-content-secondary";
	const featureTextClass = "text-content-secondary";
	const checkColor = Colors.primary;

	const shadow = React.useMemo(
		() =>
			isUser
				? shadowStyle(elevation.raised, {
						shadowColor: Colors.shadow,
						opacity: 0.08,
					})
				: shadowStyle(elevation.raised, {
						shadowColor: Colors.primary,
						opacity: 0.1,
					}),
		[isUser],
	);

	React.useEffect(() => {
		if (reducedMotion) {
			enterOpacity.value = 1;
			enterTranslateX.value = 0;
			return;
		}

		enterOpacity.value = 0;
		enterTranslateX.value = direction * 28;
		enterOpacity.value = withDelay(
			enterDelay,
			withTiming(1, {
				duration: 220,
				easing: Easing.out(Easing.cubic),
			}),
		);
		enterTranslateX.value = withDelay(
			enterDelay,
			withTiming(0, {
				duration: 260,
				easing: Easing.out(Easing.cubic),
			}),
		);
	}, [direction, enterDelay, enterOpacity, enterTranslateX, reducedMotion]);

	const entryStyle = useAnimatedStyle(() => ({
		opacity: enterOpacity.value,
		transform: [{ translateX: enterTranslateX.value }],
	}));

	const illustrationPanel = (
		<View
			style={
				horizontal
					? {
							width: illustrationPanelWidth,
							alignItems: "center",
							justifyContent: "center",
							overflow: "hidden",
						}
					: { height: 200, alignItems: "center", justifyContent: "center" }
			}
		>
			{illustration}
		</View>
	);

	const contentPanel = (
		<View
			style={{
				flex: 1,
				paddingHorizontal: contentPadding ?? (horizontal ? space[4] : space[3]),
				paddingTop: contentPadding ?? (horizontal ? space[4] : space[3]),
				paddingBottom: contentPadding ?? (horizontal ? space[4] : space[4]),
				gap: horizontal ? space[3] : space[2],
				justifyContent: horizontal ? "center" : undefined,
			}}
		>
			{eyebrow ? (
				<Text
					variant="caption"
					className={cn(
						"font-google-sans-bold uppercase",
						isUser ? "text-app-primary" : "text-overlay-bright",
					)}
				>
					{eyebrow}
				</Text>
			) : null}

			<View style={{ gap: space[1] }}>
				<Text variant="h3" className={titleClass}>
					{title}
				</Text>
				<Text variant="bodySm" className={descriptionClass}>
					{description}
				</Text>
			</View>

			<View className="bg-edge" style={{ height: 1, width: "100%" }} />

			<View style={{ gap: space[2], marginTop: space[1] }}>
				{features.slice(0, 3).map((feature) => (
					<View
						key={feature}
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: space[2],
							minWidth: 0,
						}}
					>
						<View
							className="items-center justify-center rounded-full bg-app-primary/10"
							style={{ width: 24, height: 24 }}
						>
							<Check size={14} color={checkColor} strokeWidth={2.5} />
						</View>
						<Text
							variant="bodySm"
							className={featureTextClass}
							style={{ flex: 1, flexShrink: 1, minWidth: 0 }}
						>
							{feature}
						</Text>
					</View>
				))}
			</View>
		</View>
	);

	return (
		<Animated.View style={[entryStyle, { flex: horizontal ? undefined : 1 }]}>
			<PressableScale
				onPress={onPress}
				accessibilityRole="button"
				style={{ flex: horizontal ? undefined : 1 }}
			>
				<View
					className={containerClass}
					style={[
						shadow,
						{
							backgroundColor: isUser
								? Colors.surfaceBase
								: Colors.primaryLight,
							flex: horizontal ? undefined : 1,
							flexDirection: horizontal ? "row" : "column",
							minHeight: horizontal ? (cardMinHeight ?? 236) : undefined,
						},
					]}
				>
					{horizontal && svgSide === "right" ? (
						<>
							{contentPanel}
							{illustrationPanel}
						</>
					) : (
						<>
							{illustrationPanel}
							{contentPanel}
						</>
					)}
				</View>
			</PressableScale>
		</Animated.View>
	);
}
