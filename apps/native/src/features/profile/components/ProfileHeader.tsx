import { ActivityIndicator, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import ProfileAvatar from "./ProfileAvatar";

interface ProfileHeaderProps {
	readonly name: string | null;
	readonly isLoading: boolean;
	readonly imageUrl?: string | null;
	readonly onChangePhoto?: () => void;
}

export default function ProfileHeader({
	name,
	isLoading,
	imageUrl,
	onChangePhoto,
}: ProfileHeaderProps) {
	return (
		<View className="items-center bg-app-primary pt-stack-xl pb-stack-3xl">
			<ProfileAvatar
				name={name}
				imageUrl={imageUrl}
				onChangePhoto={onChangePhoto}
			/>
			<Text variant="h3" className="mt-stack-md font-bold text-surface-on-primary text-xl">
				{isLoading ? <ActivityIndicator color="white" /> : (name ?? "User")}
			</Text>
		</View>
	);
}
