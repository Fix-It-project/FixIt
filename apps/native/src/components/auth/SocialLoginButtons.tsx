import { Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SocialLoginButtonsProps {
	/** "signup" = signup button style, "login" = login button style */
	variant?: "signup" | "login";
}

export default function SocialLoginButtons({ variant = "signup" }: SocialLoginButtonsProps) {
	if (variant === "login") {
		return (
			<Pressable className="bg-white border border-[#5982b3] rounded-lg h-14 flex-row items-center justify-center gap-3 active:opacity-70">
				<Ionicons name="logo-google" size={24} color="#111418" />
				<Text className="text-[#111418] text-[16px] font-medium">
					Login with Google
				</Text>
			</Pressable>
		);
	}

	return (
		<Pressable className="bg-white border border-[#e5e7eb] rounded-lg h-14 w-full flex-row items-center justify-center gap-3 active:opacity-70 shadow-sm">
			<Ionicons name="logo-google" size={24} color="#364153" />
			<Text className="text-[#364153] text-[16px] font-medium">Continue with Google</Text>
		</Pressable>
	);
}
