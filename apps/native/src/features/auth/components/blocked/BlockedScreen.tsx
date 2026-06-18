import { router } from "expo-router";
import { ShieldOff } from "lucide-react-native";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
	readonly titleKey: "blocked.technicianTitle" | "blocked.userTitle";
	readonly bodyKey: "blocked.technicianBody" | "blocked.userBody";
	readonly contactSubjectKey:
		| "blocked.technicianContactSubject"
		| "blocked.userContactSubject";
}

const COPY: Record<BlockedRole, RoleCopy> = {
	technician: {
		titleKey: "blocked.technicianTitle",
		bodyKey: "blocked.technicianBody",
		contactSubjectKey: "blocked.technicianContactSubject",
	},
	user: {
		titleKey: "blocked.userTitle",
		bodyKey: "blocked.userBody",
		contactSubjectKey: "blocked.userContactSubject",
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
	const { t } = useTranslation("auth");
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
						{t("blocked.eyebrow")}
					</Text>
					<Text variant="h1" className="font-google-sans-bold text-content">
						{t(copy.titleKey)}
					</Text>
					<Text
						variant="body"
						className="text-content-secondary"
						style={{ maxWidth: 520 }}
					>
						{message ?? t(copy.bodyKey)}
					</Text>
					{email ? (
						<Text variant="caption" className="text-content-muted">
							{t("blocked.signedInAs", { email })}
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
							{t("blocked.reasonTitle")}
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
						prompt={t("blocked.contactPrompt")}
						subject={t(copy.contactSubjectKey)}
						emphasis="primary"
					/>
				</Animated.View>

				<Animated.View
					entering={fadeIn()}
					style={{ alignItems: "center", paddingTop: space[1] }}
				>
					<Button variant="link" size="sm" onPress={backToLogin}>
						{t("blocked.backToLogin")}
					</Button>
				</Animated.View>
			</ScrollView>
		</View>
	);
}

function Divider({ color }: { readonly color: string }): ReactNode {
	return <View style={{ height: 1, backgroundColor: color, opacity: 0.7 }} />;
}
