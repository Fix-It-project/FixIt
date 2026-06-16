import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import {
	DUR_SLIDE_UP,
	EASE_OUT_QUART,
	ENTRANCE_STAGGER,
} from "@/src/constants/animation";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { RequestStatusChip } from "@/src/features/technicians/components/RequestStatusChip";
import { ServiceListItem } from "@/src/features/technicians/components/ServiceListItem";
import { ServiceRequestForm } from "@/src/features/technicians/components/ServiceRequestForm";
import { useMyServiceRequestsQuery } from "@/src/features/technicians/hooks/useCustomServiceRequests";
import { useTechnicianServicesQuery } from "@/src/features/technicians/hooks/useTechnicianServicesQuery";
import type { ServiceRequestStatus } from "@/src/features/technicians/schemas/custom-service.schema";
import { cn } from "@/src/lib/utils";
import { useAuthStore } from "@/src/stores/auth-store";

const SKELETON_KEYS = ["s1", "s2", "s3"] as const;

function formatPriceRange(
	min: number | null,
	max: number | null,
	onRequestLabel: string,
): string {
	if (min == null && max == null) return onRequestLabel;
	if (min != null && max != null && min !== max) {
		return `EGP ${min.toLocaleString()} – ${max.toLocaleString()}`;
	}
	const value = (min ?? max) as number;
	return `EGP ${value.toLocaleString()}`;
}

/** Quiet small-caps section label — hierarchy by weight, not boxes. */
function SectionHeader({ label }: { label: string }) {
	return (
		<Text
			variant="caption"
			className="font-bold text-content-muted uppercase tracking-widest"
		>
			{label}
		</Text>
	);
}

export default function TechnicianServicesScreen() {
	const { t } = useTranslation("settings");
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();

	const technicianId = useAuthStore((s) => s.user?.id) ?? null;
	const {
		data: services = [],
		isLoading: servicesLoading,
		isError: servicesError,
	} = useTechnicianServicesQuery(technicianId);
	const { data: requests = [], isLoading: requestsLoading } =
		useMyServiceRequestsQuery(technicianId);

	const statusLabel: Record<ServiceRequestStatus, string> = {
		pending: t("services.status.inReview"),
		approved: t("services.status.approved"),
		rejected: t("services.status.rejected"),
	};

	const fadeDown = (delay: number) =>
		reducedMotion
			? undefined
			: FadeInDown.delay(delay).duration(DUR_SLIDE_UP).easing(EASE_OUT_QUART);

	const showRequests = requestsLoading || requests.length > 0;

	return (
		<ScreenSafeAreaView
			className="flex-1"
			edges={["bottom"]}
			style={{ backgroundColor: themeColors.surfaceBase }}
		>
			<KeyboardAwareScrollView
				style={{ flex: 1, paddingHorizontal: spacing.screen.paddingX }}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="interactive"
				contentContainerStyle={{
					gap: spacing.stack.xl,
					paddingVertical: spacing.stack.lg,
					paddingBottom: spacing.stack.xl + spacing.stack.sm,
				}}
				bottomOffset={20}
			>
				{/* Screen header */}
				<Animated.View entering={fadeDown(0)} className="gap-stack-xs">
					<Text variant="h2" className="text-content">
						{t("services.title")}
					</Text>
					<Text variant="bodySm" className="text-content-secondary">
						{t("services.subtitle")}
					</Text>
				</Animated.View>

				{/* Section 1 — live, bookable services */}
				<Animated.View
					entering={fadeDown(ENTRANCE_STAGGER)}
					className="gap-stack-sm"
				>
					<SectionHeader label={t("services.liveHeader")} />
					{servicesLoading ? (
						<View className="gap-stack-sm">
							{SKELETON_KEYS.map((key) => (
								<Skeleton key={key} className="h-14 w-full rounded-input" />
							))}
						</View>
					) : servicesError ? (
						<Text variant="bodySm" className="text-content-muted">
							{t("services.loadError")}
						</Text>
					) : services.length === 0 ? (
						<Text variant="bodySm" className="text-content-muted">
							{t("services.empty")}
						</Text>
					) : (
						<View>
							{services.map((service, index) => (
								<View
									key={service.id}
									className={cn(index > 0 && "border-edge border-t")}
								>
									<ServiceListItem
										name={service.name}
										description={service.description}
										priceLabel={formatPriceRange(
											service.min_price,
											service.max_price,
											t("services.priceOnRequest"),
										)}
									/>
								</View>
							))}
						</View>
					)}
				</Animated.View>

				{/* Section 2 — review pipeline (pending / approved / rejected) */}
				{showRequests ? (
					<Animated.View
						entering={fadeDown(ENTRANCE_STAGGER * 2)}
						className="gap-stack-sm"
					>
						<SectionHeader label={t("services.requestsHeader")} />
						{requestsLoading ? (
							<View className="gap-stack-sm">
								{SKELETON_KEYS.map((key) => (
									<Skeleton key={key} className="h-16 w-full rounded-input" />
								))}
							</View>
						) : (
							<View>
								{requests.map((req, index) => (
									<View
										key={req.id}
										className={cn(
											"py-stack-sm",
											index > 0 && "border-edge border-t",
										)}
									>
										<View className="flex-row items-start justify-between gap-stack-md">
											<View className="min-w-0 flex-1">
												<Text
													variant="body"
													className="font-semibold text-content"
													numberOfLines={1}
												>
													{req.name}
												</Text>
												<Text
													variant="caption"
													className="mt-0.5 text-content-muted"
												>
													{formatPriceRange(
														req.min_price,
														req.max_price,
														t("services.priceOnRequest"),
													)}
												</Text>
											</View>
											<RequestStatusChip
												status={req.status}
												label={statusLabel[req.status]}
											/>
										</View>
										{req.status === "rejected" && req.reject_reason ? (
											<View
												className="mt-stack-xs rounded-input px-card py-stack-xs"
												style={{ backgroundColor: themeColors.dangerLight }}
											>
												<Text
													variant="caption"
													className="font-semibold"
													style={{ color: themeColors.danger }}
												>
													{t("services.rejectReasonLabel")}
												</Text>
												<Text
													variant="caption"
													className="mt-0.5 text-content-secondary"
												>
													{req.reject_reason}
												</Text>
											</View>
										) : null}
									</View>
								))}
							</View>
						)}
					</Animated.View>
				) : null}

				{/* Section 3 — request a new service */}
				<Animated.View entering={fadeDown(ENTRANCE_STAGGER * 3)}>
					<ServiceRequestForm technicianId={technicianId} />
				</Animated.View>
			</KeyboardAwareScrollView>
		</ScreenSafeAreaView>
	);
}
