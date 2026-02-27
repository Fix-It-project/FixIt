import { useState } from "react";
import { router } from "expo-router";
import { View, FlatList } from "react-native";
import { useTechnicianSignupStore } from "@/src/stores/technician-signup-store";
import { CATEGORIES } from "@/src/lib/categories";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import CategoryChip from "@/src/components/auth/CategoryChip";
import SubmitButton from "@/src/components/auth/SubmitButton";

export default function TechnicianSignUpStep4() {
  const store = useTechnicianSignupStore();
  const [selectedId, setSelectedId] = useState<string | null>(
    store.categories[0] || null
  );

  const toggleCategory = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleNext = () => {
    if (selectedId) {
      store.setCategoriesData({ categories: [selectedId] });
      router.push("/(auth)/Technician/signup-step5");
    }
  };

  return (
    <AuthPageLayout
      title="Your specialty."
      subtitle="Select the category that matches your skills."
    >
      <View
        style={{
          marginHorizontal: -28,
          paddingTop: 4,
          paddingBottom: 8,
        }}
      >
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

      {/* Next button */}
      <SubmitButton
        label="Next"
        onPress={handleNext}
        disabled={selectedId === null}
      />
    </AuthPageLayout>
  );
}
