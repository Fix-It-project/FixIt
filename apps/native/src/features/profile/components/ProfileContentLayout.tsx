import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import ProfileHeader from "./ProfileHeader";
import ProfileStatsSection from "./ProfileStatsSection";

interface ProfileContentLayoutProps {
	readonly name: string | null;
	readonly isLoading: boolean;
	readonly imageUrl?: string | null;
	readonly onChangePhoto?: () => void;
	readonly bookings: number;
	readonly completed: number;
	readonly children: ReactNode;
}

export default function ProfileContentLayout({
	name,
	isLoading,
	imageUrl,
	onChangePhoto,
	bookings,
	completed,
	children,
}: ProfileContentLayoutProps) {
	return (
		<View className="flex-1 bg-surface">
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="pb-screen-bottom-inset"
			>
				<ProfileHeader
					name={name}
					isLoading={isLoading}
					imageUrl={imageUrl}
					onChangePhoto={onChangePhoto}
				/>
				<ProfileStatsSection bookings={bookings} completed={completed} />
				{children}
			</ScrollView>
		</View>
	);
}
