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
		<View className="gap-3">
			<Text variant="label" className="font-semibold text-content">
				{label}
				{required && (
					<Text variant="label" className="text-red-500">
						{" "}
						*
					</Text>
				)}
			</Text>
			<Pressable
				onPress={onPick}
				className={`flex-row items-center rounded-2xl bg-surface px-6 py-4 ${
					error ? "border border-red-400" : ""
				}`}
			>
				{hasFile ? (
					<View className="flex-1 flex-row items-center gap-3">
						<Image
							source={{ uri: value }}
							className="h-12 w-12 rounded-lg"
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
					<View className="flex-1 flex-row items-center gap-3">
						<View className="items-center justify-center rounded-lg bg-surface-elevated p-2.5">
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
				<Text variant="caption" className="ml-4 text-red-500">
					{error}
				</Text>
			)}
		</View>
	);
}
