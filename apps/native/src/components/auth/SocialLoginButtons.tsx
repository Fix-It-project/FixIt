import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SocialLoginButtonsProps {
	/** "compact" = smaller side-by-side buttons (signup), "full" = stacked full-width (login) */
	variant?: "compact" | "full";
}

export default function SocialLoginButtons({ variant = "compact" }: SocialLoginButtonsProps) {
	if (variant === "full") {
		return (
			<View className="gap-4">
				<Pressable className="bg-white border border-[#5982b3] rounded-full h-14 flex-row items-center justify-center gap-3 active:opacity-70">
					<Ionicons name="logo-google" size={24} color="#111418" />
					<Text className="text-[#111418] text-[16px] font-medium">
						Login with Google
					</Text>
				</Pressable>

				<Pressable className="bg-[#111418] rounded-full h-14 flex-row items-center justify-center gap-3 active:opacity-70">
					<Ionicons name="logo-apple" size={24} color="#ffffff" />
					<Text className="text-white text-[16px] font-medium">
						Login with Apple
					</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View className="flex-row gap-6 justify-center">
			<Pressable className="bg-white border border-[#e5e7eb] rounded-[30px] h-11 px-6 flex-row items-center gap-3 active:opacity-70 shadow-sm">
				<Ionicons name="logo-google" size={20} color="#364153" />
				<Text className="text-[#364153] text-[12px] font-medium">Google</Text>
			</Pressable>

			<Pressable className="bg-white border border-[#e5e7eb] rounded-[30px] h-11 px-6 flex-row items-center gap-3 active:opacity-70 shadow-sm">
				<Ionicons name="logo-apple" size={20} color="#364153" />
				<Text className="text-[#364153] text-[12px] font-medium">Apple</Text>
			</Pressable>
		</View>
	);
}
