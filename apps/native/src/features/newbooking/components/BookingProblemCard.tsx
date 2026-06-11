import * as ImagePicker from "expo-image-picker";
import { Camera, ImageIcon, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Image, Pressable, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Textarea } from "@/src/components/ui/textarea";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";

export interface AttachmentInfo {
	uri: string;
	name: string;
	type: string;
}

interface BookingProblemCardProps {
	readonly description: string;
	readonly onDescriptionChange: (text: string) => void;
	readonly attachment: AttachmentInfo | null;
	readonly onAttachmentChange: (attachment: AttachmentInfo | null) => void;
}

export function BookingProblemCard({
	description,
	onDescriptionChange,
	attachment,
	onAttachmentChange,
}: BookingProblemCardProps) {
	const { t } = useTranslation("booking");
	const themeColors = useThemeColors();

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			quality: 0.8,
			allowsEditing: false,
		});
		if (!result.canceled && result.assets[0]) {
			const asset = result.assets[0];
			onAttachmentChange({
				uri: asset.uri,
				name: asset.fileName ?? `photo_${Date.now()}.jpg`,
				type: asset.mimeType ?? "image/jpeg",
			});
		}
	};

	const takePhoto = async () => {
		const permission = await ImagePicker.requestCameraPermissionsAsync();
		if (!permission.granted) return;
		const result = await ImagePicker.launchCameraAsync({
			quality: 0.8,
			allowsEditing: false,
		});
		if (!result.canceled && result.assets[0]) {
			const asset = result.assets[0];
			onAttachmentChange({
				uri: asset.uri,
				name: asset.fileName ?? `photo_${Date.now()}.jpg`,
				type: asset.mimeType ?? "image/jpeg",
			});
		}
	};

	return (
		<View className="gap-stack-md">
			<View>
				<View className="flex-row items-center justify-between">
					<Text variant="buttonMd" className="font-semibold text-content">
						{t("problem.noteTitle")}
					</Text>
					<Text variant="caption" className="text-content-muted">
						{t("problem.optional")}
					</Text>
				</View>
				<Textarea
					value={description}
					onChangeText={onDescriptionChange}
					placeholder={t("problem.notePlaceholder")}
					multiline
					numberOfLines={4}
					variant="filled"
					className="mt-stack-sm min-h-[108px] bg-app-primary-light"
				/>
			</View>

			<View>
				<View className="flex-row items-center justify-between">
					<Text variant="buttonMd" className="font-semibold text-content">
						{t("problem.attachTitle")}
					</Text>
					<Text variant="caption" className="text-content-muted">
						{t("problem.optional")}
					</Text>
				</View>
				<Text variant="bodySm" className="mt-stack-xs text-content-muted">
					{t("problem.attachHint")}
				</Text>

				{attachment ? (
					<View className="mt-stack-sm overflow-hidden rounded-input border border-edge">
						<Image
							source={{ uri: attachment.uri }}
							resizeMode="cover"
							style={{
								width: "100%",
								height: spacing.media.attachmentPreviewHeight,
							}}
						/>
						<Button
							variant="secondary"
							size="icon"
							onPress={() => onAttachmentChange(null)}
							className="absolute top-stack-sm right-stack-sm h-control-icon-box-sm w-control-icon-box-sm items-center justify-center rounded-pill bg-shadow/50"
							iconLeft={
								<X
									size={spacing.icon.xs}
									color={themeColors.surfaceOnPrimary}
									strokeWidth={2.5}
								/>
							}
							accessibilityLabel={t("problem.removePhoto")}
						/>
					</View>
				) : (
					<View className="mt-stack-sm flex-row gap-stack-md">
						<Pressable
							onPress={takePhoto}
							className="aspect-square flex-1 items-center justify-center gap-stack-sm rounded-input border border-app-primary border-dashed bg-app-primary-light"
							accessibilityLabel={t("problem.takePhoto")}
						>
							<Camera size={22} color={themeColors.primary} strokeWidth={2} />
							<Text
								variant="buttonMd"
								className="font-semibold text-app-primary"
							>
								{t("problem.takePhoto")}
							</Text>
						</Pressable>
						<Pressable
							onPress={pickImage}
							className="aspect-square flex-1 items-center justify-center gap-stack-sm rounded-input border border-app-primary border-dashed bg-app-primary-light"
							accessibilityLabel={t("problem.uploadPhoto")}
						>
							<ImageIcon
								size={22}
								color={themeColors.primary}
								strokeWidth={2}
							/>
							<Text
								variant="buttonMd"
								className="font-semibold text-app-primary"
							>
								{t("problem.upload")}
							</Text>
						</Pressable>
					</View>
				)}
			</View>
		</View>
	);
}
