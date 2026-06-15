import { Image } from "expo-image";
import { MapPin } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { radius, useThemeColors } from "@/src/constants/design-tokens";
import { buildStaticMapUrl } from "../utils/static-map";

interface LocationSnapshotProps {
	latitude: number;
	longitude: number;
	height?: number;
	/** Tap to re-open the map picker and adjust the pin. */
	onPress?: () => void;
}

/**
 * Google Static Maps preview of a chosen point. Falls back to a coordinate
 * badge when the API key is missing or the image fails to load — never a
 * broken image.
 */
export function LocationSnapshot({
	latitude,
	longitude,
	height = 160,
	onPress,
}: LocationSnapshotProps) {
	const themeColors = useThemeColors();
	const [failed, setFailed] = useState(false);

	const url = buildStaticMapUrl({
		latitude,
		longitude,
		width: 640,
		height,
		zoom: 16,
	});

	if (!url || failed) {
		const content = (
			<View
				className="flex-row items-center rounded-input px-stack-md py-control-trigger-y"
				style={{ backgroundColor: themeColors.primaryLight }}
			>
				<MapPin size={16} color={themeColors.primary} strokeWidth={2} />
				<Text
					variant="bodySm"
					className="ml-stack-sm flex-1"
					numberOfLines={1}
					style={{ color: themeColors.primary }}
				>
					{`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
				</Text>
			</View>
		);
		return onPress ? (
			<Pressable onPress={onPress} accessibilityRole="button">
				{content}
			</Pressable>
		) : (
			content
		);
	}

	const image = (
		<View
			style={{
				height,
				borderRadius: radius.card,
				overflow: "hidden",
				backgroundColor: themeColors.surfaceElevated,
			}}
		>
			<Image
				source={{ uri: url }}
				style={{ width: "100%", height: "100%" }}
				contentFit="cover"
				transition={200}
				onError={() => setFailed(true)}
				accessibilityLabel="Selected location on map"
			/>
		</View>
	);

	return onPress ? (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel="Adjust location on map"
		>
			{image}
		</Pressable>
	) : (
		image
	);
}
