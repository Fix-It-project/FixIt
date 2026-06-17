import { router } from "expo-router";
import { BellRing } from "lucide-react-native";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	ActivityIndicator,
	Image,
	SectionList,
	StyleSheet,
	View,
} from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { AppRefreshControl } from "@/src/components/ui/app-refresh-control";
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

const systemNotificationIcon = require("@/src/assets/images/notification-icon.png");

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
		normalized.startsWith("your ") ||
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

function isSystemNotification(
	item: NotificationLogItem,
	avatarLabel: string,
): boolean {
	return !item.senderImageUrl && avatarLabel === "FixIt";
}

interface NotificationSection {
	readonly title: string;
	readonly data: NotificationLogItem[];
}

/** Local calendar-day key (not UTC) so grouping matches the user's clock. */
function localDayKey(d: Date): string {
	return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Group notifications into day buckets (Today / Yesterday / weekday / date) in
 * arrival order, YouTube-style. Input is assumed newest-first, so sections come
 * out newest-first too.
 */
function groupByDay(
	items: readonly NotificationLogItem[],
	language: string,
	todayLabel: string,
	yesterdayLabel: string,
): NotificationSection[] {
	const now = new Date();
	const todayKey = localDayKey(now);
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	const yesterdayKey = localDayKey(yesterday);
	const weekdayFmt = new Intl.DateTimeFormat(language, { weekday: "long" });
	const monthDayFmt = new Intl.DateTimeFormat(language, {
		month: "short",
		day: "numeric",
	});
	const fullFmt = new Intl.DateTimeFormat(language, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	const sections: NotificationSection[] = [];
	const byKey = new Map<string, NotificationSection>();

	for (const item of items) {
		const date = new Date(item.createdAt);
		const key = localDayKey(date);
		let section = byKey.get(key);
		if (!section) {
			let title: string;
			if (key === todayKey) {
				title = todayLabel;
			} else if (key === yesterdayKey) {
				title = yesterdayLabel;
			} else {
				const diffDays = Math.floor(
					(now.getTime() - date.getTime()) / 86_400_000,
				);
				title =
					diffDays >= 0 && diffDays < 7
						? weekdayFmt.format(date)
						: date.getFullYear() === now.getFullYear()
							? monthDayFmt.format(date)
							: fullFmt.format(date);
			}
			section = { title, data: [] };
			byKey.set(key, section);
			sections.push(section);
		}
		section.data.push(item);
	}
	return sections;
}

export default function NotificationLogContent({
	notificationRole,
	title,
	showBackButton = true,
}: Readonly<{
	notificationRole: NotificationPreferencesRole;
	title: string;
	showBackButton?: boolean;
}>) {
	const { t, i18n } = useTranslation("notifications");
	const themeColors = useThemeColors();
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isRefetching,
		refetch,
	} = useNotificationLogsQuery(notificationRole);
	const { mutate: markAllRead, isPending: isMarkingRead } =
		useMarkAllNotificationsReadMutation(notificationRole);
	const notifications = useMemo(() => data?.pages.flat() ?? [], [data]);

	useEffect(() => {
		if (notifications.some((item) => !item.isRead) && !isMarkingRead) {
			markAllRead();
		}
	}, [notifications, isMarkingRead, markAllRead]);

	const handleEndReached = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			void fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const sections = useMemo(
		() =>
			groupByDay(
				notifications,
				i18n.language,
				t("today", { defaultValue: "Today" }),
				t("yesterday", { defaultValue: "Yesterday" }),
			),
		[notifications, i18n.language, t],
	);

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
				<SectionList
					sections={sections}
					keyExtractor={(item) => item.id}
					stickySectionHeadersEnabled={false}
					contentContainerStyle={{
						paddingBottom: spacing.screen.paddingBottom + spacing.stack.lg,
						flexGrow: 1,
					}}
					SectionSeparatorComponent={null}
					onEndReached={handleEndReached}
					onEndReachedThreshold={0.35}
					ItemSeparatorComponent={() => (
						<View
							style={{
								height: StyleSheet.hairlineWidth,
								marginLeft: spacing.screen.paddingX + spacing.avatar.md + 12,
								backgroundColor: themeColors.borderDefault,
							}}
						/>
					)}
					renderSectionHeader={({ section }) => (
						<Text
							variant="caption"
							className="px-screen-x pt-stack-lg pb-stack-xs font-semibold text-content-muted uppercase"
						>
							{section.title}
						</Text>
					)}
					renderItem={({ item }) => {
						const target = notificationTarget(item, notificationRole);
						const avatarLabel = senderLabel(item);
						const systemNotification = isSystemNotification(item, avatarLabel);
						return (
							<PressableScale
								pressedScale={target ? 0.985 : 1}
								disabled={!target}
								onPress={() => {
									if (target) {
										router.push(target as never);
									}
								}}
								className="flex-row items-center gap-stack-md px-screen-x py-stack-sm"
								style={{
									opacity: item.isRead ? 0.7 : 1,
								}}
							>
								{systemNotification ? (
									<View className="h-avatar-md w-avatar-md items-center justify-center rounded-pill bg-app-primary-light">
										<Image
											source={systemNotificationIcon}
											className="h-icon-sm w-icon-sm"
											style={{ tintColor: themeColors.primary }}
										/>
									</View>
								) : (
									<Avatar alt={avatarLabel} className="h-avatar-md w-avatar-md">
										{item.senderImageUrl ? (
											<AvatarImage source={{ uri: item.senderImageUrl }} />
										) : null}
										<AvatarFallback
											style={{
												backgroundColor: getAvatarColor(avatarLabel),
											}}
										>
											<Text
												variant="caption"
												className="font-bold"
												style={{ color: themeColors.surfaceBase }}
											>
												{getPfpInitialsFallback(avatarLabel)}
											</Text>
										</AvatarFallback>
									</Avatar>
								)}

								<View className="flex-1">
									<View className="flex-row items-center gap-stack-sm">
										<Text
											variant="label"
											numberOfLines={1}
											className="flex-1 font-semibold text-content"
										>
											{avatarLabel}
										</Text>
										<Text variant="caption" className="text-content-muted">
											{formatRelativeTime(
												item.createdAt,
												new Date(),
												i18n.language,
											)}
										</Text>
										{!item.isRead ? (
											<View
												className="h-status-dot-sm w-status-dot-sm rounded-pill"
												style={{ backgroundColor: Colors.danger }}
											/>
										) : null}
									</View>
									<Text
										variant="caption"
										numberOfLines={1}
										className="mt-0.5 text-content-muted"
									>
										{item.body}
									</Text>
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
					ListFooterComponent={
						isFetchingNextPage ? (
							<View className="items-center py-stack-lg">
								<ActivityIndicator color={themeColors.primary} />
							</View>
						) : null
					}
					refreshControl={
						<AppRefreshControl refreshing={isRefetching} onRefresh={refetch} />
					}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</View>
	);
}
