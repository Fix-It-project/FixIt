import { useCallback, useMemo, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Briefcase, ClipboardList, Star } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { useTechnicianProfileQuery } from "@/src/hooks/technicians/useTechnicianProfileQuery";
import TechnicianAvatar from "@/src/components/technicians/TechnicianAvatar";
import StatCard from "@/src/components/technicians/StatCard";
import InfoRow from "@/src/components/technicians/InfoRow";

// ─── Public handle ──────────────────────────────────────────────────────────
export interface TechnicianProfileSheetRef {
  open: (technicianId: string, initials: string) => void;
  close: () => void;
}

interface SheetState {
  technicianId: string | null;
  initials: string;
}

// ─── Component ──────────────────────────────────────────────────────────────
const TechnicianProfileSheet = forwardRef<TechnicianProfileSheetRef, object>(
  function TechnicianProfileSheet(_, ref) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [sheetState, setSheetState] = useState<SheetState>({
      technicianId: null,
      initials: "",
    });

    const { data: profile, isLoading, isError } = useTechnicianProfileQuery(
      sheetState.technicianId,
    );

    const snapPoints = useMemo(() => ["55%"], []);

    useImperativeHandle(ref, () => ({
      open(technicianId: string, initials: string) {
        setSheetState({ technicianId, initials });
        bottomSheetRef.current?.snapToIndex(0);
      },
      close() {
        bottomSheetRef.current?.close();
      },
    }));

    const handleClose = useCallback(() => {
      setSheetState({ technicianId: null, initials: "" });
    }, []);

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
      >
        <BottomSheetView className="flex-1 px-6 pb-6">
          {isLoading && (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={Colors.brand} />
              <Text
                className="mt-3 text-[13px] text-content-muted"
                style={{ fontFamily: "GoogleSans_400Regular" }}
              >
                Loading profile…
              </Text>
            </View>
          )}

          {isError && !isLoading && (
            <View className="flex-1 items-center justify-center">
              <Text
                className="text-center text-[15px] font-semibold text-danger"
                style={{ fontFamily: "GoogleSans_600SemiBold" }}
              >
                Unable to load profile
              </Text>
              <Text
                className="mt-1 text-center text-[13px] text-content-muted"
                style={{ fontFamily: "GoogleSans_400Regular" }}
              >
                Please try again later.
              </Text>
            </View>
          )}

          {profile && !isLoading && (
            <View className="flex-1 items-center">
              <View className="mt-1">
                <TechnicianAvatar
                  id={sheetState.technicianId ?? ""}
                  initials={sheetState.initials}
                  size="lg"
                />
              </View>

              <Text
                className="mt-3 text-center text-[20px] font-bold text-content"
                style={{ fontFamily: "GoogleSans_700Bold" }}
                numberOfLines={1}
              >
                {profile.name}
              </Text>

              <Text
                className="mt-1 px-4 text-center text-[13px] text-content-secondary"
                style={{ fontFamily: "GoogleSans_400Regular" }}
                numberOfLines={2}
              >
                {profile.description}
              </Text>

              <View className="mt-5 w-full flex-row" style={{ gap: 12 }}>
                <StatCard
                  icon={<Briefcase size={18} color={Colors.brand} strokeWidth={2} />}
                  label="Completed"
                  value={profile.completedOrders}
                />
                <StatCard
                  icon={<ClipboardList size={18} color={Colors.brand} strokeWidth={2} />}
                  label="Bookings"
                  value={profile.totalBookings}
                />
              </View>

              <View className="mt-4">
                <InfoRow
                  icon={<Star size={16} color={Colors.star} fill={Colors.star} strokeWidth={0} />}
                  text={profile.reviews}
                />
              </View>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default TechnicianProfileSheet;
