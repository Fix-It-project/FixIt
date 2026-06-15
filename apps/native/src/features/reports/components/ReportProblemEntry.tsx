import { Flag } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import type { ReportViewer } from "../constants/labels";
import { ReportSheet } from "./ReportSheet";

interface ReportProblemEntryProps {
	orderId: string;
	viewer: ReportViewer;
	counterpartyName?: string | null;
	hasOpenReport?: boolean;
}

/** Low-emphasis "Report a problem" entry for terminal order screens. Never
 *  competes with the primary CTA; flips to a disabled "Reported" state once the
 *  viewer has an open report (from `has_open_report` or this session's submit). */
export function ReportProblemEntry({
	orderId,
	viewer,
	counterpartyName,
	hasOpenReport,
}: ReportProblemEntryProps) {
	const { t } = useTranslation("reports");
	const c = useThemeColors();
	const [open, setOpen] = useState(false);
	const [reportedLocal, setReportedLocal] = useState(false);
	const reported = Boolean(hasOpenReport) || reportedLocal;

	if (reported) {
		return (
			<View className="flex-row items-center justify-center gap-stack-xs py-stack-sm">
				<Flag size={13} color={c.textMuted} />
				<Text variant="caption" style={{ color: c.textMuted }}>
					{t("entry.reported")}
				</Text>
			</View>
		);
	}

	return (
		<>
			<Pressable
				onPress={() => setOpen(true)}
				className="flex-row items-center justify-center gap-stack-xs py-stack-sm"
				accessibilityRole="button"
				accessibilityLabel={t("entry.report")}
				hitSlop={8}
			>
				<Flag size={13} color={c.textMuted} />
				<Text
					variant="caption"
					className="underline"
					style={{ color: c.textMuted }}
				>
					{t("entry.report")}
				</Text>
			</Pressable>
			<ReportSheet
				visible={open}
				onClose={() => setOpen(false)}
				orderId={orderId}
				viewer={viewer}
				counterpartyName={counterpartyName}
				onReported={() => setReportedLocal(true)}
			/>
		</>
	);
}
