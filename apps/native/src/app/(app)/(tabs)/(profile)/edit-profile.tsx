import { useEffect } from "react";
import { View, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Mail, Phone, User } from "lucide-react-native";
import { useProfileQuery } from "@/src/hooks/user/useProfileQuery";
import { useUpdateProfileMutation } from "@/src/hooks/user/useUpdateProfileMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { editProfileSchema } from "@/src/features/users/schemas/form.schema";
import { useEditProfileStore } from "@/src/stores/edit-profile-store";
import FormInput from "@/src/features/auth/components/shared/FormInput";
import ErrorBanner from "@/src/features/auth/components/shared/ErrorBanner";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { useSafeBack } from "@/src/lib/navigation";

export default function EditProfileScreen() {
  const themeColors = useThemeColors();
  const { data: profile } = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const { fieldErrors, clearFieldError, validate } = useFormValidation(editProfileSchema);
  const goBack = useSafeBack("/(app)/(tabs)/(profile)");

  const { fullName, email, phone, setFullName, setEmail, setPhone, hydrate, reset } =
    useEditProfileStore();

  // Pre-fill store once profile data is available
  useEffect(() => {
    if (!profile) return;

    hydrate({
      fullName: profile.full_name ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    });
  }, [profile, hydrate]);

  const originalValues = {
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
  };

  const hasChanges =
    fullName !== originalValues.fullName ||
    email !== originalValues.email ||
    phone !== originalValues.phone;

  const handleSave = () => {
    if (!hasChanges) return;

    const result = validate({ full_name: fullName, email, phone });
    if (!result.success) return;

    // Only send changed fields
    const payload: { full_name?: string; email?: string; phone?: string } = {};
    if (result.data.full_name !== originalValues.fullName) payload.full_name = result.data.full_name;
    if (result.data.email !== originalValues.email) payload.email = result.data.email;
    if (result.data.phone !== originalValues.phone) payload.phone = result.data.phone;

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
    <ScrollView
      className="flex-1 bg-surface-elevated"
      contentContainerClassName="px-5 py-6 gap-4"
      keyboardShouldPersistTaps="handled"
    >
      <ErrorBanner
        message={updateProfile.error ? getErrorMessage(updateProfile.error) : null}
      />

      <FormInput
        label="Full Name"
        value={fullName}
        onChangeText={(text) => { setFullName(text); clearFieldError("full_name"); }}
        placeholder="Enter your full name"
        icon={User}
        error={fieldErrors.full_name}
        disabled={updateProfile.isPending}
        variant="outline"
        autoCapitalize="words"
      />

      <FormInput
        label="Email"
        value={email}
        onChangeText={(text) => { setEmail(text); clearFieldError("email"); }}
        placeholder="Enter your email"
        icon={Mail}
        error={fieldErrors.email}
        disabled={updateProfile.isPending}
        variant="outline"
        keyboardType="email-address"
        autoCapitalize="none"
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

      <View className="mt-2">
        <Button onPress={handleSave} disabled={!hasChanges || updateProfile.isPending}>
          {updateProfile.isPending ? (
            <ActivityIndicator color={themeColors.surfaceBase} />
          ) : (
            <Text>Save Changes</Text>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
