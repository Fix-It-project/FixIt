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
				contentContainerClassName="items-center px-6 pt-6"
				contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
			>
				{/* Header */}
				<View className="mt-6 mb-6 flex w-full items-center">
					<View className="flex-row items-center gap-2">
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
				<View className="mb-4 w-full max-w-sm">
					<Text variant="h2" className="text-content">
						Select Role{" "}
					</Text>
				</View>

				{/* Role Cards Container */}
				<View className="w-full max-w-sm flex-1 justify-center gap-6 pb-8">
					{/* User Card - Light Blue */}
					<Pressable
						className="relative h-[250px] w-full overflow-hidden rounded-3xl border-2 border-blue-200/50 bg-role-user p-8 active:opacity-90"
						style={{
							...shadowStyle(elevation.modal, {
								shadowColor: Colors.roleAccent,
								opacity: 0.2,
							}),
						}}
						onPress={goToUserSignup}
					>
						{/* Profile Icon - Top Right */}
						<View className="absolute top-4 right-4 h-32 w-32">
							<View className="h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-blue-300/30 bg-role-accent shadow-lg">
								<Image
									source={require("../../assets/avatars/business-man-user-icon-vector-4333097-removebg-preview.png")}
									className="h-40 w-32"
									resizeMode="cover"
								/>
							</View>
						</View>

						{/* Content - Bottom Left */}
						<View className="absolute right-6 bottom-6 left-6">
							<View className="mb-1 flex-row items-center gap-2">
								<View className="rounded-lg bg-white/80 p-1.5">
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
							<Text variant="caption" className="mt-1 text-role-label">
								Find trusted experts for repairs & cleaning instantly.
							</Text>
						</View>
					</Pressable>

					{/* Technician Card - Primary Blue */}
					<Pressable
						className="relative h-[250px] w-full overflow-hidden rounded-3xl bg-role-tech p-8 active:opacity-90"
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
							className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-white/10"
							style={{ opacity: 0.3 }}
						/>

						{/* Profile Icon - Top Left */}
						<View className="absolute top-4 left-4 h-32 w-32">
							<View className="h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-blue-300/30 bg-role-accent shadow-lg">
								<Image
									source={require("../../assets/avatars/technician.png")}
									className="h-32 w-32"
									resizeMode="cover"
								/>
							</View>
						</View>

						{/* Content - Bottom Right */}
						<View className="absolute right-6 bottom-6 left-6 items-end">
							<View className="mb-1 flex-row items-center gap-2">
								<Text
									variant="caption"
									className="font-semibold text-blue-100 uppercase tracking-wider"
								>
									I AM A PRO
								</Text>
								<View className="rounded-lg bg-white/20 p-1.5">
									<Hammer size={16} color={themeColors.surfaceBase} />
								</View>
							</View>
							<Text
								variant="h2"
								className="text-right text-white leading-tight"
							>
								Apply as a{"\n"}Technician
							</Text>
							<Text
								variant="caption"
								className="mt-1 max-w-[85%] text-right text-blue-100"
							>
								Grow your business and connect with local customers.
							</Text>
						</View>
					</Pressable>
				</View>

				{/* Login Section */}
				<View className="mb-6 w-full max-w-sm">
					<Pressable
						className="w-full flex-row items-center justify-center px-6 py-4 active:opacity-70"
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
				<View className="mb-8 w-full max-w-sm px-4">
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
