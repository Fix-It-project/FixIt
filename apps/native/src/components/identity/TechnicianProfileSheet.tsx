import { router } from "expo-router";
import { Briefcase, ClipboardList, Star } from "lucide-react-native";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	ActivityIndicator,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { ReviewRow } from "@/src/components/reviews";
import {
	BottomSheet,
	type BottomSheetModalRef,
} from "@/src/components/ui/bottom-sheet";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/constants/design-tokens";
import TechnicianAvatar from "@/src/features/technicians/components/user/TechnicianAvatar";
import { useTechnicianProfileQuery } from "@/src/features/technicians/hooks/useTechnicianProfileQuery";
import { useTechnicianReviewsQuery } from "@/src/hooks/useTechnicianReviewsQuery";
import { ROUTES } from "@/src/lib/navigation";

export interface TechnicianProfileSheetRef {
	open: (technicianId: string, initials: string) => void;
	close: () => void;
}

interface SheetState {
	technicianId: string | null;
	initials: string;
}

const TechnicianProfileSheet = forwardRef<TechnicianProfileSheetRef, object>(
	function TechnicianProfileSheet(_, ref) {
		const themeColors = useThemeColors();
		const { t, i18n } = useTranslation("technicians");
		const sheetRef = useRef<BottomSheetModalRef>(null);
		const { height } = useWindowDimensions();
		const numberFormatter = new Intl.NumberFormat(
			i18n.language.startsWith("ar") ? "ar-EG" : "en-US",
		);
		const [sheetState, setSheetState] = useState<SheetState>({
			technicianId: null,
			initials: "",
		});

		const {
			data: profile,
			isLoading,
			isError,
			refetch,
		} = useTechnicianProfileQuery(sheetState.technicianId);

		const { data: reviewsData, isLoading: reviewsLoading } =
			useTechnicianReviewsQuery(sheetState.technicianId, 3, 0);

		useImperativeHandle(ref, () => ({
			open(technicianId: string, initials: string) {
				setSheetState({ technicianId, initials });
				sheetRef.current?.present();
			},
			close() {
				sheetRef.current?.dismiss();
			},
		}));

		const handleDismiss = () => {
			setSheetState((prev) =>
				prev.technicianId === null
					? prev
					: { technicianId: null, initials: "" },
			);
		};

		return (
			<BottomSheet.Modal
				ref={sheetRef}
				enableDynamicSizing
				maxDynamicContentSize={height * 0.9}
				enablePanDownToClose
				onDismiss={handleDismiss}
				backgroundStyle={{ backgroundColor: themeColors.surfaceBase }}
			>
				<BottomSheet.ScrollView
					className="px-button-x pb-stack-xl"
					style={{ backgroundColor: themeColors.surfaceBase }}
				>
					{isLoading && (
						<View className="items-center justify-center py-stack-xl">
							<ActivityIndicator size="large" color={themeColors.primary} />
							<Text variant="bodySm" className="mt-stack-md text-content-muted">
								{t("profileSheet.loadingProfile")}
							</Text>
						</View>
					)}

					{isError && !isLoading && (
						<View className="items-center justify-center py-stack-xl">
							<Text variant="buttonLg" className="text-center text-danger">
								{t("profileSheet.loadErrorTitle")}
							</Text>
							<Text
								variant="bodySm"
								className="mt-stack-xs text-center text-content-muted"
							>
								{t("profileSheet.loadErrorBody")}
							</Text>
							<TouchableOpacity
								onPress={() => refetch()}
								activeOpacity={0.7}
								className="mt-stack-md rounded-button px-control-compact-cta-x py-control-compact-cta-y"
								style={{ backgroundColor: themeColors.primary }}
							>
								<Text variant="buttonMd" className="text-surface-on-primary">
									{t("profileSheet.retry")}
								</Text>
							</TouchableOpacity>
						</View>
					)}

					{profile && !isLoading && (
						<View className="items-center">
							<View className="mt-stack-xs">
								<TechnicianAvatar
									id={sheetState.technicianId ?? ""}
									initials={sheetState.initials}
									imageUrl={profile.profilePicture}
									size="lg"
								/>
							</View>

							<Text
								variant="h3"
								className="mt-stack-md text-center text-content"
								numberOfLines={1}
							>
								{profile.name}
							</Text>

							<Text
								variant="bodySm"
								className="mt-stack-xs px-card text-center text-content-secondary"
								numberOfLines={2}
							>
								{profile.description}
							</Text>

							<View className="mt-card-roomy w-full flex-row gap-stack-md">
								<View className="flex-1 items-center gap-stack-xs rounded-input bg-surface-elevated px-stack-md py-card">
									<Briefcase
										size={18}
										color={themeColors.primary}
										strokeWidth={2}
									/>
									<Text
										variant="buttonLg"
										className="mt-stack-xs font-bold text-content"
									>
										{numberFormatter.format(profile.completedOrders)}
									</Text>
									<Text variant="caption" className="text-content-muted">
										{t("profileSheet.completed")}
									</Text>
								</View>
								<View className="flex-1 items-center gap-stack-xs rounded-input bg-surface-elevated px-stack-md py-card">
									<ClipboardList
										size={18}
										color={themeColors.primary}
										strokeWidth={2}
									/>
									<Text
										variant="buttonLg"
										className="mt-stack-xs font-bold text-content"
									>
										{numberFormatter.format(profile.totalBookings)}
									</Text>
									<Text variant="caption" className="text-content-muted">
										{t("profileSheet.bookings")}
									</Text>
								</View>
							</View>

							<View className="mt-stack-lg w-full">
								<View className="min-h-avatar-md w-full flex-row items-center gap-stack-sm rounded-input bg-surface-elevated px-card py-stack-md">
									<Star
										size={16}
										color={themeColors.ratingDefault}
										fill={themeColors.ratingDefault}
										strokeWidth={0}
									/>
									<Text
										variant="bodySm"
										className="flex-1 text-content-secondary"
										style={{ includeFontPadding: false }}
									>
										{(() => {
											if (
												profile.avg_rating === null ||
												profile.review_count <= 0
											) {
												return t("profileSheet.noReviewsYet");
											}
											const summaryKey =
												profile.review_count === 1
													? "profileSheet.reviewSummaryOne"
													: "profileSheet.reviewSummaryOther";
											return t(summaryKey, {
												rating: numberFormatter.format(profile.avg_rating),
												count: numberFormatter.format(profile.review_count),
											});
										})()}
									</Text>
								</View>
							</View>

							{profile.review_count > 0 && (
								<View className="mt-stack-lg w-full">
									{reviewsLoading ? (
										<ActivityIndicator
											size="small"
											color={themeColors.primary}
										/>
									) : (
										reviewsData?.reviews
											.slice(0, 3)
											.map((r) => (
												<ReviewRow key={r.id} review={r} variant="preview" />
											))
									)}
									<TouchableOpacity
										onPress={() => {
											sheetRef.current?.dismiss();
											const route = ROUTES.user.technicianDetail(
												sheetState.technicianId ?? "",
											);
											router.push({
												...route,
												params: { ...route.params, tab: "Reviews" },
											});
										}}
										activeOpacity={0.7}
										className="mt-stack-md py-stack-md"
										style={{
											borderTopWidth: 1,
											borderTopColor: themeColors.borderDefault,
										}}
									>
										<Text
											variant="buttonMd"
											className="text-center"
											style={{ color: Colors.primary }}
										>
											{t("profileSheet.viewAllReviews", {
												count: numberFormatter.format(profile.review_count),
											})}
										</Text>
									</TouchableOpacity>
								</View>
							)}
						</View>
					)}
				</BottomSheet.ScrollView>
			</BottomSheet.Modal>
		);
	},
);

export default TechnicianProfileSheet;
