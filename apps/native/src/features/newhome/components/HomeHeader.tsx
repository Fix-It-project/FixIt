import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
	ChevronDown,
	Languages,
	MapPin,
	Plus,
	Search,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	I18nManager,
	TextInput,
	useWindowDimensions,
	View,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import {
	Accordion,
	AccordionContent,
	AccordionTrigger,
} from "@/src/components/ui/accordion";
import NotificationBell from "@/src/components/ui/notification-bell";
import { Text } from "@/src/components/ui/text";
import { EASE_OUT_QUART } from "@/src/constants/animation";
import {
	arabicFontFamily,
	typography,
	useThemeColors,
} from "@/src/constants/design-tokens";
import type { Language } from "@/src/constants/i18n";
import { ROUTES } from "@/src/lib/navigation/routes";
import { useLanguageStore } from "@/src/stores/language-store";

const fixitTextLogo = require("@/src/assets/images/fixittext.png");
const CHEVRON_ROTATE_MS = 160;

interface HomeHeaderProps {
	readonly address?: string;
	readonly addressExpanded: boolean;
	readonly onAddressExpandedChange: (expanded: boolean) => void;
	readonly onChangeAddressPress: () => void;
	readonly onAddAddressPress: () => void;
}

export function HomeHeader({
	address,
	addressExpanded,
	onAddressExpandedChange,
	onChangeAddressPress,
	onAddAddressPress,
}: HomeHeaderProps) {
	const t = useThemeColors();
	const { t: tr } = useTranslation("home");
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const language = useLanguageStore((state) => state.language);
	const setLanguage = useLanguageStore((state) => state.setLanguage);
	const [query, setQuery] = useState("");
	const reducedMotion = useReducedMotion();
	const isRTL = I18nManager.isRTL;
	const rowDirection = isRTL ? "row-reverse" : "row";
	const textAlign = isRTL ? "right" : "left";
	const currentAddress = address ?? tr("selectAddress");
	const nextLanguage: Language = language === "ar" ? "en" : "ar";
	const isAddressOpen = addressExpanded;
	const addressPreviewWidth = Math.min(Math.max(width * 0.36, 104), 172);
	const chevronRotation = useSharedValue(isAddressOpen ? 180 : 0);

	useEffect(() => {
		chevronRotation.value = withTiming(isAddressOpen ? 180 : 0, {
			duration: reducedMotion ? 0 : CHEVRON_ROTATE_MS,
			easing: EASE_OUT_QUART,
		});
	}, [chevronRotation, isAddressOpen, reducedMotion]);

	const chevronAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${chevronRotation.value}deg` }],
	}));

	function handleSubmit() {
		const trimmed = query.trim();
		if (trimmed.length > 0) {
			router.push({
				pathname: ROUTES.user.recommend,
				params: { q: trimmed },
			});
		}
	}

	function handleChangeAddress() {
		onChangeAddressPress();
	}

	function handleAddAddress() {
		onAddAddressPress();
	}

	return (
		<View
			style={{
				backgroundColor: t.tint.heroStart,
				paddingTop: insets.top + 2,
			}}
		>
			<View
				style={{
					flexDirection: rowDirection,
					alignItems: "center",
					justifyContent: "space-between",
					paddingHorizontal: 20,
					paddingTop: 4,
				}}
			>
				<Image
					source={fixitTextLogo}
					style={{
						width: 138,
						height: 38,
						marginLeft: isRTL ? 0 : -28,
						marginRight: isRTL ? -28 : 0,
					}}
					contentFit="cover"
					accessibilityLabel="FixIt"
				/>

				<View
					style={{
						flexDirection: rowDirection,
						alignItems: "center",
						gap: 8,
					}}
				>
					<PressableScale
						pressedScale={0.94}
						onPress={() => {
							void setLanguage(nextLanguage);
						}}
						style={{
							minWidth: 48,
							height: 40,
							borderRadius: 10,
							backgroundColor: t.overlayMd,
							alignItems: "center",
							justifyContent: "center",
							flexDirection: rowDirection,
							gap: 5,
						}}
						accessibilityLabel={tr("language.switchTo", {
							language: nextLanguage.toUpperCase(),
						})}
					>
						<Languages size={16} color={t.tint.onHero} strokeWidth={2} />
						<Text variant="caption" style={{ color: t.tint.onHero }}>
							{nextLanguage.toUpperCase()}
						</Text>
					</PressableScale>
					<NotificationBell />
				</View>
			</View>

			<View
				style={{
					marginHorizontal: 20,
					marginTop: 8,
					backgroundColor: t.surfaceElevated,
					borderRadius: 14,
					borderWidth: 1,
					borderColor: t.borderDefault,
					height: 44,
					flexDirection: rowDirection,
					alignItems: "center",
					paddingHorizontal: 12,
					gap: 9,
					elevation: 3,
					shadowOffset: { width: 0, height: 5 },
					shadowColor: t.shadow,
					shadowOpacity: 0.1,
					shadowRadius: 7,
				}}
			>
				<Search size={18} color={t.primary} />
				<TextInput
					placeholder={tr("searchPlaceholder")}
					returnKeyType="search"
					value={query}
					onChangeText={setQuery}
					onSubmitEditing={handleSubmit}
					placeholderTextColor={t.textMuted}
					selectionColor={t.primary}
					underlineColorAndroid="transparent"
					style={{
						...typography.input,
						flex: 1,
						height: 44,
						color: t.textPrimary,
						fontFamily: isRTL
							? arabicFontFamily.regular
							: typography.input.fontFamily,
						paddingHorizontal: 0,
						textAlign,
						writingDirection: isRTL ? "rtl" : "ltr",
					}}
				/>
			</View>

			<Accordion
				expanded={isAddressOpen}
				onExpandedChange={onAddressExpandedChange}
			>
				<AccordionTrigger
					style={{
						marginTop: 8,
						paddingHorizontal: 20,
						paddingVertical: 9,
						flexDirection: rowDirection,
						alignItems: "center",
						justifyContent: "space-between",
						gap: 12,
					}}
				>
					<View
						style={{
							flexDirection: rowDirection,
							alignItems: "center",
							gap: 7,
							flexShrink: 0,
						}}
					>
						<MapPin size={16} color={t.tint.onHero} strokeWidth={2} />
						<Text variant="caption" style={{ color: t.tint.onHero }}>
							{tr("serviceTo")}
						</Text>
					</View>

					<View
						style={{
							flex: 1,
							minWidth: 0,
							flexDirection: rowDirection,
							alignItems: "center",
							justifyContent: isRTL ? "flex-start" : "flex-end",
							gap: 5,
							maxWidth: addressPreviewWidth + 24,
						}}
					>
						<Text
							variant="bodySm"
							style={{
								color: t.tint.onHero,
								fontWeight: "600",
								textAlign,
								flexShrink: 1,
								maxWidth: addressPreviewWidth,
							}}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{currentAddress}
						</Text>
						<Animated.View style={chevronAnimatedStyle}>
							<ChevronDown size={16} color={t.tint.onHero} strokeWidth={2} />
						</Animated.View>
					</View>
				</AccordionTrigger>

				<AccordionContent>
					<View
						style={{
							paddingHorizontal: 20,
							paddingTop: 4,
							paddingBottom: 14,
							gap: 10,
						}}
					>
						<View
							style={{
								borderRadius: 12,
								backgroundColor: t.overlaySm,
								padding: 12,
								gap: 3,
							}}
						>
							<Text
								variant="caption"
								style={{ color: t.tint.onHero, opacity: 0.75, textAlign }}
							>
								{tr("address.current")}
							</Text>
							<Text
								variant="label"
								style={{ color: t.tint.onHero, textAlign }}
								numberOfLines={2}
								ellipsizeMode="tail"
							>
								{currentAddress}
							</Text>
						</View>

						<View style={{ flexDirection: rowDirection, gap: 8 }}>
							<PressableScale
								pressedScale={0.96}
								onPress={handleChangeAddress}
								style={{
									flex: 1,
									borderRadius: 10,
									backgroundColor: t.tint.onHero,
									paddingVertical: 10,
									alignItems: "center",
								}}
							>
								<Text variant="buttonMd" style={{ color: t.primary }}>
									{tr("address.change")}
								</Text>
							</PressableScale>

							<PressableScale
								pressedScale={0.96}
								onPress={handleAddAddress}
								style={{
									flex: 1,
									borderRadius: 10,
									backgroundColor: t.overlayMd,
									paddingVertical: 10,
									alignItems: "center",
									justifyContent: "center",
									flexDirection: rowDirection,
									gap: 6,
								}}
							>
								<Plus size={15} color={t.tint.onHero} strokeWidth={2.2} />
								<Text variant="buttonMd" style={{ color: t.tint.onHero }}>
									{tr("address.add")}
								</Text>
							</PressableScale>
						</View>
					</View>
				</AccordionContent>
			</Accordion>
		</View>
	);
}
