import { useTranslation } from "react-i18next";
import HelpSupportContent from "@/src/features/settings/components/HelpSupportContent";

export default function HelpSupportScreen() {
	const { t } = useTranslation("settings");
	return <HelpSupportContent description={t("help.description")} />;
}
