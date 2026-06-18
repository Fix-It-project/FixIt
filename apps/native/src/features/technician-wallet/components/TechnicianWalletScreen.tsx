import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { formatEgp } from "@/src/features/techhome/utils/money";
import { useTechnicianWalletQuery } from "../hooks/useTechnicianWalletQuery";

export function TechnicianWalletScreen() {
	const { t } = useTranslation("technician");
	const { data, isLoading } = useTechnicianWalletQuery();

	if (isLoading || !data) {
		return (
			<View className="flex-1 items-center justify-center bg-surface px-screen-x">
				<Text variant="body">{t("wallet.loading")}</Text>
			</View>
		);
	}

	return (
		<ScrollView
			className="flex-1 bg-surface"
			contentContainerClassName="gap-4 px-screen-x py-6"
		>
			<View className="gap-2">
				<Text variant="h3" className="text-content">
					{t("wallet.title")}
				</Text>
				<Text variant="bodySm" className="text-content-muted">
					{t("wallet.subtitle")}
				</Text>
			</View>

			<Card elevated className="gap-3 p-card">
				<Text variant="caption" className="text-content-muted">
					{t("wallet.pendingBalance")}
				</Text>
				<Text variant="display" className="text-content">
					{formatEgp(data.summary.pendingBalance)}
				</Text>
				<View className="gap-2 border-t border-edge pt-3">
					<Text variant="bodySm" className="text-content-muted">
						{t("wallet.lifetimeGross")}: {formatEgp(data.summary.lifetimeGross)}
					</Text>
					<Text variant="bodySm" className="text-content-muted">
						{t("wallet.lifetimeFees")}: {formatEgp(data.summary.lifetimePlatformFees)}
					</Text>
					<Text variant="bodySm" className="text-content-muted">
						{t("wallet.lifetimeNet")}: {formatEgp(data.summary.lifetimeNet)}
					</Text>
				</View>
			</Card>

			<View className="gap-3">
				<Text variant="h4" className="text-content">
					{t("wallet.entries")}
				</Text>
				{data.entries.length === 0 ? (
					<Card className="p-card">
						<Text variant="bodySm" className="text-content-muted">
							{t("wallet.empty")}
						</Text>
					</Card>
				) : (
					data.entries.map((entry) => (
						<Card key={entry.orderId} className="gap-3 p-card">
							<View className="gap-2">
								<View className="gap-1">
									<Text variant="body" className="font-bold text-content">
										{t("wallet.orderLabel")}
									</Text>
									<Text variant="caption" className="text-content-muted">
										{t(`wallet.method.${entry.paymentMethod}`)}
									</Text>
								</View>
								<Text
									variant="caption"
									className="self-start rounded-full bg-surface-muted px-3 py-1 text-content-muted"
								>
									{t(`wallet.payoutStatus.${entry.payoutStatus}`)}
								</Text>
							</View>
							<Text variant="bodySm" className="text-content-muted">
								{t("wallet.gross")}: {formatEgp(entry.grossAmount)}
							</Text>
							<Text variant="bodySm" className="text-content-muted">
								{t("wallet.platformCut", {
									percent: entry.platformFeePercent,
								})}
								: {formatEgp(entry.platformFeeAmount)}
							</Text>
							<Text variant="bodySm" className="text-content">
								{t("wallet.net")}: {formatEgp(entry.technicianNetAmount)}
							</Text>
						</Card>
					))
				)}
			</View>
		</ScrollView>
	);
}
