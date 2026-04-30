import { useRouter } from "expo-router";
import { ClipboardList } from "lucide-react-native";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";
import {
	elevation,
	shadowStyle,
	space,
	type ThemePalette,
	useThemeColors,
} from "@/src/lib/theme";
import {
	useDashboardOrdersQuery,
	useTodayAcceptedDashboardOrders,
} from "../../hooks/useDashboardOrdersQuery";
import type { DashboardOrder } from "../../schemas/response.schema";

function ScheduleCard({
	item,
	index,
	isLast,
	themeColors,
}: Readonly<{
	item: DashboardOrder;
	index: number;
	isLast: boolean;
	themeColors: ThemePalette;
}>) {
	const isInProgress = index === 0;

	return (
		<Animated.View
			entering={FadeInDown.delay(index * 120).duration(400)}
			className="flex-row"
		>
			{/* Timeline column */}
			<View className="mr-stack-md w-icon-md items-center">
				<View
					className="h-icon-md w-icon-md rounded-pill border-4"
					style={{
						backgroundColor: isInProgress
							? themeColors.primary
							: themeColors.borderDefault,
						borderColor: themeColors.surfaceElevated,
					}}
				/>
				{!isLast && (
					<View
						className="flex-1"
						style={{
							width: space[0.5],
							backgroundColor: themeColors.borderDefault,
							marginTop: -space[0.5],
						}}
					/>
				)}
			</View>

			{/* Card */}
			<View
				className="mb-stack-lg flex-1 rounded-card border bg-surface p-card"
				style={{
					borderColor: isInProgress
						? `${themeColors.primary}30`
						: themeColors.borderDefault,
					opacity: isInProgress ? 1 : 0.85,
					...shadowStyle(elevation.flat, { shadowColor: themeColors.shadow }),
				}}
			>
				<View className="mb-stack-sm flex-row items-start justify-between">
					<View className="mr-stack-sm flex-1">
						<Text
							variant="caption"
							className="mb-stack-xs font-bold uppercase"
							style={{
								color: isInProgress
									? themeColors.primary
									: themeColors.textMuted,
							}}
						>
							{isInProgress ? "In Progress" : "Upcoming"}
						</Text>
						<Text
							variant="body"
							className="font-bold text-content"
							numberOfLines={2}
						>
							{item.problem_description ?? "Service Request"}
						</Text>
					</View>
					<ClipboardList
						size={20}
						color={isInProgress ? themeColors.primary : themeColors.textMuted}
						strokeWidth={1.8}
					/>
				</View>

				<Text variant="caption" className="text-content-muted">
					Scheduled for today
				</Text>
			</View>
		</Animated.View>
	);
}

export default function TodayScheduleSection() {
	const router = useRouter();
	const themeColors = useThemeColors();
	const todaysOrders = useTodayAcceptedDashboardOrders();
	const { isLoading } = useDashboardOrdersQuery();
	const goToBookings = useDebounce(() =>
		router.push(ROUTES.technician.bookings),
	);
	let content = (
		<View>
			{todaysOrders.map((item, index) => (
				<ScheduleCard
					key={item.id}
					item={item}
					index={index}
					isLast={index === todaysOrders.length - 1}
					themeColors={themeColors}
				/>
			))}
		</View>
	);

	if (isLoading) {
		content = (
			<View className="items-center py-stack-xl">
				<ActivityIndicator color={themeColors.primary} />
			</View>
		);
	} else if (todaysOrders.length === 0) {
		content = (
			<View className="items-center rounded-card border border-edge bg-surface px-card py-stack-xl">
				<Text variant="bodySm" className="text-content-muted">
					No bookings for today
				</Text>
			</View>
		);
	}

	return (
		<View className="mt-stack-xl px-screen-x">
			<View className="mb-stack-lg flex-row items-center justify-between">
				<Text
					variant="caption"
					className="font-bold text-content-muted uppercase tracking-widest"
				>
					Today's Schedule
				</Text>
				<TouchableOpacity onPress={goToBookings} activeOpacity={0.7}>
					<Text
						variant="caption"
						className="font-semibold"
						style={{ color: themeColors.primary }}
					>
						View All
					</Text>
				</TouchableOpacity>
			</View>

			{content}
		</View>
	);
}
