import { View } from "react-native";
import { Text } from "@/src/components/ui/text";

interface InfoRowProps {
	readonly icon: React.ReactNode;
	readonly text: string | number;
	readonly className?: string;
}

export default function InfoRow({ icon, text, className = "" }: InfoRowProps) {
	return (
		<View
			className={`min-h-12 w-full flex-row items-center gap-2 rounded-xl bg-surface-elevated px-4 py-3 ${className}`}
		>
			{icon}
			<Text
				variant="bodySm"
				className="flex-1 text-content-secondary"
				style={{ includeFontPadding: false }}
			>
				{text}
			</Text>
		</View>
	);
}
