import { router } from "expo-router";
import { ShieldOff } from "lucide-react-native";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import Animated, {
	Easing,
	FadeInDown,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import {
	DUR_REVEAL,
	DUR_STAGGER,
	STAGGER_GAP,
} from "@/src/constants/animation";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";
import { ContactSupportRow } from "@/src/features/auth/components/verification/ContactSupportRow";
import { type BlockedRole, ROUTES } from "@/src/lib/navigation";

interface BlockedScreenProps {
	readonly role: BlockedRole;
	readonly email?: string;
	readonly message?: string;
	readonly reason?: string;
}

interface RoleCopy {
	readonly title: string;
	readonly body: string;
	readonly contactSubject: string;
}

const COPY: Record<BlockedRole, RoleCopy> = {
	technician: {
		title: "Your technician account is blocked",
		body: "Your technician account has been blocked, so you can't sign in or take jobs right now. Reach out to our team and we'll help you sort it out.",
		contactSubject: "Help with my blocked FixIt technician account",
	},
	user: {
		title: "Your account is blocked",
		body: "Your account has been blocked, so you can't sign in or book services right now. Reach out to our team and we'll help you sort it out.",
		contactSubject: "Help with my blocked FixIt account",
	},
};

/**
 * Shared, role-aware Blocked screen for technicians and homeowners. Tone is
 * serious and respectful, not alarming: danger is an accent (the glyph + one
 * quiet settling ring), never a flood. The block reason, when present, is the
 * key informative element.
 */
export function BlockedScreen({
	role,
	email,
	message,
	reason,
}: BlockedScreenProps) {
	const c = useThemeColors();
	const insets = useSafeAreaInsets();
	const reducedMotion = useReducedMotion();
	const copy = COPY[role];

	// A single, one-shot ring that expands and settles — gravity without alarm.
	const settle = useSharedValue(reducedMotion ? 1 : 0);
	useEffect(() => {
		if (reducedMotion) return;
		settle.value = withTiming(1, {
			duration: DUR_REVEAL,
			easing: Easing.out(Easing.cubic),
		});
	}, [reducedMotion, settle]);
	const ringStyle = useAnimatedStyle(() => ({
		transform: [{ scale: 1 + settle.value * 0.6 }],
		opacity: 0.35 * (1 - settle.value),
	}));

	let step = 0;
	const fadeIn = () => {
		const delay = step++ * STAGGER_GAP;
		return reducedMotion
			? undefined
			: FadeInDown.delay(delay).duration(DUR_STAGGER);
	};

	const backToLogin = () =>
		router.replace(
			role === "technician" ? ROUTES.auth.techLogin : ROUTES.auth.login,
		);

	return (
		<View className="flex-1 bg-surface">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingTop: insets.top + space[8],
					paddingBottom: insets.bottom + space[8],
					paddingHorizontal: space[5],
					gap: space[5],
				}}
			>
				<Animated.View entering={fadeIn()}>
					<View
						style={{
							width: 56,
							height: 56,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Animated.View
							pointerEvents="none"
							style={[
								{
									position: "absolute",
									width: 56,
									height: 56,
									borderRadius: radius.pill,
									backgroundColor: c.danger,
								},
								ringStyle,
							]}
						/>
						<View
							style={{
								width: 56,
								height: 56,
								borderRadius: radius.pill,
								alignItems: "center",
								justifyContent: "center",
								backgroundColor: `${c.danger}1A`,
							}}
						>
							<ShieldOff size={26} color={c.danger} strokeWidth={2.2} />
						</View>
					</View>
				</Animated.View>

				<Animated.View entering={fadeIn()} style={{ gap: space[2] }}>
					<Text
						variant="caption"
						className="font-google-sans-bold uppercase"
						style={{ color: c.danger, letterSpacing: 1.4 }}
					>
						Account blocked
					</Text>
					<Text variant="h1" className="font-google-sans-bold text-content">
						{copy.title}
					</Text>
					<Text
						variant="body"
						className="text-content-secondary"
						style={{ maxWidth: 520 }}
					>
						{message ?? copy.body}
					</Text>
					{email ? (
						<Text variant="caption" className="text-content-muted">
							Signed in as {email}
						</Text>
					) : null}
				</Animated.View>

				{reason ? (
					<Animated.View
						entering={fadeIn()}
						style={{
							borderRadius: radius.card,
							borderWidth: 1,
							borderColor: c.borderDefault,
							backgroundColor: c.surfaceElevated,
							paddingHorizontal: space[4],
							paddingVertical: space[3],
							gap: space[1],
						}}
					>
						<Text
							variant="caption"
							className="font-google-sans-bold text-content-muted uppercase"
							style={{ letterSpacing: 1 }}
						>
							Reason from our team
						</Text>
						<Text variant="bodySm" className="text-content">
							{reason}
						</Text>
					</Animated.View>
				) : null}

				<Animated.View entering={fadeIn()}>
					<Divider color={c.borderDefault} />
				</Animated.View>

				<Animated.View entering={fadeIn()}>
					<ContactSupportRow
						prompt="We're here to help you resolve this."
						subject={copy.contactSubject}
						emphasis="primary"
					/>
				</Animated.View>

				<Animated.View
					entering={fadeIn()}
					style={{ alignItems: "center", paddingTop: space[1] }}
				>
					<Button variant="link" size="sm" onPress={backToLogin}>
						Back to login
					</Button>
				</Animated.View>
			</ScrollView>
		</View>
	);
}

function Divider({ color }: { readonly color: string }): ReactNode {
	return <View style={{ height: 1, backgroundColor: color, opacity: 0.7 }} />;
}
