import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { translateCategoryLabel } from "@/src/features/categories/constants/categories";
import { InitialsAvatar } from "@/src/features/newhome/components/InitialsAvatar";
import { getRecommendedTechnicians } from "@/src/features/technicians/recommendations.service";
import type { RecommendedTechnicianApi } from "@/src/features/technicians/schemas/response.schema";
import { showError, toAppError } from "@/src/lib/errors";
import { ROUTES } from "@/src/lib/navigation/routes";

export default function RecommendScreen() {
	const { t } = useTranslation("chat");
	const { t: tc } = useTranslation("categories");
	const { q } = useLocalSearchParams<{ q: string }>();
	const router = useRouter();

	const [results, setResults] = useState<RecommendedTechnicianApi[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);
	const retryRef = useRef(0);

	useEffect(() => {
		if (!q || q.trim().length === 0) return;

		let cancelled = false;

		async function fetchResults() {
			setIsLoading(true);
			setHasError(false);
			try {
				const data = await getRecommendedTechnicians({
					problemDescription: q.trim(),
				});
				if (!cancelled) {
					setResults(Array.isArray(data) ? data : []);
				}
			} catch (error) {
				if (!cancelled) {
					const appErr = toAppError(error);
					setHasError(true);
					showError(appErr);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		void fetchResults();

		return () => {
			cancelled = true;
		};
	}, [q]);

	function handleRetry() {
		retryRef.current += 1;
		if (!q || q.trim().length === 0) return;
		let cancelled = false;
		setIsLoading(true);
		setHasError(false);
		getRecommendedTechnicians({ problemDescription: q.trim() })
			.then((data) => {
				if (!cancelled) setResults(Array.isArray(data) ? data : []);
			})
			.catch((error) => {
				if (!cancelled) {
					const appErr = toAppError(error);
					setHasError(true);
					showError(appErr);
				}
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View
				style={{
					paddingHorizontal: 20,
					paddingVertical: 16,
					flexDirection: "row",
					alignItems: "center",
					gap: 12,
				}}
			>
				<PressableScale onPress={() => router.back()}>
					<ChevronLeft size={24} className="text-foreground" />
				</PressableScale>
				<Text variant="h3" className="flex-1 text-foreground" numberOfLines={1}>
					{t("recommend.title", { query: q })}
				</Text>
			</View>

			{isLoading && (
				<View style={{ paddingHorizontal: 20 }}>
					{[0, 1, 2, 3, 4].map((i) => (
						<Skeleton
							key={i}
							className="mb-2 rounded-xl"
							style={{ height: 72 }}
						/>
					))}
				</View>
			)}

			{hasError && !isLoading && (
				<View
					style={{ paddingHorizontal: 20, alignItems: "center", gap: 8 }}
					className="mt-8"
				>
					<Text variant="label" className="text-foreground">
						{t("recommend.loadErrorTitle")}
					</Text>
					<Text variant="bodySm" className="text-center text-muted-foreground">
						{t("recommend.loadErrorMessage")}
					</Text>
					<PressableScale onPress={handleRetry}>
						<Text variant="buttonMd" className="text-app-primary">
							{t("recommend.tryAgain")}
						</Text>
					</PressableScale>
				</View>
			)}

			{!isLoading && !hasError && results.length === 0 && (
				<View
					style={{ paddingHorizontal: 20, alignItems: "center", gap: 8 }}
					className="mt-8"
				>
					<Text variant="label" className="text-foreground">
						{t("recommend.emptyTitle")}
					</Text>
					<Text variant="bodySm" className="text-center text-muted-foreground">
						{t("recommend.emptyMessage")}
					</Text>
				</View>
			)}

			{!isLoading && !hasError && results.length > 0 && (
				<ScrollView
					contentContainerStyle={{
						paddingHorizontal: 20,
						paddingBottom: 32,
						gap: 12,
					}}
				>
					{results.map((result) => (
						<PressableScale
							key={result.technician_id}
							pressedScale={0.97}
							onPress={() => {
								const route = ROUTES.user.technicianDetail(
									result.technician_id,
								);
								router.push({
									...route,
									params: {
										...route.params,
										technicianName: result.name,
										distanceKm:
											result.distance_km != null
												? result.distance_km.toFixed(1)
												: undefined,
									},
								});
							}}
						>
							<View
								className="rounded-xl bg-card"
								style={{
									padding: 16,
									flexDirection: "row",
									alignItems: "center",
									gap: 12,
								}}
							>
								<InitialsAvatar
									name={result.name}
									imageUrl={null}
									className="size-12"
								/>
								<View style={{ flex: 1, gap: 4 }}>
									<Text
										variant="label"
										className="text-foreground"
										numberOfLines={1}
									>
										{result.name}
									</Text>
									<Text variant="caption" className="text-muted-foreground">
										{[
											result.category
												? translateCategoryLabel(tc, null, result.category)
												: "",
											result.distance_km != null
												? t("recommend.distance", {
														km: result.distance_km.toFixed(1),
													})
												: null,
										]
											.filter(Boolean)
											.join(" · ")}
									</Text>
									{result.base_hourly_rate != null && (
										<Text variant="caption" className="text-muted-foreground">
											{t("recommend.rate", {
												rate: result.base_hourly_rate.toFixed(0),
											})}
										</Text>
									)}
								</View>
								<ChevronRight size={16} className="text-muted-foreground" />
							</View>
						</PressableScale>
					))}
				</ScrollView>
			)}
		</SafeAreaView>
	);
}
