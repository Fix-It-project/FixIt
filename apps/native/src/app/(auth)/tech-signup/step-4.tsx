import { router } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import CategoryChip from "@/src/features/auth/components/shared/CategoryChip";
import { useTechnicianSignupStore } from "@/src/features/auth/stores/technician-signup-store";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { ROUTES } from "@/src/lib/routes";

export default function TechnicianSignUpStep4() {
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
			title="Your specialty."
			subtitle="Select the category that matches your skills."
		>
			<View className="-mx-screen-form-bleed pt-stack-xs pb-stack-sm">
				<FlatList
					data={CATEGORIES}
					keyExtractor={(item) => item.id}
					scrollEnabled={false}
					renderItem={({ item }) => (
						<CategoryChip
							label={item.label}
							icon={item.icon}
							color={item.color}
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
				<BtnText variant="buttonLg">Next</BtnText>
			</Button>
		</AuthPageLayout>
	);
}
