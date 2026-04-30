import { RefreshControl, ScrollView, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useBookingsDateStore } from "@/src/features/booking-orders/stores/bookings-date-store";
import {
	formatDateLabel,
	formatHeading,
	toIso,
} from "@/src/features/booking-orders/utils/date-helpers";
import { spacing, useThemeColors } from "@/src/lib/theme";
import { useVisibleTechnicianBookings } from "../../hooks/useTechnicianBookingsQuery";
import BookingCard from "./BookingCard";
import BookingsEmptyState from "./BookingsEmptyState";

/** Booking list body for the technician bookings surface. */
export default function BookingListContent() {
	const themeColors = useThemeColors();
	const { selectedDate } = useBookingsDateStore();
	const dateStr = toIso(selectedDate);
	const {
		data: bookings = [],
		isPending,
		isRefetching,
		refetch,
	} = useVisibleTechnicianBookings(dateStr);

	return (
		<ScrollView
			className="flex-1"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ paddingBottom: spacing.screen.scrollBottomInset }}
			refreshControl={
				<RefreshControl
					refreshing={isRefetching}
					onRefresh={refetch}
					colors={[themeColors.primary]}
					tintColor={themeColors.primary}
				/>
			}
		>
			{/* Date heading */}
			<View className="flex-row items-baseline justify-between px-screen-x pt-card-roomy pb-stack-sm">
				<View>
					<Text variant="h3" style={{ color: themeColors.textPrimary }}>
						{formatHeading(selectedDate)}
					</Text>
					<Text
						variant="bodySm"
						className="mt-stack-xs"
						style={{ color: themeColors.textSecondary }}
					>
						{bookings.length} booking{bookings.length === 1 ? "" : "s"}
					</Text>
				</View>
				{bookings.length > 0 && (
					<Text
						variant="caption"
						className="font-semibold"
						style={{ color: themeColors.primary }}
					>
						{formatDateLabel(selectedDate)}
					</Text>
				)}
			</View>

			{/* List or empty state */}
			<View className="px-screen-x">
				{bookings.length === 0 && !isPending ? (
					<BookingsEmptyState />
				) : (
					bookings.map((b, i) => (
						<BookingCard key={b.id} booking={b} index={i} />
					))
				)}
			</View>
		</ScrollView>
	);
}
