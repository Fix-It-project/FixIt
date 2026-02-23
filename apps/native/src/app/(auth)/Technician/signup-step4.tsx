import { useState, useMemo } from "react";
import { router } from "expo-router";
import { View, FlatList, Text } from "react-native";
import { useTechnicianSignupStore } from "@/src/stores/technician-signup-store";
import { CATEGORIES } from "@/src/lib/categories";
import AuthPageLayout from "@/src/components/auth/AuthPageLayout";
import SearchBar from "@/src/components/auth/SearchBar";
import CategoryChip from "@/src/components/auth/CategoryChip";
import SubmitButton from "@/src/components/auth/SubmitButton";

export default function TechnicianSignUpStep4() {
  const store = useTechnicianSignupStore();
  const [selectedIds, setSelectedIds] = useState<string[]>(store.categories);
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return CATEGORIES;
    return CATEGORIES.filter((c) =>
      c.label.toLowerCase().includes(query)
    );
  }, [search]);

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    store.setCategoriesData({ categories: selectedIds });
    router.push("/(auth)/Technician/signup-step5");
  };

  return (
    <AuthPageLayout
      title="Your specialties."
      subtitle="Select the categories that match your skills. You can pick more than one."
    >
      {/* Search bar */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search categories..."
      />

      {/* Selected count */}
      {selectedIds.length > 0 && (
        <Text
          style={{
            fontSize: 13,
            color: "#735f8c",
            fontWeight: "600",
            marginTop: -8,
          }}
        >
          {selectedIds.length} selected
        </Text>
      )}

      {/* Category list — break out of px-7 so chips span full width */}
      <View
        style={{
          marginHorizontal: -28,
          paddingTop: 4,
          paddingBottom: 8,
        }}
      >
        {filteredCategories.length === 0 ? (
          <Text
            style={{
              paddingVertical: 32,
              textAlign: "center",
              fontSize: 15,
              color: "#735f8c",
            }}
          >
            No categories match your search.
          </Text>
        ) : (
          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <CategoryChip
                label={item.label}
                icon={item.icon}
                color={item.color}
                selected={selectedIds.includes(item.id)}
                onPress={() => toggleCategory(item.id)}
              />
            )}
          />
        )}
      </View>

      {/* Next button */}
      <SubmitButton
        label="Next"
        onPress={handleNext}
        disabled={selectedIds.length === 0}
      />
    </AuthPageLayout>
  );
}
