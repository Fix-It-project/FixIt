import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Text } from "@/src/components/ui/text";
import { useCreateReviewMutation } from "@/src/features/reviews/hooks/useCreateReviewMutation";
import { createReviewClientSchema } from "@/src/features/reviews/schemas/review.schema";
import { useReviewPromptStore } from "@/src/features/reviews/stores/review-prompt-store";
import { spacing, useThemeColors } from "@/src/lib/theme";
import StarRatingInput from "./StarRatingInput";

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
    const queryClient = useQueryClient();
    const { height } = useWindowDimensions();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const submittedRef = useRef(false);

    const [sheetState, setSheetState] = useState<SheetState>({
      orderId: null,
      technicianId: null,
      technicianName: "",
    });
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const markSkipped = useReviewPromptStore((s) => s.markSkipped);
    const markSubmitted = useReviewPromptStore((s) => s.markSubmitted);
    const mutation = useCreateReviewMutation();

    const snapPoints = useMemo(() => [Math.min(height * 0.6, 560)], [height]);

    useImperativeHandle(ref, () => ({
      open(orderId: string, technicianId: string, technicianName: string) {
        submittedRef.current = false;
        setRating(0);
        setComment("");
        setSubmitError(null);
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

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={1}
          pressBehavior="close"
          style={{ backgroundColor: themeColors.backdrop }}
        />
      ),
      [themeColors.backdrop],
    );

    const handleSubmit = useCallback(() => {
      const { orderId, technicianId } = sheetState;
      if (!orderId || !technicianId) return;

      const parsed = createReviewClientSchema.safeParse({
        order_id: orderId,
        rating,
        comment: comment || undefined,
      });

      if (!parsed.success) {
        setSubmitError(parsed.error.issues[0]?.message ?? "Invalid input");
        return;
      }

      mutation.mutate(
        { input: parsed.data, technicianId },
        {
          onSuccess: () => {
            submittedRef.current = true;
            markSubmitted(orderId);
            queryClient.invalidateQueries({ queryKey: ["user-orders"] });
            bottomSheetRef.current?.close();
          },
          onError: (e) => setSubmitError(e.message),
        },
      );
    }, [sheetState, rating, comment, mutation, markSubmitted, queryClient]);

    const handleSkip = useCallback(() => {
      bottomSheetRef.current?.close();
    }, []);

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: themeColors.surfaceBase,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        handleIndicatorStyle={{
          backgroundColor: themeColors.borderDefault,
          width: spacing.sheet.handleWidth,
        }}
      >
        <BottomSheetView
          className="flex-1 px-button-x pb-stack-xl"
          style={{ backgroundColor: themeColors.surfaceBase }}
        >
          <KeyboardAvoidingView behavior="padding" className="flex-1">
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <Text
                variant="h3"
                className="mt-stack-md text-center text-content"
                numberOfLines={1}
              >
                Rate {sheetState.technicianName}
              </Text>

              <View className="mt-stack-xl items-center">
                <StarRatingInput value={rating} onChange={setRating} />
              </View>

              <View className="mt-stack-lg" style={{ opacity: rating > 0 ? 1 : 0.45 }}>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  editable={rating > 0}
                  multiline
                  maxLength={1000}
                  placeholder={
                    rating > 0
                      ? "Share details (optional)"
                      : "Select a rating to add a comment"
                  }
                  placeholderTextColor={themeColors.textMuted}
                  style={{
                    borderColor: themeColors.borderDefault,
                    color: themeColors.textPrimary,
                    backgroundColor:
                      rating > 0
                        ? themeColors.surfaceBase
                        : themeColors.surfaceElevated,
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                />
                <Text
                  variant="caption"
                  className="mt-stack-xs text-right text-content-muted"
                >
                  {comment.length}/1000
                </Text>
              </View>

              {submitError && (
                <Text
                  variant="bodySm"
                  className="mt-stack-sm text-center text-danger"
                >
                  {submitError}
                </Text>
              )}

              <View className="mt-stack-lg gap-stack-sm">
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={rating < 1 || mutation.isPending}
                  activeOpacity={0.8}
                  className="items-center rounded-button px-button-x py-control-compact-cta-y"
                  style={{
                    backgroundColor: rating >= 1 && !mutation.isPending
                      ? themeColors.primary
                      : themeColors.borderDefault,
                    opacity: rating < 1 || mutation.isPending ? 0.5 : 1,
                  }}
                >
                  {mutation.isPending ? (
                    <ActivityIndicator size="small" color={themeColors.surfaceOnPrimary} />
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
            </BottomSheetScrollView>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default ReviewSubmissionSheet;
