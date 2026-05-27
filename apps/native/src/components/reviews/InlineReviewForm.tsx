// Shared "rate technician" inline form widget.
//
// Single source of truth for: rating state, optional comment, schema
// validation, and the createReview mutation. Used by:
//   • user CompletedView (inline above the Done button)
//   • ReviewSubmissionSheet (inside the bottom-sheet body)
//
// Consumers wire their OWN submit/done button and call `ref.current?.submit()`.
// If no rating was selected, `submit()` resolves with `{ submitted: false }`
// so the caller can decide whether to navigate / close anyway.

import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useState,
} from "react";
import { View } from "react-native";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import StarRatingInput from "@/src/features/reviews/components/user/StarRatingInput";
import { useCreateReviewMutation } from "@/src/features/reviews/hooks/useCreateReviewMutation";
import { createReviewClientSchema } from "@/src/features/reviews/schemas/review.schema";
import { space, useThemeColors } from "@/src/lib/theme";

export interface InlineReviewFormHandle {
	submit: () => Promise<{ submitted: boolean }>;
	hasRating: () => boolean;
}

interface InlineReviewFormProps {
	readonly orderId: string;
	readonly technicianId: string;
	readonly technicianName?: string;
	readonly labelStyle?: "uppercase-caption" | "h3";
	readonly onRatingChange?: (rating: number) => void;
	readonly onSubmitted?: () => void;
	readonly onError?: (err: Error) => void;
}

const InlineReviewForm = forwardRef<InlineReviewFormHandle, InlineReviewFormProps>(
	function InlineReviewForm(
		{
			orderId,
			technicianId,
			technicianName,
			labelStyle = "uppercase-caption",
			onRatingChange,
			onSubmitted,
			onError,
		},
		ref,
	) {
		const themeColors = useThemeColors();
		const mutation = useCreateReviewMutation();
		const [rating, setRating] = useState(0);
		const [comment, setComment] = useState("");

		const submit = useCallback(
			() =>
				new Promise<{ submitted: boolean }>((resolve) => {
					if (rating < 1) {
						resolve({ submitted: false });
						return;
					}
					const parsed = createReviewClientSchema.safeParse({
						order_id: orderId,
						rating,
						comment: comment || undefined,
					});
					if (!parsed.success) {
						const message =
							parsed.error.issues[0]?.message ?? "Invalid input.";
						onError?.(new Error(message));
						resolve({ submitted: false });
						return;
					}
					mutation.mutate(
						{ input: parsed.data, technicianId },
						{
							onSuccess: () => {
								onSubmitted?.();
								resolve({ submitted: true });
							},
							onError: (err) => {
								onError?.(err);
								resolve({ submitted: false });
							},
						},
					);
				}),
			[rating, comment, mutation, orderId, technicianId, onSubmitted, onError],
		);

		useImperativeHandle(
			ref,
			() => ({
				submit,
				hasRating: () => rating >= 1,
			}),
			[submit, rating],
		);

		const title = technicianName
			? `Rate ${technicianName}`
			: "Rate technician";

		return (
			<View style={{ gap: space[3] }}>
				<View style={{ alignItems: "center", gap: space[2] }}>
					{labelStyle === "h3" ? (
						<Text variant="h3" className="text-content">
							{title}
						</Text>
					) : (
						<Text
							variant="caption"
							className="font-google-sans-bold uppercase"
							style={{ color: themeColors.textMuted, letterSpacing: 1 }}
						>
							{title}
						</Text>
					)}
					<StarRatingInput
						value={rating}
						onChange={(v) => {
							setRating(v);
							onRatingChange?.(v);
						}}
					/>
				</View>

				{rating > 0 ? (
					<Input
						value={comment}
						onChangeText={setComment}
						multiline
						maxLength={1000}
						editable={!mutation.isPending}
						placeholder="Add a comment (optional)"
						className="min-h-[96px]"
					/>
				) : null}
			</View>
		);
	},
);

export default InlineReviewForm;
