import { useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MapPin } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { addAddressSchema } from "@/src/schemas/address-schema";
import { useAddAddressMutation } from "@/src/hooks/addresses/useAddAddressMutation";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import AddressFormSection from "@/src/components/shared/AddressFormSection";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";

export default function AddAddressScreen() {
  const params = useLocalSearchParams<{ latitude: string; longitude: string }>();
  const latitude = Number(params.latitude);
  const longitude = Number(params.longitude);

  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");

  const { fieldErrors, clearFieldError, validate } =
    useFormValidation(addAddressSchema);
  const addMutation = useAddAddressMutation();

  const handleSubmit = useCallback(() => {
    const result = validate({ city, street, buildingNumber, apartmentNumber });
    if (!result.success) return;

    addMutation.mutate(
      {
        city: result.data.city,
        street: result.data.street,
        building_no: result.data.buildingNumber || undefined,
        apartment_no: result.data.apartmentNumber || undefined,
        latitude,
        longitude,
      },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  }, [city, street, buildingNumber, apartmentNumber, latitude, longitude, validate, addMutation]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.white }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-3" style={{ gap: 8 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeft size={26} color={Colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text
          className="text-[20px] text-content"
          style={{ fontFamily: "GoogleSans_700Bold" }}
        >
          Address Details
        </Text>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
        bottomOffset={20}
      >
        {/* Coords badge */}
        <View
          className="flex-row items-center rounded-lg px-3 py-2.5"
          style={{ backgroundColor: Colors.brandLight }}
        >
          <MapPin size={14} color={Colors.brand} strokeWidth={2} />
          <Text
            className="ml-2 text-[13px]"
            style={{ fontFamily: "GoogleSans_400Regular", color: Colors.brand }}
          >
            Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </Text>
        </View>

        {/* Form fields */}
        <AddressFormSection
          city={city}
          onCityChange={(t) => { setCity(t); clearFieldError("city"); }}
          street={street}
          onStreetChange={(t) => { setStreet(t); clearFieldError("street"); }}
          buildingNumber={buildingNumber}
          onBuildingNumberChange={setBuildingNumber}
          apartmentNumber={apartmentNumber}
          onApartmentNumberChange={setApartmentNumber}
          errors={{ city: fieldErrors.city, street: fieldErrors.street }}
          variant="outline"
          streetLabel="Street"
          showIcons={false}
        />

        {/* Mutation error */}
        {addMutation.isError && (
          <Text
            className="text-[13px] text-center"
            style={{ color: Colors.error, fontFamily: "GoogleSans_400Regular" }}
          >
            {getErrorMessage(addMutation.error)}
          </Text>
        )}

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={addMutation.isPending}
          activeOpacity={0.7}
          className="flex-row items-center justify-center rounded-xl py-4"
          style={{
            backgroundColor: Colors.brand,
            opacity: addMutation.isPending ? 0.6 : 1,
          }}
        >
          {addMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text
              className="text-[15px] text-white"
              style={{ fontFamily: "GoogleSans_600SemiBold" }}
            >
              Save Address
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
