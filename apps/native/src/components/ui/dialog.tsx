/**
 * Dialog primitive — MD2 animation, dual imperative+declarative API, composition slots.
 * Portal-mounted above all other UI. No react-native Modal used anywhere.
 *
 * Exports: Dialog, DialogProvider, confirm (re-export from dialog-store)
 */

import * as React from "react";
import {
	BackHandler,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	useWindowDimensions,
	View,
} from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";
import { overlayTokens } from "@/src/lib/theme/overlay";
import { useDialogStore } from "@/src/stores/dialog-store";

// ─── Re-export confirm for convenience ───────────────────────────────────────
export { confirm } from "@/src/stores/dialog-store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DialogProps {
	visible: boolean;
	onClose: () => void;
	/** When false, backdrop press and hardware back are no-ops */
	dismissible?: boolean;
	children?: React.ReactNode;
	/** Override for accessibility role. "alert" for imperative confirms, "none" for declarative forms. */
	accessibilityRoleOverride?: "alert" | "none";
}

// ─── Animated Internal Layer ──────────────────────────────────────────────────

interface DialogInternalProps {
	/** When false, backdrop press and hardware back are consumed without closing */
	dismissible?: boolean;
	children?: React.ReactNode;
	/** Override for accessibility role. "alert" for imperative confirms, "none" for declarative forms. */
	accessibilityRoleOverride?: "alert" | "none";
	/** Called by exit animation's runOnJS callback — dismisses from outside */
	onExitComplete: (result: boolean) => void;
}

