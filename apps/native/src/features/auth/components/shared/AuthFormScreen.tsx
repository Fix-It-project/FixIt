import type { ReactNode } from "react";
import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ErrorBanner from "@/src/components/feedback/ErrorBanner";
import BackButton from "@/src/components/ui/BackButton";

interface Props {
	readonly children: ReactNode;
	readonly errorMessage?: string | null;
}

export default function AuthFormScreen({ children, errorMessage }: Props) {
	const insets = useSafeAreaInsets();

	return (
		<KeyboardAvoidingView
			behavior="padding"
			className="flex-1 bg-app-primary-light"
		>
			<View style={{ flex: 1 }}>
				<View
					className="flex-row items-center justify-between px-card pb-stack-sm"
					style={{ paddingTop: insets.top + 8 }}
				>
					<BackButton variant="header" size="md" />
					<View className="h-control-back-md w-control-back-md" />
				</View>

				<ErrorBanner message={errorMessage ?? null} variant="warning" />

				{children}
			</View>
		</KeyboardAvoidingView>
	);
}
