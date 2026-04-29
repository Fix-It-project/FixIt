import { router } from "expo-router";
import { ScrollView, useWindowDimensions, View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TechRoleIllustration from "@/src/assets/onboarding/techrole1.svg";
import UserRoleIllustration from "@/src/assets/onboarding/userrole.svg";
import { Text } from "@/src/components/ui/text";
import { RoleCard } from "@/src/features/onboarding/components/RoleCard";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";
import { space } from "@/src/lib/theme";

export default function RoleSelectionScreen() {
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
	const titleSize = isNarrow ? 32 : isWide ? 38 : 36;
	const titleLineHeight = titleSize + 6;
	const topPadding =
		insets.top + (isShort ? space[6] : isWide ? space[12] : space[10]);
	const cardMinHeight = horizontalCards
		? isShort
			? 220
			: isWide
				? 260
				: 236
		: undefined;
	const illustrationPanelWidth = isNarrow ? 118 : isWide ? 156 : 142;
	const userIllustrationSize = isNarrow ? 124 : isWide ? 164 : 148;
	const techIllustrationSize = isNarrow ? 134 : isWide ? 174 : 158;
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
							Choose your role
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
							How will you use FixIt?
						</Text>
					</Animated.View>

					<Animated.View
						entering={fadeDown(140)}
						style={{ marginTop: space[3] }}
					>
						<Text variant="body" className="text-content-secondary">
							We match the right help to the right hands. Pick the path that
							fits your needs.
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
						title={<>Homeowner</>}
						description="Request repairs and home care from experienced technicians."
						features={[
							"Post repair requests",
							"Track job progress",
							"Experienced pros",
						]}
						illustration={
							<UserRoleIllustration
								width={userIllustrationSize}
								height={userIllustrationSize}
							/>
						}
						onPress={goToUserSignup}
						enterIndex={0}
						horizontal={horizontalCards}
						illustrationPanelWidth={illustrationPanelWidth}
						cardMinHeight={cardMinHeight}
						contentPadding={cardContentPadding}
						svgSide="left"
					/>
					<RoleCard
						variant="tech"
						title={<>Technician</>}
						description="Offer services and get matched with local jobs."
						features={[
							"Accept local jobs",
							"Set your schedule",
							"Grow your business",
						]}
						illustration={
							<TechRoleIllustration
								width={techIllustrationSize}
								height={techIllustrationSize}
							/>
						}
						onPress={goToTechSignup}
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
