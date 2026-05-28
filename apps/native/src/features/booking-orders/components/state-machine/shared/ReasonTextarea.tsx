// Auto-growing multiline reason input used by RescheduleSheet.
// Owns its own grow-to-content height clamp.

import { useState } from "react";
import { Textarea } from "@/src/components/ui/textarea";
import { space } from "@/src/constants/design-tokens";

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
	const [height, setHeight] = useState(MIN_HEIGHT);

	return (
		<Textarea
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
			editable={editable}
			autoCorrect={false}
			spellCheck={false}
			onContentSizeChange={(e) => {
				const next = e.nativeEvent.contentSize.height;
				setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, next)));
			}}
			style={{
				height,
				maxHeight: MAX_HEIGHT,
				marginTop: space[4],
			}}
			className="bg-surface-elevated"
		/>
	);
}
