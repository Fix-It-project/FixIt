// Borderless accepted-network marks on the Card option, using the real brand
// SVGs (imported as components via react-native-svg-transformer).

import { View } from "react-native";
import MeezaLogo from "@/src/assets/images/meeza.svg";
import VisaLogo from "@/src/assets/images/visa.svg";
import { space } from "@/src/constants/design-tokens";

// Heights kept equal; widths derive from each logo's viewBox aspect ratio
// (visa ≈ 3.09:1, meeza ≈ 2.07:1) so neither distorts.
const MARK_HEIGHT = 16;

export function PaymentBrandMarks() {
	return (
		<View style={{ flexDirection: "row", alignItems: "center", gap: space[2] }}>
			<VisaLogo width={MARK_HEIGHT * 3.09} height={MARK_HEIGHT} />
			<MeezaLogo width={MARK_HEIGHT * 2.07} height={MARK_HEIGHT} />
		</View>
	);
}
