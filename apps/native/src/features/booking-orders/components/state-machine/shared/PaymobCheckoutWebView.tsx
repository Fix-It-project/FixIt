// In-app Paymob checkout. Replaces the external browser: the gateway loads in a
// WebView and we detect the server return URL (`/api/orders/payments/return`,
// see apps/server/src/config/paymob.ts) to close and refetch. The webhook
// remains the source of truth for the final payment state.

import { X } from "lucide-react-native";
import { useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { Text } from "@/src/components/ui/text";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";

/** Substring of the Paymob `redirection_url` that signals the gateway is done. */
const RETURN_URL_MARKER = "/payments/return";

interface Props {
	readonly url: string;
	readonly title?: string;
	/** Fired once when the gateway redirects back to the server return URL. */
	readonly onReturn: () => void;
	/** Fired when the user dismisses the checkout manually. */
	readonly onClose: () => void;
}

export default function PaymobCheckoutWebView({
	url,
	title = "Card payment",
	onReturn,
	onClose,
}: Props) {
	const themeColors = useThemeColors();
	const [loading, setLoading] = useState(true);
	const returnedRef = useRef(false);

	const handleNavigationStateChange = (navState: WebViewNavigation) => {
		if (!returnedRef.current && navState.url.includes(RETURN_URL_MARKER)) {
			returnedRef.current = true;
			onReturn();
		}
	};

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: themeColors.surfaceBase }}
			edges={["top", "bottom"]}
		>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					paddingHorizontal: space[4],
					paddingVertical: space[3],
				}}
			>
				<Text
					variant="bodyLg"
					className="font-google-sans-bold"
					style={{ color: themeColors.textPrimary }}
				>
					{title}
				</Text>
				<TouchableOpacity
					accessibilityRole="button"
					accessibilityLabel="Close payment"
					onPress={onClose}
					hitSlop={8}
					style={{
						width: 36,
						height: 36,
						borderRadius: radius.pill,
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: themeColors.surfaceElevated,
					}}
				>
					<X size={20} color={themeColors.textPrimary} />
				</TouchableOpacity>
			</View>

			<View style={{ flex: 1 }}>
				<WebView
					source={{ uri: url }}
					onNavigationStateChange={handleNavigationStateChange}
					onLoadStart={() => setLoading(true)}
					onLoadEnd={() => setLoading(false)}
					startInLoadingState
					// Keep 3-D Secure inline rather than opening a separate window.
					setSupportMultipleWindows={false}
				/>
				{loading ? (
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<ActivityIndicator color={themeColors.primary} />
					</View>
				) : null}
			</View>
		</SafeAreaView>
	);
}
