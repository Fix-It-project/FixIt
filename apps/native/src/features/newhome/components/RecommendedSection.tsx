import { router } from "expo-router";
import {
	BriefcaseBusiness,
	ClipboardList,
	MapPin,
	Star,
} from "lucide-react-native";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { formatRating } from "@/src/constants/format";
import { translateCategoryLabel } from "@/src/features/categories/constants/categories";
import { InitialsAvatar } from "@/src/features/newhome/components/InitialsAvatar";
import { useRecommendedTechnicians } from "@/src/features/newhome/hooks/useRecommendedTechnicians";
import { useTechnicianProfileQuery } from "@/src/features/technicians/hooks/useTechnicianProfileQuery";
import type { RecommendedTechnicianApi } from "@/src/features/technicians/schemas/response.schema";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES } from "@/src/lib/navigation/routes";

const SKELETON_KEYS = ["tr-sk-1", "tr-sk-2", "tr-sk-3"];

function formatDistance(distanceKm: number | null, fallback: string): string {
	return distanceKm == null ? fallback : `${distanceKm.toFixed(1)} km`;
}

function formatCount(value: number | undefined): string {
	return value == null ? "—" : value.toLocaleString();
}

interface RecommendedTechnicianCardProps {
	readonly tech: RecommendedTechnicianApi;
	readonly categoryName: string;
	readonly cardWidth: number;
	readonly onOpenProfile: (technicianId: string, initials: string) => void;
}

function RecommendedTechnicianCard({
	tech,
	categoryName,
	cardWidth,
	onOpenProfile,
}: RecommendedTechnicianCardProps) {
	const t = useThemeColors();
	const { t: tr } = useTranslation("home");
	const { data: profile } = useTechnicianProfileQuery(tech.technician_id);
	const name = profile?.name ?? tech.name;
	const initials = getPfpInitialsFallback(name);
	const description =
		profile?.description?.trim() || tr("technicianDescriptionFallback");
	const hasRating =
		profile?.avg_rating !== null &&
		profile?.avg_rating !== undefined &&
		(profile?.review_count ?? 0) > 0;
	const totalBookings =
		profile != null
			? tr("totalJobs", { total: formatCount(profile.totalBookings) })
			: null;

	function openDetail() {
		const route = ROUTES.user.technicianDetail(tech.technician_id);
		router.push({
			...route,
			params: {
				...route.params,
				technicianName: name,
				initials,
				categoryName,
				distanceKm:
					tech.distance_km != null ? tech.distance_km.toFixed(1) : undefined,
			},
		});
	}

	return (
		<Card
			className="p-card"
			style={{
				width: cardWidth,
				minHeight: 184,
				gap: 8,
			}}
		>
			<PressableScale
				pressedScale={0.985}
				onPress={openDetail}
				style={{ gap: 8, flex: 1 }}
				accessibilityRole="button"
				accessibilityLabel={`Book ${name}`}
			>
				<View className="flex-row items-center gap-stack-sm">
					<PressableScale
						pressedScale={0.94}
						onPress={(event) => {
							event.stopPropagation();
							onOpenProfile(tech.technician_id, initials);
						}}
						accessibilityRole="button"
						accessibilityLabel={`Open ${name} profile`}
					>
						<InitialsAvatar
							name={name}
							imageUrl={profile?.profilePicture ?? null}
							className="size-[72px]"
							textClassName="font-bold text-primary-foreground"
							textStyle={{ fontSize: 24, lineHeight: 28 }}
						/>
					</PressableScale>

					<View style={{ flex: 1, minWidth: 0 }}>
						<View className="min-w-0 flex-1">
							<Text
								variant="label"
								className="font-bold text-foreground"
								numberOfLines={1}
							>
								{name}
							</Text>
							{/* rating sits directly under the name */}
							<View className="mt-[2px] flex-row items-center gap-stack-xs">
								<Icon
									as={Star}
									size={12}
									color={t.ratingDefault}
									fill={hasRating ? t.ratingDefault : "transparent"}
								/>
								<Text variant="caption" className="font-bold text-foreground">
									{hasRating
										? formatRating(profile?.avg_rating ?? 0)
										: tr("newTech")}
								</Text>
							</View>
							<View className="mt-[2px] flex-row items-center gap-stack-xs">
								<Icon
									as={ClipboardList}
									size={12}
									color={t.textSecondary}
									strokeWidth={2}
								/>
								<Text
									variant="caption"
									className="min-w-0 flex-1 text-content-secondary"
									numberOfLines={1}
								>
									{categoryName}
								</Text>
							</View>
							<Text
								variant="caption"
								className="mt-[2px] text-content-secondary"
								numberOfLines={2}
							>
								{description}
							</Text>
						</View>
					</View>
				</View>

				<View className="flex-row items-center gap-stack-md">
					<View className="flex-row items-center gap-stack-xs">
						<Icon as={MapPin} size={14} color={t.textSecondary} />
						<Text
							variant="caption"
							className="text-content-muted"
							numberOfLines={1}
						>
							{formatDistance(
								tech.distance_km ?? null,
								tr("distanceUnavailable"),
							)}
						</Text>
					</View>
					{totalBookings ? (
						<View className="flex-row items-center gap-stack-xs">
							<Icon
								as={BriefcaseBusiness}
								size={14}
								color={t.textSecondary}
								strokeWidth={2}
							/>
							<Text
								variant="caption"
								className="text-content-muted"
								numberOfLines={1}
							>
								{totalBookings}
							</Text>
						</View>
					) : null}
				</View>
			</PressableScale>

			<Button size="sm" variant="primary" fullWidth onPress={openDetail}>
				{tr("book")}
			</Button>
		</Card>
	);
}

export function RecommendedSection() {
	const { t: tr } = useTranslation("home");
	const { t: tc } = useTranslation("categories");
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const { width } = useWindowDimensions();
	const cardWidth = Math.min(width - 64, 304);

	const { technicians, isLoading, isError } = useRecommendedTechnicians();

	if (!isLoading && !isError && technicians.length === 0) {
		return null;
	}

	return (
		<View>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					paddingHorizontal: 20,
					marginBottom: 10,
				}}
			>
				<Text variant="h3" className="text-foreground">
					{tr("recommended")}
				</Text>
				<PressableScale onPress={() => router.push(ROUTES.user.technicians)}>
					<Text variant="buttonMd" className="text-app-primary">
						{tr("viewAll")}
					</Text>
				</PressableScale>
			</View>

			{isLoading && (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
				>
					{SKELETON_KEYS.map((key) => (
						<Skeleton
							key={key}
							className="rounded-card"
							style={{ width: cardWidth, height: 184 }}
						/>
					))}
				</ScrollView>
			)}

			{isError && !isLoading && (
				<Text variant="bodySm" className="px-5 text-center text-danger">
					{tr("couldNotLoadRecommended")}
				</Text>
			)}

			{!isLoading && !isError && technicians.length > 0 && (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					decelerationRate="fast"
					snapToInterval={cardWidth + 12}
					contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
				>
					{technicians.slice(0, 8).map((tech) => {
						const categoryName =
							translateCategoryLabel(tc, null, tech.category) ||
							tr("technicianFallback");

						return (
							<RecommendedTechnicianCard
								key={tech.technician_id}
								tech={tech}
								categoryName={categoryName}
								cardWidth={cardWidth}
								onOpenProfile={(technicianId, initials) => {
									profileSheetRef.current?.open(technicianId, initials);
								}}
							/>
						);
					})}
				</ScrollView>
			)}

			<TechnicianProfileSheet ref={profileSheetRef} />
		</View>
	);
}
