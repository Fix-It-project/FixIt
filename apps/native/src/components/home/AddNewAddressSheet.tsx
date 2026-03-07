import { useCallback, useMemo, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { View, ActivityIndicator, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { MapPin, Navigation, ChevronLeft } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { useLocationStore } from "@/src/stores/location-store";
import { useAddAddressMutation } from "@/src/hooks/addresses/useAddAddressMutation";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { addAddressSchema, type AddAddressFormData } from "@/src/schemas/address-schema";

// ─── Public handle ──────────────────────────────────────────────────────────
export interface AddNewAddressSheetRef {
  open: () => void;
  close: () => void;
}

type Step = "capture" | "form";

// ─── Component ──────────────────────────────────────────────────────────────
const AddNewAddressSheet = forwardRef<AddNewAddressSheetRef, object>(
  function AddNewAddressSheet(_, ref) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [step, setStep] = useState<Step>("capture");
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

    // Form state
    const [city, setCity] = useState("");
    const [street, setStreet] = useState("");
    const [buildingNumber, setBuildingNumber] = useState("");
    const [apartmentNumber, setApartmentNumber] = useState("");

    const { requestLocationPermission, isLoading: isLocating } = useLocationStore();
    const addMutation = useAddAddressMutation();
    const { fieldErrors, clearFieldError, validate } = useFormValidation(addAddressSchema);

    const snapPoints = useMemo(() => ["70%"], []);

    const resetState = useCallback(() => {
      setStep("capture");
      setCoords(null);
      setCity("");
      setStreet("");
      setBuildingNumber("");
      setApartmentNumber("");
    }, []);

    useImperativeHandle(ref, () => ({
      open() {
        resetState();
        bottomSheetRef.current?.snapToIndex(0);
      },
      close() {
        bottomSheetRef.current?.close();
      },
    }));

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      [],
    );

    const handleCaptureLocation = useCallback(async () => {
      await requestLocationPermission();
      const { location } = useLocationStore.getState();
      if (location) {
        setCoords(location);
        setStep("form");
      }
    }, [requestLocationPermission]);

    const handleSubmit = useCallback(() => {
      const result = validate({ city, street, buildingNumber, apartmentNumber });
      if (!result.success) return;

      if (!coords) return;

      addMutation.mutate(
        {
          city: result.data.city,
          street: result.data.street,
          building_no: result.data.buildingNumber || undefined,
          apartment_no: result.data.apartmentNumber || undefined,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        {
          onSuccess: () => {
            bottomSheetRef.current?.close();
            resetState();
          },
        },
      );
    }, [city, street, buildingNumber, apartmentNumber, coords, validate, addMutation, resetState]);

    const handleBack = useCallback(() => {
      setStep("capture");
      setCoords(null);
    }, []);

    const handleClose = useCallback(() => {
      resetState();
    }, [resetState]);

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: Colors.borderLight, width: 40 }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView className="flex-1 px-6 pb-6">
          {/* Header */}
          <View className="flex-row items-center mb-4">
            {step === "form" && (
              <TouchableOpacity onPress={handleBack} activeOpacity={0.7} className="mr-2">
                <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
              </TouchableOpacity>
            )}
            <Text
              className="text-[18px] font-bold text-content"
              style={{ fontFamily: "GoogleSans_700Bold" }}
            >
              {step === "capture" ? "Capture Your Location" : "Address Details"}
            </Text>
          </View>

          {/* Step 1: Capture location */}
          {step === "capture" && (
            <View className="flex-1 items-center justify-center" style={{ gap: 20 }}>
              <View
                className="h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: Colors.brandLight }}
              >
                <Navigation size={36} color={Colors.brand} strokeWidth={2} />
              </View>

              <Text
                className="text-center text-[15px] text-content-secondary px-4"
                style={{ fontFamily: "GoogleSans_400Regular" }}
              >
                Tap the button below to capture your current GPS coordinates. This will be saved with your new address.
              </Text>

              <TouchableOpacity
                onPress={handleCaptureLocation}
                disabled={isLocating}
                activeOpacity={0.7}
                className="w-full flex-row items-center justify-center rounded-xl py-4"
                style={{ backgroundColor: Colors.brand }}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <MapPin size={18} color={Colors.white} strokeWidth={2} />
                    <Text
                      className="ml-2 text-[15px] text-white"
                      style={{ fontFamily: "GoogleSans_600SemiBold" }}
                    >
                      Capture Current Location
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Address form */}
          {step === "form" && (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              className="flex-1"
            >
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 14, paddingBottom: 20 }}
              >
                {/* Coords confirmation */}
                {coords && (
                  <View
                    className="flex-row items-center rounded-lg px-3 py-2"
                    style={{ backgroundColor: Colors.brandLight }}
                  >
                    <MapPin size={14} color={Colors.brand} strokeWidth={2} />
                    <Text
                      className="ml-2 text-[12px]"
                      style={{ fontFamily: "GoogleSans_400Regular", color: Colors.brand }}
                    >
                      Location captured ({coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)})
                    </Text>
                  </View>
                )}

                {/* City */}
                <View>
                  <Text
                    className="mb-1 text-[13px] text-content"
                    style={{ fontFamily: "GoogleSans_600SemiBold" }}
                  >
                    City <Text style={{ color: Colors.error }}>*</Text>
                  </Text>
                  <TextInput
                    value={city}
                    onChangeText={(t) => { setCity(t); clearFieldError("city"); }}
                    placeholder="Enter city"
                    placeholderTextColor={Colors.textMuted}
                    className="rounded-xl border px-4 py-3 text-[15px]"
                    style={{
                      fontFamily: "GoogleSans_400Regular",
                      borderColor: fieldErrors.city ? Colors.error : Colors.borderLight,
                      color: Colors.textPrimary,
                    }}
                  />
                  {fieldErrors.city && (
                    <Text className="mt-1 text-[12px]" style={{ color: Colors.error, fontFamily: "GoogleSans_400Regular" }}>
                      {fieldErrors.city}
                    </Text>
                  )}
                </View>

                {/* Street */}
                <View>
                  <Text
                    className="mb-1 text-[13px] text-content"
                    style={{ fontFamily: "GoogleSans_600SemiBold" }}
                  >
                    Street <Text style={{ color: Colors.error }}>*</Text>
                  </Text>
                  <TextInput
                    value={street}
                    onChangeText={(t) => { setStreet(t); clearFieldError("street"); }}
                    placeholder="Enter street address"
                    placeholderTextColor={Colors.textMuted}
                    className="rounded-xl border px-4 py-3 text-[15px]"
                    style={{
                      fontFamily: "GoogleSans_400Regular",
                      borderColor: fieldErrors.street ? Colors.error : Colors.borderLight,
                      color: Colors.textPrimary,
                    }}
                  />
                  {fieldErrors.street && (
                    <Text className="mt-1 text-[12px]" style={{ color: Colors.error, fontFamily: "GoogleSans_400Regular" }}>
                      {fieldErrors.street}
                    </Text>
                  )}
                </View>

                {/* Building number (optional) */}
                <View>
                  <Text
                    className="mb-1 text-[13px] text-content"
                    style={{ fontFamily: "GoogleSans_600SemiBold" }}
                  >
                    Building Number
                  </Text>
                  <TextInput
                    value={buildingNumber}
                    onChangeText={setBuildingNumber}
                    placeholder="Enter building number (optional)"
                    placeholderTextColor={Colors.textMuted}
                    className="rounded-xl border px-4 py-3 text-[15px]"
                    style={{
                      fontFamily: "GoogleSans_400Regular",
                      borderColor: Colors.borderLight,
                      color: Colors.textPrimary,
                    }}
                  />
                </View>

                {/* Apartment number (optional) */}
                <View>
                  <Text
                    className="mb-1 text-[13px] text-content"
                    style={{ fontFamily: "GoogleSans_600SemiBold" }}
                  >
                    Apartment Number
                  </Text>
                  <TextInput
                    value={apartmentNumber}
                    onChangeText={setApartmentNumber}
                    placeholder="Enter apartment number (optional)"
                    placeholderTextColor={Colors.textMuted}
                    className="rounded-xl border px-4 py-3 text-[15px]"
                    style={{
                      fontFamily: "GoogleSans_400Regular",
                      borderColor: Colors.borderLight,
                      color: Colors.textPrimary,
                    }}
                  />
                </View>

                {/* Mutation error */}
                {addMutation.isError && (
                  <Text className="text-[13px] text-center" style={{ color: Colors.error, fontFamily: "GoogleSans_400Regular" }}>
                    {(addMutation.error as any)?.response?.data?.error ?? "Failed to save address. Please try again."}
                  </Text>
                )}

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={addMutation.isPending}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-center rounded-xl py-4"
                  style={{ backgroundColor: Colors.brand, opacity: addMutation.isPending ? 0.6 : 1 }}
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
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default AddNewAddressSheet;
