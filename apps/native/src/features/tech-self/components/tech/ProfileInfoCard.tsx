import {
	FileText,
	type LucideIcon,
	Mail,
	Phone,
	Wrench,
} from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import type { TechnicianSelfProfile } from "@/src/features/tech-self/schemas/response.schema";
import { Colors, elevation, shadowStyle } from "@/src/lib/theme";

function InfoRow({
	icon: Icon,
	label,
	value,
}: {
	readonly icon: LucideIcon;
	readonly label: string;
	readonly value: string;
}) {
	return (
		<View className="flex-row items-center gap-list-row py-list-row-comfortable-y">
			<View className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-pill bg-app-primary-light">
				<Icon size={18} color={Colors.primary} strokeWidth={1.8} />
			</View>
			<View className="flex-1">
				<Text variant="caption" className="text-content-muted text-xs">{label}</Text>
				<Text variant="buttonLg" className="text-content" numberOfLines={2}>
					{value}
				</Text>
			</View>
		</View>
	);
}

interface TechProfileInfoCardProps {
	readonly profile: TechnicianSelfProfile | undefined;
	readonly isLoading: boolean;
}

export default function ProfileInfoCard({
	profile,
	isLoading,
}: TechProfileInfoCardProps) {
	if (isLoading) {
		return (
			<View className="items-center py-stack-3xl">
				<ActivityIndicator size="large" color={Colors.primary} />
			</View>
		);
	}

	return (
		<View className="mt-stack-md px-screen-x">
			<View
				className="rounded-card bg-surface px-card-roomy py-stack-sm"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<InfoRow icon={Mail} label="Email" value={profile?.email ?? "—"} />
				<Separator />
				<InfoRow
					icon={Phone}
					label="Phone"
					value={profile?.phone ?? "Not provided"}
				/>
				<Separator />
				<InfoRow
					icon={Wrench}
					label="Specialty"
					value={profile?.category_name ?? "Not assigned"}
				/>
				{!!profile?.description && (
					<>
						<Separator />
						<InfoRow
							icon={FileText}
							label="About"
							value={profile.description}
						/>
					</>
				)}
			</View>
		</View>
	);
}
