import { CalendarClock, ClipboardList } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, SectionList, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSharedValue } from "react-native-reanimated";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { AppRefreshControl } from "@/src/components/ui/app-refresh-control";
import { Icon } from "@/src/components/ui/icon";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { SegmentedTabBar } from "@/src/features/booking-orders/components/shared/SegmentedTabBar";
import UserBookingCard from "@/src/features/booking-orders/components/user/UserBookingCard";
import UserRescheduleCard from "@/src/features/booking-orders/components/user/UserRescheduleCard";
import {
	useUserOrdersQuery,
	useUserRescheduleRequests,
} from "@/src/features/booking-orders/hooks";
import type { UserRescheduleRequest } from "@/src/features/booking-orders/hooks/useUserRescheduleRequests";
import { TERMINAL_STATUSES } from "@/src/features/booking-orders/schemas/order-status.schema";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";

type ActivityTabKey = "bookings" | "reschedules";

const TAB_KEYS: readonly ActivityTabKey[] = ["bookings", "reschedules"];

function listContentStyle() {
	return {
		padding: spacing.card.padding,
		paddingBottom: spacing.screen.paddingBottom + spacing.stack.lg,
		gap: spacing.stack.sm,
		flexGrow: 1,
	};
}

function ActivityLoading() {
	return (
		<View className="gap-stack-sm p-card">
			{[0, 1, 2].map((i) => (
				<Skeleton key={i} className="h-28 w-full rounded-card" />
			))}
		</View>
	);
}

function EmptyState({
	icon,
	title,
	subtitle,
}: {
	readonly icon: typeof ClipboardList;
	readonly title: string;
	readonly subtitle: string;
}) {
	const themeColors = useThemeColors();
	return (
		<View className="flex-1 items-center justify-center px-button-lg-x py-stack-xl">
			<Icon as={icon} size={36} color={themeColors.textMuted} />
			<Text
				variant="buttonLg"
				className="mt-stack-md text-center"
				style={{ color: themeColors.textSecondary }}
			>
				{title}
			</Text>
			<Text
				variant="bodySm"
				className="mt-stack-xs text-center"
				style={{ color: themeColors.textMuted }}
			>
				{subtitle}
			</Text>
		</View>
	);
}

export default function ActivityScreen() {
	const { t } = useTranslation("orders");
	const themeColors = useThemeColors();
	const pagerRef = useRef<PagerView>(null);
	const position = useSharedValue(0);
	const [active, setActive] = useState<ActivityTabKey>("bookings");

	const {
		data: ordersData = [],
		isPending: ordersPending,
		isRefetching: ordersRefetching,
		refetch: refetchOrders,
	} = useUserOrdersQuery();
	const reschedules = useUserRescheduleRequests();

	const tabs = useMemo(
		() => [
			{ key: "bookings" as const, label: t("activity.tabs.bookings") },
			{
				key: "reschedules" as const,
				label: t("activity.tabs.reschedules"),
				count: reschedules.total,
			},
		],
		[reschedules.total, t],
	);

	const handleTabPress = useCallback((key: ActivityTabKey, index: number) => {
		setActive(key);
		pagerRef.current?.setPage(index);
	}, []);

	const initialLoading = ordersPending && ordersData.length === 0;

	return (
		<View className="flex-1 bg-surface">
			<ScreenStatusBar variant="surface" />
			<PageHeader
				title={t("activity.title")}
				showBackButton={false}
				className="border-b-0"
			/>
			{/* Full-bleed: the track + sliding blue indicator reach both screen edges;
			    labels stay centered in equal segments inside SegmentedTabBar. */}
			<View style={{ backgroundColor: themeColors.surfaceBase }}>
				<SegmentedTabBar
					tabs={tabs}
					active={active}
					onChange={handleTabPress}
					position={position}
				/>
			</View>

			{initialLoading ? (
				<ActivityLoading />
			) : (
				<PagerView
					ref={pagerRef}
					style={{ flex: 1 }}
					initialPage={0}
					onPageSelected={(e) =>
						setActive(TAB_KEYS[e.nativeEvent.position] ?? "bookings")
					}
					onPageScroll={(e) => {
						position.value = e.nativeEvent.position + e.nativeEvent.offset;
					}}
				>
					<View key="bookings" style={{ flex: 1 }}>
						<BookingsList
							data={ordersData}
							refreshing={ordersRefetching}
							onRefresh={refetchOrders}
						/>
					</View>
					<View key="reschedules" style={{ flex: 1 }}>
						<ReschedulesList
							incoming={reschedules.incoming}
							sent={reschedules.sent}
							refreshing={reschedules.isRefetching}
							onRefresh={reschedules.refetch}
						/>
					</View>
				</PagerView>
			)}
		</View>
	);
}

function BookingsList({
	data,
	refreshing,
	onRefresh,
}: {
	readonly data: readonly Order[];
	readonly refreshing: boolean;
	readonly onRefresh: () => void;
}) {
	const { t } = useTranslation("orders");
	// Activity = current bookings only: requests sent to technicians + the active
	// job until it's completed/cancelled. Terminal orders live in profile history.
	const active = useMemo(
		() => data.filter((o) => !TERMINAL_STATUSES.has(o.status)),
		[data],
	);

	return (
		<FlatList
			data={active}
			keyExtractor={(o) => o.id}
			contentContainerStyle={listContentStyle()}
			showsVerticalScrollIndicator={false}
			refreshControl={
				<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
			renderItem={({ item }) => <UserBookingCard order={item} />}
			ListEmptyComponent={
				<EmptyState
					icon={ClipboardList}
					title={t("activity.empty.bookingsTitle")}
					subtitle={t("activity.empty.bookingsBody")}
				/>
			}
		/>
	);
}

function ReschedulesList({
	incoming,
	sent,
	refreshing,
	onRefresh,
}: {
	readonly incoming: readonly UserRescheduleRequest[];
	readonly sent: readonly UserRescheduleRequest[];
	readonly refreshing: boolean;
	readonly onRefresh: () => void;
}) {
	const { t } = useTranslation("orders");
	const sections = useMemo(() => {
		const out: { title: string; data: UserRescheduleRequest[] }[] = [];
		if (incoming.length) {
			out.push({
				title: t("activity.reschedules.incomingSection"),
				data: incoming as UserRescheduleRequest[],
			});
		}
		if (sent.length) {
			out.push({
				title: t("activity.reschedules.sentSection"),
				data: sent as UserRescheduleRequest[],
			});
		}
		return out;
	}, [incoming, sent, t]);

	return (
		<SectionList
			sections={sections}
			keyExtractor={(r) => r.order.id}
			contentContainerStyle={listContentStyle()}
			showsVerticalScrollIndicator={false}
			stickySectionHeadersEnabled={false}
			refreshControl={
				<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
			renderSectionHeader={({ section }) => (
				<Text
					variant="label"
					className="pt-stack-sm pb-stack-xs font-bold text-content"
				>
					{section.title}
				</Text>
			)}
			renderItem={({ item }) => <UserRescheduleCard order={item.order} />}
			ListEmptyComponent={
				<EmptyState
					icon={CalendarClock}
					title={t("activity.empty.reschedulesTitle")}
					subtitle={t("activity.empty.reschedulesBody")}
				/>
			}
		/>
	);
}
