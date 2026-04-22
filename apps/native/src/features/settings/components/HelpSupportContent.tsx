import {
	CircleHelp,
	type LucideIcon,
	Mail,
	MessageCircle,
} from "lucide-react-native";
import { Linking, ScrollView, TouchableOpacity, View } from "react-native";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { Colors, elevation, shadowStyle } from "@/src/lib/theme";

function ContactItem({
	icon: Icon,
	label,
	value,
	onPress,
}: Readonly<{
	icon: LucideIcon;
	label: string;
	value: string;
	onPress: () => void;
}>) {
	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			className="flex-row items-center gap-list-row py-list-row-comfortable-y"
		>
			<View className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-full bg-app-primary-light">
				<Icon size={18} color={Colors.primary} strokeWidth={1.8} />
			</View>
			<View className="flex-1">
				<Text variant="caption" className="text-content-muted">
					{label}
				</Text>
				<Text variant="buttonLg" className="text-app-primary">
					{value}
				</Text>
			</View>
		</TouchableOpacity>
	);
}

interface HelpSupportContentProps {
	readonly description: string;
}

export default function HelpSupportContent({
	description,
}: HelpSupportContentProps) {
	return (
		<ScrollView
			className="flex-1 bg-surface-elevated"
			contentContainerClassName="gap-4 px-5 py-6"
		>
			<View
				className="rounded-card bg-surface px-card-roomy py-6"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<View className="mb-4 h-avatar-lg w-avatar-lg items-center justify-center rounded-full bg-app-primary-light">
					<CircleHelp size={28} color={Colors.primary} strokeWidth={1.8} />
				</View>
				<Text className="font-bold text-content text-lg">Help & Support</Text>
				<Text variant="bodySm" className="mt-2 text-content-muted">
					{description}
				</Text>
			</View>

			<View
				className="rounded-card bg-surface px-card-roomy py-2"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<ContactItem
					icon={Mail}
					label="Email us"
					value="support@fixit.app"
					onPress={() => {
						void Linking.openURL("mailto:support@fixit.app");
					}}
				/>
				<Separator />
				<ContactItem
					icon={MessageCircle}
					label="WhatsApp"
					value="+20 100 000 0000"
					onPress={() => {
						void Linking.openURL("whatsapp://send?phone=201000000000");
					}}
				/>
			</View>
		</ScrollView>
	);
}
