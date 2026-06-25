import { ArrowRight, Sparkles, Star } from "lucide-react-native";
import { type ComponentRef, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	ActivityIndicator,
	Image,
	type LayoutChangeEvent,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardChatScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn, useSharedValue } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { translateCategoryLabel } from "@/src/features/categories/constants/categories";
import type { ServiceOrder } from "../../schemas/response.schema";
import { CHATBOT_ENABLED } from "../constants";
import type { ChatEntry, ChatFlow } from "../types";
import { getRecommendationCards } from "../utils";

type Props = {
	mode: ChatFlow;
	chatEntries: ChatEntry[];
	isLoading: boolean;
	error: string | null;
	activeFlow: ChatFlow | null;
	isOpeningTechnician: boolean;
	onOpenTechnician: (
		technician: { id: string | number; name: string },
		order: ServiceOrder,
		promptText: string,
	) => void;
};

// Subtle fade — message bubbles ease in without the bouncy spring.
const BUBBLE_IN = FadeIn.duration(160);
const USER_IMAGE_PREVIEW_STYLE = {
	width: 220,
	height: 160,
	borderRadius: 16,
} as const;

export default function ChatMessageList({
	mode,
	chatEntries,
	isLoading,
	error,
	activeFlow,
	isOpeningTechnician,
	onOpenTechnician,
}: Readonly<Props>) {
	const { t } = useTranslation("chat");
	const themeColors = useThemeColors();

	const surface = themeColors.surfaceBase;
	const surfaceText = themeColors.textPrimary;
	const mutedText = themeColors.textMuted;

	const isEmpty = chatEntries.length === 0 && !isLoading && !error;
	const modeLabel =
		mode === "recommend"
			? t("composer.modeRecommend")
			: t("composer.modeAgent");
	const scrollRef = useRef<ComponentRef<typeof KeyboardChatScrollView> | null>(
		null,
	);
	const blankSpace = useSharedValue(0);
	const [viewportHeight, setViewportHeight] = useState(0);
	const anchoredUserEntryId = useRef<string | null>(null);
	const contentHeightRef = useRef(0);
	const latestUserTopRef = useRef(0);
	const latestUserEntryId = chatEntries.findLast(
		(entry) => entry.type === "user",
	)?.id;

	const scrollToTurnEnd = useCallback((animated = true) => {
		requestAnimationFrame(() => {
			scrollRef.current?.scrollToEnd({ animated });
		});
	}, []);

	const handleLayout = useCallback((event: LayoutChangeEvent) => {
		const nextHeight = event.nativeEvent.layout.height;
		setViewportHeight((currentHeight) =>
			Math.abs(currentHeight - nextHeight) > 0.5 ? nextHeight : currentHeight,
		);
	}, []);

	const syncLatestTurnEnd = useCallback(
		(userEntryId: string, animated: boolean) => {
			if (!viewportHeight) return;

			const latestTurnHeight =
				contentHeightRef.current - latestUserTopRef.current;
			blankSpace.value = Math.max(0, viewportHeight - latestTurnHeight);
			anchoredUserEntryId.current = userEntryId;
			scrollToTurnEnd(animated);
		},
		[blankSpace, scrollToTurnEnd, viewportHeight],
	);

	const handleLatestUserLayout = useCallback(
		(event: LayoutChangeEvent, entryId: string) => {
			latestUserTopRef.current = event.nativeEvent.layout.y;
			syncLatestTurnEnd(entryId, true);
		},
		[syncLatestTurnEnd],
	);

	const handleContentSizeChange = useCallback(
		(_width: number, height: number) => {
			contentHeightRef.current = height;
			if (latestUserEntryId) {
				syncLatestTurnEnd(
					latestUserEntryId,
					latestUserEntryId !== anchoredUserEntryId.current,
				);
			}
		},
		[latestUserEntryId, syncLatestTurnEnd],
	);

	return (
		<View className="flex-1">
			<KeyboardChatScrollView
				ref={scrollRef}
				className="flex-1"
				blankSpace={blankSpace}
				contentContainerClassName="px-4 py-4"
				keyboardLiftBehavior="whenAtEnd"
				showsVerticalScrollIndicator={false}
				keyboardDismissMode="interactive"
				keyboardShouldPersistTaps="handled"
				onContentSizeChange={handleContentSizeChange}
				onLayout={handleLayout}
			>
				{chatEntries.map((entry) => {
					if (entry.type === "user") {
						return (
							<UserChatBubble
								key={entry.id}
								entry={entry}
								isLatest={entry.id === latestUserEntryId}
								onLatestLayout={handleLatestUserLayout}
							/>
						);
					}

					if (entry.type === "assistant") {
						return <AssistantChatBubble key={entry.id} entry={entry} />;
					}

					return (
						<OrderRecommendationBubble
							key={entry.id}
							entry={entry}
							isOpeningTechnician={isOpeningTechnician}
							onOpenTechnician={onOpenTechnician}
						/>
					);
				})}

				{isLoading ? (
					<Animated.View
						entering={FadeIn.duration(200)}
						className="mt-stack-md max-w-[82%] self-start rounded-3xl rounded-tl-md px-stack-md py-stack-md"
						style={{ backgroundColor: surface }}
					>
						<View className="flex-row items-center">
							<ActivityIndicator size="small" color={themeColors.primary} />
							<Text
								variant="bodySm"
								className="ml-3"
								style={{ color: mutedText }}
							>
								{activeFlow === "agent"
									? t("messages.loadingAgent")
									: t("messages.loadingRecommend")}
							</Text>
						</View>
					</Animated.View>
				) : null}

				{error ? (
					<Animated.View
						entering={FadeIn.duration(200)}
						className="mt-stack-md max-w-[88%] self-start rounded-3xl rounded-tl-md px-stack-md py-stack-md"
						style={{ backgroundColor: themeColors.dangerLight }}
					>
						<Text variant="bodySm" style={{ color: themeColors.danger }}>
							{error}
						</Text>
					</Animated.View>
				) : null}
			</KeyboardChatScrollView>
			{/* Hidden while the chatbot is disabled — the unavailable overlay owns
			    the center message; flip CHATBOT_ENABLED to restore this empty state. */}
			{isEmpty && CHATBOT_ENABLED ? (
				<Animated.View
					pointerEvents="none"
					entering={FadeIn.duration(240)}
					className="absolute inset-0 items-center justify-center px-8"
				>
					<Text
						variant="bodyLg"
						className="text-center font-google-sans-bold"
						style={{ color: surfaceText }}
					>
						{t("composer.modeLabel", { mode: modeLabel })}
					</Text>
					<Text
						variant="bodySm"
						className="mt-stack-sm text-center leading-5"
						style={{ color: mutedText }}
					>
						{mode === "agent"
							? t("modeHint.agentBody")
							: t("modeHint.recommendBody")}
					</Text>
				</Animated.View>
			) : null}
		</View>
	);
}

