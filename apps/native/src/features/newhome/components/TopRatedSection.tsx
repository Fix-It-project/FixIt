import { router } from "expo-router";
import { Star } from "lucide-react-native";
import { useRef } from "react";
import { View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useCategoriesQuery } from "@/src/features/categories/hooks/useCategoriesQuery";
import { InitialsAvatar } from "@/src/features/newhome/components/InitialsAvatar";
import { useTopRatedTechnicians } from "@/src/features/newhome/hooks/useTopRatedTechnicians";
import { ROUTES } from "@/src/lib/navigation/routes";

const SKELETON_KEYS = ["tr-sk-1", "tr-sk-2", "tr-sk-3"];

export function TopRatedSection() {
	const t = useThemeColors();
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);

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
					Top rated
				</Text>
				<PressableScale onPress={() => router.push(ROUTES.user.technicians)}>
					<Text variant="buttonMd" className="text-app-primary">
						View all
					</Text>
				</PressableScale>
			</View>

			{isLoading && (
				<View style={{ paddingHorizontal: 20, gap: 8 }}>
					{SKELETON_KEYS.map((key) => (
						<Skeleton key={key} className="rounded-xl" style={{ height: 74 }} />
					))}
				</View>
			)}

			{isError && !isLoading && (
				<Text variant="bodySm" className="px-5 text-center text-danger">
					Could not load top rated technicians. Pull to refresh.
				</Text>
			)}

			{!isLoading && !isError && technicians.length > 0 && (
				<View style={{ paddingHorizontal: 20, gap: 8 }}>
					{technicians.slice(0, 3).map((tech) => {
						const initials = (
							(tech.first_name[0] ?? "") + (tech.last_name[0] ?? "")
						).toUpperCase();
						const name = `${tech.first_name} ${tech.last_name}`;
						const categoryName = catMap.get(tech.category_id) ?? "";
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
								className="rounded-[14px] border border-border bg-card"
								style={{
									padding: 12,
									flexDirection: "row",
									alignItems: "center",
									gap: 12,
								}}
							>
								<PressableScale
									pressedScale={0.98}
									onPress={() => {
										profileSheetRef.current?.open(tech.id, initials);
									}}
									style={{
										flex: 1,
										minWidth: 0,
										flexDirection: "row",
										alignItems: "center",
										gap: 10,
									}}
								>
									<View style={{ position: "relative" }}>
										<InitialsAvatar
											name={name}
											imageUrl={null}
											className="size-11"
										/>
										{tech.is_available && (
											<View
												style={{
													position: "absolute",
													bottom: 0,
													right: 0,
													width: 9,
													height: 9,
													borderRadius: 4.5,
													backgroundColor: t.statusOnline,
													borderWidth: 2,
													borderColor: t.surfaceElevated,
												}}
											/>
										)}
									</View>

									<View style={{ flex: 1, minWidth: 0 }}>
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
												gap: 6,
											}}
										>
											<Text
												variant="label"
												className="text-foreground"
												numberOfLines={1}
												style={{ flexShrink: 1 }}
											>
												{name}
											</Text>
											{tech.avg_rating !== null ? (
												<View
													style={{
														flexDirection: "row",
														alignItems: "center",
														gap: 3,
													}}
												>
													<Star
														size={12}
														color={t.ratingDefault}
														fill={t.ratingDefault}
													/>
													<Text variant="caption" className="text-foreground">
														{tech.avg_rating.toFixed(1)}
													</Text>
												</View>
											) : null}
										</View>

										<Text
											variant="caption"
											className="text-muted-foreground"
											numberOfLines={1}
										>
											{categoryName || "Technician"}
											{locationText ? ` · ${locationText}` : ""}
										</Text>
									</View>
								</PressableScale>

								<PressableScale
									pressedScale={0.94}
									onPress={() => router.push(ROUTES.user.bookingRoot(tech.id))}
								>
									<View
										style={{
											backgroundColor: t.tint.surfaceSoft,
											borderRadius: 9,
											paddingHorizontal: 12,
											paddingVertical: 8,
											flexDirection: "row",
											alignItems: "center",
										}}
									>
										<Text variant="buttonMd" style={{ color: t.tint.onSoft }}>
											Book
										</Text>
									</View>
								</PressableScale>
							</View>
						);
					})}
				</View>
			)}

			<TechnicianProfileSheet ref={profileSheetRef} />
		</View>
	);
}
