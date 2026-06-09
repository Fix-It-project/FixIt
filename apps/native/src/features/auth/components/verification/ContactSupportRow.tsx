import { Mail } from "lucide-react-native";
import { Linking, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { space } from "@/src/constants/design-tokens";
import { SUPPORT_EMAIL, supportMailto } from "@/src/constants/support";

interface ContactSupportRowProps {
	readonly prompt: string;
	readonly subject: string;
	/** `tonal` for the calm pending state, `primary` when it's the main action. */
	readonly emphasis?: "tonal" | "primary";
}

export function ContactSupportRow({
	prompt,
	subject,
	emphasis = "tonal",
}: ContactSupportRowProps) {
	return (
		<View style={{ gap: space[3] }}>
			<Text variant="bodySm" className="text-content-secondary">
				{prompt}
			</Text>
			<Button
				variant={emphasis}
				iconLeft={Mail}
				onPress={() => Linking.openURL(supportMailto(subject))}
				accessibilityLabel={`Email support at ${SUPPORT_EMAIL}`}
			>
				Email support
			</Button>
		</View>
	);
}
