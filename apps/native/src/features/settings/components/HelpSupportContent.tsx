import { type LucideIcon, Mail, MessageCircle } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, TouchableOpacity, View } from "react-native";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/design-tokens";

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
			<Icon size={22} color={Colors.primary} strokeWidth={1.8} />
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
	const { t } = useTranslation("settings");
	return (
		<ScrollView
			className="flex-1 bg-surface"
			contentContainerClassName="px-screen-x py-stack-lg"
		>
			<Text variant="bodySm" className="mb-stack-md text-content-muted">
				{description}
			</Text>
			<ContactItem
				icon={Mail}
				label={t("help.emailLabel")}
				value="support@fixit.app"
				onPress={() => {
					void Linking.openURL("mailto:support@fixit.app");
				}}
			/>
			<Separator />
			<ContactItem
				icon={MessageCircle}
				label={t("help.whatsappLabel")}
				value="+20 100 000 0000"
				onPress={() => {
					void Linking.openURL("whatsapp://send?phone=201000000000");
				}}
			/>
		</ScrollView>
	);
}
