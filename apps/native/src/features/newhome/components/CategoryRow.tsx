import { router } from "expo-router";
import {
	Bug,
	ClipboardList,
	Droplets,
	Fan,
	Flame,
	Hammer,
	Leaf,
	type LucideIcon,
	PaintRoller,
	SatelliteDish,
	Sparkles,
	Thermometer,
	Wrench,
	Zap,
} from "lucide-react-native";
import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { DUR_SLIDE_UP, ENTRANCE_STAGGER } from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { getCategoryMeta } from "@/src/features/categories/constants/categories";
import { useCategoriesQuery } from "@/src/features/categories/hooks/useCategoriesQuery";
import { ROUTES } from "@/src/lib/navigation/routes";

const ICON_MAP: Record<string, LucideIcon> = {
	"air condition": Fan,
	ac: Fan,
	hvac: Fan,
	fan: Fan,
	dish: SatelliteDish,
	"fridge freezer": Thermometer,
	fridge: Thermometer,
	freezer: Thermometer,
	"oven cooker": Flame,
	oven: Flame,
	cooker: Flame,
	"home cleaning": Sparkles,
	cleaning: Sparkles,
	painter: PaintRoller,
	painting: PaintRoller,
	carpenter: Hammer,
	carpentry: Hammer,
	electrician: Zap,
	electrical: Zap,
	plumbing: Droplets,
	droplets: Droplets,
	zap: Zap,
	sparkles: Sparkles,
	paintbrush: PaintRoller,
	hammer: Hammer,
	bug: Bug,
	leaf: Leaf,
	wrench: Wrench,
	"pest control": Bug,
	gardening: Leaf,
};

function normalizeCategoryKey(value: string): string {
	return value
		.toLowerCase()
		.replace(/[/_-]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function resolveIcon(categoryId: string, categoryName: string): LucideIcon {
	const meta = getCategoryMeta(categoryId);
	if (meta?.icon) return meta.icon;
	const key = normalizeCategoryKey(categoryName);
	return ICON_MAP[key] ?? ClipboardList;
}

const SKELETON_KEYS = [
	"cat-sk-1",
	"cat-sk-2",
	"cat-sk-3",
	"cat-sk-4",
	"cat-sk-5",
	"cat-sk-6",
	"cat-sk-7",
	"cat-sk-8",
	"cat-sk-9",
];

export function CategoryRow() {
	const t = useThemeColors();
	const { data: categories, isLoading, isError } = useCategoriesQuery();

	return (
		<View>
			{/* Section header */}
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					paddingHorizontal: 20,
					marginBottom: 12,
				}}
			>
				<Text variant="h3" className="text-foreground">
					Browse services
				</Text>
				<PressableScale onPress={() => router.push(ROUTES.user.categories)}>
					<Text variant="buttonMd" className="text-app-primary">
						See all
					</Text>
				</PressableScale>
			</View>

			{/* Loading state */}
			{isLoading && (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
				>
					{SKELETON_KEYS.map((key) => (
						<Skeleton key={key} className="h-14 w-14 rounded-xl" />
					))}
				</ScrollView>
			)}

			{/* Error state */}
			{isError && !isLoading && (
				<Text variant="bodySm" className="px-5 text-center text-danger">
					Could not load services. Pull to refresh.
				</Text>
			)}

			{/* Empty state */}
			{!isLoading && !isError && categories?.length === 0 && (
				<Text
					variant="caption"
					className="px-5 text-center text-muted-foreground"
				>
					No categories available
				</Text>
			)}

			{/* Data state */}
			{!isLoading && !isError && (categories?.length ?? 0) > 0 && (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
				>
					{categories?.map((cat, index) => {
						const IconComponent = resolveIcon(cat.id, cat.name);
						return (
							<Animated.View
								key={cat.id}
								entering={FadeInDown.delay(index * ENTRANCE_STAGGER).duration(
									DUR_SLIDE_UP,
								)}
							>
								<PressableScale
									pressedScale={0.93}
									onPress={() =>
										router.push({
											pathname: ROUTES.user.services,
											params: {
												categoryId: cat.id,
												categoryName: cat.name,
											},
										})
									}
								>
									<View style={{ alignItems: "center", gap: 8 }}>
										<View
											style={{
												width: 56,
												height: 56,
												borderRadius: 12,
												backgroundColor: t.surfaceElevated,
												borderWidth: 1,
												borderColor: t.borderDefault,
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<IconComponent
												size={23}
												color={t.tint.onChip}
												strokeWidth={2}
											/>
										</View>
										<Text
											variant="caption"
											className="text-center text-foreground"
											numberOfLines={2}
											style={{ maxWidth: 64 }}
										>
											{cat.name}
										</Text>
									</View>
								</PressableScale>
							</Animated.View>
						);
					})}
				</ScrollView>
			)}
		</View>
	);
}
