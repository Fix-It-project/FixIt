import { CalendarClock, type LucideIcon, Phone } from "lucide-react-native";
import type { ReactNode } from "react";
import { Linking, View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Text } from "@/src/components/ui/text";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import { getAvatarColor } from "@/src/features/booking-orders/utils/booking-helpers";
import { CATEGORIES } from "@/src/features/categories/constants/categories";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { Colors, radius, space, spacing, useThemeColors } from "@/src/constants/design-tokens";
import OrderIdentityRow from "./OrderIdentityRow";

interface OrderInfoCompactProps {
	readonly order: Order;
	readonly viewer: "user" | "technician";
	readonly onIdentityPress?: () => void;
	readonly footer?: ReactNode;
}

function formatScheduled(value: string | null | undefined): string | null {
	if (!value) return null;
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	return d.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function maskPhone(value: string | null | undefined): string | null {
	if (!value) return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export default function OrderInfoCompact({
	order,
	viewer,
	onIdentityPress,
	footer,
}: OrderInfoCompactProps) {
	const themeColors = useThemeColors();
	const isUserViewer = viewer === "user";
	const booking = order as unknown as TechnicianBooking;

	const counterpartyName = isUserViewer
		? (order.technician_name ?? "Technician")
		: (booking.user_name ?? "Customer");
	const counterpartyImage = isUserViewer
		? (order.technician_image ?? null)
		: null;
	const counterpartyPhone = isUserViewer
		? order.technician_phone
		: booking.user_phone;
	const counterpartyId = isUserViewer ? order.technician_id : order.user_id;

	const initials = getPfpInitialsFallback(counterpartyName);
	const avatarColor = getAvatarColor(counterpartyName);

	const category = order.category_id
		? CATEGORIES.find((c) => c.id === order.category_id)
		: undefined;
	const CategoryIcon: LucideIcon = category?.icon ?? CalendarClock;
	const categoryColor = Colors.primary;

	const scheduled = formatScheduled(order.scheduled_start_at);
	const phone = maskPhone(counterpartyPhone);

	const handlePhonePress = () => {
		if (!phone) return;
		void Linking.openURL(`tel:${phone}`);
	};

	const identityRow = (
		<OrderIdentityRow
			name={counterpartyName}
			imageUrl={counterpartyImage}
			initials={initials}
			avatarColor={avatarColor}
			roleLabel={isUserViewer ? "Technician" : "Customer"}
			ratingTechnicianId={
				isUserViewer && counterpartyId ? counterpartyId : null
			}
			showChevron={Boolean(onIdentityPress)}
		/>
	);

	return (
		<View
			style={{
				borderRadius: radius.card,
				backgroundColor: themeColors.surfaceElevated,
				padding: space[4],
				gap: space[3],
			}}
		>
			{onIdentityPress ? (
				<PressableScale
					onPress={onIdentityPress}
					accessibilityRole="button"
					accessibilityLabel={`Open ${counterpartyName} info`}
				>
					{identityRow}
				</PressableScale>
			) : (
				identityRow
			)}

			<View
				style={{
					height: 1,
					backgroundColor: themeColors.borderDefault,
					opacity: 0.5,
				}}
			/>

			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: space[3],
				}}
			>
				<View style={{ flex: 1, gap: space[1] }}>
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						Service
					</Text>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: space[2],
						}}
					>
						<CategoryIcon size={spacing.icon.caption} color={categoryColor} strokeWidth={2.2} />
						<Text
							variant="bodySm"
							style={{ color: themeColors.textPrimary, flex: 1 }}
							numberOfLines={1}
						>
							{order.service_name ?? "—"}
						</Text>
					</View>
				</View>
				<View style={{ flex: 1, gap: space[1] }}>
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						Scheduled
					</Text>
					<Text
						variant="bodySm"
						style={{ color: themeColors.textPrimary }}
						numberOfLines={1}
					>
						{scheduled ?? "Flexible"}
					</Text>
				</View>
			</View>

			{phone ? (
				<PressableScale
					onPress={handlePhonePress}
					accessibilityRole="button"
					accessibilityLabel={`Call ${phone}`}
				>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: space[2],
							paddingHorizontal: space[3],
							paddingVertical: space[2],
							borderRadius: radius.pill,
							backgroundColor: `${themeColors.primary}14`,
							alignSelf: "flex-start",
						}}
					>
						<Phone size={spacing.icon.caption} color={themeColors.primary} strokeWidth={2.4} />
						<Text
							variant="bodySm"
							className="font-google-sans-bold"
							style={{ color: themeColors.primary }}
						>
							{phone}
						</Text>
					</View>
				</PressableScale>
			) : null}

			{footer ? (
				<>
					<View
						style={{
							height: 1,
							backgroundColor: themeColors.borderDefault,
							opacity: 0.5,
						}}
					/>
					{footer}
				</>
			) : null}
		</View>
	);
}
