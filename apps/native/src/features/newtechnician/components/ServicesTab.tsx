import { Check } from "lucide-react-native";
import { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useTechnicianServicesQuery } from "@/src/features/technicians/hooks/useTechnicianServicesQuery";
import type { TechnicianService } from "@/src/features/technicians/schemas/response.schema";

function formatPriceRange(min: number | null, max: number | null): string {
	if (min == null && max == null) return "Price on request";
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
	const themeColors = useThemeColors();
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
					Couldn't load services
				</Text>
				<Text variant="bodySm" className="mt-stack-xs text-content-muted">
					Please try again in a moment.
				</Text>
			</View>
		);
	}

	if (services.length === 0) {
		return (
			<View className="items-center py-section-y">
				<Text variant="buttonLg" className="text-content">
					No services listed
				</Text>
				<Text
					variant="bodySm"
					className="mt-stack-xs text-center text-content-muted"
				>
					This technician hasn't published any services yet.
				</Text>
			</View>
		);
	}

	return (
		<View className="gap-stack-sm py-stack-md">
			{services.map((service) => {
				const isSelected = service.id === selectedServiceId;
				return (
					<TouchableOpacity
						key={service.id}
						onPress={() => onSelect(service)}
						activeOpacity={0.85}
						accessibilityRole="radio"
						accessibilityState={{ selected: isSelected }}
						className="flex-row items-center rounded-card border bg-card p-card"
						style={{
							borderColor: isSelected
								? themeColors.primary
								: themeColors.borderDefault,
							borderWidth: isSelected ? 2 : 1,
						}}
					>
						<View className="mr-stack-md flex-1">
							<Text
								variant="buttonLg"
								className="font-bold text-content"
								numberOfLines={1}
							>
								{service.name}
							</Text>
							{service.description ? (
								<Text
									variant="caption"
									className="mt-stack-xs text-content-muted"
									numberOfLines={2}
								>
									{service.description}
								</Text>
							) : null}
							<Text
								variant="buttonMd"
								className="mt-stack-sm font-bold text-app-primary"
							>
								{formatPriceRange(service.min_price, service.max_price)}
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
					</TouchableOpacity>
				);
			})}
		</View>
	);
}
