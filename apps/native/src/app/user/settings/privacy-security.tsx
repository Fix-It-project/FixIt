import { Shield } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, elevation, shadowStyle } from "@/src/lib/theme";

export default function PrivacySecurityScreen() {
	return (
		<ScrollView
			className="flex-1 bg-surface-elevated"
			contentContainerClassName="px-screen-x py-stack-xl gap-stack-lg"
		>
			<View
				className="rounded-card bg-surface px-card-roomy py-stack-xl"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<View className="mb-stack-lg h-avatar-lg w-avatar-lg items-center justify-center rounded-pill bg-app-primary-light">
					<Shield size={28} color={Colors.primary} strokeWidth={1.8} />
				</View>
				<Text variant="bodyLg" className="font-bold text-content">
					Privacy & Security
				</Text>
				<Text variant="bodySm" className="mt-stack-sm text-content-muted">
					Your data is encrypted and never shared with third parties without
					your consent. We follow industry-standard security practices to keep
					your account safe.
				</Text>
			</View>

			<View
				className="rounded-card bg-surface px-card-roomy py-card-roomy"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<Text variant="buttonLg" className="text-content">
					Data we collect
				</Text>
				<Text variant="bodySm" className="mt-stack-xs text-content-muted">
					Name, email, phone number, and address — only what's needed to provide
					the service.
				</Text>
			</View>

			<View
				className="rounded-card bg-surface px-card-roomy py-card-roomy"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<Text variant="buttonLg" className="text-content">
					How we use your data
				</Text>
				<Text variant="bodySm" className="mt-stack-xs text-content-muted">
					Solely to match you with technicians and manage your bookings. We
					never sell your information.
				</Text>
			</View>
		</ScrollView>
	);
}
