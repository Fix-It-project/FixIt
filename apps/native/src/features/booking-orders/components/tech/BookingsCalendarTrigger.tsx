import { CalendarDays } from "lucide-react-native";
import { Button } from "@/src/components/ui/button";
import type { ThemePalette } from "@/src/lib/theme";

interface Props {
	readonly onPress: () => void;
	readonly themeColors: ThemePalette;
}

export default function BookingsCalendarTrigger({
	onPress,
	themeColors: _themeColors,
}: Props) {
	return (
		<Button
			variant="secondary"
			size="sm"
			onPress={onPress}
			iconLeft={CalendarDays}
			accessibilityLabel="Jump to date"
			className="self-end"
		>
			Jump
		</Button>
	);
}
