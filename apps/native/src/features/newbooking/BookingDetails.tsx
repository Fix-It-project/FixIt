import { router, useLocalSearchParams } from "expo-router";
import {
	CalendarClock,
	type LucideIcon,
	MapPin,
	Star,
	Wrench,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { Button } from "@/src/components/ui/button";
import { confirm } from "@/src/components/ui/dialog";
import { Text } from "@/src/components/ui/text";
import {
	DUR_SLIDE_UP,
	EASE_OUT_QUART,
	ENTRANCE_STAGGER,
} from "@/src/constants/animation";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import {
	useCreateBookingMutation,
	useInspectionFeePreview,
} from "@/src/features/booking-orders/hooks";
import { bookingSchema } from "@/src/features/booking-orders/schemas/form.schema";
import { getDateLocale } from "@/src/features/booking-orders/utils/booking-helpers";
import {
	BOOKING_SLOT_OPTIONS,
	type BookingSlotHour,
	buildCairoSlotIsoUtc,
} from "@/src/features/booking-orders/utils/fixed-slots";
import { translateServiceName } from "@/src/features/categories/constants/categories";
import TechnicianAvatar from "@/src/features/technicians/components/user/TechnicianAvatar";
import { useTechnicianProfileQuery } from "@/src/features/technicians/hooks/useTechnicianProfileQuery";
import { useDebounce } from "@/src/hooks/useDebounce";
import { showError } from "@/src/lib/errors";
import { formatAddress } from "@/src/lib/helpers/format-address";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";
import {
	type AttachmentInfo,
	BookingProblemCard,
} from "./components/BookingProblemCard";
import {
	type PaymentMethodValue,
	PaymentMethodSegmentedControl,
} from "./components/PaymentMethodSegmentedControl";

function getStringParam(value: string | string[] | undefined): string {
	if (Array.isArray(value)) return value[0] ?? "";
	return value ?? "";
}

interface SummaryRowProps {
	readonly icon: LucideIcon;
	readonly label: string;
	readonly value: string;
	readonly valueLines?: number;
}

function SummaryRow({
	icon: Icon,
	label,
	value,
	valueLines = 2,
}: SummaryRowProps) {
	const themeColors = useThemeColors();
	return (
		<View className="flex-row items-start gap-stack-md py-stack-xs">
			<View className="mt-px h-control-icon-box-sm w-control-icon-box-sm items-center justify-center">
				<Icon
					size={spacing.icon.sm}
					color={themeColors.primary}
					strokeWidth={2}
				/>
			</View>
			<View className="min-w-0 flex-1">
				<Text variant="buttonMd" className="font-semibold text-content">
					{label}
				</Text>
				<Text
					variant="bodySm"
					className="mt-px text-content"
					numberOfLines={valueLines}
				>
					{value}
				</Text>
			</View>
		</View>
	);
}

function formatRating(value: number | null | undefined): string {
	if (typeof value !== "number" || Number.isNaN(value)) return "";
	return value.toFixed(1);
}

function formatDateLabel(value: string, language?: string): string {
	if (!value) return "";
	const parsed = new Date(`${value}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleDateString(getDateLocale(language), {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export default function BookingDetails() {
	const { t, i18n } = useTranslation("booking");
	const { t: tc } = useTranslation("categories");
	const { t: tOrders } = useTranslation("orders");
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const params = useLocalSearchParams<{
		technicianId: string | string[];
		technicianName?: string | string[];
		serviceId?: string | string[];
		serviceName?: string | string[];
		categoryId?: string | string[];
		categoryName?: string | string[];
		selectedDate?: string | string[];
		selectedHour?: string | string[];
	}>();

	const technicianId = getStringParam(params.technicianId);
	const technicianNameParam = getStringParam(params.technicianName);
	const serviceId = getStringParam(params.serviceId);
	const serviceName = translateServiceName(
		tc,
		serviceId,
		getStringParam(params.serviceName),
	);
	const selectedDate = getStringParam(params.selectedDate);
	const selectedHourRaw = getStringParam(params.selectedHour);
	const selectedHour = selectedHourRaw ? Number(selectedHourRaw) : null;

	const [description, setDescription] = useState("");
	const [attachment, setAttachment] = useState<AttachmentInfo | null>(null);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue | null>(
		null,
	);

	const {
		data: addresses,
		isError: isAddressError,
		isLoading: isLoadingAddresses,
	} = useAddressesQuery();
	const { data: technicianProfile } = useTechnicianProfileQuery(
		technicianId || null,
	);
	const { mutateAsync: createBooking, isPending } = useCreateBookingMutation();

	const selectedAddress =
		addresses?.find((address) => address.is_active) ?? addresses?.[0];
	const inspectionFeeQuery = useInspectionFeePreview(
		technicianId,
		selectedAddress?.id,
	);
	const selectedTimeLabel = useMemo(
		() =>
			BOOKING_SLOT_OPTIONS.find((slot) => slot.hour === selectedHour)?.label ??
			"",
		[selectedHour],
	);
	const technicianName =
		technicianProfile?.name || technicianNameParam || t("technicianFallback");
	const technicianDescription =
		technicianProfile?.description || t("technicianDescriptionFallback");
	const technicianRating = formatRating(technicianProfile?.avg_rating);
	const reviewCount = technicianProfile?.review_count ?? 0;
	const completedOrders = technicianProfile?.completedOrders ?? 0;
	const appointmentLabel =
		selectedDate && selectedTimeLabel
			? t("appointmentAt", {
					date: formatDateLabel(selectedDate, i18n.language),
					time: selectedTimeLabel,
				})
			: t("noDateTimeSelected");
	const addressLabel = isLoadingAddresses
		? t("loadingLocation")
		: formatAddress(selectedAddress);
	const initials = getPfpInitialsFallback(technicianName);

	const fallbackRoute = ROUTES.user.bookingRoot(technicianId);
	const goBack = useSafeBack(fallbackRoute);
	const canConfirm =
		!!technicianId &&
		!!serviceId &&
		!!selectedDate &&
		selectedHour !== null &&
		!Number.isNaN(selectedHour) &&
		!!inspectionFeeQuery.data &&
		paymentMethod !== null &&
		!isPending &&
		!isLoadingAddresses &&
		!inspectionFeeQuery.isLoading &&
		!inspectionFeeQuery.isError;
	const entering = (index: number) =>
		reducedMotion
			? undefined
			: FadeInDown.delay(index * ENTRANCE_STAGGER)
					.duration(DUR_SLIDE_UP)
					.easing(EASE_OUT_QUART);

	const handleConfirm = useDebounce(async () => {
		if (
			!technicianId ||
			!serviceId ||
			!selectedDate ||
			selectedHour === null ||
			Number.isNaN(selectedHour)
		) {
			Toast.show({ type: "info", text1: t("toast.pickDateTime") });
			return;
		}
		if (isAddressError) {
			Toast.show({ type: "info", text1: t("toast.locationError") });
			return;
		}
		if (!selectedAddress) {
			Toast.show({ type: "info", text1: t("toast.addLocation") });
			return;
		}
		if (!paymentMethod) {
			Toast.show({ type: "info", text1: t("toast.pickPaymentMethod") });
			return;
		}

		try {
			const scheduledStartAt = buildCairoSlotIsoUtc(
				selectedDate,
				selectedHour as BookingSlotHour,
			);
			const payload = bookingSchema.parse({
				technician_id: technicianId,
				service_id: serviceId,
				scheduled_date: selectedDate,
				scheduled_start_at: scheduledStartAt,
				payment_method: paymentMethod,
				problem_description: description || undefined,
				destination_address_id: selectedAddress.id,
			});
			await createBooking({
				payload,
				attachment: attachment ?? undefined,
			});
			// Confirm dialog appears BEFORE any navigation; only OK navigates home.
			await confirm({
				title: tOrders("detail.placed.title"),
				description: tOrders("detail.placed.subtitle"),
				primary: { label: tOrders("detail.placed.ok") },
				dismissible: false,
			});
			router.dismissAll();
			router.replace(ROUTES.user.home);
		} catch (error: unknown) {
			showError(error);
		}
	}, 600);

	return (
		<ScreenSafeAreaView className="flex-1 bg-app-primary" edges={["top"]}>
			<ScreenStatusBar variant="blue" />
			<View className="flex-1 bg-surface">
				<PageHeader
					title={t("detailsTitle")}
					subtitle={serviceName || undefined}
					variant="app-primary"
					onBackPress={goBack}
				/>

				<KeyboardAwareScrollView
					className="flex-1"
					contentContainerStyle={{
						padding: 20,
						paddingBottom: spacing.screen.scrollBottomInset,
					}}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="interactive"
					showsVerticalScrollIndicator={false}
					bottomOffset={spacing.stack.xl}
				>
					<Animated.View
						entering={entering(0)}
						className="mb-card flex-row items-center gap-stack-md border-edge border-b pb-card"
					>
						<TechnicianAvatar
							id={technicianId || technicianName}
							initials={initials}
							imageUrl={technicianProfile?.profilePicture}
							size="lg"
						/>
						<View className="min-w-0 flex-1">
							<View className="flex-row items-center">
								<Text
									variant="buttonLg"
									className="font-semibold text-content"
									numberOfLines={1}
								>
									{technicianName}
								</Text>
								<View className="ml-stack-sm flex-row items-center gap-stack-xs">
									<Star
										size={spacing.icon.xs}
										color={themeColors.ratingDefault}
										fill={themeColors.ratingDefault}
									/>
									<Text
										variant="caption"
										className="font-semibold text-content"
									>
										{technicianRating || t("ratingNew")}
									</Text>
									<Text variant="caption" className="text-content-muted">
										({reviewCount})
									</Text>
								</View>
							</View>
							<Text
								variant="bodySm"
								className="mt-stack-xs text-content-muted"
								numberOfLines={2}
							>
								{technicianDescription}
							</Text>
							<Text
								variant="caption"
								className="mt-stack-xs text-content-muted"
							>
								{t("completedJobs", { count: completedOrders })}
							</Text>
						</View>
					</Animated.View>

					<Animated.View
						entering={entering(1)}
						className="mb-card gap-stack-sm"
					>
						<SummaryRow
							icon={Wrench}
							label={t("service")}
							value={serviceName || t("serviceNotSelected")}
						/>
						<SummaryRow
							icon={CalendarClock}
							label={t("schedule")}
							value={appointmentLabel}
						/>
						<SummaryRow
							icon={MapPin}
							label={t("location")}
							value={addressLabel}
							valueLines={3}
						/>
					</Animated.View>

					<Animated.View entering={entering(2)}>
						<BookingProblemCard
							description={description}
							onDescriptionChange={setDescription}
							attachment={attachment}
							onAttachmentChange={setAttachment}
						/>
					</Animated.View>

					<Animated.View entering={entering(3)} className="mt-card gap-stack-sm">
						<Text variant="buttonMd" className="font-semibold text-content">
							{t("payment.title")}
						</Text>
						<PaymentMethodSegmentedControl
							value={paymentMethod}
							onChange={setPaymentMethod}
						/>
						<Text variant="caption" className="text-content-muted">
							{paymentMethod === "card"
								? t("payment.cardHint")
								: t("payment.cashHint")}
						</Text>
					</Animated.View>

					<Animated.View entering={entering(4)} className="mt-card">
						<Button
							disabled={!canConfirm}
							onPress={handleConfirm}
							className="w-full rounded-button"
							testID="confirm-booking"
						>
							<Text variant="buttonLg" className="text-surface-on-primary">
								{isPending ? t("confirming") : t("confirm")}
							</Text>
						</Button>
					</Animated.View>
				</KeyboardAwareScrollView>
			</View>
		</ScreenSafeAreaView>
	);
}
