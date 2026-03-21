import { useCallback, useMemo, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { View, ActivityIndicator, TouchableOpacity } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Navigation, X } from "lucide-react-native";
import { router } from "expo-router";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { useLocationStore } from "@/src/stores/location-store";
import { useHardwareBackHandler } from "@/src/hooks/useHardwareBackHandler";

// ─── Public handle ──────────────────────────────────────────────────────────
export interface AddNewAddressSheetRef {
  open: () => void;
  close: () => void;
}

interface AddNewAddressSheetProps {
  onBack?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────
const AddNewAddressSheet = forwardRef<AddNewAddressSheetRef, AddNewAddressSheetProps>(
  function AddNewAddressSheet({ onBack }, ref) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { requestLocationPermission, isLoading: isLocating } = useLocationStore();
    const [sheetIndex, setSheetIndex] = useState(-1);

    const snapPoints = useMemo(() => ["55%"], []);

    useImperativeHandle(ref, () => ({
      open() {
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

    const handleBack = useCallback(() => {
      bottomSheetRef.current?.close();
      onBack?.();
    }, [onBack]);

    useHardwareBackHandler(sheetIndex >= 0, () => {
      handleBack();
      return true;
    });

    const handleCaptureLocation = useCallback(async () => {
      await requestLocationPermission();
      const { location } = useLocationStore.getState();
      if (location) {
        bottomSheetRef.current?.close();
        router.push({
          pathname: "/(app)/(profile)/add-address",
          params: {
            latitude: String(location.latitude),
            longitude: String(location.longitude),
          },
        });
      }
    }, [requestLocationPermission]);

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: Colors.borderLight, width: 40 }}
        onChange={setSheetIndex}
      >
        <BottomSheetView className="flex-1 px-6 pb-10">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className="text-[18px] font-bold text-content"
              style={{ fontFamily: "GoogleSans_700Bold" }}
            >
              Add New Location
            </Text>
            <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
              <X size={22} color={Colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center" style={{ gap: 20 }}>
            {/* Icon */}
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: Colors.brandLight }}
            >
              <Navigation size={36} color={Colors.brand} strokeWidth={2} />
            </View>

            {/* Description */}
            <Text
              className="text-center text-[18px] text-content"
              style={{ fontFamily: "GoogleSans_700Bold" }}
            >
              Capture Your Location
            </Text>

            <Text
              className="text-center text-[14px] text-content-secondary px-4"
              style={{ fontFamily: "GoogleSans_400Regular" }}
            >
              Tap the button below to capture your current GPS coordinates,
              then fill in your address details.
            </Text>

            {/* Capture button */}
            <TouchableOpacity
              onPress={handleCaptureLocation}
              disabled={isLocating}
              activeOpacity={0.7}
              className="w-full flex-row items-center justify-center rounded-xl py-4"
              style={{ backgroundColor: Colors.brand, opacity: isLocating ? 0.6 : 1 }}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text
                  className="text-[15px] text-white"
                  style={{ fontFamily: "GoogleSans_600SemiBold" }}
                >
                  Get Current Location
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default AddNewAddressSheet;
