import { router, useLocalSearchParams } from "expo-router";
import {
	CalendarClock,
	CalendarDays,
	Inbox,
	MapPin,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, SectionList, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSharedValue } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { AppRefreshControl } from "@/src/components/ui/app-refresh-control";
import { confirm } from "@/src/components/ui/dialog";
import { Icon } from "@/src/components/ui/icon";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useDebounce } from "@/src/hooks/useDebounce";
import { logger } from "@/src/lib/logger";
import { ROUTES } from "@/src/lib/navigation";
import {
	useTechAccept,
	useTechDecline,
} from "../../../hooks/useTechLifecycleMutations";
import {
	type RescheduleJob,
	useJobRequests,
	useRescheduleJobs,
	useScheduledJobGroups,
} from "../../../hooks/useTechnicianJobs";
import type { TechnicianBooking } from "../../../schemas/response.schema";
import {
	extractOrderErrorToken,
	translateOrderError,
} from "../../../utils/translate-order-error";
import { JobsEmptyState } from "./JobsEmptyState";
import { JobsTabBar } from "./JobsTabBar";
import { formatJobDateLabel } from "./job-format";
import { RequestJobCard } from "./RequestJobCard";
import { RescheduleJobItem } from "./RescheduleJobItem";
import { ScheduledJobCard } from "./ScheduledJobCard";

type JobsTabKey = "requests" | "scheduled" | "reschedules";

const TAB_KEYS: readonly JobsTabKey[] = [
	"requests",
	"scheduled",
	"reschedules",
];

function tabIndex(tab: string | undefined): number {
	const i = TAB_KEYS.indexOf(tab as JobsTabKey);
	return i >= 0 ? i : 0;
}

function listContentStyle() {
	return {
		padding: spacing.card.padding,
		paddingBottom: spacing.screen.paddingBottom + spacing.stack.lg,
		gap: spacing.stack.sm,
		flexGrow: 1,
	};
}

function JobsLoading() {
	return (
		<View className="gap-stack-sm p-card">
			{[0, 1, 2].map((i) => (
				<Skeleton key={i} className="h-28 w-full rounded-card" />
			))}
		</View>
	);
}

