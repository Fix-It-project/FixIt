import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText, Text } from "@/src/components/ui/text";
import { openMailApp } from "@/src/features/auth/utils/open-mail-app";

interface CheckInboxViewProps {
	readonly email: string;
	readonly cooldown: number;
	readonly isResending: boolean;
	readonly onResend: () => void;
}

export default function CheckInboxView({
	email,
	cooldown,
	isResending,
	onResend,
}: CheckInboxViewProps) {
	const { t } = useTranslation("auth");
	const insets = useSafeAreaInsets();

	return (
		<>
			{/* Header */}
			<View className="mt-stack-sm mb-stack-lg px-screen-x">
				<Text variant="h2" className="mb-stack-sm text-content">
					{t("forgotPassword.checkInboxTitle")}
				</Text>
				<Text variant="body" className="text-content-secondary">
					{t("forgotPassword.checkInboxBody")}
					{"\n"}
					<Text variant="body" className="font-semibold text-content">
						{email}
					</Text>
				</Text>
			</View>

			{/* Empty Space */}
			<View className="flex-1" />

			{/* Resend Section */}
			<View className="mb-card-roomy items-center">
				{cooldown > 0 ? (
					<Text variant="body" className="text-content-secondary">
						{t("forgotPassword.didNotGetEmail")}{" "}
						<Text variant="body" className="font-semibold">
							{t("forgotPassword.resendIn", { seconds: cooldown })}
						</Text>
					</Text>
				) : (
					<View className="flex-row items-center">
						<Text variant="body" className="text-content-secondary">
							{t("forgotPassword.didNotGetEmail")}{" "}
						</Text>
						<Button
							variant="link"
							size="sm"
							onPress={onResend}
							disabled={isResending}
						>
							{isResending
								? t("forgotPassword.sending")
								: t("forgotPassword.resend")}
						</Button>
					</View>
				)}
			</View>

			{/* Open Email App Button */}
			<View
				className="px-screen-x"
				style={{ paddingBottom: insets.bottom + 16 }}
			>
				<Button onPress={() => void openMailApp()}>
					<BtnText variant="buttonLg">
						{t("forgotPassword.openEmailApp")}
					</BtnText>
				</Button>
			</View>
		</>
	);
}
