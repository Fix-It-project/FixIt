import {
	BottomSheet,
	type BottomSheetRef,
} from "@/src/components/ui/bottom-sheet";
import {
	type ComponentType,
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ActivityIndicator,
	type ScrollViewProps,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import InlineReviewForm, {
	type InlineReviewFormHandle,
} from "@/src/components/reviews/InlineReviewForm";
import { Text } from "@/src/components/ui/text";
import { useReviewPromptStore } from "@/src/features/reviews/stores/review-prompt-store";
import { spacing, useThemeColors } from "@/src/lib/theme";

const KeyboardAwareBottomSheetScrollView =
	BottomSheet.ScrollView as unknown as ComponentType<ScrollViewProps>;

export interface ReviewSubmissionSheetRef {
	open: (orderId: string, technicianId: string, technicianName: string) => void;
	close: () => void;
}

interface SheetState {
	orderId: string | null;
	technicianId: string | null;
	technicianName: string;
}

const ReviewSubmissionSheet = forwardRef<ReviewSubmissionSheetRef, object>(
	function ReviewSubmissionSheet(_, ref) {
		const themeColors = useThemeColors();
		const { height } = useWindowDimensions();
		const bottomSheetRef = useRef<BottomSheetRef>(null);
		const formRef = useRef<InlineReviewFormHandle>(null);
		const submittedRef = useRef(false);
		const [isPending, setIsPending] = useState(false);
		const [hasRating, setHasRating] = useState(false);

		const [sheetState, setSheetState] = useState<SheetState>({
			orderId: null,
			technicianId: null,
			technicianName: "",
		});

		const markSkipped = useReviewPromptStore((s) => s.markSkipped);
		const markSubmitted = useReviewPromptStore((s) => s.markSubmitted);

		const snapPoints = useMemo(() => [Math.min(height * 0.6, 560)], [height]);

		useImperativeHandle(ref, () => ({
			open(orderId: string, technicianId: string, technicianName: string) {
				submittedRef.current = false;
				setSheetState({ orderId, technicianId, technicianName });
				bottomSheetRef.current?.snapToIndex(0);
			},
			close() {
				bottomSheetRef.current?.close();
			},
		}));

		const handleClose = useCallback(() => {
			if (sheetState.orderId && !submittedRef.current) {
				markSkipped(sheetState.orderId);
			}
			submittedRef.current = false;
		}, [sheetState.orderId, markSkipped]);

		const handleSubmit = useCallback(async () => {
			if (!formRef.current) return;
			setIsPending(true);
			const { submitted } = await formRef.current.submit();
			setIsPending(false);
			if (submitted && sheetState.orderId) {
				submittedRef.current = true;
				markSubmitted(sheetState.orderId);
				bottomSheetRef.current?.close();
			}
		}, [markSubmitted, sheetState.orderId]);

		const handleSkip = useCallback(() => {
			bottomSheetRef.current?.close();
		}, []);

		const canSubmit = hasRating;

		return (
			<BottomSheet
				ref={bottomSheetRef}
				index={-1}
				snapPoints={snapPoints}
				onClose={handleClose}
				android_keyboardInputMode="adjustResize"
				handleIndicatorStyle={{
					backgroundColor: themeColors.borderDefault,
					width: spacing.sheet.handleWidth,
				}}
			>
				<BottomSheet.View
					className="flex-1 px-button-x pb-stack-xl"
					style={{ backgroundColor: themeColors.surfaceBase }}
				>
					<KeyboardAwareScrollView
						ScrollViewComponent={KeyboardAwareBottomSheetScrollView}
						className="flex-1"
						showsVerticalScrollIndicator={false}
						keyboardDismissMode="interactive"
						keyboardShouldPersistTaps="handled"
						bottomOffset={spacing.stack.xl}
						extraKeyboardSpace={spacing.stack.lg}
						contentContainerStyle={{ paddingBottom: spacing.stack["2xl"] }}
					>
						<View className="mt-stack-md">
							<InlineReviewForm
								ref={formRef}
								orderId={sheetState.orderId ?? ""}
								technicianId={sheetState.technicianId ?? ""}
								technicianName={sheetState.technicianName}
								labelStyle="h3"
								onRatingChange={(r) => setHasRating(r >= 1)}
							/>
						</View>

						<View className="mt-stack-lg gap-stack-sm">
							<TouchableOpacity
								onPress={handleSubmit}
								disabled={!canSubmit || isPending}
								activeOpacity={0.8}
								className="items-center rounded-button px-button-x py-control-compact-cta-y"
								style={{
									backgroundColor:
										canSubmit && !isPending
											? themeColors.primary
											: themeColors.borderDefault,
									opacity: !canSubmit || isPending ? 0.5 : 1,
								}}
							>
								{isPending ? (
									<ActivityIndicator
										size="small"
										color={themeColors.surfaceOnPrimary}
									/>
								) : (
									<Text variant="buttonMd" className="text-surface-on-primary">
										Submit
									</Text>
								)}
							</TouchableOpacity>

							<TouchableOpacity
								onPress={handleSkip}
								activeOpacity={0.7}
								className="items-center py-control-compact-cta-y"
							>
								<Text variant="buttonMd" className="text-content-muted">
									Skip
								</Text>
							</TouchableOpacity>
						</View>
					</KeyboardAwareScrollView>
				</BottomSheet.View>
			</BottomSheet>
		);
	},
);

export default ReviewSubmissionSheet;
