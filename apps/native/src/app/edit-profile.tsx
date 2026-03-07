import { useEffect } from "react";
import { View, ScrollView, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { Mail, Phone, User } from "lucide-react-native";
import { useProfileQuery } from "@/src/hooks/users/useProfileQuery";
import { useUpdateProfileMutation } from "@/src/hooks/users/useUpdateProfileMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { editProfileSchema } from "@/src/schemas/auth-schema";
import { useEditProfileStore } from "@/src/stores/edit-profile-store";
import FormInput from "@/src/components/auth/FormInput";
import ErrorBanner from "@/src/components/auth/ErrorBanner";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";

export default function EditProfileScreen() {
  const { data: profile } = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const { fieldErrors, clearFieldError, validate } = useFormValidation(editProfileSchema);

  const { fullName, email, phone, setFullName, setEmail, setPhone, hydrate, reset } =
    useEditProfileStore();

  // Pre-fill store once profile data is available
  useEffect(() => {
    if (profile) {
      hydrate({
        fullName: profile.full_name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    const result = validate({ full_name: fullName, email, phone });
    if (!result.success) return;

    // Only send changed fields
    const payload: Record<string, string> = {};
    if (fullName !== (profile?.full_name ?? "")) payload.full_name = fullName;
    if (email !== (profile?.email ?? "")) payload.email = email;
    if (phone !== (profile?.phone ?? "")) payload.phone = phone;

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
