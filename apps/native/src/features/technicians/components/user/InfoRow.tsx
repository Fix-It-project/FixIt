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
			className={`min-h-avatar-md w-full flex-row items-center gap-stack-sm rounded-input bg-surface-elevated px-card py-stack-md ${className}`}
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
