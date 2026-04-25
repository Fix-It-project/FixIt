import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Hammer, HelpCircle } from "lucide-react-native";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/src/components/ui/text";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";
import {
	Colors,
	elevation,
	shadowStyle,
	space,
	useThemeColors,
} from "@/src/lib/theme";

export default function RoleSelectionScreen() {
	const themeColors = useThemeColors();
	const insets = useSafeAreaInsets();
	const logoSize = space[10];
	const logoRadius = space[2.5];
	const goToUserSignup = useDebounce(() => router.push(ROUTES.auth.signup));
	const goToTechSignup = useDebounce(() => router.push(ROUTES.auth.techSignup));
	const goToLogin = useDebounce(() => router.push(ROUTES.auth.login));

	return (
		<LinearGradient
			colors={[
				themeColors.gradientRoleStart,
				themeColors.gradientRoleMid,
				themeColors.gradientRoleEnd,
			]}
			locations={[0, 0.5, 1]}
			className="flex-1"
		>
			<ScrollView
				className="flex-1"
				contentContainerClassName="items-center px-button-x pt-stack-xl"
				contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
			>
				{/* Header */}
				<View className="mt-stack-xl mb-stack-xl flex w-full items-center">
					<View className="flex-row items-center gap-stack-sm">
						<Image
							source={require("../../assets/images/fixit.png")}
							style={{
								width: logoSize,
								height: logoSize,
								borderRadius: logoRadius,
							}}
							resizeMode="contain"
						/>
						<View className="flex-row">
							<Text variant="h2" className="text-content tracking-tight">
								Fix
							</Text>
							<Text variant="h2" className="text-app-primary tracking-tight">
								IT
							</Text>
						</View>
					</View>
				</View>

				{/* Subtitle */}
				<View className="mb-stack-lg w-full max-w-sm">
					<Text variant="h2" className="text-content">
						Select Role{" "}
					</Text>
				</View>

				{/* Role Cards Container */}
				<View className="w-full max-w-sm flex-1 justify-center gap-stack-xl pb-stack-2xl">
					{/* User Card - Light Blue */}
					<Pressable
						className="relative h-media-attachment w-full overflow-hidden rounded-hero border-selected border-overlay-md bg-role-user p-stack-2xl active:opacity-90"
						style={{
							...shadowStyle(elevation.modal, {
								shadowColor: Colors.roleAccent,
								opacity: 0.2,
							}),
						}}
						onPress={goToUserSignup}
					>
						{/* Profile Icon - Top Right */}
						<View className="absolute top-card right-4 h-media-role-avatar w-media-role-avatar">
							<View className="h-full w-full items-center justify-center overflow-hidden rounded-pill border-selected border-overlay-md bg-role-accent shadow-lg">
								<Image
									source={require("../../assets/avatars/business-man-user-icon-vector-4333097-removebg-preview.png")}
									className="h-media-role-avatar w-media-role-avatar"
									resizeMode="cover"
								/>
							</View>
						</View>

						{/* Content - Bottom Left */}
						<View className="absolute right-6 bottom-6 left-6">
							<View className="mb-stack-xs flex-row items-center gap-stack-sm">
								<View className="rounded-compact bg-surface/80 p-stack-sm">
									<HelpCircle size={16} color={Colors.primary} />
								</View>
								<Text
									variant="caption"
									className="font-semibold text-role-label uppercase tracking-wider"
								>
									I NEED HELP
								</Text>
							</View>
							<Text variant="h2" className="text-content leading-tight">
								Sign up as{"\n"}a User
							</Text>
							<Text variant="caption" className="mt-stack-xs text-role-label">
								Find trusted experts for repairs & cleaning instantly.
							</Text>
						</View>
					</Pressable>

					{/* Technician Card - Primary Blue */}
					<Pressable
						className="relative h-media-attachment w-full overflow-hidden rounded-hero bg-role-tech p-stack-2xl active:opacity-90"
						style={{
							...shadowStyle(elevation.modal, {
								shadowColor: Colors.primary,
								opacity: 0.3,
							}),
						}}
						onPress={goToTechSignup}
					>
						{/* Background blur effect */}
						<View
							className="absolute -bottom-10 -left-10 h-media-role-orb w-media-role-orb rounded-pill bg-overlay-sm"
							style={{ opacity: 0.3 }}
						/>

						{/* Profile Icon - Top Left */}
						<View className="absolute top-card left-4 h-media-role-avatar w-media-role-avatar">
							<View className="h-full w-full items-center justify-center overflow-hidden rounded-pill border-selected border-overlay-md bg-role-accent shadow-lg">
								<Image
									source={require("../../assets/avatars/technician.png")}
									className="h-media-role-avatar w-media-role-avatar"
									resizeMode="cover"
								/>
							</View>
						</View>

						{/* Content - Bottom Right */}
						<View className="absolute right-6 bottom-6 left-6 items-end">
							<View className="mb-stack-xs flex-row items-center gap-stack-sm">
								<Text
									variant="caption"
									className="font-semibold text-overlay-bright uppercase tracking-wider"
								>
									I AM A PRO
								</Text>
								<View className="rounded-compact bg-overlay-md p-stack-sm">
									<Hammer size={16} color={themeColors.surfaceBase} />
								</View>
							</View>
							<Text
								variant="h2"
								className="text-right text-surface-on-primary leading-tight"
							>
								Apply as a{"\n"}Technician
							</Text>
							<Text
								variant="caption"
								className="mt-stack-xs max-w-[85%] text-right text-overlay-bright"
							>
								Grow your business and connect with local customers.
							</Text>
						</View>
					</Pressable>
				</View>

				{/* Login Section */}
				<View className="mb-stack-xl w-full max-w-sm">
					<Pressable
						className="w-full flex-row items-center justify-center px-button-x py-card active:opacity-70"
						onPress={goToLogin}
					>
						<Text variant="label" className="text-content-secondary">
							Already have an account?{" "}
						</Text>
						<Text variant="label" className="font-bold text-app-primary">
							Log in
						</Text>
					</Pressable>
				</View>

				{/* Terms of Service */}
				<View className="mb-stack-2xl w-full max-w-sm px-card">
					<Text variant="caption" className="text-center text-content-muted">
						By signing up, you agree to our{" "}
						<Text variant="caption" className="font-semibold text-app-primary">
							Terms of Service
						</Text>{" "}
						and{" "}
						<Text variant="caption" className="font-semibold text-app-primary">
							Privacy Policy
						</Text>
					</Text>
				</View>
			</ScrollView>
		</LinearGradient>
	);
}
