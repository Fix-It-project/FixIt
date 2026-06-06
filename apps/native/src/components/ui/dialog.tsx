/**
 * Dialog primitive adapter.
 *
 * This file intentionally mirrors React Native Reusables' dialog stack:
 * @rn-primitives/dialog + @rn-primitives/portal, with FullWindowOverlay on iOS.
 * The public FixIt API is kept intact so existing consumers can keep using
 * <Dialog visible onClose> plus Dialog.Header/Body/Form/Footer.
 */

import * as DialogPrimitive from "@rn-primitives/dialog";
import { PortalHost } from "@rn-primitives/portal";
import { X } from "lucide-react-native";
import * as React from "react";
import {
	Platform,
	Pressable,
	Text as RNText,
	ScrollView,
	StyleSheet,
	useWindowDimensions,
	View,
	type ViewProps,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";
import { AlertDialog } from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { overlayTokens } from "@/src/constants/design-tokens/themes/overlay";
import { useDialogStore } from "@/src/stores/dialog-store";

export { confirm } from "@/src/stores/dialog-store";
export { PortalHost };

type DialogProps = {
	visible: boolean;
	onClose: () => void;
	dismissible?: boolean;
	children?: React.ReactNode;
	accessibilityRoleOverride?: "alert" | "none";
	keyboardVerticalOffset?: number;
};

type DialogComponent = ((props: DialogProps) => React.ReactNode) & {
	Header: typeof DialogHeader;
	Body: typeof DialogBody;
	Form: typeof DialogForm;
	Footer: typeof DialogFooter;
};

const DialogRoot = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

const FullWindowOverlay =
	Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

function NativeOnlyAnimatedView(
	props: React.ComponentProps<typeof Animated.View> &
		React.RefAttributes<Animated.View>,
) {
	if (Platform.OS === "web") {
		return <>{props.children as React.ReactNode}</>;
	}

	return <Animated.View {...props} />;
}

function DialogOverlay({
	children,
	dismissible,
	keyboardVerticalOffset = 0,
}: {
	children: React.ReactNode;
	dismissible: boolean;
	keyboardVerticalOffset?: number;
}) {
	const themeColors = useThemeColors();

	return (
		<FullWindowOverlay>
			<DialogPrimitive.Overlay
				asChild={Platform.OS !== "web"}
				closeOnPress={dismissible}
			>
				<Pressable
					style={[
						StyleSheet.absoluteFill,
						styles.overlay,
						{ backgroundColor: themeColors.backdrop },
					]}
				>
					<NativeOnlyAnimatedView
						entering={FadeIn.duration(200)}
						exiting={FadeOut.duration(150)}
						style={styles.overlayAnimatedFill}
					>
						<KeyboardAvoidingView
							automaticOffset
							behavior="position"
							keyboardVerticalOffset={keyboardVerticalOffset}
							style={styles.keyboardAvoidingView}
						>
							{children}
						</KeyboardAvoidingView>
					</NativeOnlyAnimatedView>
				</Pressable>
			</DialogPrimitive.Overlay>
		</FullWindowOverlay>
	);
}

function DialogContent({
	children,
	accessibilityRoleOverride = "none",
}: {
	children: React.ReactNode;
	accessibilityRoleOverride?: "alert" | "none";
}) {
	const themeColors = useThemeColors();
	const { height: screenHeight, width: screenWidth } = useWindowDimensions();
	const viewportMargin =
		screenWidth <=
		overlayTokens.dialog.minWidth + overlayTokens.dialog.viewportMargin * 2
			? overlayTokens.dialog.minViewportMargin
			: overlayTokens.dialog.viewportMargin;
	const availableWidth = Math.max(0, screenWidth - viewportMargin * 2);
	const availableHeight = Math.max(0, screenHeight - viewportMargin * 2);

	return (
		<DialogPrimitive.Content
			accessibilityViewIsModal={true}
			accessibilityRole={accessibilityRoleOverride}
			style={[
				styles.surface,
				{
					backgroundColor: themeColors.surfaceElevated,
					maxHeight: availableHeight,
					maxWidth: Math.min(overlayTokens.dialog.maxWidth, availableWidth),
					minWidth: Math.min(overlayTokens.dialog.minWidth, availableWidth),
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
		</DialogPrimitive.Content>
	);
}

function DialogHeader({ children }: { children: React.ReactNode }) {
	return (
		<View style={styles.header}>
			<DialogTitle asChild>
				<Text variant="h3">{children}</Text>
			</DialogTitle>
		</View>
	);
}

function DialogBody({ children }: { children: React.ReactNode }) {
	return (
		<View style={styles.body}>
			{typeof children === "string" ? (
				<DialogDescription asChild>
					<Text variant="body">{children}</Text>
				</DialogDescription>
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
			{React.Children.map(children, (child) => (
				<View style={styles.footerItem}>{child}</View>
			))}
		</View>
	);
}

function ReusablesDialog({
	visible,
	onClose,
	dismissible = true,
	children,
	accessibilityRoleOverride = "none",
	keyboardVerticalOffset,
}: DialogProps) {
	const handleOpenChange = React.useCallback(
		(open: boolean) => {
			if (open) return;
			if (dismissible !== false) {
				onClose();
			}
		},
		[dismissible, onClose],
	);

	if (!visible) return null;

	return (
		<DialogRoot open={visible} onOpenChange={handleOpenChange}>
			<DialogPortal hostName="dialog-root">
				<DialogOverlay
					dismissible={dismissible}
					keyboardVerticalOffset={keyboardVerticalOffset}
				>
					<DialogContent accessibilityRoleOverride={accessibilityRoleOverride}>
						{children}
					</DialogContent>
				</DialogOverlay>
			</DialogPortal>
		</DialogRoot>
	);
}

const Dialog = ReusablesDialog as DialogComponent;
Dialog.Header = DialogHeader;
Dialog.Body = DialogBody;
Dialog.Form = DialogForm;
Dialog.Footer = DialogFooter;

function DialogProvider() {
	const stack = useDialogStore((state) => state.stack);
	const pop = useDialogStore((state) => state.pop);
	const topEntry = stack.at(-1);

	if (!topEntry) return null;

	const { config } = topEntry;

	const handleClose = () => {
		pop(false);
	};

	return (
		<AlertDialog key={topEntry.id} visible onClose={handleClose}>
			<AlertDialog.Header>{config.title}</AlertDialog.Header>

			{config.description !== undefined && (
				<AlertDialog.Body>{config.description}</AlertDialog.Body>
			)}

			<AlertDialog.Footer>
				{config.secondary !== undefined && (
					<Button
						variant="secondary"
						onPress={() => pop(false)}
						testID="dialog-confirm-secondary"
					>
						{config.secondary.label}
					</Button>
				)}
				<Button
					variant={config.primary.destructive ? "destructive" : "primary"}
					onPress={() => pop(true)}
					testID="dialog-confirm-primary"
				>
					{config.primary.label}
				</Button>
			</AlertDialog.Footer>
		</AlertDialog>
	);
}

function DialogCloseButton({ style, ...props }: ViewProps) {
	const themeColors = useThemeColors();

	return (
		<DialogClose asChild>
			<Pressable hitSlop={12} style={[styles.closeButton, style]} {...props}>
				<X size={18} color={themeColors.textMuted} />
				<RNText style={styles.srOnly}>Close</RNText>
			</Pressable>
		</DialogClose>
	);
}

const styles = StyleSheet.create({
	overlay: {
		alignItems: "center",
		justifyContent: "center",
		padding: overlayTokens.dialog.minViewportMargin,
		zIndex: overlayTokens.dialog.portalElevation,
		elevation: overlayTokens.dialog.portalElevation,
	},
	overlayAnimatedFill: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	keyboardAvoidingView: {
		alignItems: "center",
		width: "100%",
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
	closeButton: {
		position: "absolute",
		right: 16,
		top: 16,
	},
	srOnly: {
		height: 1,
		opacity: 0,
		position: "absolute",
		width: 1,
	},
});

export {
	Dialog,
	DialogClose,
	DialogCloseButton,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogProvider,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
};
