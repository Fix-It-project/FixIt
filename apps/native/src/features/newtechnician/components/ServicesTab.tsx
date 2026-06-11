import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import {
	DUR_SLIDE_UP,
	EASE_OUT_QUART,
	ENTRANCE_STAGGER,
} from "@/src/constants/animation";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import {
	translateServiceDescription,
	translateServiceName,
} from "@/src/features/categories/constants/categories";
import { useTechnicianServicesQuery } from "@/src/features/technicians/hooks/useTechnicianServicesQuery";
import type { TechnicianService } from "@/src/features/technicians/schemas/response.schema";
import { Check } from "lucide-react-native";
import { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";

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

const SKELETON_KEYS = ["k1", "k2", "k3"] as const;

interface ServicesTabProps {
	readonly technicianId: string;
	readonly selectedServiceId: string | null;
	readonly onSelect: (service: TechnicianService) => void;
	/** Rebook flow: preselect this service if the technician still offers it. */
	readonly preselectServiceId?: string;
}

export function ServicesTab({
	technicianId,
	selectedServiceId,
	onSelect,
	preselectServiceId,
}: ServicesTabProps) {
	const { t } = useTranslation("technicians");
	const { t: tc } = useTranslation("categories");
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const {
		data: services = [],
		isLoading,
		isError,
	} = useTechnicianServicesQuery(technicianId);

	// Rebook: preselect once, only if the technician still offers that service.
	useEffect(() => {
		if (selectedServiceId || !preselectServiceId) return;
		const match = services.find((s) => s.id === preselectServiceId);
		if (match) onSelect(match);
	}, [services, preselectServiceId, selectedServiceId, onSelect]);

	if (isLoading) {
		return (
			<View className="gap-stack-sm py-stack-md">
				{SKELETON_KEYS.map((key) => (
					<Skeleton key={key} className="h-20 w-full rounded-card" />
				))}
			</View>
		);
	}

	if (isError) {
		return (
			<View className="items-center py-section-y">
				<Text variant="buttonLg" className="text-content">
					{t("services.loadError")}
				</Text>
				<Text variant="bodySm" className="mt-stack-xs text-content-muted">
					{t("services.loadErrorBody")}
				</Text>
			</View>
		);
	}

	if (services.length === 0) {
		return (
			<View className="items-center py-section-y">
				<Text variant="buttonLg" className="text-content">
					{t("services.emptyTitle")}
				</Text>
				<Text
					variant="bodySm"
					className="mt-stack-xs text-center text-content-muted"
				>
					{t("services.emptyBody")}
				</Text>
			</View>
		);
	}

	return (
		<View className="py-stack-md">
			<View className="gap-stack-xs rounded-card bg-card p-stack-xs">
				{services.map((service, index) => {
					const isSelected = service.id === selectedServiceId;
					const serviceName = translateServiceName(
						tc,
						service.id,
						service.name,
					);
					const serviceDescription = translateServiceDescription(
						tc,
						service.id,
						service.description,
					);
					return (
						<Fragment key={service.id}>
							<Animated.View
								entering={
									reducedMotion
										? undefined
										: FadeInDown.delay(index * ENTRANCE_STAGGER)
												.duration(DUR_SLIDE_UP)
												.easing(EASE_OUT_QUART)
								}
							>
								<PressableScale
									onPress={() => onSelect(service)}
									pressedScale={0.985}
									accessibilityRole="radio"
									accessibilityState={{ selected: isSelected }}
									testID="service-option"
									className="flex-row items-center rounded-input bg-card p-card"
									style={{
										backgroundColor: isSelected
											? themeColors.surfaceElevated
											: "transparent",
									}}
								>
									<View className="mr-stack-md flex-1">
										<Text
											variant="buttonLg"
											className="font-bold text-content"
											numberOfLines={1}
										>
											{serviceName}
										</Text>
										{serviceDescription ? (
											<Text
												variant="caption"
												className="mt-stack-xs text-content-muted"
												numberOfLines={2}
											>
												{serviceDescription}
											</Text>
										) : null}
										<Text
											variant="buttonMd"
											className="mt-stack-sm font-bold text-app-primary"
										>
											{formatPriceRange(
												service.min_price,
												service.max_price,
												t("services.priceOnRequest"),
											)}
										</Text>
									</View>

									{/* Radio indicator */}
									<View
										className="h-icon-md w-icon-md items-center justify-center rounded-pill border"
										style={{
											borderColor: isSelected
												? themeColors.primary
												: themeColors.borderDefault,
											backgroundColor: isSelected
												? themeColors.primary
												: "transparent",
										}}
									>
										{isSelected ? (
											<Check
												size={spacing.icon.xs}
												color={themeColors.surfaceOnPrimary}
												strokeWidth={3}
											/>
										) : null}
									</View>
								</PressableScale>
							</Animated.View>
							{index < services.length - 1 ? (
								<View className="mx-stack-sm h-px bg-edge/20" />
							) : null}
						</Fragment>
					);
				})}
			</View>
		</View>
	);
}
