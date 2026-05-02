import { createRef, useEffect, useRef, useState } from "react";
import { useReviewPromptTrigger } from "@/src/features/reviews/hooks/useReviewPromptTrigger";
import { useReviewPromptStore } from "@/src/features/reviews/stores/review-prompt-store";
import ReviewSubmissionSheet, {
  type ReviewSubmissionSheetRef,
} from "./ReviewSubmissionSheet";

export const reviewSheetRef = createRef<ReviewSubmissionSheetRef>();

export default function ReviewPromptHost() {
  const { pendingOrder } = useReviewPromptTrigger();
  const lastOpenedRef = useRef<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(
    useReviewPromptStore.persist.hasHydrated(),
  );

  useEffect(() => {
    return useReviewPromptStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!pendingOrder) return;
    if (lastOpenedRef.current === pendingOrder.orderId) return;
    lastOpenedRef.current = pendingOrder.orderId;
    reviewSheetRef.current?.open(
      pendingOrder.orderId,
      pendingOrder.technicianId,
      pendingOrder.technicianName,
    );
  }, [hasHydrated, pendingOrder]);

  return <ReviewSubmissionSheet ref={reviewSheetRef} />;
}
