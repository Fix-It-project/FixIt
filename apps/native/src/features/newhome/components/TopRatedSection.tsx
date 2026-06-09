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
import { getCategoryMeta } from "@/src/features/categories/constants/categories";
import { useCategoriesQuery } from "@/src/features/categories/hooks/useCategoriesQuery";
import { InitialsAvatar } from "@/src/features/newhome/components/InitialsAvatar";
import { useTopRatedTechnicians } from "@/src/features/newhome/hooks/useTopRatedTechnicians";
import { useTechnicianProfileQuery } from "@/src/features/technicians/hooks/useTechnicianProfileQuery";
import type { TechnicianListItem } from "@/src/features/technicians/schemas/response.schema";
import { ROUTES } from "@/src/lib/navigation/routes";

const SKELETON_KEYS = ["tr-sk-1", "tr-sk-2", "tr-sk-3"];

function formatDistance(distanceKm: number | null, fallback: string): string {
	return distanceKm == null ? fallback : `${distanceKm.toFixed(1)} km`;
}

function formatCount(value: number | undefined): string {
	return value == null ? "—" : value.toLocaleString();
}

interface TopRatedTechnicianCardProps {
	readonly tech: TechnicianListItem;
	readonly categoryName: string;
	readonly cardWidth: number;
	readonly onOpenProfile: (technicianId: string, initials: string) => void;
}

function TopRatedTechnicianCard({
	tech,
	categoryName,
	cardWidth,
	onOpenProfile,
}: TopRatedTechnicianCardProps) {
	const t = useThemeColors();
	const { t: tr } = useTranslation("home");
	const { data: profile } = useTechnicianProfileQuery(tech.id);
	const initials = (
		(tech.first_name[0] ?? "") + (tech.last_name[0] ?? "")
	).toUpperCase();
	const name = `${tech.first_name} ${tech.last_name}`;
	const categoryMeta = getCategoryMeta(tech.category_id);
	const CategoryIcon = categoryMeta?.icon ?? ClipboardList;
	const description =
		tech.description?.trim() ||
		profile?.description?.trim() ||
		tr("technicianDescriptionFallback");
	const hasRating = tech.avg_rating !== null && tech.review_count > 0;
	const totalBookings =
		profile != null
			? tr("totalJobs", { total: formatCount(profile.totalBookings) })
			: null;

	function openDetail() {
		const route = ROUTES.user.technicianDetail(tech.id);
		router.push({
			...route,
			params: {
				...route.params,
				technicianName: name,
				initials,
				categoryId: tech.category_id,
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
							onOpenProfile(tech.id, initials);
						}}
						accessibilityRole="button"
						accessibilityLabel={`Open ${name} profile`}
					>
						<InitialsAvatar
							name={name}
							imageUrl={tech.profile_image}
							className="size-[72px]"
							textClassName="font-bold text-primary-foreground"
							textStyle={{ fontSize: 24, lineHeight: 28 }}
						/>
					</PressableScale>

					<View style={{ flex: 1, minWidth: 0 }}>
						<View className="min-w-0 flex-row items-start justify-between gap-stack-xs">
							<View className="min-w-0 flex-1">
								<Text
									variant="label"
									className="font-bold text-foreground"
									numberOfLines={1}
								>
									{name}
								</Text>
								<View className="mt-[2px] flex-row items-center gap-stack-xs">
									<Icon
										as={CategoryIcon}
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

							<View className="flex-row items-center gap-stack-xs">
								<Icon
									as={Star}
									size={12}
									color={t.ratingDefault}
									fill={hasRating ? t.ratingDefault : "transparent"}
								/>
								<Text variant="caption" className="font-bold text-foreground">
									{hasRating
										? formatRating(tech.avg_rating ?? 0)
										: tr("newTech")}
								</Text>
							</View>
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
							{formatDistance(tech.distance_km, tr("distanceUnavailable"))}
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

export function TopRatedSection() {
	const { t: tr } = useTranslation("home");
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const { width } = useWindowDimensions();
	const cardWidth = Math.min(width - 64, 304);

	const { technicians, isLoading, isError } = useTopRatedTechnicians();
	const { data: categories } = useCategoriesQuery();

	const catMap = new Map<string, string>(
		(categories ?? []).map((c) => [c.id, c.name]),
	);

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
					{tr("topRated")}
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
					{tr("couldNotLoadTopRated")}
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
							catMap.get(tech.category_id) ?? tr("technicianFallback");

						return (
							<TopRatedTechnicianCard
								key={tech.id}
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
