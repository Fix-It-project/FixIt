import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Dialog } from "@/src/components/ui/dialog";
import { Text } from "@/src/components/ui/text";
import { Textarea } from "@/src/components/ui/textarea";
import { Toast } from "@/src/components/ui/toast";
import { useThemeColors } from "@/src/constants/design-tokens";
import { showError } from "@/src/lib/errors";
import {
	DANGER_LABELS,
	REPORT_LABELS,
	type ReportViewer,
} from "../constants/labels";
import { useSubmitReport } from "../hooks/useSubmitReport";
import type { ReportLabel } from "../schemas/report.schema";

interface ReportSheetProps {
	visible: boolean;
	onClose: () => void;
	orderId: string;
	viewer: ReportViewer;
	counterpartyName?: string | null;
	onReported: () => void;
}

const SUMMARY_MAX = 2000;

/** The server maps the `duplicate_report` guard to 409 / CONFLICT. */
function isDuplicate(err: unknown): boolean {
	const e = err as { code?: string; opts?: { status?: number } };
	return e?.code === "CONFLICT" || e?.opts?.status === 409;
}

function LabelChip({
	text,
	active,
	danger,
	onPress,
}: {
	text: string;
	active: boolean;
	danger: boolean;
	onPress: () => void;
}) {
	const c = useThemeColors();
	const tint = danger ? c.danger : c.primary;
	return (
		<Pressable
			onPress={onPress}
			className="rounded-pill border px-3 py-2"
			style={{
				borderColor: active ? tint : c.borderDefault,
				backgroundColor: active ? `${tint}14` : "transparent",
			}}
			accessibilityRole="button"
			accessibilityState={{ selected: active }}
		>
			<Text
				variant="bodySm"
				className="font-semibold"
				style={{ color: active ? tint : c.textSecondary }}
			>
				{text}
			</Text>
		</Pressable>
	);
}

export function ReportSheet({
	visible,
	onClose,
	orderId,
	viewer,
	counterpartyName,
	onReported,
}: ReportSheetProps) {
	const { t } = useTranslation("reports");
	const mutation = useSubmitReport(viewer);

	const [label, setLabel] = useState<ReportLabel | null>(null);
	const [summary, setSummary] = useState("");

	// Reset whenever the sheet opens.
	useEffect(() => {
		if (visible) {
			setLabel(null);
			setSummary("");
		}
	}, [visible]);

	const canSubmit =
		label !== null && summary.trim().length > 0 && !mutation.isPending;

	const handleSubmit = () => {
		if (!label || summary.trim().length === 0) return;
		mutation.mutate(
			{ orderId, label, summary: summary.trim() },
			{
				onSuccess: () => {
					Toast.show({ type: "success", text1: t("success") });
					onReported();
					onClose();
				},
				onError: (err) => {
					if (isDuplicate(err)) {
						Toast.show({ type: "info", text1: t("alreadyReported") });
						onReported();
						onClose();
					} else {
						showError(err);
					}
				},
			},
		);
	};

	const name = counterpartyName?.trim() || t("sheet.counterpartyFallback");

	return (
		<Dialog visible={visible} onClose={onClose}>
			<Dialog.Header>{t("sheet.title")}</Dialog.Header>
			<Dialog.Body>{t("sheet.body", { name })}</Dialog.Body>
			<Dialog.Form>
				<View className="gap-stack-sm">
					<Text variant="label" className="text-content-secondary">
						{t("sheet.reasonLabel")}
					</Text>
					<View className="flex-row flex-wrap gap-stack-xs">
						{REPORT_LABELS[viewer].map((value) => (
							<LabelChip
								key={value}
								text={t(`labels.${value}` as Parameters<typeof t>[0])}
								active={label === value}
								danger={DANGER_LABELS.has(value)}
								onPress={() => setLabel(value)}
							/>
						))}
					</View>
					<Textarea
						value={summary}
						onChangeText={setSummary}
						placeholder={t("sheet.summaryPlaceholder")}
						maxLength={SUMMARY_MAX}
					/>
				</View>
			</Dialog.Form>
			<Dialog.Footer>
				<Button variant="secondary" onPress={onClose}>
					{t("sheet.cancel")}
				</Button>
				<Button
					variant="primary"
					loading={mutation.isPending}
					disabled={!canSubmit}
					onPress={handleSubmit}
				>
					{t("sheet.submit")}
				</Button>
			</Dialog.Footer>
		</Dialog>
	);
}
