import { router } from "expo-router";
import { MapPin, Star } from "lucide-react-native";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Icon } from "@/src/components/ui/icon";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { formatRating } from "@/src/constants/format";
import { useCategoriesQuery } from "@/src/features/categories/hooks/useCategoriesQuery";
import { InitialsAvatar } from "@/src/features/newhome/components/InitialsAvatar";
import { useTopRatedTechnicians } from "@/src/features/newhome/hooks/useTopRatedTechnicians";
import { ROUTES } from "@/src/lib/navigation/routes";

const SKELETON_KEYS = ["tr-sk-1", "tr-sk-2", "tr-sk-3"];

export function TopRatedSection() {
	const t = useThemeColors();
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
							style={{ width: cardWidth, height: 154 }}
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
						const initials = (
							(tech.first_name[0] ?? "") + (tech.last_name[0] ?? "")
						).toUpperCase();
						const name = `${tech.first_name} ${tech.last_name}`;
						const categoryName =
							catMap.get(tech.category_id) ?? tr("technicianFallback");
						const locationText = [
							tech.city,
							tech.distance_km != null
								? `${tech.distance_km.toFixed(1)} km`
								: null,
						]
							.filter(Boolean)
							.join(" · ");

						return (
							<View
								key={tech.id}
								className="bg-card"
								style={{
									width: cardWidth,
									minHeight: 154,
									borderRadius: 14,
									borderWidth: 1,
									borderColor: t.borderDefault,
									padding: 14,
									justifyContent: "space-between",
									gap: 12,
								}}
							>
								<PressableScale
									pressedScale={0.98}
									onPress={() => {
										profileSheetRef.current?.open(tech.id, initials);
									}}
									style={{
										gap: 12,
									}}
								>
									<View
										style={{
											flexDirection: "row",
											alignItems: "flex-start",
											gap: 11,
										}}
									>
										<InitialsAvatar
											name={name}
											imageUrl={null}
											className="size-11"
										/>
										<View style={{ flex: 1, minWidth: 0, gap: 5 }}>
											<Text
												variant="label"
												className="text-foreground"
												numberOfLines={1}
											>
												{name}
											</Text>
											<Badge
												variant="secondary"
												className="max-w-36 self-start rounded-md"
											>
												<Text variant="caption" numberOfLines={1}>
													{categoryName}
												</Text>
											</Badge>
										</View>
										{tech.avg_rating !== null ? (
											<View
												style={{
													flexDirection: "row",
													alignItems: "center",
													gap: 3,
												}}
											>
												<Icon
													as={Star}
													size={12}
													color={t.ratingDefault}
													fill={t.ratingDefault}
												/>
												<Text variant="caption" className="text-foreground">
													{formatRating(tech.avg_rating)}
												</Text>
											</View>
										) : null}
									</View>

									{locationText ? (
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
												gap: 4,
												minWidth: 0,
											}}
										>
											<Icon
												as={MapPin}
												size={12}
												color={t.textMuted}
												strokeWidth={2}
											/>
											<Text
												variant="caption"
												className="text-muted-foreground"
												numberOfLines={1}
												style={{ flex: 1 }}
											>
												{locationText}
											</Text>
										</View>
									) : null}
								</PressableScale>

								<Button
									size="sm"
									variant="primary"
									fullWidth
									onPress={() => {
										const route = ROUTES.user.technicianDetail(tech.id);
										router.push({
											...route,
											params: {
												...route.params,
												technicianName: name,
												initials,
												categoryId: tech.category_id,
												categoryName,
											},
										});
									}}
									accessibilityLabel={tr("book")}
								>
									{tr("book")}
								</Button>
							</View>
						);
					})}
				</ScrollView>
			)}

			<TechnicianProfileSheet ref={profileSheetRef} />
		</View>
	);
}
