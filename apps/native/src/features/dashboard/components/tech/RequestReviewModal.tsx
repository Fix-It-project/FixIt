import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ClipboardList, MapPin, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
	ActivityIndicator,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { useTechRequestsStore } from "@/src/features/dashboard/stores/tech-requests-store";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { Colors, spacing, useThemeColors } from "@/src/lib/theme";
import {
	useAcceptDashboardOrderMutation,
	useRejectDashboardOrderMutation,
} from "../../hooks/useDashboardOrderMutations";

function timeAgo(isoString: string): string {
	const diff = Date.now() - new Date(isoString).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}

interface RequestReviewModalProps {
	readonly categoryName?: string | null;
}

export default function RequestReviewModal({
	categoryName,
}: RequestReviewModalProps = {}) {
	const themeColors = useThemeColors();
	const { selectedOrder, isModalVisible, closeModal } = useTechRequestsStore();
	const sheetRef = useRef<BottomSheetModal>(null);
	const acceptMutation = useAcceptDashboardOrderMutation();
	const rejectMutation = useRejectDashboardOrderMutation();
	const { height } = useWindowDimensions();

	const category = CATEGORIES.find(
		(c) => c.label.toLowerCase() === (categoryName ?? "").toLowerCase(),
	);
	const CategoryIcon = category?.icon ?? ClipboardList;
	const categoryColor = category?.color ?? Colors.primary;

	const isBusy = acceptMutation.isPending || rejectMutation.isPending;
	const snapPoints = useMemo(() => [Math.min(height * 0.72, 560)], [height]);
	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				pressBehavior="close"
				opacity={0.5}
			/>
		),
		[],
	);

	if (!selectedOrder) return null;

	useEffect(() => {
		if (isModalVisible) {
			sheetRef.current?.present();
			return;
		}

		sheetRef.current?.dismiss();
	}, [isModalVisible]);

	const handleAccept = () => {
		acceptMutation.mutate(selectedOrder.id, { onSuccess: closeModal });
	};

	const handleReject = () => {
		rejectMutation.mutate(selectedOrder.id, { onSuccess: closeModal });
	};

	return (
		<BottomSheetModal
			ref={sheetRef}
			snapPoints={snapPoints}
			enablePanDownToClose
			backdropComponent={renderBackdrop}
			onDismiss={closeModal}
			backgroundStyle={{ backgroundColor: themeColors.surfaceBase }}
			handleIndicatorStyle={{
				backgroundColor: themeColors.borderDefault,
				width: spacing.sheet.handleWidth,
			}}
		>
			<BottomSheetView
				className="px-6"
				style={{
					backgroundColor: themeColors.surfaceBase,
					paddingBottom: spacing.screen.paddingBottom + spacing.stack.md,
				}}
			>
				{/* Header row */}
				<View className="mb-5 flex-row items-center">
					<View
						className="mr-3 h-control-icon-box-touch w-control-icon-box-touch items-center justify-center rounded-button"
						style={{
							backgroundColor: `${categoryColor}18`,
						}}
					>
						<CategoryIcon size={22} color={categoryColor} strokeWidth={1.8} />
					</View>
					<View className="flex-1">
						<Text
							variant="buttonLg"
							className="font-bold"
							style={{ color: themeColors.textPrimary }}
						>
							Service Request
						</Text>
						<Text
							variant="caption"
							className="mt-0.5"
							style={{ color: themeColors.textMuted }}
						>
							Received {timeAgo(selectedOrder.created_at)}
						</Text>
					</View>
					<TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
						<X size={20} color={themeColors.textMuted} strokeWidth={2} />
					</TouchableOpacity>
				</View>

				{/* Scheduled date */}
				<View
					className="mb-4 rounded-xl p-3"
					style={{
						backgroundColor: themeColors.surfaceElevated,
					}}
				>
					<Text
						variant="caption"
						className="mb-0.5 uppercase"
						style={{ color: themeColors.textMuted, letterSpacing: 0.5 }}
					>
						Scheduled Date
					</Text>
					<Text variant="buttonMd" style={{ color: themeColors.textPrimary }}>
						📅 {selectedOrder.scheduled_date}
					</Text>
				</View>

				{/* Location */}
				{selectedOrder.user_address && (
					<View
						className="mb-4 flex-row items-center gap-2 rounded-xl p-3"
						style={{
							backgroundColor: themeColors.surfaceElevated,
						}}
					>
						<MapPin size={16} color={themeColors.textMuted} strokeWidth={2} />
						<Text
							variant="bodySm"
							style={{ flex: 1, color: themeColors.textPrimary }}
						>
							{selectedOrder.user_address}
						</Text>
					</View>
				)}

				{/* Problem description */}
				<View
					className="mb-6 rounded-xl p-3"
					style={{
						backgroundColor: themeColors.surfaceElevated,
					}}
				>
					<Text
						variant="caption"
						className="mb-1.5 uppercase"
						style={{ color: themeColors.textMuted, letterSpacing: 0.5 }}
					>
						Problem Description
					</Text>
					<Text variant="bodySm" style={{ color: themeColors.textPrimary }}>
						{selectedOrder.problem_description ?? "No description provided."}
					</Text>
				</View>

				{/* Action buttons */}
				<View className="flex-row gap-3">
					<TouchableOpacity
						className="flex-1 items-center rounded-button py-control-cta-y"
						style={{
							backgroundColor: isBusy
								? themeColors.borderDefault
								: Colors.primary,
						}}
						activeOpacity={0.85}
						disabled={isBusy}
						onPress={handleAccept}
					>
						{acceptMutation.isPending ? (
							<ActivityIndicator size="small" color={themeColors.surfaceBase} />
						) : (
							<Text
								variant="buttonMd"
								style={{ color: themeColors.surfaceBase }}
							>
								Accept
							</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						className="flex-1 items-center rounded-button border py-control-cta-y"
						style={{
							borderWidth: 1,
							borderColor: themeColors.borderDefault,
							backgroundColor: isBusy
								? themeColors.surfaceElevated
								: themeColors.surfaceBase,
						}}
						activeOpacity={0.7}
						disabled={isBusy}
						onPress={handleReject}
					>
						{rejectMutation.isPending ? (
							<ActivityIndicator size="small" color={themeColors.textMuted} />
						) : (
							<Text
								variant="buttonMd"
								style={{ color: themeColors.textPrimary }}
							>
								Decline
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</BottomSheetView>
		</BottomSheetModal>
	);
}
