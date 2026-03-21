import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/src/lib/colors";

export default function SearchBar() {
	return (
		<Animated.View
			entering={FadeInDown.delay(80).duration(350)}
			className="px-5 pt-1 pb-4"
		>
			<View
				className="flex-row items-center gap-2.5 rounded-xl px-3.5 py-3.5"
				style={{
					backgroundColor: Colors.whiteOverlay,
					borderWidth: 1,
					borderColor: Colors.overlaySub,
				}}
			>
				<Search size={18} color={Colors.overlaySub} strokeWidth={2} />
				<TextInput
					placeholder="Search services & technicians"
					placeholderTextColor={Colors.overlaySub}
					editable={false}
					style={{
						flex: 1,
						fontSize: 15,
						color: Colors.white,
						fontFamily: "GoogleSans_400Regular",
						padding: 0,
					}}
				/>
			</View>
		</Animated.View>
	);
}
