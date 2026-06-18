import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import PaymobCheckoutWebView from "@/src/features/booking-orders/components/state-machine/shared/PaymobCheckoutWebView";

/**
 * In-app Paymob checkout screen. Opened with the gateway `url`; on the server
 * return URL it refetches the user's orders and pops back to the order, where
 * the existing card-completion poll picks up the webhook-confirmed status.
 */
export default function PaymentCheckoutScreen() {
	const { url } = useLocalSearchParams<{ url: string }>();
	const queryClient = useQueryClient();

	const close = () => {
		if (router.canGoBack()) router.back();
	};

	const handleReturn = () => {
		void queryClient.invalidateQueries({ queryKey: ["user-orders"] });
		close();
	};

	// Guard against a missing/malformed url (e.g. a stale deep link).
	useEffect(() => {
		if (!url) close();
	}, [url]);

	if (!url) return null;

	return (
		<PaymobCheckoutWebView
			url={url}
			title="Card payment"
			onReturn={handleReturn}
			onClose={close}
		/>
	);
}