type UserEntry = Extract<ChatEntry, { type: "user" }>;
type AssistantEntry = Extract<ChatEntry, { type: "assistant" }>;
type OrderEntry = Extract<ChatEntry, { type: "order" }>;

function UserChatBubble({
	entry,
	isLatest,
	onLatestLayout,
}: Readonly<{
	entry: UserEntry;
	isLatest: boolean;
	onLatestLayout: (event: LayoutChangeEvent, entryId: string) => void;
}>) {
	const themeColors = useThemeColors();
	if (!entry.text && !entry.image) return null;

	const userBubble = themeColors.roleTech;
	const userBubbleText = themeColors.onPrimaryHeader;
	return (
		<Animated.View
			entering={BUBBLE_IN}
			className="mt-stack-md max-w-[88%] self-end rounded-3xl rounded-tr-md px-stack-md py-stack-md"
			style={{ backgroundColor: userBubble }}
			onLayout={
				isLatest ? (event) => onLatestLayout(event, entry.id) : undefined
			}
		>
			{entry.text ? (
				<Text variant="bodySm" style={{ color: userBubbleText }}>
					{entry.text}
				</Text>
			) : null}
			{entry.image ? (
				<View className={entry.text ? "mt-2" : ""}>
					<Image
						source={{ uri: entry.image.uri }}
						style={USER_IMAGE_PREVIEW_STYLE}
						resizeMode="cover"
					/>
					<Text
						variant="caption"
						className="mt-2"
						style={{ color: userBubbleText }}
						numberOfLines={1}
					>
						{entry.image.name}
					</Text>
				</View>
			) : null}
		</Animated.View>
	);
}

