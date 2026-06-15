import { createRef } from "react";
import ReviewSubmissionSheet, {
	type ReviewSubmissionSheetRef,
} from "./ReviewSubmissionSheet";

export const reviewSheetRef = createRef<ReviewSubmissionSheetRef>();

export default function ReviewPromptHost() {
	return <ReviewSubmissionSheet ref={reviewSheetRef} />;
}