function DialogInternal({
	dismissible = true,
	children,
	accessibilityRoleOverride = "none",
	onExitComplete,
}: DialogInternalProps) {
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const { height: screenHeight, width: screenWidth } = useWindowDimensions();
	const keyboard = useReanimatedKeyboardAnimation();
	const surfaceHeight = useSharedValue(0);
	const isMountedRef = React.useRef(true);
	const viewportMargin =
		screenWidth <=
		overlayTokens.dialog.minWidth + overlayTokens.dialog.viewportMargin * 2
			? overlayTokens.dialog.minViewportMargin
			: overlayTokens.dialog.viewportMargin;
	const availableWidth = Math.max(0, screenWidth - viewportMargin * 2);
	const availableHeight = Math.max(0, screenHeight - viewportMargin * 2);
	const surfaceSizeStyle = React.useMemo(
		() => ({
			maxHeight: availableHeight,
			maxWidth: Math.min(overlayTokens.dialog.maxWidth, availableWidth),
			minWidth: Math.min(overlayTokens.dialog.minWidth, availableWidth),
		}),
		[availableHeight, availableWidth],
	);

	// Animated values — typed as number to allow withTiming targets outside the literal type
	const backdropOpacity = useSharedValue<number>(0);
	const surfaceScale = useSharedValue<number>(
		overlayTokens.dialog.enter.scaleFrom,
	);
	const surfaceOpacity = useSharedValue<number>(0);

	// Track whether exit has been triggered to prevent double-firing
	const isExitingRef = React.useRef(false);

	const triggerExit = React.useCallback(
		(result: boolean) => {
			if (isExitingRef.current) return;
			isExitingRef.current = true;

			const safeCallback = (r: boolean) => {
				if (isMountedRef.current) {
					onExitComplete(r);
				}
			};

			if (reducedMotion) {
				// Opacity-only exit at 100ms
				backdropOpacity.value = withTiming(0, {
					duration: 100,
					easing: Easing.linear,
				});
				surfaceOpacity.value = withTiming(
					0,
					{ duration: 100, easing: Easing.linear },
					(finished) => {
						if (finished) runOnJS(safeCallback)(result);
					},
				);
			} else {
				// MD2 exit: backdrop fade + surface scale + opacity
				backdropOpacity.value = withTiming(0, {
					duration: overlayTokens.dialog.exit.backdropDuration,
					easing: overlayTokens.dialog.exit.backdropEasing,
				});
				surfaceOpacity.value = withTiming(0, {
					duration: overlayTokens.dialog.exit.opacityDuration,
					easing: Easing.linear,
				});
				surfaceScale.value = withTiming(
					overlayTokens.dialog.exit.scaleTo,
					{
						duration: overlayTokens.dialog.exit.duration,
						easing: overlayTokens.dialog.exit.easing,
					},
					(finished) => {
						if (finished) runOnJS(safeCallback)(result);
					},
				);
			}
		},
		[
			reducedMotion,
			backdropOpacity,
			surfaceOpacity,
			surfaceScale,
			onExitComplete,
		],
	);

	// Enter animation on mount
	React.useEffect(() => {
		if (reducedMotion) {
			// Opacity-only enter at 100ms
			backdropOpacity.value = withTiming(overlayTokens.backdrop.opacity, {
				duration: 100,
				easing: Easing.linear,
			});
			surfaceOpacity.value = withTiming(1, {
				duration: 100,
				easing: Easing.linear,
			});
		} else {
			// MD2 enter: backdrop + surface opacity + surface scale
			backdropOpacity.value = withTiming(overlayTokens.backdrop.opacity, {
				duration: overlayTokens.dialog.enter.backdropDuration,
				easing: overlayTokens.dialog.enter.backdropEasing,
			});
			surfaceOpacity.value = withTiming(1, {
				duration: 100,
				easing: Easing.linear,
			});
			surfaceScale.value = withTiming(1, {
				duration: overlayTokens.dialog.enter.duration,
				easing: overlayTokens.dialog.enter.easing,
			});
		}

		return () => {
			isMountedRef.current = false;
		};
	}, [reducedMotion, backdropOpacity, surfaceOpacity, surfaceScale]);

	// Android hardware back button
	React.useEffect(() => {
		const subscription = BackHandler.addEventListener(
			"hardwareBackPress",
			() => {
				if (dismissible !== false) {
					triggerExit(false);
				}
				return true;
			},
		);

		return () => subscription.remove();
	}, [dismissible, triggerExit]);

	// Animated styles
	const backdropAnimatedStyle = useAnimatedStyle(() => ({
		opacity: backdropOpacity.value,
	}));

	const surfaceAnimatedStyle = useAnimatedStyle(() => ({
		opacity: surfaceOpacity.value,
		transform: reducedMotion ? [] : [{ scale: surfaceScale.value }],
	}));

	const keyboardAvoidanceStyle = useAnimatedStyle(() => {
		const measuredHeight =
			surfaceHeight.value || overlayTokens.dialog.minWidth;
		const centeredBottom = Math.max(
			(screenHeight - measuredHeight) / 2,
			viewportMargin,
		);
		const keyboardHeight = Math.abs(keyboard.height.value);
		const overlap = Math.max(
			keyboardHeight + overlayTokens.dialog.keyboardGap - centeredBottom,
			0,
		);

		return {
			transform: [{ translateY: -overlap * keyboard.progress.value }],
		};
	}, [
		keyboard.height,
		keyboard.progress,
		screenHeight,
		surfaceHeight,
		viewportMargin,
	]);

	const handleBackdropPress = () => {
		if (dismissible !== false) {
			triggerExit(false);
		}
	};

	return (
		<>
			<Animated.View
				style={[
					StyleSheet.absoluteFill,
					styles.backdrop,
					backdropAnimatedStyle,
					{ backgroundColor: themeColors.backdrop },
				]}
				pointerEvents="none"
			/>

			<Pressable
				style={StyleSheet.absoluteFill}
				onPress={handleBackdropPress}
			/>

			<View style={styles.keyboardContainer} pointerEvents="box-none">
				<Animated.View
					pointerEvents="box-none"
					style={[styles.surfaceFrame, keyboardAvoidanceStyle]}
				>
					<Animated.View style={[styles.surfaceShell, surfaceAnimatedStyle]}>
						<View
							accessibilityViewIsModal={true}
							accessibilityRole={accessibilityRoleOverride}
							onLayout={(event) => {
								surfaceHeight.value = event.nativeEvent.layout.height;
							}}
							style={[
								styles.surface,
								surfaceSizeStyle,
								{
									backgroundColor: themeColors.surfaceElevated,
									shadowColor: themeColors.shadow,
								},
							]}
						>
							<ScrollView
								bounces={false}
								keyboardShouldPersistTaps="handled"
								showsVerticalScrollIndicator={false}
								contentContainerStyle={styles.surfaceContent}
							>
								{children}
							</ScrollView>
						</View>
					</Animated.View>
				</Animated.View>
			</View>
		</>
	);
}

// ─── Composition Slots ────────────────────────────────────────────────────────

function DialogHeader({ children }: { children: React.ReactNode }) {
	return (
		<View style={styles.header}>
			<Text variant="h3">{children}</Text>
		</View>
	);
}

function DialogBody({ children }: { children: React.ReactNode }) {
	return (
		<View style={styles.body}>
			{typeof children === "string" ? (
				<Text variant="body">{children}</Text>
			) : (
				children
			)}
		</View>
	);
}

function DialogForm({ children }: { children: React.ReactNode }) {
	return <View style={styles.form}>{children}</View>;
}

