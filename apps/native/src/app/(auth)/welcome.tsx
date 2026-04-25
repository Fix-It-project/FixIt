import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";
import { space, useThemeColors } from "@/src/lib/theme";

export default function WelcomeScreen() {
	const themeColors = useThemeColors();
	const insets = useSafeAreaInsets();
	const logoSize = space[20] + space[8];
	const logoRadius = space[6] + space[0.5];
	const goToRoleSelection = useDebounce(() =>
		router.push(ROUTES.auth.roleSelection),
	);

	return (
		<LinearGradient
			colors={[
				themeColors.gradientStart,
				themeColors.gradientMid,
				themeColors.gradientEnd,
			]}
			locations={[0, 0.5, 1]}
			className="flex-1"
		>
			{/* Main Content */}
			<View
				className="flex-1 items-center px-button-lg-x"
				style={{
					paddingTop: insets.top + 145,
					paddingBottom: insets.bottom + 20,
				}}
			>
				{/* Logo Container */}
				<View className="mb-[33px]">
					<Image
						source={require("../../assets/images/fixit.png")}
						style={{
							width: logoSize,
							height: logoSize,
							borderRadius: logoRadius,
						}}
						resizeMode="contain"
					/>
				</View>

				{/* App Name */}
				<View className="mb-stack-sm flex-row items-center">
					<Text variant="display" className="text-content tracking-tight">
						Fix
					</Text>
					<Text
						variant="display"
						className="text-app-primary-dark tracking-tight"
					>
						IT
					</Text>
				</View>

				{/* Subtitle */}
				<Text
					variant="body"
					className="mb-[76px] font-light text-content-secondary"
				>
					Fast & Reliable
				</Text>

				{/* Buttons */}
				<View className="w-full max-w-[327px] gap-stack-lg">
					<Button
						onPress={goToRoleSelection}
						className="flex-row gap-stack-sm shadow-sm"
					>
						<Text variant="buttonLg">Get Started</Text>
						<ArrowRight size={20} color={themeColors.surfaceBase} />
					</Button>
				</View>

				{/* Terms and Privacy */}
				<View className="absolute px-button-lg-x" style={{ bottom: insets.bottom + 18 }}>
					<Text variant="caption" className="text-center text-content-muted">
						By pressing on "Sign Up", you agree to our{" "}
						<Text variant="caption" className="underline">
							Terms of Service
						</Text>
						{"\n"}and{" "}
						<Text variant="caption" className="underline">
							Privacy Policy
						</Text>
					</Text>
				</View>
			</View>
		</LinearGradient>
	);
}
