import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { Toast } from "@/src/components/ui/toast";
import {
	DUR_SLIDE_UP,
	EASE_OUT_QUART,
	ENTRANCE_STAGGER,
} from "@/src/constants/animation";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useTechnicianServicesQuery } from "@/src/features/technicians/hooks/useTechnicianServicesQuery";
import { useAuthStore } from "@/src/stores/auth-store";

const SKELETON_KEYS = ["s1", "s2", "s3"] as const;

function formatPriceRange(
	min: number | null,
	max: number | null,
	onRequestLabel: string,
): string {
	if (min == null && max == null) return onRequestLabel;
	if (min != null && max != null && min !== max) {
		return `EGP ${min.toLocaleString()} – ${max.toLocaleString()}`;
	}
	const value = (min ?? max) as number;
	return `EGP ${value.toLocaleString()}`;
}

export default function TechnicianServicesScreen() {
	const { t } = useTranslation("settings");
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();

	const technicianId = useAuthStore((s) => s.user?.id) ?? null;
	const {
		data: services = [],
		isLoading,
		isError,
	} = useTechnicianServicesQuery(technicianId);

	const [name, setName] = useState("");
	const [category, setCategory] = useState("");
	const [description, setDescription] = useState("");
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");

	const fadeDown = (delay: number) =>
		reducedMotion
			? undefined
			: FadeInDown.delay(delay).duration(DUR_SLIDE_UP).easing(EASE_OUT_QUART);

	const canSubmit = name.trim().length > 0;

	const handleSubmit = () => {
		if (!canSubmit) return;
		// TODO: wire to the custom-services backend (technician requests a unique
		// service for admin approval). That module lives on another branch and is
		// not yet in tech-side-finalise, so the submission is stubbed for now.
		Toast.show({ type: "success", text1: t("services.submitSuccess") });
		setName("");
		setCategory("");
		setDescription("");
		setMinPrice("");
		setMaxPrice("");
	};

	return (
		<ScreenSafeAreaView
			className="flex-1"
			edges={["bottom"]}
			style={{ backgroundColor: themeColors.surfaceBase }}
		>
			<KeyboardAwareScrollView
				style={{ flex: 1, paddingHorizontal: spacing.screen.paddingX }}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="interactive"
				contentContainerStyle={{
					gap: spacing.stack.lg,
					paddingVertical: spacing.stack.lg,
					paddingBottom: spacing.stack.xl + spacing.stack.sm,
				}}
				bottomOffset={20}
			>
				{/* Current services */}
				<Animated.View entering={fadeDown(0)} className="gap-stack-sm">
					<Text variant="h2" className="text-content">
						{t("services.title")}
					</Text>
					<Text variant="bodySm" className="text-content-secondary">
						{t("services.subtitle")}
					</Text>
				</Animated.View>

				{isLoading ? (
					<View className="gap-stack-sm">
						{SKELETON_KEYS.map((key) => (
							<Skeleton key={key} className="h-20 w-full rounded-card" />
						))}
					</View>
				) : isError ? (
					<Text variant="bodySm" className="text-content-muted">
						{t("services.loadError")}
					</Text>
				) : services.length === 0 ? (
					<Text variant="bodySm" className="text-content-muted">
						{t("services.empty")}
					</Text>
				) : (
					<View className="gap-stack-xs rounded-card bg-card p-card">
						{services.map((service, index) => (
							<Animated.View
								key={service.id}
								entering={fadeDown(index * ENTRANCE_STAGGER)}
								className="rounded-input p-card"
							>
								<Text
									variant="buttonLg"
									className="font-bold text-content"
									numberOfLines={1}
								>
									{service.name}
								</Text>
								{service.description ? (
									<Text
										variant="caption"
										className="mt-stack-xs text-content-muted"
										numberOfLines={2}
									>
										{service.description}
									</Text>
								) : null}
								<Text
									variant="buttonMd"
									className="mt-stack-sm font-bold text-app-primary"
								>
									{formatPriceRange(
										service.min_price,
										service.max_price,
										t("services.priceOnRequest"),
									)}
								</Text>
							</Animated.View>
						))}
					</View>
				)}

				{/* Request a new service */}
				<Animated.View
					entering={fadeDown(120)}
					className="gap-stack-md rounded-card bg-card p-card"
				>
					<View className="gap-stack-xs">
						<Text variant="buttonLg" className="font-bold text-content">
							{t("services.requestTitle")}
						</Text>
						<Text variant="bodySm" className="text-content-secondary">
							{t("services.requestSubtitle")}
						</Text>
					</View>

					<View className="gap-stack-xs">
						<Text variant="label" className="text-content-secondary">
							{t("services.form.name")}
						</Text>
						<Input
							value={name}
							onChangeText={setName}
							placeholder={t("services.form.namePlaceholder")}
						/>
					</View>

					<View className="gap-stack-xs">
						<Text variant="label" className="text-content-secondary">
							{t("services.form.category")}
						</Text>
						<Input
							value={category}
							onChangeText={setCategory}
							placeholder={t("services.form.categoryPlaceholder")}
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

					<View className="flex-row gap-stack-md">
						<View className="flex-1 gap-stack-xs">
							<Text variant="label" className="text-content-secondary">
								{t("services.form.minPrice")}
							</Text>
							<Input
								value={minPrice}
								onChangeText={setMinPrice}
								placeholder="0"
								keyboardType="number-pad"
							/>
						</View>
						<View className="flex-1 gap-stack-xs">
							<Text variant="label" className="text-content-secondary">
								{t("services.form.maxPrice")}
							</Text>
							<Input
								value={maxPrice}
								onChangeText={setMaxPrice}
								placeholder="0"
								keyboardType="number-pad"
							/>
						</View>
					</View>

					<Button
						variant="primary"
						onPress={handleSubmit}
						disabled={!canSubmit}
						fullWidth
					>
						{t("services.submit")}
					</Button>
				</Animated.View>
			</KeyboardAwareScrollView>
		</ScreenSafeAreaView>
	);
}
