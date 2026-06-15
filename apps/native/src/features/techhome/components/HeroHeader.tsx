import { Languages } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/src/components/ui/avatar";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import type { Language } from "@/src/constants/i18n";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { confirm } from "@/src/stores/dialog-store";
import { useLanguageStore } from "@/src/stores/language-store";
import { useTechSelfQuery } from "../hooks/useTechSelfQuery";
import { OnlineSwitch } from "./OnlineSwitch";

interface HeroHeaderProps {
	/** Extra bottom padding so the earnings card can overlap the hero. */
	overlapPadding: number;
	topInset: number;
}

/** Language toggle — flips the global app language (no techhome translation yet). */
function LanguageToggle() {
	const colors = useThemeColors();
	const { t: ts } = useTranslation("settings");
	const language = useLanguageStore((state) => state.language);
	const setLanguage = useLanguageStore((state) => state.setLanguage);
	const nextLanguage: Language = language === "ar" ? "en" : "ar";

	// Switching language flips text direction (LTR<->RTL) and reloads the app.
	const handlePress = async () => {
		const confirmed = await confirm({
			title: ts("language.restartTitle"),
			description: ts("language.restartMessage"),
			primary: { label: ts("language.restartConfirm") },
			secondary: { label: ts("language.cancel") },
		});
		if (!confirmed) return;
		void setLanguage(nextLanguage);
	};

	return (
		<PressableScale
			pressedScale={0.94}
			onPress={() => void handlePress()}
			accessibilityRole="button"
			accessibilityLabel={`Switch to ${nextLanguage.toUpperCase()}`}
			className="h-9 flex-row items-center gap-1 rounded-xl bg-overlay-white px-2.5"
		>
			<Icon as={Languages} size={15} color={colors.tint.onHero} />
			<Text variant="caption" className="text-tint-on-hero">
				{nextLanguage.toUpperCase()}
			</Text>
		</PressableScale>
	);
}

export function HeroHeader({ overlapPadding, topInset }: HeroHeaderProps) {
	const colors = useThemeColors();
	const { data: profile } = useTechSelfQuery();

	const fullName = profile
		? `${profile.first_name} ${profile.last_name}`.trim()
		: "";
	const initials = getPfpInitialsFallback(fullName);
	const online = profile?.is_available ?? false;

	return (
		<View
			style={{
				backgroundColor: colors.tint.heroStart,
				paddingTop: topInset,
				paddingBottom: overlapPadding,
			}}
		>
			<View className="flex-row items-center justify-between px-screen-x pt-stack-sm">
				<View className="flex-1 flex-row items-center gap-stack-sm">
					<Avatar alt={fullName || "Technician"} className="h-11 w-11">
						{profile?.profile_image ? (
							<AvatarImage source={{ uri: profile.profile_image }} />
						) : null}
						<AvatarFallback className="bg-tint-surface-strong">
							<Text variant="body" className="font-bold text-tint-on-strong">
								{initials}
							</Text>
						</AvatarFallback>
					</Avatar>
					<View className="flex-1">
						<Text
							variant="body"
							className="font-bold text-tint-on-hero"
							numberOfLines={1}
						>
							{fullName || " "}
						</Text>
					</View>
				</View>

				<View className="flex-row items-center gap-stack-xs">
					<LanguageToggle />
					<OnlineSwitch online={online} />
				</View>
			</View>
		</View>
	);
}
