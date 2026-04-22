import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "@/src/components/ui/BackButton";
import { Text } from "@/src/components/ui/text";

interface AuthPageLayoutProps {
	readonly title: string;
	readonly subtitle: string;
	readonly children: ReactNode;
}

export default function AuthPageLayout({
	title,
	subtitle,
	children,
}: AuthPageLayoutProps) {
	const insets = useSafeAreaInsets();

	return (
		<KeyboardAvoidingView
			behavior="padding"
			className="flex-1 bg-app-primary-light"
		>
			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardDismissMode="interactive"
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: insets.bottom + 24,
				}}
			>
				{/* Back Button */}
				<BackButton
					variant="header"
					size="md"
					className="ml-5"
					style={{ marginTop: insets.top + 12 }}
				/>

				{/* Header */}
				<View className="mt-3 mb-10 px-screen-x">
					<Text variant="h1" className="mb-2 text-content">
						{title}
					</Text>
					<Text variant="body" className="text-content-secondary">
						{subtitle}
					</Text>
				</View>

				{/* Form Content */}
				<View className="gap-6 px-screen-x">{children}</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
