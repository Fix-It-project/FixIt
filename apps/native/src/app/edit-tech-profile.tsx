import { useEffect } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { FileText, Phone, User } from "lucide-react-native";
import { useTechSelfProfileQuery } from "@/src/hooks/technicians/useTechSelfProfileQuery";
import { useUpdateTechSelfProfileMutation } from "@/src/hooks/technicians/useUpdateTechSelfProfileMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { editTechProfileSchema } from "@/src/schemas/technician-profile.schema";
import { useEditTechProfileStore } from "@/src/stores/edit-tech-profile-store";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import FormInput from "@/src/components/auth/FormInput";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";

export default function EditTechProfileScreen() {
  const { data: profile } = useTechSelfProfileQuery();
  const updateProfile = useUpdateTechSelfProfileMutation();
  const { fieldErrors, clearFieldError, validate } = useFormValidation(editTechProfileSchema);

  const {
    firstName, lastName, phone, description,
    setFirstName, setLastName, setPhone, setDescription,
    hydrate, reset,
  } = useEditTechProfileStore();

  useEffect(() => {
    if (profile) {
      hydrate({
        firstName: profile.first_name ?? "",
        lastName: profile.last_name ?? "",
        phone: profile.phone ?? "",
        description: profile.description ?? "",
      });
    }
  }, [profile, hydrate]);

  const handleSave = () => {
    const result = validate({ first_name: firstName, last_name: lastName, phone, description });
    if (!result.success) return;

    const payload: Record<string, string> = {};
    if (firstName !== (profile?.first_name ?? "")) payload.first_name = firstName;
    if (lastName !== (profile?.last_name ?? "")) payload.last_name = lastName;
    if (phone !== (profile?.phone ?? "")) payload.phone = phone;
    if (description !== (profile?.description ?? "")) payload.description = description;

    if (Object.keys(payload).length === 0) {
      Alert.alert("No changes", "You haven't changed anything.");
      return;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => { reset(); router.back(); },
      onError: (error) =>
        Alert.alert("Update failed", getErrorMessage(error) || "Something went wrong."),
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-surface-gray"
      contentContainerClassName="px-5 py-6 gap-4"
      keyboardShouldPersistTaps="handled"
    >
      <ErrorBanner
        message={updateProfile.error ? getErrorMessage(updateProfile.error) : null}
      />

      <FormInput
        label="First Name"
        value={firstName}
        onChangeText={(text) => { setFirstName(text); clearFieldError("first_name"); }}
        placeholder="Enter your first name"
        icon={User}
        error={fieldErrors.first_name}
        disabled={updateProfile.isPending}
        variant="outline"
        autoCapitalize="words"
      />

      <FormInput
        label="Last Name"
        value={lastName}
        onChangeText={(text) => { setLastName(text); clearFieldError("last_name"); }}
        placeholder="Enter your last name"
        icon={User}
        error={fieldErrors.last_name}
        disabled={updateProfile.isPending}
        variant="outline"
        autoCapitalize="words"
      />

      <FormInput
        label="Phone"
        value={phone}
        onChangeText={(text) => { setPhone(text); clearFieldError("phone"); }}
        placeholder="Enter your phone number"
        icon={Phone}
        error={fieldErrors.phone}
        disabled={updateProfile.isPending}
        variant="outline"
        keyboardType="phone-pad"
      />

      <FormInput
        label="About"
        value={description}
        onChangeText={(text) => { setDescription(text); clearFieldError("description"); }}
        placeholder="Tell clients about yourself…"
        icon={FileText}
        error={fieldErrors.description}
        disabled={updateProfile.isPending}
        variant="outline"
      />

      <View className="mt-2">
        <Button onPress={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text>Save Changes</Text>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