function AssistantChatBubble({ entry }: Readonly<{ entry: AssistantEntry }>) {
	const { t } = useTranslation("chat");
	const themeColors = useThemeColors();
	return (
		<Animated.View
			entering={BUBBLE_IN}
			className="mt-stack-md max-w-[88%] self-start rounded-3xl rounded-tl-md px-stack-md py-stack-md shadow-sm"
			style={{
				backgroundColor: themeColors.surfaceElevated,
				borderWidth: 1,
				borderColor: themeColors.borderDefault,
			}}
		>
			<View className="mb-stack-sm flex-row items-center">
				<Text variant="caption" style={{ color: themeColors.textMuted }}>
					{entry.flow === "agent"
						? t("messages.agent")
						: t("messages.assistant")}
				</Text>
			</View>
			<Text variant="bodySm" style={{ color: themeColors.textPrimary }}>
				{entry.text}
			</Text>
		</Animated.View>
	);
}

function RecommendationTechCard({
	technician,
	index,
	isOpeningTechnician,
	onPress,
}: Readonly<{
	technician: ReturnType<typeof getRecommendationCards>[number];
	index: number;
	isOpeningTechnician: boolean;
	onPress: () => void;
}>) {
	const { t } = useTranslation("chat");
	const themeColors = useThemeColors();
	const isTopPick = index === 0 || technician.isAssigned;
	const distanceLabel = t("messages.distanceAway", {
		km: technician.distance_km.toFixed(1),
	});
	const rateLabel = technician.hourly_rate_egp
		? t("messages.rate", { n: technician.hourly_rate_egp })
		: null;

	const onAccent = themeColors.onPrimaryHeader;
	const nameColor = isTopPick ? onAccent : themeColors.textPrimary;
	const subColor = isTopPick ? onAccent : themeColors.textMuted;
	const iconColor = isTopPick ? onAccent : themeColors.primary;

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.85}
			disabled={isOpeningTechnician}
			className="rounded-2xl px-stack-md py-stack-sm"
			style={{
				backgroundColor: isTopPick ? themeColors.primary : themeColors.orderBg,
			}}
		>
			<View className="flex-row items-start justify-between">
				<View className="flex-1 pr-3">
					<View className="flex-row items-center">
						{isTopPick ? (
							<View
								className="mr-2 flex-row items-center rounded-full px-2 py-1"
								style={{ backgroundColor: themeColors.overlayMd }}
							>
								<Star
									size={11}
									color={onAccent}
									strokeWidth={2.4}
									fill={onAccent}
								/>
								<Text
									variant="caption"
									className="ml-1"
									style={{ color: onAccent }}
								>
									{t("messages.topPick")}
								</Text>
							</View>
						) : null}
						<Text
							variant="bodySm"
							className="font-google-sans-bold"
							style={{ color: nameColor }}
						>
							{technician.name}
						</Text>
					</View>

					<Text variant="caption" className="mt-2" style={{ color: subColor }}>
						{distanceLabel}
					</Text>

					{rateLabel ? (
						<Text
							variant="caption"
							className="mt-1"
							style={{ color: subColor }}
						>
							{rateLabel}
						</Text>
					) : null}

					<Text
						variant="caption"
						className="mt-2 font-google-sans-semibold"
						style={{ color: iconColor }}
					>
						{t("messages.continueBooking")}
					</Text>
				</View>

				{isOpeningTechnician ? (
					<ActivityIndicator size="small" color={iconColor} />
				) : (
					<ArrowRight size={18} color={iconColor} strokeWidth={2.4} />
				)}
			</View>
		</TouchableOpacity>
	);
}

