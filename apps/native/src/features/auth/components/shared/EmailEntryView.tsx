import { Mail } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FormInput from "@/src/components/forms/FormInput";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText, Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/design-tokens";
import type { useForgotPasswordMutation } from "@/src/features/auth/hooks/useForgotPasswordMutation";

interface EmailEntryViewProps {
	readonly email: string;
	readonly setEmail: (text: string) => void;
	readonly fieldErrors: Record<string, string | undefined>;
	readonly clearFieldError: (field: string) => void;
	readonly mutation: ReturnType<typeof useForgotPasswordMutation>;
	readonly onSubmit: () => void;
}

export default function EmailEntryView({
	email,
	setEmail,
	fieldErrors,
	clearFieldError,
	mutation,
	onSubmit,
}: EmailEntryViewProps) {
	const { t } = useTranslation("auth");
	const insets = useSafeAreaInsets();
	const isButtonActive = email.trim().length > 0 && !mutation.isPending;

	return (
		<>
			{/* Header */}
			<View className="mt-stack-sm mb-stack-2xl px-screen-x">
				<Text variant="h2" className="mb-stack-sm text-content">
					{t("forgotPassword.title")}
				</Text>
				<Text variant="body" className="text-content-secondary">
					{t("forgotPassword.subtitle")}
				</Text>
			</View>

			{/* Email Input */}
			<View className="px-screen-x">
				<FormInput
					value={email}
					onChangeText={(text) => {
						setEmail(text);
						clearFieldError("email");
						if (mutation.error) mutation.reset();
					}}
					placeholder={t("forgotPassword.emailPlaceholder")}
					icon={Mail}
					error={fieldErrors.email}
					disabled={mutation.isPending}
					variant="outline"
					clearable
					onClear={() => setEmail("")}
					keyboardType="email-address"
					autoCapitalize="none"
					required
					testID="forgot-email-input"
				/>
			</View>

			{/* Spacer */}
			<View className="flex-1" />

			{/* Bottom Button */}
			<View
				className="px-screen-x"
				style={{ paddingBottom: insets.bottom + 16 }}
			>
				<Button
					onPress={onSubmit}
					disabled={!isButtonActive}
					testID="forgot-submit"
				>
					{mutation.isPending ? (
						<ActivityIndicator color={Colors.surfaceOnPrimary} />
					) : (
						<BtnText variant="buttonLg">{t("forgotPassword.submit")}</BtnText>
					)}
				</Button>
			</View>
		</>
	);
}
