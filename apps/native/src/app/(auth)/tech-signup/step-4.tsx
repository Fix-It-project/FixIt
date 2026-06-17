import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import CategoryChip from "@/src/features/auth/components/shared/CategoryChip";
import { useTechnicianSignupStore } from "@/src/features/auth/stores/technician-signup-store";
import {
	CATEGORIES,
	translateCategoryLabel,
} from "@/src/features/categories/constants/categories";
import { ROUTES } from "@/src/lib/navigation";

export default function TechnicianSignUpStep4() {
	const { t } = useTranslation("auth");
	const { t: tc } = useTranslation("categories");
	const store = useTechnicianSignupStore();
	const [selectedId, setSelectedId] = useState<string | null>(
		store.categories[0] || null,
	);

	const toggleCategory = (id: string) => {
		setSelectedId((prev) => (prev === id ? null : id));
	};

	const handleNext = () => {
		if (selectedId) {
			store.setCategoriesData({ categories: [selectedId] });
			router.push(ROUTES.auth.techSignupStep(5));
		}
	};

	return (
		<AuthPageLayout
			title={t("techSignup.step4Title")}
			subtitle={t("techSignup.step4Subtitle")}
		>
			<View className="-mx-screen-form-bleed pt-stack-xs pb-stack-sm">
				<FlatList
					data={CATEGORIES}
					keyExtractor={(item) => item.id}
					scrollEnabled={false}
					renderItem={({ item }) => (
						<CategoryChip
							label={translateCategoryLabel(tc, item.id, item.label)}
							icon={item.icon}
							selected={selectedId === item.id}
							onPress={() => toggleCategory(item.id)}
						/>
					)}
				/>
			</View>

			<Button
				onPress={handleNext}
				disabled={selectedId === null}
				className="mt-stack-sm"
			>
				<BtnText variant="buttonLg">{t("form.next")}</BtnText>
			</Button>
		</AuthPageLayout>
	);
}
