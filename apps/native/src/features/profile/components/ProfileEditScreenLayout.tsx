import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import PageHeader from "@/src/components/layout/PageHeader";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";

interface ProfileEditScreenLayoutProps {
	readonly children: ReactNode;
	readonly isPending: boolean;
	readonly isSaveDisabled: boolean;
	readonly onBackPress: () => void;
	readonly onSavePress: () => void;
}

export default function ProfileEditScreenLayout({
	children,
	isPending,
	isSaveDisabled,
	onBackPress,
	onSavePress,
}: ProfileEditScreenLayoutProps) {
	const { t } = useTranslation("profile");
	const themeColors = useThemeColors();
	const { width } = useWindowDimensions();
	const horizontalPadding = Math.min(Math.max(width * 0.05, 16), 28);

	return (
		<ScreenSafeAreaView className="flex-1 bg-surface" edges={["top"]}>
			<PageHeader
				title={t("header.editTitle")}
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
					{children}

					<View className="mt-stack-sm">
						<Button onPress={onSavePress} disabled={isSaveDisabled}>
							{isPending ? (
								<ActivityIndicator color={themeColors.surfaceOnPrimary} />
							) : (
								<Text variant="body">{t("edit.save")}</Text>
							)}
						</Button>
					</View>
				</View>
			</KeyboardAwareScrollView>
		</ScreenSafeAreaView>
	);
}
