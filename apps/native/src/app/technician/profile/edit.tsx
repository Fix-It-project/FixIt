import { useEffect } from "react";
import { ActivityIndicator, Alert, View, useWindowDimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { FileText, Phone, User } from "lucide-react-native";
import { useTechSelfProfileQuery } from "@/src/hooks/tech/useTechSelfProfileQuery";
import { useUpdateTechSelfProfileMutation } from "@/src/hooks/tech/useUpdateTechSelfProfileMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { editTechProfileSchema } from "@/src/features/tech-self/schemas/form.schema";
import { useEditTechProfileStore } from "@/src/stores/edit-tech-profile-store";
import ErrorBanner from "@/src/features/auth/components/shared/ErrorBanner";
import FormInput from "@/src/features/auth/components/shared/FormInput";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";
import PageHeader from "@/src/components/PageHeader";

export default function EditTechProfileScreen() {
  const themeColors = useThemeColors();
  const { width } = useWindowDimensions();
  const { data: profile } = useTechSelfProfileQuery();
  const updateProfile = useUpdateTechSelfProfileMutation();
  const { fieldErrors, clearFieldError, validate } = useFormValidation(editTechProfileSchema);
  const goBack = useSafeBack(ROUTES.technician.profile);
  const horizontalPadding = Math.min(Math.max(width * 0.05, 16), 28);

  const {
    firstName, lastName, phone, description,
    setFirstName, setLastName, setPhone, setDescription,
    hydrate, reset,
  } = useEditTechProfileStore();

  useEffect(() => {
    if (!profile) return;

    hydrate({
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      phone: profile.phone ?? "",
      description: profile.description ?? "",
    });
  }, [profile, hydrate]);

  const originalValues = {
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    phone: profile?.phone ?? "",
    description: profile?.description ?? "",
  };

  const hasChanges =
    firstName !== originalValues.firstName ||
    lastName !== originalValues.lastName ||
    phone !== originalValues.phone ||
    description !== originalValues.description;

  const handleSave = () => {
    if (!hasChanges) return;

    const result = validate({ first_name: firstName, last_name: lastName, phone, description });
    if (!result.success) return;

    const payload: { first_name?: string; last_name?: string; phone?: string; description?: string } = {};
    if (result.data.first_name !== originalValues.firstName) payload.first_name = result.data.first_name;
    if (result.data.last_name !== originalValues.lastName) payload.last_name = result.data.last_name;
    if (result.data.phone !== originalValues.phone) payload.phone = result.data.phone;
    if (result.data.description !== originalValues.description) payload.description = result.data.description;

    if (Object.keys(payload).length === 0) {
      Alert.alert("No changes", "You haven't changed anything.");
      return;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => { reset(); goBack(); },
      onError: (error) =>
        Alert.alert("Update failed", getErrorMessage(error) || "Something went wrong."),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-elevated" edges={["top"]}>
      <PageHeader title="Edit Profile" variant="surface" onBackPress={goBack} />

      <KeyboardAwareScrollView
        className="flex-1"
        style={{ paddingHorizontal: horizontalPadding }}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 32,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={20}
      >
        <View className="w-full gap-4" style={{ maxWidth: 560 }}>
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
            <Button onPress={handleSave} disabled={!hasChanges || updateProfile.isPending}>
              {updateProfile.isPending ? (
                <ActivityIndicator color={themeColors.surfaceBase} />
              ) : (
                <Text>Save Changes</Text>
              )}
            </Button>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
