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
			<View className="mr-3 w-6 items-center">
				<View
					className="h-6 w-6 rounded-full border-4"
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
							width: 2,
							backgroundColor: themeColors.borderDefault,
							marginTop: -2,
						}}
					/>
				)}
			</View>

			{/* Card */}
			<View
				className="mb-4 flex-1 rounded-2xl bg-surface p-4"
				style={{
					borderWidth: 1,
					borderColor: isInProgress
						? `${themeColors.primary}30`
						: themeColors.borderDefault,
					opacity: isInProgress ? 1 : 0.85,
					...shadowStyle(elevation.flat, { shadowColor: themeColors.shadow }),
				}}
			>
				<View className="mb-2 flex-row items-start justify-between">
					<View className="mr-2 flex-1">
						<Text
							variant="caption"
							className="mb-0.5 font-bold uppercase"
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

				<Text className="text-content-muted text-xs">Scheduled for today</Text>
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
			<View className="items-center py-6">
				<ActivityIndicator color={themeColors.primary} />
			</View>
		);
	} else if (todaysOrders.length === 0) {
		content = (
			<View
				className="items-center rounded-2xl bg-surface px-4 py-6"
				style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
			>
				<Text className="text-content-muted text-sm">
					No bookings for today
				</Text>
			</View>
		);
	}

	return (
		<View className="mt-6 px-4">
			<View className="mb-4 flex-row items-center justify-between">
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
