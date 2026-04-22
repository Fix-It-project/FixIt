import { Shield } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import { Text } from "@/src/components/ui/text";
import { Colors, elevation, shadowStyle } from "@/src/lib/theme";

export default function TechnicianPrivacySecurityScreen() {
	return (
		<ScrollView
			className="flex-1 bg-surface-elevated"
			contentContainerClassName="px-screen-x py-6 gap-4"
		>
			<View
				className="rounded-card bg-surface px-card-roomy py-6"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-app-primary-light">
					<Shield size={28} color={Colors.primary} strokeWidth={1.8} />
				</View>
				<Text variant="bodyLg" className="font-bold text-content">
					Privacy & Security
				</Text>
				<Text variant="bodySm" className="mt-2 text-content-muted">
					Your technician profile and booking data are encrypted in transit and
					protected with role-based access controls across the FixIt platform.
				</Text>
			</View>

			<View
				className="rounded-card bg-surface px-card-roomy py-5"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<Text variant="buttonLg" className="text-content">
					Account information
				</Text>
				<Text variant="bodySm" className="mt-1 text-content-muted">
					We store the identity, contact, and service details required to verify
					your account and connect you with customers safely.
				</Text>
			</View>

			<View
				className="rounded-card bg-surface px-card-roomy py-5"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<Text variant="buttonLg" className="text-content">
					How we use your data
				</Text>
				<Text variant="bodySm" className="mt-1 text-content-muted">
					Your information is used to manage bookings, payouts, and trust
					signals inside the app. We do not sell your personal information.
				</Text>
			</View>
		</ScrollView>
	);
}
