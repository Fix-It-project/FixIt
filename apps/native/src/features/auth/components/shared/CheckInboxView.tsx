import { Pressable, View } from "react-native";
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
	const insets = useSafeAreaInsets();

	return (
		<>
			{/* Header */}
			<View className="mt-2 mb-4 px-screen-x">
				<Text variant="h2" className="mb-2 text-content">
					Check your inbox
				</Text>
				<Text variant="body" className="text-content-secondary">
					A link to reset your password was sent to{"\n"}
					<Text variant="body" className="font-semibold text-content">
						{email}
					</Text>
				</Text>
			</View>

			{/* Empty Space */}
			<View className="flex-1" />

			{/* Resend Section */}
			<View className="mb-5 items-center">
				{cooldown > 0 ? (
					<Text variant="body" className="text-content-secondary">
						Didn't get an email?{" "}
						<Text variant="body" className="font-semibold">
							Resend in {cooldown}
						</Text>
					</Text>
				) : (
					<View className="flex-row items-center">
						<Text variant="body" className="text-content-secondary">
							Didn't get an email?{" "}
						</Text>
						<Pressable
							onPress={onResend}
							disabled={isResending}
							className="active:opacity-70"
						>
							<Text
								variant="body"
								className="font-bold text-app-primary underline"
							>
								{isResending ? "Sending..." : "Resend"}
							</Text>
						</Pressable>
					</View>
				)}
			</View>

			{/* Open Email App Button */}
			<View
				className="px-screen-x"
				style={{ paddingBottom: insets.bottom + 16 }}
			>
				<Button onPress={() => void openMailApp()}>
					<BtnText>Open email app</BtnText>
				</Button>
			</View>
		</>
	);
}
