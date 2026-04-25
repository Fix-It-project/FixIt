import type { ReactNode } from "react";
import { ActivityIndicator, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import ErrorBanner from "@/src/components/feedback/ErrorBanner";
import PageHeader from "@/src/components/PageHeader";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/lib/theme";

interface ProfileEditScreenLayoutProps {
	readonly children: ReactNode;
	readonly errorMessage: string | null;
	readonly isPending: boolean;
	readonly isSaveDisabled: boolean;
	readonly onBackPress: () => void;
	readonly onSavePress: () => void;
}

export default function ProfileEditScreenLayout({
	children,
	errorMessage,
	isPending,
	isSaveDisabled,
	onBackPress,
	onSavePress,
}: ProfileEditScreenLayoutProps) {
	const themeColors = useThemeColors();
	const { width } = useWindowDimensions();
	const horizontalPadding = Math.min(Math.max(width * 0.05, 16), 28);

	return (
		<SafeAreaView className="flex-1 bg-surface-elevated" edges={["top"]}>
			<PageHeader
				title="Edit Profile"
				variant="surface"
				onBackPress={onBackPress}
			/>

			<KeyboardAwareScrollView
				className="flex-1"
				style={{ paddingHorizontal: horizontalPadding }}
				contentContainerStyle={{
					paddingTop: spacing.card.roomy.padding,
					paddingBottom: spacing.stack["2xl"],
					alignItems: "center",
				}}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="interactive"
				bottomOffset={spacing.card.roomy.padding}
			>
				<View className="w-full max-w-[560px] gap-stack-lg">
					<ErrorBanner message={errorMessage} />
					{children}

					<View className="mt-stack-sm">
						<Button onPress={onSavePress} disabled={isSaveDisabled}>
							{isPending ? (
								<ActivityIndicator color={themeColors.surfaceBase} />
							) : (
								<Text variant="body">Save Changes</Text>
							)}
						</Button>
					</View>
				</View>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	);
}
