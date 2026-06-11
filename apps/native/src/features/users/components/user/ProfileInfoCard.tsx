import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { Colors, elevation, shadowStyle } from "@/src/constants/design-tokens";
import type { UserProfile } from "@/src/features/users/schemas/response.schema";
import { formatAddress } from "@/src/lib/helpers/format-address";
import { type LucideIcon, Mail, MapPin, Phone } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

function InfoRow({
	icon: Icon,
	label,
	value,
}: Readonly<{
	icon: LucideIcon;
	label: string;
	value: string;
}>) {
	return (
		<View className="flex-row items-center gap-list-row py-list-row-comfortable-y">
			<View className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-pill bg-app-primary-light">
				<Icon size={18} color={Colors.primary} strokeWidth={1.8} />
			</View>
			<View className="flex-1">
				<Text variant="caption" className="text-content-muted text-xs">
					{label}
				</Text>
				<Text variant="buttonLg" className="text-content" numberOfLines={2}>
					{value}
				</Text>
			</View>
		</View>
	);
}

interface ProfileInfoCardProps {
	readonly profile: UserProfile | undefined;
	readonly isLoading: boolean;
}

export default function ProfileInfoCard({
	profile,
	isLoading,
}: ProfileInfoCardProps) {
	const { t } = useTranslation("profile");
	if (isLoading) {
		return (
			<View className="items-center py-stack-3xl">
				<ActivityIndicator size="large" color={Colors.primary} />
			</View>
		);
	}

	const primaryAddress = profile?.addresses?.[0];
	const addressText = formatAddress(primaryAddress, t("info.noAddress"));

	return (
		<View className="mt-stack-md px-screen-x">
			<View
				className="rounded-card bg-card px-card-roomy py-stack-sm"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<InfoRow
					icon={Mail}
					label={t("info.email")}
					value={profile?.email ?? t("info.empty")}
				/>
				<Separator />
				<InfoRow
					icon={Phone}
					label={t("info.phone")}
					value={profile?.phone ?? t("info.notProvided")}
				/>
				<Separator />
				<InfoRow icon={MapPin} label={t("info.address")} value={addressText} />
			</View>
		</View>
	);
}
