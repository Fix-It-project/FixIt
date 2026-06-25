import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, useWindowDimensions, View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TechRoleIllustration from "@/src/assets/onboarding/techrole1.svg";
import UserRoleIllustration from "@/src/assets/onboarding/userrole.svg";
import { Text } from "@/src/components/ui/text";
import { space } from "@/src/constants/design-tokens";
import { RoleCard } from "@/src/features/onboarding/components/RoleCard";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";

/**
 * Pick a responsive value: `whenPrimary` if the primary breakpoint matches,
 * else `whenSecondary` if the secondary one does, else `fallback`. Keeps the
 * screen body free of nested responsive ternaries.
 */
function responsiveValue<T>(
	primary: boolean,
	secondary: boolean,
	whenPrimary: T,
	whenSecondary: T,
	fallback: T,
): T {
	if (primary) return whenPrimary;
	if (secondary) return whenSecondary;
	return fallback;
}

export default function RoleSelectionScreen() {
	const { t } = useTranslation("auth");
	const insets = useSafeAreaInsets();
	const reducedMotion = useReducedMotion();
	const { height, width } = useWindowDimensions();

	const isNarrow = width < 380;
	const isVeryNarrow = width < 340;
	const isWide = width >= 430;
	const isShort = height < 720;
	const horizontalCards = !isVeryNarrow;

	const screenPaddingX = isNarrow ? space[4] : space[5];
	const contentMaxWidth = Math.min(480, width - screenPaddingX * 2);
	const titleSize = responsiveValue(isNarrow, isWide, 32, 38, 36);
	const titleLineHeight = titleSize + 6;
	const topPadding =
		insets.top +
		responsiveValue(isShort, isWide, space[6], space[12], space[10]);
	const cardMinHeight = horizontalCards
		? responsiveValue(isShort, isWide, 220, 260, 236)
		: undefined;
	const illustrationPanelWidth = responsiveValue(isNarrow, isWide, 118, 156, 142);
	const userIllustrationSize = responsiveValue(isNarrow, isWide, 124, 164, 148);
	const techIllustrationSize = responsiveValue(isNarrow, isWide, 134, 174, 158);
	const cardContentPadding = isNarrow ? space[3] : space[4];

	const goToUserSignup = useDebounce(() => router.push(ROUTES.auth.signup));
	const goToTechSignup = useDebounce(() => router.push(ROUTES.auth.techSignup));

	const fadeDown = (delay: number) =>
		reducedMotion ? undefined : FadeInDown.delay(delay).duration(400);

	return (
		<View className="flex-1 bg-surface">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					paddingTop: topPadding,
					paddingBottom: insets.bottom + (isShort ? space[6] : space[8]),
					paddingHorizontal: screenPaddingX,
					flexGrow: 1,
					justifyContent: "flex-start",
				}}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View
					style={{
						marginBottom: space[8],
						alignSelf: "center",
						width: "100%",
						maxWidth: contentMaxWidth,
					}}
				>
					<Animated.View entering={fadeDown(0)}>
						<Text
							variant="h1"
							className="font-google-sans-bold text-content"
							style={{ fontSize: titleSize, lineHeight: titleLineHeight }}
						>
							{t("roleSelection.title")}
						</Text>
					</Animated.View>

					<Animated.View
						entering={fadeDown(60)}
						className="bg-app-primary"
						style={{
							width: 52,
							height: 5,
							borderRadius: 999,
							marginTop: space[4],
						}}
					/>

					<Animated.View
						entering={fadeDown(80)}
						style={{ marginTop: space[5] }}
					>
						<Text
							variant="h3"
							className="font-google-sans-bold text-app-primary"
						>
							{t("roleSelection.heading")}
						</Text>
					</Animated.View>

					<Animated.View
						entering={fadeDown(140)}
						style={{ marginTop: space[3] }}
					>
						<Text variant="body" className="text-content-secondary">
							{t("roleSelection.subtitle")}
						</Text>
					</Animated.View>
				</View>

				{/* Cards */}
				<View
					style={{
						alignSelf: "center",
						width: "100%",
						maxWidth: contentMaxWidth,
						gap: isShort ? space[4] : space[5],
					}}
				>
					<RoleCard
						variant="user"
						title={t("roleSelection.user.title")}
						description={t("roleSelection.user.description")}
						features={[
							t("roleSelection.user.feature1"),
							t("roleSelection.user.feature2"),
							t("roleSelection.user.feature3"),
						]}
						illustration={
							<UserRoleIllustration
								width={userIllustrationSize}
								height={userIllustrationSize}
							/>
						}
						onPress={goToUserSignup}
						testID="role-user"
						enterIndex={0}
						horizontal={horizontalCards}
						illustrationPanelWidth={illustrationPanelWidth}
						cardMinHeight={cardMinHeight}
						contentPadding={cardContentPadding}
						svgSide="left"
					/>
					<RoleCard
						variant="tech"
						title={t("roleSelection.tech.title")}
						description={t("roleSelection.tech.description")}
						features={[
							t("roleSelection.tech.feature1"),
							t("roleSelection.tech.feature2"),
							t("roleSelection.tech.feature3"),
						]}
						illustration={
							<TechRoleIllustration
								width={techIllustrationSize}
								height={techIllustrationSize}
							/>
						}
						onPress={goToTechSignup}
						testID="role-technician"
						enterIndex={1}
						horizontal={horizontalCards}
						illustrationPanelWidth={illustrationPanelWidth}
						cardMinHeight={cardMinHeight}
						contentPadding={cardContentPadding}
						svgSide="right"
					/>
				</View>
			</ScrollView>
		</View>
	);
}