export function JobsScreen() {
	const { t } = useTranslation("technician");
	const themeColors = useThemeColors();
	const params = useLocalSearchParams<{ tab?: string }>();
	const pagerRef = useRef<PagerView>(null);
	const initialIndex = useRef(tabIndex(params.tab)).current;
	const position = useSharedValue(initialIndex);
	const [active, setActive] = useState<JobsTabKey>(TAB_KEYS[initialIndex]);

	// Honor deep-links (e.g. dashboard reschedule teaser → ?tab=reschedules).
	useEffect(() => {
		if (params.tab && TAB_KEYS.includes(params.tab as JobsTabKey)) {
			const idx = tabIndex(params.tab);
			setActive(params.tab as JobsTabKey);
			pagerRef.current?.setPage(idx);
		}
	}, [params.tab]);

	const requests = useJobRequests();
	const scheduled = useScheduledJobGroups();
	const reschedules = useRescheduleJobs();

	const accept = useTechAccept();
	const decline = useTechDecline();
	const [pendingId, setPendingId] = useState<string | null>(null);

	const handleAccept = useCallback(
		(id: string) => {
			setPendingId(id);
			accept.mutate(
				{ orderId: id },
				{
					onSuccess: () =>
						Toast.show({ type: "success", text1: t("jobs.toast.accepted") }),
					onError: (err) => {
						logger.warn("jobs.request", "accept_failed", {
							orderId: id,
							token: extractOrderErrorToken(err),
						});
						Toast.show({
							type: "info",
							text1: t("jobs.toast.acceptFailed"),
							text2: translateOrderError(err),
						});
					},
					onSettled: () => setPendingId(null),
				},
			);
		},
		[accept, t],
	);

	const handleDecline = useCallback(
		async (id: string) => {
			const ok = await confirm({
				title: t("jobs.dialog.declineTitle"),
				description: t("jobs.dialog.declineBody"),
				primary: { label: t("jobs.dialog.decline"), destructive: true },
				secondary: { label: t("jobs.dialog.keep") },
			});
			if (!ok) return;
			setPendingId(id);
			decline.mutate(
				{ orderId: id },
				{
					onSuccess: () =>
						Toast.show({ type: "success", text1: t("jobs.toast.declined") }),
					onError: (err) => {
						logger.warn("jobs.request", "decline_failed", {
							orderId: id,
							token: extractOrderErrorToken(err),
						});
						Toast.show({
							type: "info",
							text1: t("jobs.toast.declineFailed"),
							text2: translateOrderError(err),
						});
					},
					onSettled: () => setPendingId(null),
				},
			);
		},
		[decline, t],
	);

	const tabs = useMemo(
		() => [
			{
				key: "requests" as const,
				label: t("jobs.tabs.requests"),
				count: requests.data.length,
			},
			{ key: "scheduled" as const, label: t("jobs.tabs.scheduled") },
			{
				key: "reschedules" as const,
				label: t("jobs.tabs.reschedules"),
				count: reschedules.total,
			},
		],
		[requests.data.length, reschedules.total, t],
	);

	const handleTabPress = useCallback((key: JobsTabKey, index: number) => {
		setActive(key);
		pagerRef.current?.setPage(index);
	}, []);

	const initialLoading = requests.isPending && !requests.data.length;

	return (
		<View className="flex-1 bg-surface">
			<ScreenStatusBar variant="surface" />
			<PageHeader
				title={t("jobs.title")}
				showBackButton={false}
				className="border-b-0"
			/>
			{/* Full-bleed: the track + sliding blue indicator reach both screen
			    edges; labels stay centered in equal segments inside JobsTabBar. */}
			<View style={{ backgroundColor: themeColors.surfaceBase }}>
				<JobsTabBar
					tabs={tabs}
					active={active}
					onChange={handleTabPress}
					position={position}
				/>
			</View>

			{initialLoading ? (
				<JobsLoading />
			) : (
				<PagerView
					ref={pagerRef}
					style={{ flex: 1 }}
					initialPage={initialIndex}
					onPageSelected={(e) =>
						setActive(TAB_KEYS[e.nativeEvent.position] ?? "requests")
					}
					onPageScroll={(e) => {
						position.value = e.nativeEvent.position + e.nativeEvent.offset;
					}}
				>
					<View key="requests" style={{ flex: 1 }}>
						<RequestsList
							data={requests.data}
							pendingId={pendingId}
							onAccept={handleAccept}
							onDecline={handleDecline}
							refreshing={requests.isRefetching}
							onRefresh={requests.refetch}
						/>
					</View>
					<View key="scheduled" style={{ flex: 1 }}>
						<ScheduledList
							groups={scheduled.data}
							refreshing={scheduled.isRefetching}
							onRefresh={scheduled.refetch}
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

function RequestsList({
	data,
	pendingId,
	onAccept,
	onDecline,
	refreshing,
	onRefresh,
}: {
	readonly data: readonly TechnicianBooking[];
	readonly pendingId: string | null;
	readonly onAccept: (id: string) => void;
	readonly onDecline: (id: string) => void;
	readonly refreshing: boolean;
	readonly onRefresh: () => void;
}) {
	const { t } = useTranslation("technician");
	return (
		<FlatList
			data={data}
			keyExtractor={(b) => b.id}
			contentContainerStyle={listContentStyle()}
			showsVerticalScrollIndicator={false}
			refreshControl={
				<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
			renderItem={({ item }) => (
				<RequestJobCard
					booking={item}
					actionPending={pendingId === item.id}
					onAccept={() => onAccept(item.id)}
					onDecline={() => onDecline(item.id)}
				/>
			)}
			ListEmptyComponent={
				<JobsEmptyState
					icon={Inbox}
					title={t("jobs.empty.requestsTitle")}
					subtitle={t("jobs.empty.requestsBody")}
				/>
			}
		/>
	);
}

function ScheduledList({
	groups,
	refreshing,
	onRefresh,
}: {
	readonly groups: ReturnType<typeof useScheduledJobGroups>["data"];
	readonly refreshing: boolean;
	readonly onRefresh: () => void;
}) {
	const { t } = useTranslation("technician");
	const sections = useMemo(
		() =>
			groups.map((g) => ({
				date: g.date,
				data: g.jobs as TechnicianBooking[],
			})),
		[groups],
	);
	return (
		<SectionList
			sections={sections}
			keyExtractor={(b) => b.id}
			contentContainerStyle={listContentStyle()}
			showsVerticalScrollIndicator={false}
			stickySectionHeadersEnabled={false}
			refreshControl={
				<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
			renderSectionHeader={({ section }) => (
				<ScheduledSectionHeader date={section.date} />
			)}
			renderItem={({ item }) => <ScheduledJobCard booking={item} />}
			ListEmptyComponent={
				<JobsEmptyState
					icon={CalendarDays}
					title={t("jobs.empty.scheduledTitle")}
					subtitle={t("jobs.empty.scheduledBody")}
				/>
			}
		/>
	);
}

function ScheduledSectionHeader({ date }: { readonly date: string }) {
	const { t, i18n } = useTranslation("technician");
	const viewInSchedule = useDebounce(() =>
		router.push(ROUTES.technician.scheduleDay(date)),
	);
	return (
		<View className="flex-row items-center justify-between pt-stack-sm pb-stack-xs">
			<Text variant="label" className="font-bold text-content">
				{formatJobDateLabel(date, i18n.language, {
					today: t("jobs.dates.today"),
					tomorrow: t("jobs.dates.tomorrow"),
					yesterday: t("jobs.dates.yesterday"),
				})}
			</Text>
			<PressableScale
				pressedScale={0.96}
				onPress={viewInSchedule}
				className="flex-row items-center gap-1 rounded-pill bg-app-primary/10 px-stack-md py-stack-xs"
				accessibilityLabel={t("jobs.scheduled.viewInScheduleAria")}
			>
				<Icon as={MapPin} size={12} className="text-app-primary" />
				<Text variant="caption" className="font-semibold text-app-primary">
					{t("jobs.scheduled.viewInSchedule")}
				</Text>
			</PressableScale>
		</View>
	);
}

function ReschedulesList({
	incoming,
	sent,
	refreshing,
	onRefresh,
}: {
	readonly incoming: readonly RescheduleJob[];
	readonly sent: readonly RescheduleJob[];
	readonly refreshing: boolean;
	readonly onRefresh: () => void;
}) {
	const { t } = useTranslation("technician");
	const sections = useMemo(() => {
		const out: { title: string; data: RescheduleJob[] }[] = [];
		if (incoming.length) {
			out.push({
				title: t("jobs.reschedules.incomingSection"),
				data: incoming as RescheduleJob[],
			});
		}
		if (sent.length) {
			out.push({
				title: t("jobs.reschedules.sentSection"),
				data: sent as RescheduleJob[],
			});
		}
		return out;
	}, [incoming, sent, t]);

	return (
		<SectionList
			sections={sections}
			keyExtractor={(r) => r.booking.id}
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
			renderItem={({ item }) => (
				<RescheduleJobItem booking={item.booking} direction={item.direction} />
			)}
			ListEmptyComponent={
				<JobsEmptyState
					icon={CalendarClock}
					title={t("jobs.empty.reschedulesTitle")}
					subtitle={t("jobs.empty.reschedulesBody")}
				/>
			}
		/>
	);
}
