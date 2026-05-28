// Themed wrapper over @gorhom/bottom-sheet. Consumers import from here — never directly from @gorhom/bottom-sheet.
import GorhomBottomSheet, {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetFlatList,
	type BottomSheetModalProps,
	type BottomSheetProps,
	BottomSheetScrollView,
	BottomSheetTextInput,
	BottomSheetView,
	BottomSheetModal as GorhomBottomSheetModal,
} from "@gorhom/bottom-sheet";

import {
	forwardRef,
	type Ref,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/src/constants/design-tokens";
import { overlayTokens } from "@/src/constants/design-tokens/themes/overlay";

// Re-export gorhom's ref types so consumers never import directly from @gorhom/bottom-sheet
export type BottomSheetRef = GorhomBottomSheet;
export type BottomSheetModalRef = GorhomBottomSheetModal;

function assignRef<T>(ref: Ref<T>, value: T | null) {
	if (typeof ref === "function") {
		ref(value);
		return;
	}
	if (ref) {
		ref.current = value;
	}
}

// ─── Backdrop ────────────────────────────────────────────────────────────────

interface DefaultBackdropProps extends BottomSheetBackdropProps {
	canDismiss: boolean;
}

function DefaultBackdrop({ canDismiss, ...props }: DefaultBackdropProps) {
	return (
		<BottomSheetBackdrop
			{...props}
			appearsOnIndex={0}
			disappearsOnIndex={-1}
			opacity={overlayTokens.bottomSheet.backdropOpacity}
			pressBehavior={canDismiss ? "close" : "none"}
		/>
	);
}

// ─── BottomSheet (persistent, snap-based) ───────────────────────────────────

const BottomSheetInner = forwardRef<GorhomBottomSheet, BottomSheetProps>(
	function BottomSheet(
		{ enablePanDownToClose = true, onChange, ...props },
		ref,
	) {
		const themeColors = useThemeColors();
		const insets = useSafeAreaInsets();
		const sheetRef = useRef<GorhomBottomSheet | null>(null);
		const [sheetIndex, setSheetIndex] = useState(props.index ?? -1);
		const canDismiss = enablePanDownToClose !== false;

		const setRefs = useCallback(
			(node: GorhomBottomSheet | null) => {
				sheetRef.current = node;
				assignRef(ref, node);
			},
			[ref],
		);

		const renderBackdrop = useCallback(
			(backdropProps: BottomSheetBackdropProps) => (
				<DefaultBackdrop {...backdropProps} canDismiss={canDismiss} />
			),
			[canDismiss],
		);

		const handleChange = useCallback(
			(...args: Parameters<NonNullable<BottomSheetProps["onChange"]>>) => {
				const [index] = args;
				setSheetIndex(index);
				onChange?.(...args);
			},
			[onChange],
		);

		useEffect(() => {
			if (sheetIndex < 0) return;
			const subscription = BackHandler.addEventListener(
				"hardwareBackPress",
				() => {
					if (canDismiss) {
						sheetRef.current?.close();
					}
					return true;
				},
			);

			return () => subscription.remove();
		}, [canDismiss, sheetIndex]);

		return (
			<GorhomBottomSheet
				ref={setRefs}
				snapPoints={overlayTokens.bottomSheet.snapPoints as string[]}
				enablePanDownToClose={enablePanDownToClose}
				backdropComponent={renderBackdrop}
				backgroundStyle={{
					backgroundColor: themeColors.surfaceBase,
					borderTopLeftRadius: overlayTokens.bottomSheet.radius,
					borderTopRightRadius: overlayTokens.bottomSheet.radius,
				}}
				handleIndicatorStyle={{
					backgroundColor: themeColors.borderDefault,
				}}
				keyboardBehavior="interactive"
				keyboardBlurBehavior="restore"
				topInset={insets.top}
				bottomInset={insets.bottom}
				onChange={handleChange}
				{...props}
			/>
		);
	},
);

// ─── BottomSheetModal (transient, present/dismiss) ────────────────────────────

const BottomSheetModalInner = forwardRef<
	GorhomBottomSheetModal,
	BottomSheetModalProps
>(function BottomSheetModal(
	{ enablePanDownToClose = true, onChange, ...props },
	ref,
) {
	const themeColors = useThemeColors();
	const insets = useSafeAreaInsets();
	const sheetRef = useRef<GorhomBottomSheetModal | null>(null);
	const [sheetIndex, setSheetIndex] = useState(-1);
	const canDismiss = enablePanDownToClose !== false;

	const setRefs = useCallback(
		(node: GorhomBottomSheetModal | null) => {
			sheetRef.current = node;
			assignRef(ref, node);
		},
		[ref],
	);

	const renderBackdrop = useCallback(
		(backdropProps: BottomSheetBackdropProps) => (
			<DefaultBackdrop {...backdropProps} canDismiss={canDismiss} />
		),
		[canDismiss],
	);

	const handleChange = useCallback(
		(...args: Parameters<NonNullable<BottomSheetModalProps["onChange"]>>) => {
			const [index] = args;
			setSheetIndex(index);
			onChange?.(...args);
		},
		[onChange],
	);

	useEffect(() => {
		if (sheetIndex < 0) return;
		const subscription = BackHandler.addEventListener(
			"hardwareBackPress",
			() => {
				if (canDismiss) {
					sheetRef.current?.dismiss();
				}
				return true;
			},
		);

		return () => subscription.remove();
	}, [canDismiss, sheetIndex]);

	return (
		<GorhomBottomSheetModal
			ref={setRefs}
			snapPoints={overlayTokens.bottomSheet.snapPoints as string[]}
			enablePanDownToClose={enablePanDownToClose}
			backdropComponent={renderBackdrop}
			backgroundStyle={{
				backgroundColor: themeColors.surfaceBase,
				borderTopLeftRadius: overlayTokens.bottomSheet.radius,
				borderTopRightRadius: overlayTokens.bottomSheet.radius,
			}}
			handleIndicatorStyle={{
				backgroundColor: themeColors.borderDefault,
			}}
			keyboardBehavior="interactive"
			keyboardBlurBehavior="restore"
			topInset={insets.top}
			bottomInset={insets.bottom}
			onChange={handleChange}
			{...props}
		/>
	);
});

// ─── Slot augmentation ────────────────────────────────────────────────────────

type BottomSheetType = typeof BottomSheetInner & {
	View: typeof BottomSheetView;
	ScrollView: typeof BottomSheetScrollView;
	FlatList: typeof BottomSheetFlatList;
	TextInput: typeof BottomSheetTextInput;
	Modal: typeof BottomSheetModalInner;
};

const BottomSheet = BottomSheetInner as BottomSheetType;

BottomSheet.View = BottomSheetView;
BottomSheet.ScrollView = BottomSheetScrollView;
BottomSheet.FlatList = BottomSheetFlatList;
BottomSheet.TextInput = BottomSheetTextInput;
BottomSheet.Modal = BottomSheetModalInner;

// ─── Exports ──────────────────────────────────────────────────────────────────

export { BottomSheet };
export default BottomSheet;
