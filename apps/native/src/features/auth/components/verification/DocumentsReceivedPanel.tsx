import { CheckCircle2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";

// The three documents a technician uploads during signup. Listed back to them
// as a receipt — concrete and reassuring, not a generic "pending" placeholder.
const DOCUMENTS = ["nationalId", "criminalRecord", "certificate"] as const;

export function DocumentsReceivedPanel() {
	const { t } = useTranslation("auth");
	const c = useThemeColors();

	return (
		<View
			style={{
				borderRadius: radius.card,
				borderWidth: 1,
				borderColor: c.borderDefault,
				backgroundColor: c.surfaceElevated,
				paddingHorizontal: space[4],
				paddingVertical: space[3],
				gap: space[2],
			}}
		>
			<Text
				variant="caption"
				className="font-google-sans-bold text-content-muted uppercase"
				style={{ letterSpacing: 1 }}
			>
				{t("verification.documents.title")}
			</Text>

			{DOCUMENTS.map((doc) => (
				<View
					key={doc}
					style={{ flexDirection: "row", alignItems: "center", gap: space[2] }}
				>
					<CheckCircle2 size={17} color={c.success} strokeWidth={2.4} />
					<Text variant="bodySm" className="text-content">
						{t(`verification.documents.${doc}`)}
					</Text>
				</View>
			))}
		</View>
	);
}
