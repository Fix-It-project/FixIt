import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import {
	ArrowRight,
	BadgeCheck,
	FileX,
	type LucideIcon,
	ShieldCheck,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { DUR_STAGGER, STAGGER_GAP } from "@/src/constants/animation";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";
import { logger } from "@/src/lib/logger";
import { ROUTES, type TechVerificationState } from "@/src/lib/navigation";
import { CancelApplicationModal } from "./CancelApplicationModal";
import { ContactSupportRow } from "./ContactSupportRow";
import { DocumentsReceivedPanel } from "./DocumentsReceivedPanel";
import { ReviewTimeline } from "./ReviewTimeline";

interface VerificationScreenProps {
	readonly state: TechVerificationState;
	readonly email?: string;
	readonly message?: string;
	readonly initialApproved?: boolean;
}

interface StateCopy {
	readonly icon: LucideIcon;
	readonly tint: (c: ReturnType<typeof useThemeColors>) => string;
	readonly eyebrow: string;
	readonly title: string;
	readonly body: string;
	readonly contactPrompt: string;
	readonly contactSubject: string;
	readonly contactEmphasis: "tonal" | "primary";
}

const COPY: Record<TechVerificationState, StateCopy> = {
	pending: {
		icon: ShieldCheck,
		tint: (c) => c.primary,
		eyebrow: "Application under review",
		title: "We're verifying your application",
		body: "Hang tight. Our team is reviewing your documents, and we'll notify you the moment you're approved so you can sign in.",
		contactPrompt: "Questions about your application?",
		contactSubject: "Question about my FixIt technician application",
		contactEmphasis: "tonal",
	},
	rejected: {
		icon: FileX,
		tint: (c) => c.textSecondary,
		eyebrow: "Application not approved",
		title: "Your application wasn't approved",
		body: "After reviewing your application, we weren't able to approve your account at this time.",
		contactPrompt: "Have questions about this decision?",
		contactSubject: "Question about my FixIt technician application",
		contactEmphasis: "primary",
	},
};

const APPROVED_COPY = {
	eyebrow: "You're approved",
	title: "Your account is verified",
	body: "Welcome to FixIt. You can now sign in to your technician account and start taking jobs.",
} as const;

export function VerificationScreen({
	state,
	email,
	message,
	initialApproved = false,
}: VerificationScreenProps) {
	const c = useThemeColors();
	const insets = useSafeAreaInsets();
	const reducedMotion = useReducedMotion();

	const [approved, setApproved] = useState(initialApproved);
	const [cancelOpen, setCancelOpen] = useState(false);

	// Live, in-place updates while waiting on the pending screen: approval flips
	// this screen to its success state (no navigation); rejection routes to the
	// rejected screen.
	useEffect(() => {
		if (state !== "pending") return;
		const subscription = Notifications.addNotificationReceivedListener(
			(notification: Notifications.Notification) => {
				const type = (notification.request.content.data as { type?: string })
					?.type;
				if (type === "technician_verified") {
					logger.info("PushNotifications", "Approved on verification screen");
					setApproved(true);
				} else if (type === "technician_rejected") {
					logger.info("PushNotifications", "Rejected on verification screen");
					router.replace(
						ROUTES.auth.techVerification({ state: "rejected", email }),
					);
				}
			},
		);
		return () => subscription.remove();
	}, [state, email]);

	const showApproved = state === "pending" && approved;
	const isPendingReview = state === "pending" && !approved;

	const copy = COPY[state];
	const tint = showApproved ? c.success : copy.tint(c);
	const Icon = showApproved ? BadgeCheck : copy.icon;
	const header = showApproved ? APPROVED_COPY : copy;

	// Staggered entrance — each block fades up just behind the previous one.
	let step = 0;
	const fadeIn = () => {
		const delay = step++ * STAGGER_GAP;
		return reducedMotion
			? undefined
			: FadeInDown.delay(delay).duration(DUR_STAGGER);
	};

	const goToLogin = () =>
		router.replace(
			email
				? { pathname: ROUTES.auth.techLogin, params: { email } }
				: ROUTES.auth.techLogin,
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
							borderRadius: radius.pill,
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: `${tint}1A`,
						}}
					>
						<Icon size={26} color={tint} strokeWidth={2.2} />
					</View>
				</Animated.View>

				<Animated.View entering={fadeIn()} style={{ gap: space[2] }}>
					<Text
						variant="caption"
						className="font-google-sans-bold uppercase"
						style={{ color: tint, letterSpacing: 1.4 }}
					>
						{header.eyebrow}
					</Text>
					<Text variant="h1" className="font-google-sans-bold text-content">
						{header.title}
					</Text>
					<Text
						variant="body"
						className="text-content-secondary"
						style={{ maxWidth: 520 }}
					>
						{showApproved ? header.body : (message ?? copy.body)}
					</Text>
				</Animated.View>

				{isPendingReview && (
					<Animated.View entering={fadeIn()}>
						<DocumentsReceivedPanel />
					</Animated.View>
				)}

				{state === "pending" && (
					<Animated.View entering={fadeIn()} style={{ paddingTop: space[1] }}>
						<ReviewTimeline phase={showApproved ? "approved" : "reviewing"} />
					</Animated.View>
				)}

				{isPendingReview && (
					<Animated.View entering={fadeIn()} style={{ gap: space[1] }}>
						{email ? (
							<Text variant="caption" className="text-content-muted">
								Reviewing for {email}
							</Text>
						) : null}
						<Text variant="caption" className="text-content-muted">
							Most applications are reviewed within 24 to 48 hours.
						</Text>
					</Animated.View>
				)}

				{!showApproved && (
					<>
						<Animated.View entering={fadeIn()}>
							<Divider color={c.borderDefault} />
						</Animated.View>
						<Animated.View entering={fadeIn()}>
							<ContactSupportRow
								prompt={copy.contactPrompt}
								subject={copy.contactSubject}
								emphasis={copy.contactEmphasis}
							/>
						</Animated.View>
					</>
				)}

				{showApproved ? (
					<Animated.View
						entering={reducedMotion ? undefined : FadeIn.duration(DUR_STAGGER)}
					>
						<Button
							variant="primary"
							fullWidth
							iconRight={ArrowRight}
							onPress={goToLogin}
						>
							Sign in to your account
						</Button>
					</Animated.View>
				) : (
					<Animated.View
						entering={fadeIn()}
						style={{
							alignItems: "center",
							paddingTop: space[1],
							gap: space[2],
						}}
					>
						{isPendingReview ? (
							<>
								<Button
									variant="link"
									size="sm"
									iconRight={ArrowRight}
									onPress={goToLogin}
								>
									Already approved? Sign in
								</Button>
								{email ? (
									<Pressable hitSlop={8} onPress={() => setCancelOpen(true)}>
										<Text
											variant="bodySm"
											className="font-google-sans-semibold"
											style={{ color: c.danger }}
										>
											Cancel application
										</Text>
									</Pressable>
								) : null}
							</>
						) : (
							<Button variant="link" size="sm" onPress={goToLogin}>
								Back to login
							</Button>
						)}
					</Animated.View>
				)}
			</ScrollView>

			{email ? (
				<CancelApplicationModal
					email={email}
					open={cancelOpen}
					onClose={() => setCancelOpen(false)}
				/>
			) : null}
		</View>
	);
}

function Divider({ color }: { readonly color: string }): ReactNode {
	return <View style={{ height: 1, backgroundColor: color, opacity: 0.7 }} />;
}
