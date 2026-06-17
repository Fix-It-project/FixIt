import { ArrowRight, Bot, Sparkles, Star } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import { KeyboardChatScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { translateCategoryLabel } from "@/src/features/categories/constants/categories";
import type { ServiceOrder } from "../../schemas/response.schema";
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

export default function ChatMessageList({
	mode,
	chatEntries,
	isLoading,
	error,
	activeFlow,
	isOpeningTechnician,
	onOpenTechnician,
}: Props) {
	const { t } = useTranslation("chat");
	const { t: tc } = useTranslation("categories");
	const themeColors = useThemeColors();

	const surface = themeColors.surfaceBase;
	const surfaceText = themeColors.textPrimary;
	const mutedText = themeColors.textMuted;
	const cardBg = themeColors.surfaceElevated;
	const assistantBubble = themeColors.surfaceElevated;
	const assistantBorder = themeColors.borderDefault;
	const userBubble = themeColors.roleTech;
	const userBubbleText = themeColors.onPrimaryHeader;
	const assistantBadge = themeColors.primaryLight;
	const agentBadge = themeColors.textMuted;
	const orderCard = themeColors.orderBg;

	const isEmpty = chatEntries.length === 0 && !isLoading && !error;
	const modeLabel =
		mode === "recommend"
			? t("composer.modeRecommend")
			: t("composer.modeAgent");

	return (
		<View className="flex-1">
			<KeyboardChatScrollView
				className="flex-1"
				contentContainerClassName="px-4 py-4"
				keyboardLiftBehavior="never"
				showsVerticalScrollIndicator={false}
				keyboardDismissMode="interactive"
				keyboardShouldPersistTaps="handled"
			>
				{chatEntries.map((entry) => {
					if (entry.type === "user") {
						if (!entry.text && !entry.image) return null;

						return (
							<Animated.View
								key={entry.id}
								entering={BUBBLE_IN}
								className="mt-stack-md max-w-[88%] self-end rounded-3xl rounded-tr-md px-stack-md py-stack-md"
								style={{ backgroundColor: userBubble }}
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
											className="h-40 w-[220px] rounded-2xl"
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

					if (entry.type === "assistant") {
						return (
							<Animated.View
								key={entry.id}
								entering={BUBBLE_IN}
								className="mt-stack-md max-w-[88%] self-start rounded-3xl rounded-tl-md px-stack-md py-stack-md shadow-sm"
								style={{
									backgroundColor: assistantBubble,
									borderWidth: 1,
									borderColor: assistantBorder,
								}}
							>
								<View className="mb-stack-sm flex-row items-center">
									<View
										className="h-6 w-6 items-center justify-center rounded-full"
										style={{
											backgroundColor:
												entry.flow === "agent" ? agentBadge : assistantBadge,
										}}
									>
										{entry.flow === "agent" ? (
											<Bot
												size={13}
												color={themeColors.onPrimaryHeader}
												strokeWidth={2.2}
											/>
										) : (
											<Sparkles
												size={13}
												color={themeColors.primary}
												strokeWidth={2.2}
											/>
										)}
									</View>
									<Text
										variant="caption"
										className="ml-2"
										style={{ color: mutedText }}
									>
										{entry.flow === "agent"
											? t("messages.agent")
											: t("messages.assistant")}
									</Text>
								</View>
								<Text variant="bodySm" style={{ color: surfaceText }}>
									{entry.text}
								</Text>
							</Animated.View>
						);
					}

					const cards = getRecommendationCards(entry.serviceOrder);
					const diagnosedCategory = translateCategoryLabel(
						tc,
						null,
						entry.serviceOrder.diagnosed_category,
					);
					return (
						<Animated.View
							key={entry.id}
							entering={BUBBLE_IN}
							className="mt-stack-md max-w-[92%] self-start rounded-3xl rounded-tl-md px-stack-md py-stack-md shadow-sm"
							style={{
								backgroundColor: assistantBubble,
								borderWidth: 1,
								borderColor: assistantBorder,
							}}
						>
							<View className="mb-stack-sm flex-row items-center">
								<View
									className="h-7 w-7 items-center justify-center rounded-full"
									style={{ backgroundColor: assistantBadge }}
								>
									<Sparkles
										size={14}
										color={themeColors.primary}
										strokeWidth={2.2}
									/>
								</View>
								<Text
									variant="bodySm"
									className="ml-2 font-google-sans-semibold"
									style={{ color: surfaceText }}
								>
									{entry.flow === "agent"
										? t("messages.agentDraft")
										: t("messages.recommendationReady")}
								</Text>
							</View>

							<Text variant="caption" style={{ color: mutedText }}>
								{t("messages.diagnosedCategory")}
							</Text>
							<Text
								variant="bodySm"
								className="mt-1 font-google-sans-bold"
								style={{ color: surfaceText }}
							>
								{diagnosedCategory}
							</Text>

							<Text
								variant="caption"
								className="mt-3"
								style={{ color: mutedText }}
							>
								{t("messages.summary")}
							</Text>
							<Text
								variant="bodySm"
								className="mt-1"
								style={{ color: surfaceText }}
							>
								{entry.serviceOrder.problem_summary}
							</Text>

							<View
								className="mt-3 rounded-2xl px-stack-md py-stack-sm"
								style={{ backgroundColor: cardBg }}
							>
								<Text variant="caption" style={{ color: mutedText }}>
									{t("messages.estimatedCost")}
								</Text>
								<Text
									variant="bodySm"
									className="mt-1 font-google-sans-semibold"
									style={{ color: surfaceText }}
								>
									{entry.serviceOrder.estimated_cost_range_egp ??
										t("messages.notAvailable")}
								</Text>
							</View>

							<Text
								variant="caption"
								className="mt-3"
								style={{ color: mutedText }}
							>
								{t("messages.recommendedTechs")}
							</Text>
							<View className="mt-2 gap-2">
								{cards.length === 0 ? (
									<Text variant="bodySm" style={{ color: mutedText }}>
										{t("messages.noRecommendations")}
									</Text>
								) : null}
								{cards.map((technician, index) => {
									const isTopPick = index === 0 || technician.isAssigned;
									const distanceLabel = t("messages.distanceAway", {
										km: technician.distance_km.toFixed(1),
									});
									const rateLabel = technician.hourly_rate_egp
										? t("messages.rate", { n: technician.hourly_rate_egp })
										: null;
									const recommendationKey = `${String(technician.id || technician.name)}-${entry.id}-${index}`;

									return (
										<TouchableOpacity
											key={recommendationKey}
											onPress={() =>
												void onOpenTechnician(
													{ id: technician.id, name: technician.name },
													entry.serviceOrder,
													entry.promptText,
												)
											}
											activeOpacity={0.85}
											disabled={isOpeningTechnician}
											className="rounded-2xl px-stack-md py-stack-sm"
											style={{
												backgroundColor: isTopPick
													? themeColors.primary
													: orderCard,
											}}
										>
											<View className="flex-row items-start justify-between">
												<View className="flex-1 pr-3">
													<View className="flex-row items-center">
														{isTopPick ? (
															<View
																className="mr-2 flex-row items-center rounded-full px-2 py-1"
																style={{
																	backgroundColor: themeColors.overlayMd,
																}}
															>
																<Star
																	size={11}
																	color={themeColors.onPrimaryHeader}
																	strokeWidth={2.4}
																	fill={themeColors.onPrimaryHeader}
																/>
																<Text
																	variant="caption"
																	className="ml-1"
																	style={{ color: themeColors.onPrimaryHeader }}
																>
																	{t("messages.topPick")}
																</Text>
															</View>
														) : null}
														<Text
															variant="bodySm"
															className="font-google-sans-bold"
															style={{
																color: isTopPick
																	? themeColors.onPrimaryHeader
																	: surfaceText,
															}}
														>
															{technician.name}
														</Text>
													</View>

													<Text
														variant="caption"
														className="mt-2"
														style={{
															color: isTopPick
																? themeColors.onPrimaryHeader
																: mutedText,
														}}
													>
														{distanceLabel}
													</Text>

													{rateLabel ? (
														<Text
															variant="caption"
															className="mt-1"
															style={{
																color: isTopPick
																	? themeColors.onPrimaryHeader
																	: mutedText,
															}}
														>
															{rateLabel}
														</Text>
													) : null}

													<Text
														variant="caption"
														className="mt-2 font-google-sans-semibold"
														style={{
															color: isTopPick
																? themeColors.onPrimaryHeader
																: themeColors.primary,
														}}
													>
														{t("messages.continueBooking")}
													</Text>
												</View>

												{isOpeningTechnician ? (
													<ActivityIndicator
														size="small"
														color={
															isTopPick
																? themeColors.onPrimaryHeader
																: themeColors.primary
														}
													/>
												) : (
													<ArrowRight
														size={18}
														color={
															isTopPick
																? themeColors.onPrimaryHeader
																: themeColors.primary
														}
														strokeWidth={2.4}
													/>
												)}
											</View>
										</TouchableOpacity>
									);
								})}
							</View>
						</Animated.View>
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
			{isEmpty ? (
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
