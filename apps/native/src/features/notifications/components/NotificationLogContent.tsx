import { router } from "expo-router";
import { BellRing } from "lucide-react-native";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	View,
} from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/src/components/ui/avatar";
import BackButton from "@/src/components/ui/back-button";
import { Text } from "@/src/components/ui/text";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useMarkAllNotificationsReadMutation } from "@/src/features/notifications/hooks/useMarkAllNotificationsReadMutation";
import { useNotificationLogsQuery } from "@/src/features/notifications/hooks/useNotificationLogsQuery";
import type {
	NotificationLogItem,
	NotificationPreferencesRole,
} from "@/src/features/notifications/types";
import { getAvatarColor } from "@/src/lib/avatar";
import { formatRelativeTime } from "@/src/lib/date/relative-time";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES } from "@/src/lib/navigation";

function notificationTarget(
	item: NotificationLogItem,
	role: NotificationPreferencesRole,
) {
	if (!item.orderId) return null;
	const viewerRole = item.viewerRole ?? role;
	return viewerRole === "technician"
		? ROUTES.technician.bookingDetail(item.orderId)
		: ROUTES.user.orderDetail(item.orderId);
}

function isGenericSenderName(name: string | undefined): boolean {
	if (!name) return true;
	const normalized = name.trim().toLowerCase();
	return (
		normalized === "" ||
		normalized === "fixit" ||
		normalized === "the customer" ||
		normalized === "the technician" ||
		normalized === "your technician"
	);
}

function inferSenderNameFromBody(body: string): string | undefined {
	const trimmed = body.trim();
	const match = trimmed.match(
		/^(.+?)\s(?:sent|accepted|declined|requested|approved|rejected|is|has|marked)\b/i,
	);
	const candidate = match?.[1]?.trim();
	return isGenericSenderName(candidate) ? undefined : candidate;
}

function senderLabel(item: NotificationLogItem): string {
	const senderName = item.senderName?.trim();
	if (senderName && !isGenericSenderName(senderName)) {
		return senderName;
	}
	return inferSenderNameFromBody(item.body) ?? "FixIt";
}

export default function NotificationLogContent({
	role,
	title,
	showBackButton = true,
}: Readonly<{
	role: NotificationPreferencesRole;
	title: string;
	showBackButton?: boolean;
}>) {
	const { t, i18n } = useTranslation("notifications");
	const themeColors = useThemeColors();
	const { data, isLoading, isRefetching, refetch } =
		useNotificationLogsQuery(role);
	const { mutate: markAllRead, isPending: isMarkingRead } =
		useMarkAllNotificationsReadMutation(role);

	useEffect(() => {
		if (data?.some((item) => !item.isRead) && !isMarkingRead) {
			markAllRead();
		}
	}, [data, isMarkingRead, markAllRead]);

	return (
		<View className="flex-1 bg-surface">
			{showBackButton ? (
				<View
					className="min-h-header flex-row items-center gap-stack-md px-screen-x pt-card pb-card"
					style={{ backgroundColor: themeColors.surfaceBase }}
				>
					<BackButton variant="surface" onPress={() => router.back()} />
					<Text variant="h3" style={{ color: themeColors.textPrimary }}>
						{title}
					</Text>
				</View>
			) : (
				<View
					className="min-h-header px-screen-x pt-card pb-card"
					style={{ backgroundColor: themeColors.surfaceBase }}
				>
					<Text variant="h3" style={{ color: themeColors.textPrimary }}>
						{title}
					</Text>
				</View>
			)}

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			) : (
				<FlatList
					data={data ?? []}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{
						padding: spacing.card.padding,
						paddingBottom: spacing.screen.paddingBottom + spacing.stack.lg,
						gap: spacing.stack.sm,
						flexGrow: 1,
					}}
					renderItem={({ item }) => {
						const target = notificationTarget(item, role);
						const avatarLabel = senderLabel(item);
						return (
							<PressableScale
								pressedScale={target ? 0.985 : 1}
								disabled={!target}
								onPress={() => {
									if (target) {
										router.push(target as never);
									}
								}}
								className="rounded-card bg-card px-card-roomy py-card-roomy"
								style={{
									opacity: item.isRead ? 0.9 : 1,
								}}
							>
								<View className="flex-row items-start gap-stack-md">
									<Avatar
										alt={avatarLabel}
										className="h-avatar-lg w-avatar-lg"
									>
										{item.senderImageUrl ? (
											<AvatarImage source={{ uri: item.senderImageUrl }} />
										) : null}
										<AvatarFallback
											style={{
												backgroundColor: getAvatarColor(item.senderName),
											}}
										>
											<Text
												variant="label"
												className="font-bold"
												style={{ color: themeColors.surfaceBase }}
											>
												{getPfpInitialsFallback(item.senderName)}
											</Text>
										</AvatarFallback>
									</Avatar>

									<View className="flex-1">
										<View className="flex-row items-start justify-between gap-stack-md">
											<View className="flex-1">
												<Text variant="buttonLg" className="text-content">
													{avatarLabel}
												</Text>
												<Text
													variant="caption"
													className="mt-1 text-content-muted"
												>
													{item.title}
												</Text>
												<Text
													variant="bodySm"
													className="mt-stack-xs text-content-muted"
												>
													{item.body}
												</Text>
											</View>
											{!item.isRead ? (
												<View
													className="mt-1 h-status-dot-sm w-status-dot-sm rounded-pill"
													style={{ backgroundColor: Colors.danger }}
												/>
											) : null}
										</View>
										<Text
											variant="caption"
											className="mt-stack-sm text-content-muted"
										>
											{formatRelativeTime(
												item.createdAt,
												new Date(),
												i18n.language,
											)}
										</Text>
									</View>
								</View>
							</PressableScale>
						);
					}}
					ListEmptyComponent={
						<View className="flex-1 items-center justify-center px-button-x py-stack-xl">
							<BellRing
								size={40}
								color={themeColors.borderDefault}
								strokeWidth={1.5}
							/>
							<Text
								variant="buttonLg"
								className="mt-stack-md text-center text-content"
							>
								{t("emptyTitle")}
							</Text>
							<Text
								variant="bodySm"
								className="mt-stack-xs text-center text-content-muted"
							>
								{t("emptyBody")}
							</Text>
						</View>
					}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={refetch}
							tintColor={Colors.primary}
						/>
					}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</View>
	);
}
