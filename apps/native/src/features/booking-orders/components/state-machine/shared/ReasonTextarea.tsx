// Auto-growing multiline reason input used by RescheduleSheet.
// Owns its own grow-to-content height clamp.

import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { radius, space, useThemeColors } from "@/src/lib/theme";

const MIN_HEIGHT = 56;
const MAX_HEIGHT = 160;

interface ReasonTextareaProps {
	readonly value: string;
	readonly onChangeText: (text: string) => void;
	readonly editable: boolean;
	readonly placeholder?: string;
}

export default function ReasonTextarea({
	value,
	onChangeText,
	editable,
	placeholder = "Why are you rescheduling?",
}: ReasonTextareaProps) {
	const themeColors = useThemeColors();
	const [height, setHeight] = useState(MIN_HEIGHT);

	return (
		<BottomSheetTextInput
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
			placeholderTextColor={themeColors.textMuted}
			multiline
			editable={editable}
			onContentSizeChange={(e) => {
				const next = e.nativeEvent.contentSize.height;
				setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, next)));
			}}
			style={{
				height,
				maxHeight: MAX_HEIGHT,
				marginTop: space[4],
				paddingHorizontal: space[4],
				paddingVertical: 0,
				borderRadius: radius.button,
				borderWidth: 1,
				borderColor: themeColors.borderDefault,
				backgroundColor: themeColors.surfaceElevated,
				color: themeColors.textPrimary,
				textAlignVertical: "center",
				opacity: editable ? 1 : 0.6,
			}}
		/>
	);
}
