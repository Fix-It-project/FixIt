import { CheckCircle2, ChevronRight, CloudUpload } from "lucide-react-native";
import { Image, Pressable, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

interface DocumentUploadFieldProps {
	readonly label: string;
	readonly value: string;
	readonly onPick: () => void;
	readonly error?: string;
	readonly required?: boolean;
}

export default function DocumentUploadField({
	label,
	value,
	onPick,
	error,
	required = false,
}: DocumentUploadFieldProps) {
	const hasFile = value.length > 0;

	return (
		<View className="gap-stack-md">
			<Text variant="label" className="font-semibold text-content">
				{label}
				{required && (
					<Text variant="label" className="text-danger">
						{" "}
						*
					</Text>
				)}
			</Text>
			<Pressable
				onPress={onPick}
				className={`flex-row items-center rounded-card bg-surface px-button-x py-card ${
					error ? "border border-danger" : ""
				}`}
			>
				{hasFile ? (
					<View className="flex-1 flex-row items-center gap-stack-md">
						<Image
							source={{ uri: value }}
							className="h-avatar-md w-avatar-md rounded-compact"
							resizeMode="cover"
						/>
						<View className="flex-1">
							<Text variant="bodySm" className="text-content" numberOfLines={1}>
								Document uploaded
							</Text>
							<Text variant="caption" className="text-surface-muted">
								Tap to change
							</Text>
						</View>
						<CheckCircle2 size={22} color={Colors.successAlt} />
					</View>
				) : (
					<View className="flex-1 flex-row items-center gap-stack-md">
						<View className="items-center justify-center rounded-compact bg-surface-elevated p-card-compact">
							<CloudUpload size={22} color={Colors.surfaceMuted} />
						</View>
						<View className="flex-1">
							<Text variant="bodySm" className="text-content">
								Upload document
							</Text>
							<Text variant="caption" className="text-content-muted">
								Take a photo or choose from gallery
							</Text>
						</View>
						<ChevronRight size={18} color={Colors.textMuted} />
					</View>
				)}
			</Pressable>
			{error && (
				<Text variant="caption" className="ml-card text-danger">
					{error}
				</Text>
			)}
		</View>
	);
}
