import { Languages } from "lucide-react-native";
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
import { useLanguageStore } from "@/src/stores/language-store";
import {
	useActiveJob,
	useNextFutureJob,
	useNextTodayJob,
	usePendingRequests,
} from "../hooks/useTechHomeOrdersQuery";
import { useTechSelfQuery } from "../hooks/useTechSelfQuery";
import { formatSlotTime, formatSlotWeekday } from "../utils/format-time";
import { greetingForHour } from "../utils/greeting";
import { OnlineSwitch } from "./OnlineSwitch";

interface HeroHeaderProps {
	/** Extra bottom padding so the earnings card can overlap the hero. */
	overlapPadding: number;
	topInset: number;
}

/** Language toggle — flips the global app language (no techhome translation yet). */
function LanguageToggle() {
	const colors = useThemeColors();
	const language = useLanguageStore((state) => state.language);
	const setLanguage = useLanguageStore((state) => state.setLanguage);
	const nextLanguage: Language = language === "ar" ? "en" : "ar";

	return (
		<PressableScale
			pressedScale={0.94}
			onPress={() => void setLanguage(nextLanguage)}
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

/** Quiet-day status line: surfaces the next upcoming job when nothing is live. */
function useQuietLine(): string | null {
	const activeJob = useActiveJob();
	const nextToday = useNextTodayJob();
	const { data: pending } = usePendingRequests();
	const nextFuture = useNextFutureJob();

	const isQuiet = !activeJob && !nextToday && pending.length === 0;
	if (!isQuiet) return null;

	if (nextFuture) {
		const day = formatSlotWeekday(nextFuture.scheduled_date);
		const time = formatSlotTime(nextFuture.scheduled_start_at);
		return time === "—" ? `Next job ${day}` : `Next job ${day} ${time}`;
	}
	return "No jobs today — you're all caught up";
}

export function HeroHeader({ overlapPadding, topInset }: HeroHeaderProps) {
	const colors = useThemeColors();
	const { data: profile } = useTechSelfQuery();
	const quietLine = useQuietLine();

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
							variant="caption"
							className="text-tint-on-hero opacity-70"
							numberOfLines={1}
						>
							{greetingForHour()}
						</Text>
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

			{quietLine ? (
				<View className="px-screen-x pt-stack-sm">
					<Text variant="caption" className="text-tint-on-hero opacity-80">
						{quietLine}
					</Text>
				</View>
			) : null}
		</View>
	);
}
