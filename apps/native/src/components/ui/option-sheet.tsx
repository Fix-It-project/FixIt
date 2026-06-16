// A themed, content-sized bottom-sheet picker: a titled list of selectable
// options with an optional color-preview swatch and a checkmark on the active
// row. Built on the app's gorhom BottomSheet wrapper (full NativeWind/theme
// control) rather than @expo/ui's native sheet, which hosts SwiftUI/Compose
// children and therefore can't render token-themed RN rows or color swatches.
import { Check } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import BottomSheet, {
	type BottomSheetModalRef,
} from "@/src/components/ui/bottom-sheet";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

export interface OptionSheetItem {
	readonly key: string;
	readonly label: string;
	readonly description?: string;
	/** Optional color preview chip(s) shown on the left (e.g. theme swatch). */
	readonly swatches?: readonly string[];
	readonly selected: boolean;
	readonly onSelect: () => void;
}

interface OptionSheetProps {
	readonly visible: boolean;
	readonly onClose: () => void;
	readonly title: string;
	readonly options: readonly OptionSheetItem[];
}

function Swatches({ colors }: { readonly colors: readonly string[] }) {
	const themeColors = useThemeColors();
	return (
		<View
			className="h-avatar-sm w-avatar-sm flex-row overflow-hidden rounded-pill"
			style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
		>
			{colors.map((c) => (
				<View key={c} className="flex-1" style={{ backgroundColor: c }} />
			))}
		</View>
	);
}

export function OptionSheet({
	visible,
	onClose,
	title,
	options,
}: OptionSheetProps) {
	const ref = useRef<BottomSheetModalRef>(null);
	const themeColors = useThemeColors();

	useEffect(() => {
		if (visible) ref.current?.present();
		else ref.current?.dismiss();
	}, [visible]);

	return (
		<BottomSheet.Modal
			ref={ref}
			snapPoints={undefined}
			enableDynamicSizing
			onDismiss={onClose}
		>
			<BottomSheet.View className="px-screen-x pt-stack-sm pb-screen-bottom-inset">
				<Text
					variant="bodySm"
					className="mb-stack-md font-semibold text-content-secondary"
				>
					{title}
				</Text>
				{options.map((opt, index) => (
					<Pressable
						key={opt.key}
						onPress={opt.onSelect}
						accessibilityRole="button"
						accessibilityState={{ selected: opt.selected }}
						className="flex-row items-center gap-stack-md py-list-row-comfortable-y active:opacity-70"
						style={
							index > 0
								? {
										borderTopWidth: 1,
										borderTopColor: themeColors.borderDefault,
									}
								: undefined
						}
					>
						{opt.swatches ? <Swatches colors={opt.swatches} /> : null}
						<View className="flex-1">
							<Text
								variant="body"
								className={
									opt.selected ? "font-semibold text-content" : "text-content"
								}
							>
								{opt.label}
							</Text>
							{opt.description ? (
								<Text
									variant="caption"
									className="mt-stack-xs text-content-muted"
								>
									{opt.description}
								</Text>
							) : null}
						</View>
						{opt.selected ? (
							<Check size={20} color={themeColors.primary} strokeWidth={2.4} />
						) : null}
					</Pressable>
				))}
			</BottomSheet.View>
		</BottomSheet.Modal>
	);
}
