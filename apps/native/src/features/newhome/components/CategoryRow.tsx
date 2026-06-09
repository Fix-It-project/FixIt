import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Icon } from "@/src/components/ui/icon";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { DUR_SLIDE_UP, ENTRANCE_STAGGER } from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import {
	getCategoryMeta,
	translateCategoryLabel,
} from "@/src/features/categories/constants/categories";
import { useCategoriesQuery } from "@/src/features/categories/hooks/useCategoriesQuery";
import { ROUTES } from "@/src/lib/navigation/routes";
import { router } from "expo-router";
import {
	AirVent,
	BrushCleaning,
	Bug,
	ClipboardList,
	CookingPot,
	Drill,
	Droplets,
	Fan,
	Flame,
	Hammer,
	HousePlug,
	Leaf,
	type LucideIcon,
	Paintbrush,
	PaintRoller,
	Refrigerator,
	SatelliteDish,
	Sparkles,
	WashingMachine,
	Zap,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const ICON_MAP: Record<string, LucideIcon> = {
	"air condition": AirVent,
	ac: AirVent,
	hvac: AirVent,
	fan: Fan,
	dish: SatelliteDish,
	"fridge freezer": Refrigerator,
	fridge: Refrigerator,
	freezer: Refrigerator,
	refrigerator: Refrigerator,
	"oven cooker": CookingPot,
	oven: Flame,
	cooker: CookingPot,
	"home cleaning": BrushCleaning,
	cleaning: BrushCleaning,
	painter: PaintRoller,
	painting: Paintbrush,
	appliance: WashingMachine,
	"appliance repair": WashingMachine,
	"washing machine": WashingMachine,
	carpenter: Drill,
	carpentry: Drill,
	electrician: HousePlug,
	electrical: HousePlug,
	plumbing: Droplets,
	droplets: Droplets,
	zap: Zap,
	sparkles: Sparkles,
	paintbrush: PaintRoller,
	hammer: Hammer,
	bug: Bug,
	leaf: Leaf,
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
	const { t: tr } = useTranslation("home");
	const { t: tc } = useTranslation("categories");
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
					{tr("browseServices")}
				</Text>
				<PressableScale onPress={() => router.push(ROUTES.user.categories)}>
					<Text variant="buttonMd" className="text-app-primary">
						{tr("seeAll")}
					</Text>
				</PressableScale>
			</View>

			{/* Loading state */}
			{isLoading && (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
				>
					{SKELETON_KEYS.map((key) => (
						<Skeleton key={key} className="h-14 w-14 rounded-xl" />
					))}
				</ScrollView>
			)}

			{/* Error state */}
			{isError && !isLoading && (
				<Text variant="bodySm" className="px-5 text-center text-danger">
					{tr("couldNotLoadServices")}
				</Text>
			)}

			{/* Empty state */}
			{!isLoading && !isError && categories?.length === 0 && (
				<Text
					variant="caption"
					className="px-5 text-center text-muted-foreground"
				>
					{tr("noCategories")}
				</Text>
			)}

			{/* Data state */}
			{!isLoading && !isError && (categories?.length ?? 0) > 0 && (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
				>
					{categories?.map((cat, index) => {
						const IconComponent = resolveIcon(cat.id, cat.name);
						const categoryLabel = translateCategoryLabel(tc, cat.id, cat.name);
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
											pathname: ROUTES.user.technicians,
											params: {
												categoryId: cat.id,
												categoryName: cat.name,
											},
										})
									}
								>
									<View style={{ alignItems: "center", gap: 6, width: 64 }}>
										<View
											style={{
												width: 56,
												height: 56,
												borderRadius: 14,
												backgroundColor: t.surfaceElevated,
												borderWidth: 1,
												borderColor: t.borderChip,
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<Icon
												as={IconComponent}
												size={23}
												color={t.primary}
												strokeWidth={2.2}
											/>
										</View>
										<Text
											variant="caption"
											className="text-center font-bold text-foreground"
											numberOfLines={2}
											style={{ maxWidth: 60 }}
										>
											{categoryLabel}
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
