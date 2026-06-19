import { CalendarClock, type LucideIcon, Phone } from "lucide-react-native";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import CustomerActionsSheet, {
	type CustomerActionsSheetHandle,
} from "@/src/components/identity/CustomerActionsSheet";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { Text } from "@/src/components/ui/text";
import {
	Colors,
	radius,
	space,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import {
	getAvatarColor,
	getDateLocale,
} from "@/src/features/booking-orders/utils/booking-helpers";
import {
	CATEGORIES,
	translateServiceName,
} from "@/src/features/categories/constants/categories";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { PaymentMethodBadge } from "../../PaymentMethodBadge";
import OrderIdentityRow from "./OrderIdentityRow";

interface OrderPartyHeaderProps {
	readonly order: Order;
	readonly viewer: "user" | "technician";
}

function formatScheduled(
	value: string | null | undefined,
	language?: string,
): string | null {
	if (!value) return null;
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	return d.toLocaleString(getDateLocale(language), {
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

/**
 * Card-less party header rendered once by `StateScreenLayout`, above the state
 * body. Shows who you're dealing with (counterparty identity + rating), the
 * service, the schedule, payment, and a tap-to-call chip — without wrapping any
 * of it in a card. It owns the identity sheet too (technician-profile sheet for
 * the customer view, customer-actions sheet for the technician view), so the
 * per-state screens no longer carry that boilerplate.
 */
export default function OrderPartyHeader({
	order,
	viewer,
}: OrderPartyHeaderProps) {
	const { t, i18n } = useTranslation("orders");
	const { t: tc } = useTranslation("categories");
	const themeColors = useThemeColors();
	const isUserViewer = viewer === "user";
	const booking = order as unknown as TechnicianBooking;

	const techSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const customerSheetRef = useRef<CustomerActionsSheetHandle>(null);

	const counterpartyName = isUserViewer
		? (order.technician_name ?? t("card.technicianFallback"))
		: (booking.user_name ?? t("card.customerFallback"));
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

	const scheduled = formatScheduled(order.scheduled_start_at, i18n.language);
	const phone = maskPhone(counterpartyPhone);
	const serviceName = translateServiceName(
		tc,
		order.service_id,
		order.service_name,
	);

	const handleIdentityPress = () => {
		if (isUserViewer) {
			if (!counterpartyId) return;
			techSheetRef.current?.open(counterpartyId, initials);
			return;
		}
		customerSheetRef.current?.open({
			name: booking.user_name ?? t("card.customerFallback"),
			phone: booking.user_phone ?? null,
			address: booking.user_address ?? null,
			latitude: booking.user_latitude ?? null,
			longitude: booking.user_longitude ?? null,
			problem: order.problem_description ?? null,
		});
	};

	const handlePhonePress = () => {
		if (!phone) return;
		void Linking.openURL(`tel:${phone}`);
	};

	return (
		<View style={{ gap: space[3] }}>
			<PressableScale
				onPress={handleIdentityPress}
				accessibilityRole="button"
				accessibilityLabel={t("detail.a11y.openInfo", {
					name: counterpartyName,
				})}
			>
				<OrderIdentityRow
					name={counterpartyName}
					imageUrl={counterpartyImage}
					initials={initials}
					avatarColor={avatarColor}
					roleLabel={
						isUserViewer
							? t("card.technicianFallback")
							: t("card.customerFallback")
					}
					ratingTechnicianId={
						isUserViewer && counterpartyId ? counterpartyId : null
					}
					showChevron
				/>
			</PressableScale>

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
						{t("detail.info.service")}
					</Text>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: space[2],
						}}
					>
						<CategoryIcon
							size={spacing.icon.caption}
							color={Colors.primary}
							strokeWidth={2.2}
						/>
						<Text
							variant="bodySm"
							style={{ color: themeColors.textPrimary, flex: 1 }}
							numberOfLines={1}
						>
							{serviceName || "—"}
						</Text>
					</View>
				</View>
				<View style={{ flex: 1, gap: space[1] }}>
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						{t("detail.info.scheduled")}
					</Text>
					<Text
						variant="bodySm"
						style={{ color: themeColors.textPrimary }}
						numberOfLines={1}
					>
						{scheduled ?? t("detail.info.flexible")}
					</Text>
				</View>
			</View>

			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: space[2],
					flexWrap: "wrap",
				}}
			>
				{order.payment_method ? (
					<PaymentMethodBadge method={order.payment_method} />
				) : null}
				{phone ? (
					<PressableScale
						onPress={handlePhonePress}
						accessibilityRole="button"
						accessibilityLabel={t("detail.a11y.call", { phone })}
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
							}}
						>
							<Phone
								size={spacing.icon.caption}
								color={themeColors.primary}
								strokeWidth={2.4}
							/>
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
			</View>

			{isUserViewer ? (
				<TechnicianProfileSheet ref={techSheetRef} />
			) : (
				<CustomerActionsSheet ref={customerSheetRef} />
			)}
		</View>
	);
}
