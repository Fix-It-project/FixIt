import { View } from "react-native";
import { Switch } from "@/src/components/ui/switch";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useAvailabilityMutation } from "../hooks/useAvailabilityMutation";

/**
 * Compact availability toggle for the hero — status dot + label + the shared
 * `ui/switch` primitive (react-native-reusables). Track is tinted online/offline
 * to match the dot; lives on the tinted hero, so text uses the on-hero color.
 */
export function OnlineSwitch({ online }: { online: boolean }) {
	const colors = useThemeColors();
	const { mutate, isPending } = useAvailabilityMutation();

	return (
		<View className="flex-row items-center gap-stack-xs rounded-xl bg-overlay-white px-2.5 py-1.5">
			<View
				className="h-2 w-2 rounded-full"
				style={{
					backgroundColor: online ? colors.statusOnline : colors.disabledText,
				}}
			/>
			<Text variant="caption" className="text-tint-on-hero">
				{online ? "Online" : "Offline"}
			</Text>
			<Switch
				checked={online}
				onCheckedChange={(checked) => mutate(checked)}
				disabled={isPending}
				className={online ? "bg-status-online" : "bg-overlay-md"}
			/>
		</View>
	);
}
