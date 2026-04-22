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
		<View className="mt-2 w-[90%] flex-row items-center rounded-2xl border border-edge/50 bg-surface p-4 shadow-sm">
			<View className="mr-3 self-center">
				<CheckCircle2 color={Colors.success} size={20} />
			</View>
			<View className="flex-1">
				{text1 ? (
					<Text variant="buttonLg" className="font-bold text-content">
						{text1}
					</Text>
				) : null}
				{text2 ? (
					<Text variant="bodySm" className="mt-1 text-content-secondary">
						{text2}
					</Text>
				) : null}
			</View>
		</View>
	),
	error: ({ text1, text2 }) => (
		<View className="mt-2 w-[90%] flex-row items-center rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
			<View className="mr-3 self-center">
				<XCircle color={Colors.danger} size={20} />
			</View>
			<View className="flex-1">
				{text1 ? (
					<Text variant="buttonLg" className="font-bold text-red-800">
						{text1}
					</Text>
				) : null}
				{text2 ? (
					<Text variant="bodySm" className="mt-1 text-red-600">
						{text2}
					</Text>
				) : null}
			</View>
		</View>
	),
	info: ({ text1, text2 }) => (
		<View className="mt-2 w-[90%] flex-row items-center rounded-2xl border border-app-primary/30 bg-app-primary-light p-4 shadow-sm">
			<View className="mr-3 self-center">
				<Info color={Colors.primary} size={20} />
			</View>
			<View className="flex-1">
				{text1 ? (
					<Text variant="buttonLg" className="font-bold text-content">
						{text1}
					</Text>
				) : null}
				{text2 ? (
					<Text variant="bodySm" className="mt-1 text-content-secondary">
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
