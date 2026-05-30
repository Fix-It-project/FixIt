import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronDown, MapPin, Search } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Input } from "@/src/components/ui/input";
import NotificationBell from "@/src/components/ui/notification-bell";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { ROUTES } from "@/src/lib/navigation/routes";

const fixitLogo = require("@/src/assets/images/fixit.png");

interface HomeHeaderProps {
	readonly onAddressPress: () => void;
	readonly address?: string;
}

export function HomeHeader({ onAddressPress, address }: HomeHeaderProps) {
	const t = useThemeColors();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [query, setQuery] = useState("");

	function handleSubmit() {
		const trimmed = query.trim();
		if (trimmed.length > 0) {
			router.push({
				pathname: ROUTES.user.recommend,
				params: { q: trimmed },
			});
		}
	}

	return (
		<View
			style={{
				backgroundColor: t.tint.heroStart,
				paddingTop: insets.top + 6,
				paddingBottom: 14,
			}}
		>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					paddingHorizontal: 20,
					paddingTop: 4,
				}}
			>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
					<Image
						source={fixitLogo}
						style={{
							width: 30,
							height: 30,
							borderRadius: 9,
						}}
						contentFit="cover"
						accessibilityLabel="FixIt"
					/>
					<Text
						style={{
							fontSize: 18,
							fontWeight: "700",
							color: t.tint.onHero,
							lineHeight: 24,
						}}
					>
						FixIt
					</Text>
				</View>

				<NotificationBell />
			</View>

			<PressableScale
				pressedScale={0.98}
				onPress={onAddressPress}
				style={{
					flexDirection: "row",
					alignItems: "center",
					paddingHorizontal: 20,
					marginTop: 10,
					gap: 6,
				}}
			>
				<MapPin size={14} color={t.tint.onHero} style={{ opacity: 0.8 }} />
				<View style={{ flexDirection: "column" }}>
					<Text
						variant="caption"
						style={{
							color: t.tint.onHero,
							opacity: 0.7,
							textTransform: "uppercase",
							letterSpacing: 0.6,
							fontWeight: "600",
						}}
					>
						SERVICE TO
					</Text>
					<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
						<Text
							variant="bodySm"
							style={{ color: t.tint.onHero, fontWeight: "600" }}
							numberOfLines={1}
						>
							{address ?? "Select address"}
						</Text>
						<ChevronDown size={14} color={t.tint.onHero} />
					</View>
				</View>
			</PressableScale>

			<View
				style={{
					marginHorizontal: 20,
					marginTop: 12,
					backgroundColor: t.surfaceElevated,
					borderRadius: 14,
					borderWidth: 1,
					borderColor: t.borderDefault,
					height: 44,
					flexDirection: "row",
					alignItems: "center",
					paddingHorizontal: 12,
					elevation: 4,
					shadowOffset: { width: 0, height: 8 },
					shadowColor: t.shadow,
					shadowOpacity: 0.14,
					shadowRadius: 8,
				}}
			>
				<Search size={18} color={t.primary} style={{ marginRight: 8 }} />
				<Input
					variant="filled"
					placeholder="What do you want to do?"
					returnKeyType="search"
					value={query}
					onChangeText={setQuery}
					onSubmitEditing={handleSubmit}
					placeholderTextColor={t.textMuted}
					selectionColor={t.primary}
					underlineColorAndroid="transparent"
					style={{
						flex: 1,
						height: 44,
						backgroundColor: "transparent",
						borderWidth: 0,
						paddingHorizontal: 0,
						color: t.textPrimary,
					}}
					className="border-0 bg-transparent"
				/>
			</View>
		</View>
	);
}