function DialogFooter({ children }: { children: React.ReactNode }) {
	return (
		<View style={styles.footer}>
			{React.Children.toArray(children).map((child, index) => (
				<View key={index} style={styles.footerItem}>
					{child}
				</View>
			))}
		</View>
	);
}

// ─── Public Dialog Component ──────────────────────────────────────────────────

/**
 * Declarative Dialog.
 * Usage: <Dialog visible={bool} onClose={() => void} dismissible>
 *   <Dialog.Header>Title</Dialog.Header>
 *   <Dialog.Body>Body text</Dialog.Body>
 *   <Dialog.Footer><Button onPress={onClose}>OK</Button></Dialog.Footer>
 * </Dialog>
 */
function Dialog({
	visible,
	onClose,
	dismissible = true,
	children,
}: DialogProps) {
	if (!visible) return [];

	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			statusBarTranslucent
			onRequestClose={onClose}
		>
			<View style={styles.portalRoot} pointerEvents="box-none">
				<DialogInternal
					dismissible={dismissible}
					onExitComplete={() => onClose()}
				>
					{children}
				</DialogInternal>
			</View>
		</Modal>
	);
}

// Attach composition slots as static properties
Dialog.Header = DialogHeader;
Dialog.Body = DialogBody;
Dialog.Form = DialogForm;
Dialog.Footer = DialogFooter;

// ─── DialogProvider (imperative stack renderer) ───────────────────────────────

/**
 * Mount once at app root (_layout.tsx).
 * Subscribes to useDialogStore and renders the topmost dialog entry as an
 * imperative <Dialog> with auto-constructed Header/Body/Footer slots.
 */
function DialogProvider() {
	const stack = useDialogStore((state) => state.stack);
	const pop = useDialogStore((state) => state.pop);

	// Only render the topmost entry
	const topEntry = stack.at(-1);

	if (!topEntry) return [];

	const { config } = topEntry;

	const handleExitComplete = (result: boolean) => {
		pop(result);
	};

	return (
		<Modal
			visible
			transparent
			animationType="none"
			statusBarTranslucent
			onRequestClose={() => handleExitComplete(false)}
		>
			<View style={styles.portalRoot} pointerEvents="box-none">
				<DialogInternal
					key={topEntry.id}
					dismissible={config.dismissible ?? true}
					accessibilityRoleOverride="alert"
					onExitComplete={handleExitComplete}
				>
					<Dialog.Header>{config.title}</Dialog.Header>

					{config.description !== undefined && (
						<Dialog.Body>{config.description}</Dialog.Body>
					)}

					<Dialog.Footer>
						{config.secondary !== undefined && (
							<Button
								variant="secondary"
								onPress={() => handleExitComplete(false)}
							>
								{config.secondary.label}
							</Button>
						)}
						<Button
							variant={config.primary.destructive ? "destructive" : "primary"}
							onPress={() => handleExitComplete(true)}
						>
							{config.primary.label}
						</Button>
					</Dialog.Footer>
				</DialogInternal>
			</View>
		</Modal>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	portalRoot: {
		...StyleSheet.absoluteFillObject,
		zIndex: overlayTokens.dialog.portalElevation,
		elevation: overlayTokens.dialog.portalElevation,
	},
	backdrop: {
		zIndex: 0,
	},
	keyboardContainer: {
		...StyleSheet.absoluteFillObject,
	},
	surfaceFrame: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
	},
	surfaceShell: {
		width: "100%",
		alignItems: "center",
	},
	surface: {
		borderRadius: overlayTokens.dialog.radius,
		overflow: "hidden",
		width: "100%",
		shadowOffset: overlayTokens.dialog.shadow.ios.offset,
		shadowOpacity: overlayTokens.dialog.shadow.ios.opacity,
		shadowRadius: overlayTokens.dialog.shadow.ios.radius,
		elevation: overlayTokens.dialog.shadow.androidElevation,
	},
	surfaceContent: {
		padding: overlayTokens.dialog.padding,
	},
	header: {
		marginBottom: overlayTokens.dialog.titleBodyGap,
	},
	body: {
		marginBottom: overlayTokens.dialog.bodyFooterGap,
	},
	form: {
		marginBottom: overlayTokens.dialog.bodyFooterGap,
	},
	footer: {
		flexDirection: "row",
		gap: overlayTokens.dialog.footerGap,
		justifyContent: "flex-end",
	},
	footerItem: {
		flex: 1,
		minWidth: 0,
	},
});

// ─── Exports ──────────────────────────────────────────────────────────────────

// PortalHost re-export for convenience if needed elsewhere
export { PortalHost } from "@rn-primitives/portal";
export { Dialog, DialogProvider };
