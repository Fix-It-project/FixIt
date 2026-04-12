import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/src/lib/theme";
import ErrorBanner from "@/src/features/auth/components/shared/ErrorBanner";

interface Props {
	readonly children: ReactNode;
	readonly errorMessage?: string | null;
}

export default function AuthFormScreen({ children, errorMessage }: Props) {
	const themeColors = useThemeColors();
	const insets = useSafeAreaInsets();

	return (
		<KeyboardAvoidingView behavior="padding" className="flex-1 bg-app-primary-light">
			<View style={{ flex: 1 }}>
				<View
					className="flex-row items-center justify-between px-4 pb-2"
					style={{ paddingTop: insets.top + 8 }}
				>
					<Pressable
						onPress={() => router.back()}
						className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
					>
						<ArrowLeft size={24} color={themeColors.textPrimary} />
					</Pressable>
					<View className="h-10 w-10" />
				</View>

				<ErrorBanner message={errorMessage ?? null} variant="warning" />

				{children}
			</View>
		</KeyboardAvoidingView>
	);
}
