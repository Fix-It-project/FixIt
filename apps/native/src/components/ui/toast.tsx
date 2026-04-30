import { CheckCircle2, Info, XCircle } from "lucide-react-native";
import { View } from "react-native";
import Toast, {
	type ToastConfig,
	type ToastProps,
} from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

export const toastConfig: ToastConfig = {
	success: ({ text1, text2 }) => (
		<View className="mt-stack-sm w-toast flex-row items-center rounded-card border border-edge/50 bg-surface p-card shadow-sm">
			<View className="mr-stack-md self-center">
				<CheckCircle2 color={Colors.success} size={20} />
			</View>
			<View className="flex-1">
				{text1 ? (
					<Text variant="buttonLg" className="font-bold text-content">
						{text1}
					</Text>
				) : null}
				{text2 ? (
					<Text variant="bodySm" className="mt-stack-xs text-content-secondary">
						{text2}
					</Text>
				) : null}
			</View>
		</View>
	),
	error: ({ text1, text2 }) => (
		<View className="mt-stack-sm w-toast flex-row items-center rounded-card border border-danger bg-danger-light p-card shadow-sm">
			<View className="mr-stack-md self-center">
				<XCircle color={Colors.danger} size={20} />
			</View>
			<View className="flex-1">
				{text1 ? (
					<Text variant="buttonLg" className="font-bold text-danger">
						{text1}
					</Text>
				) : null}
				{text2 ? (
					<Text variant="bodySm" className="mt-stack-xs text-danger">
						{text2}
					</Text>
				) : null}
			</View>
		</View>
	),
	info: ({ text1, text2 }) => (
		<View className="mt-stack-sm w-toast flex-row items-center rounded-card border border-app-primary/30 bg-app-primary-light p-card shadow-sm">
			<View className="mr-stack-md self-center">
				<Info color={Colors.primary} size={20} />
			</View>
			<View className="flex-1">
				{text1 ? (
					<Text variant="buttonLg" className="font-bold text-content">
						{text1}
					</Text>
				) : null}
				{text2 ? (
					<Text variant="bodySm" className="mt-stack-xs text-content-secondary">
						{text2}
					</Text>
				) : null}
			</View>
		</View>
	),
};

// Simple wrapper so we can import Toast and config together easily from Reusables path
export function CustomToast(props: Readonly<ToastProps>) {
	return <Toast config={toastConfig} {...props} />;
}

export { Toast };
