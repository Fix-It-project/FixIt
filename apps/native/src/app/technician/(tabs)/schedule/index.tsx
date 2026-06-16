import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useTechSelfProfileQuery } from "@/src/features/tech-self/hooks/useTechSelfProfileQuery";
import { ScheduleOnboarding } from "@/src/features/techschedule/components/ScheduleOnboarding";
import { SchedulePage } from "@/src/features/techschedule/components/SchedulePage";
import { useScheduleTemplatesQuery } from "@/src/features/techschedule/hooks/useScheduleTemplates";

function ScheduleLoadingState() {
	const themeColors = useThemeColors();
	return (
		<View className="flex-1 items-center justify-center bg-surface">
			<ScreenStatusBar variant="surface" />
			<ActivityIndicator color={themeColors.primary} />
		</View>
	);
}

function ScheduleErrorState({ onRetry }: { readonly onRetry: () => void }) {
	return (
		<View className="flex-1 items-center justify-center gap-stack-md bg-surface px-screen-x">
			<ScreenStatusBar variant="surface" />
			<Text variant="h3" className="text-center text-content">
				Couldn't load your schedule
			</Text>
			<Text variant="body" className="text-center text-content-secondary">
				Check your connection and try again.
			</Text>
			<Button size="lg" onPress={onRetry}>
				Try again
			</Button>
		</View>
	);
}

/**
 * Schedule tab: first-run technicians get the Lottie onboarding; everyone else
 * gets the normal schedule page. A `?date` deep link (e.g. Jobs → "View in
 * schedule") preselects that day.
 *
 * Onboarding is **dual-gated** so it can never re-strand an established
 * technician: it shows ONLY on a successful profile load with a null
 * `schedule_setup_completed_at` AND a successful templates load with zero saved
 * rows. The flag is the clean source of truth; the templates fallback makes the
 * gate reinstall-proof and independent of server-restart timing (saving any
 * schedule writes template rows for every day, so once setup runs there is
 * always ≥1 row — even with zero working days). A failed fetch shows retry,
 * never onboarding.
 */
export default function ScheduleRoute() {
	const params = useLocalSearchParams<{ date?: string }>();
	const profile = useTechSelfProfileQuery();
	const templates = useScheduleTemplatesQuery();

	if (profile.isPending) return <ScheduleLoadingState />;
	if (profile.isError) {
		return <ScheduleErrorState onRetry={() => profile.refetch()} />;
	}

	// Flag set → established technician. Decide immediately; never block on or be
	// re-onboarded by the secondary templates query.
	if (profile.data?.schedule_setup_completed_at) {
		return <SchedulePage initialDate={params.date} />;
	}

	if (templates.isPending) return <ScheduleLoadingState />;
	if (templates.isError) {
		// Flag is null here, so we can't safely decide — retry, never onboarding.
		return <ScheduleErrorState onRetry={() => templates.refetch()} />;
	}

	if ((templates.data?.length ?? 0) === 0) return <ScheduleOnboarding />;

	return <SchedulePage initialDate={params.date} />;
}
