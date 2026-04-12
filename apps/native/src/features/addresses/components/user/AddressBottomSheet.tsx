import { useCallback, useMemo, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { View, ActivityIndicator, FlatList, TouchableOpacity, useWindowDimensions } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Plus, X } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { useAddressesQuery } from "@/src/hooks/addresses/useAddressesQuery";
import { useSetActiveAddressMutation } from "@/src/hooks/addresses/useSetActiveAddressMutation";
import AddressListItem from "./AddressListItem";
import { useHardwareBackHandler } from "@/src/hooks/useHardwareBackHandler";

// ─── Public handle ──────────────────────────────────────────────────────────
export interface AddressBottomSheetRef {
  open: () => void;
  close: () => void;
}

interface AddressBottomSheetProps {
  onAddNewAddress: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────
const AddressBottomSheet = forwardRef<AddressBottomSheetRef, AddressBottomSheetProps>(
  function AddressBottomSheet({ onAddNewAddress }, ref) {
    const bottomSheetRef = useRef<BottomSheet>(null);

    const { data: addresses, isLoading, isError } = useAddressesQuery();
    const setActiveMutation = useSetActiveAddressMutation();

    // Optimistic active ID — avoids stale UI while mutation is in-flight
    const [optimisticActiveId, setOptimisticActiveId] = useState<string | null>(null);
    const [sheetIndex, setSheetIndex] = useState(-1);

    const { height } = useWindowDimensions();
    const snapPoints = useMemo(() => [Math.min(height * 0.65, 560)], [height]);

    useHardwareBackHandler(sheetIndex >= 0, () => {
      bottomSheetRef.current?.close();
      return true;
    });

    useImperativeHandle(ref, () => ({
      open() {
        setOptimisticActiveId(null);
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

    const handleActivate = useCallback(
      (addressId: string) => {
        setOptimisticActiveId(addressId);
        setActiveMutation.mutate(addressId, {
          onSettled: () => setOptimisticActiveId(null),
        });
      },
      [setActiveMutation],
    );

    const handleClose = useCallback(() => {
      bottomSheetRef.current?.close();
    }, []);

    // Determine which address is visually active
    const getIsActive = useCallback(
      (id: string, serverActive: boolean) =>
        optimisticActiveId ? id === optimisticActiveId : serverActive,
      [optimisticActiveId],
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: Colors.borderDefault, width: 40 }}
        onChange={setSheetIndex}
      >
        <BottomSheetView className="flex-1 px-6 pb-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className="text-[18px] font-bold text-content"
              style={{ fontFamily: "GoogleSans_700Bold" }}
            >
              Choose delivery location
            </Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <X size={22} color={Colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {isLoading && (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text
                className="mt-3 text-[13px] text-content-muted"
                style={{ fontFamily: "GoogleSans_400Regular" }}
              >
                Loading addresses…
              </Text>
            </View>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <View className="flex-1 items-center justify-center">
              <Text
                className="text-center text-[15px] font-semibold text-danger"
                style={{ fontFamily: "GoogleSans_600SemiBold" }}
              >
                Unable to load addresses
              </Text>
              <Text
                className="mt-1 text-center text-[13px] text-content-muted"
                style={{ fontFamily: "GoogleSans_400Regular" }}
              >
                Please try again later.
              </Text>
            </View>
          )}

          {/* Address list */}
          {addresses && !isLoading && (
            <View className="flex-1">
              <Text
                className="mb-1 text-[13px] text-content-secondary"
                style={{ fontFamily: "GoogleSans_600SemiBold" }}
              >
                Saved addresses
              </Text>

              <FlatList
                data={addresses}
                keyExtractor={(item) => item.id}
                extraData={optimisticActiveId}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => (
                  <View style={{ height: 1, backgroundColor: Colors.surfaceElevated }} />
                )}
                renderItem={({ item }) => (
                  <AddressListItem
                    address={item}
                    isActive={getIsActive(item.id, item.is_active)}
                    onPress={() => handleActivate(item.id)}
                    disabled={setActiveMutation.isPending}
                  />
                )}
              />

              {/* Add New Location */}
              <TouchableOpacity
                onPress={onAddNewAddress}
                activeOpacity={0.7}
                className="mt-3 flex-row items-center justify-center rounded-xl py-3.5"
                style={{ backgroundColor: Colors.primaryLight }}
              >
                <Plus size={18} color={Colors.primary} strokeWidth={2.5} />
                <Text
                  className="ml-2 text-[15px]"
                  style={{ fontFamily: "GoogleSans_600SemiBold", color: Colors.primary }}
                >
                  Add New Location
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default AddressBottomSheet;
