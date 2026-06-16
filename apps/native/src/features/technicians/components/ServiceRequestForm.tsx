import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { Toast } from "@/src/components/ui/toast";
import { useThemeColors } from "@/src/constants/design-tokens";
import { showError } from "@/src/lib/errors";
import { useSubmitServiceRequestMutation } from "../hooks/useCustomServiceRequests";

interface ServiceRequestFormProps {
	technicianId: string | null;
}

const POSITIVE_INT = /^\d+$/;

/** The server returns 403 (`technician_not_verified`) for unverified technicians. */
function isForbidden(err: unknown): boolean {
	const e = err as { code?: string; opts?: { status?: number } };
	return e?.code === "FORBIDDEN" || e?.opts?.status === 403;
}

/** Request a new custom service. Category is inherited server-side, so this form
 *  collects only name, description, and a required EGP price range. */
export function ServiceRequestForm({ technicianId }: ServiceRequestFormProps) {
	const { t } = useTranslation("settings");
	const c = useThemeColors();
	const mutation = useSubmitServiceRequestMutation(technicianId);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");
	const [forbidden, setForbidden] = useState(false);

	const minOk = POSITIVE_INT.test(minPrice.trim()) && Number(minPrice) > 0;
	const maxOk = POSITIVE_INT.test(maxPrice.trim()) && Number(maxPrice) > 0;
	const pricesFilled = minPrice.trim() !== "" && maxPrice.trim() !== "";
	const orderOk = !minOk || !maxOk || Number(maxPrice) >= Number(minPrice);

	let priceError: string | undefined;
	if (pricesFilled && (!minOk || !maxOk)) {
		priceError = t("services.form.priceInvalid");
	} else if (pricesFilled && !orderOk) {
		priceError = t("services.form.priceOrder");
	}

	const canSubmit =
		name.trim() !== "" && minOk && maxOk && orderOk && !mutation.isPending;

	// Any edit clears a stale "not verified" banner.
	const clearForbidden = () => {
		if (forbidden) setForbidden(false);
	};

	const reset = () => {
		setName("");
		setDescription("");
		setMinPrice("");
		setMaxPrice("");
	};

	const handleSubmit = () => {
		if (!canSubmit) return;
		mutation.mutate(
			{
				name: name.trim(),
				description: description.trim() || null,
				min_price: Number(minPrice),
				max_price: Number(maxPrice),
			},
			{
				onSuccess: () => {
					reset();
					Toast.show({
						type: "success",
						text1: t("services.submitSuccess"),
					});
				},
				onError: (err) => {
					if (isForbidden(err)) {
						setForbidden(true);
					} else {
						showError(err);
					}
				},
			},
		);
	};

	return (
		<View className="gap-stack-md">
			<View className="gap-stack-xs">
				<Text variant="buttonLg" className="font-bold text-content">
					{t("services.requestTitle")}
				</Text>
				<Text variant="bodySm" className="text-content-secondary">
					{t("services.requestSubtitle")}
				</Text>
			</View>

			{forbidden ? (
				<View
					className="rounded-input px-card py-stack-sm"
					style={{ backgroundColor: c.dangerLight }}
				>
					<Text
						variant="caption"
						className="font-semibold"
						style={{ color: c.danger }}
					>
						{t("services.verifiedOnly")}
					</Text>
				</View>
			) : null}

			<View className="gap-stack-xs">
				<Text variant="label" className="text-content-secondary">
					{t("services.form.name")}
				</Text>
				<Input
					value={name}
					onChangeText={(v) => {
						setName(v);
						clearForbidden();
					}}
					placeholder={t("services.form.namePlaceholder")}
				/>
			</View>

			<View className="gap-stack-xs">
				<Text variant="label" className="text-content-secondary">
					{t("services.form.description")}
				</Text>
				<Input
					value={description}
					onChangeText={setDescription}
					placeholder={t("services.form.descriptionPlaceholder")}
					multiline
				/>
			</View>

			<View className="gap-stack-xs">
				<View className="flex-row gap-stack-md">
					<View className="flex-1 gap-stack-xs">
						<Text variant="label" className="text-content-secondary">
							{t("services.form.minPrice")}
						</Text>
						<Input
							value={minPrice}
							onChangeText={(v) => {
								setMinPrice(v);
								clearForbidden();
							}}
							placeholder="0"
							keyboardType="number-pad"
							hasError={!!priceError}
						/>
					</View>
					<View className="flex-1 gap-stack-xs">
						<Text variant="label" className="text-content-secondary">
							{t("services.form.maxPrice")}
						</Text>
						<Input
							value={maxPrice}
							onChangeText={(v) => {
								setMaxPrice(v);
								clearForbidden();
							}}
							placeholder="0"
							keyboardType="number-pad"
							hasError={!!priceError}
						/>
					</View>
				</View>
				{priceError ? (
					<Text
						variant="caption"
						className="font-medium"
						style={{ color: c.danger }}
					>
						{priceError}
					</Text>
				) : null}
			</View>

			<Button
				variant="primary"
				onPress={handleSubmit}
				disabled={!canSubmit}
				loading={mutation.isPending}
				fullWidth
			>
				{t("services.submit")}
			</Button>
		</View>
	);
}
