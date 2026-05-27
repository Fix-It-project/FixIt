/**
 * AlertDialog primitive adapter.
 *
 * Use this for binary confirmations and important interruptions. Unlike Dialog,
 * backdrop press does not dismiss it; the user should choose an explicit action.
 */

import * as AlertDialogPrimitive from "@rn-primitives/alert-dialog";
import * as React from "react";
import {
	Platform,
	ScrollView,
	StyleSheet,
	useWindowDimensions,
	View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";
import { overlayTokens } from "@/src/lib/theme/overlay";

type AlertDialogProps = {
	visible: boolean;
	onClose: () => void;
	children?: React.ReactNode;
};

type AlertDialogComponent = ((props: AlertDialogProps) => React.ReactNode) & {
	Header: typeof AlertDialogHeader;
	Body: typeof AlertDialogBody;
	Footer: typeof AlertDialogFooter;
};

const AlertDialogRoot = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogAction = AlertDialogPrimitive.Action;
const AlertDialogCancel = AlertDialogPrimitive.Cancel;
const AlertDialogTitle = AlertDialogPrimitive.Title;
const AlertDialogDescription = AlertDialogPrimitive.Description;

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

function AlertDialogOverlay({ children }: { children: React.ReactNode }) {
	const themeColors = useThemeColors();

	return (
		<FullWindowOverlay>
			<AlertDialogPrimitive.Overlay asChild={Platform.OS !== "web"}>
				<View
					style={[
						StyleSheet.absoluteFill,
						styles.overlay,
						{ backgroundColor: themeColors.backdrop },
					]}
				>
					<NativeOnlyAnimatedView
						entering={FadeIn.duration(200).delay(50)}
						exiting={FadeOut.duration(150)}
						style={styles.overlayAnimatedFill}
					>
						{children}
					</NativeOnlyAnimatedView>
				</View>
			</AlertDialogPrimitive.Overlay>
		</FullWindowOverlay>
	);
}

function AlertDialogContent({ children }: { children: React.ReactNode }) {
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
		<AlertDialogPrimitive.Content
			accessibilityViewIsModal={true}
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
		</AlertDialogPrimitive.Content>
	);
}

function AlertDialogHeader({ children }: { children: React.ReactNode }) {
	return (
		<View style={styles.header}>
			<AlertDialogTitle asChild>
				<Text variant="h3">{children}</Text>
			</AlertDialogTitle>
		</View>
	);
}

function AlertDialogBody({ children }: { children: React.ReactNode }) {
	return (
		<View style={styles.body}>
			{typeof children === "string" ? (
				<AlertDialogDescription asChild>
					<Text variant="body">{children}</Text>
				</AlertDialogDescription>
			) : (
				children
			)}
		</View>
	);
}

function AlertDialogFooter({ children }: { children: React.ReactNode }) {
	return (
		<View style={styles.footer}>
			{React.Children.map(children, (child) => (
				<View style={styles.footerItem}>{child}</View>
			))}
		</View>
	);
}

function ReusablesAlertDialog({
	visible,
	onClose,
	children,
}: AlertDialogProps) {
	const handleOpenChange = React.useCallback(
		(open: boolean) => {
			if (!open) {
				onClose();
			}
		},
		[onClose],
	);

	if (!visible) return null;

	return (
		<AlertDialogRoot open={visible} onOpenChange={handleOpenChange}>
			<AlertDialogPortal hostName="dialog-root">
				<AlertDialogOverlay>
					<AlertDialogContent>{children}</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialogPortal>
		</AlertDialogRoot>
	);
}

const AlertDialog = ReusablesAlertDialog as AlertDialogComponent;
AlertDialog.Header = AlertDialogHeader;
AlertDialog.Body = AlertDialogBody;
AlertDialog.Footer = AlertDialogFooter;

const styles = StyleSheet.create({
	overlay: {
		alignItems: "center",
		justifyContent: "center",
		padding: overlayTokens.dialog.minViewportMargin,
		zIndex: overlayTokens.dialog.portalElevation,
		elevation: overlayTokens.dialog.portalElevation,
	},
	overlayAnimatedFill: {
		alignItems: "center",
		justifyContent: "center",
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

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogRoot,
	AlertDialogTitle,
	AlertDialogTrigger,
};
