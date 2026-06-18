import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import ProfileSection from "./ProfileSection";

/**
 * Rewards section placeholder. Header only for now — the reward features (points,
 * tiers, redeem actions) are wired in later; this reserves the slot so the
 * profile reads intentionally.
 */
export default function RewardsSection() {
	const { t } = useTranslation("profile");
	return (
		<ProfileSection title={t("sections.rewards")}>
			<View className="px-screen-x py-stack-md">
				<Text variant="bodySm" className="text-content-muted">
					{t("rewards.comingSoon")}
				</Text>
			</View>
		</ProfileSection>
	);
}