function OrderRecommendationBubble({
	entry,
	isOpeningTechnician,
	onOpenTechnician,
}: Readonly<{
	entry: OrderEntry;
	isOpeningTechnician: boolean;
	onOpenTechnician: Props["onOpenTechnician"];
}>) {
	const { t } = useTranslation("chat");
	const { t: tc } = useTranslation("categories");
	const themeColors = useThemeColors();

	const cards = getRecommendationCards(entry.serviceOrder);
	const diagnosedCategory = translateCategoryLabel(
		tc,
		null,
		entry.serviceOrder.diagnosed_category,
	);
	return (
		<Animated.View
			entering={BUBBLE_IN}
			className="mt-stack-md max-w-[92%] self-start rounded-3xl rounded-tl-md px-stack-md py-stack-md shadow-sm"
			style={{
				backgroundColor: themeColors.surfaceElevated,
				borderWidth: 1,
				borderColor: themeColors.borderDefault,
			}}
		>
			<View className="mb-stack-sm flex-row items-center">
				<View
					className="h-7 w-7 items-center justify-center rounded-full"
					style={{ backgroundColor: themeColors.primaryLight }}
				>
					<Sparkles size={14} color={themeColors.primary} strokeWidth={2.2} />
				</View>
				<Text
					variant="bodySm"
					className="ml-2 font-google-sans-semibold"
					style={{ color: themeColors.textPrimary }}
				>
					{entry.flow === "agent"
						? t("messages.agentDraft")
						: t("messages.recommendationReady")}
				</Text>
			</View>

			<Text variant="caption" style={{ color: themeColors.textMuted }}>
				{t("messages.diagnosedCategory")}
			</Text>
			<Text
				variant="bodySm"
				className="mt-1 font-google-sans-bold"
				style={{ color: themeColors.textPrimary }}
			>
				{diagnosedCategory}
			</Text>

			<Text
				variant="caption"
				className="mt-3"
				style={{ color: themeColors.textMuted }}
			>
				{t("messages.summary")}
			</Text>
			<Text
				variant="bodySm"
				className="mt-1"
				style={{ color: themeColors.textPrimary }}
			>
				{entry.serviceOrder.problem_summary}
			</Text>

			<View
				className="mt-3 rounded-2xl px-stack-md py-stack-sm"
				style={{ backgroundColor: themeColors.surfaceElevated }}
			>
				<Text variant="caption" style={{ color: themeColors.textMuted }}>
					{t("messages.estimatedCost")}
				</Text>
				<Text
					variant="bodySm"
					className="mt-1 font-google-sans-semibold"
					style={{ color: themeColors.textPrimary }}
				>
					{entry.serviceOrder.estimated_cost_range_egp ??
						t("messages.notAvailable")}
				</Text>
			</View>

			<Text
				variant="caption"
				className="mt-3"
				style={{ color: themeColors.textMuted }}
			>
				{t("messages.recommendedTechs")}
			</Text>
			<View className="mt-2 gap-2">
				{cards.length === 0 ? (
					<Text variant="bodySm" style={{ color: themeColors.textMuted }}>
						{t("messages.noRecommendations")}
					</Text>
				) : null}
				{cards.map((technician, index) => {
					const recommendationKey = `${String(
						technician.id || technician.name,
					)}-${entry.id}-${index}`;
					return (
						<RecommendationTechCard
							key={recommendationKey}
							technician={technician}
							index={index}
							isOpeningTechnician={isOpeningTechnician}
							onPress={() =>
								onOpenTechnician(
									{ id: technician.id, name: technician.name },
									entry.serviceOrder,
									entry.promptText,
								)
							}
						/>
					);
				})}
			</View>
		</Animated.View>
	);
}
