import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Briefcase, ClipboardList, Star } from "lucide-react-native";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { useTechnicianProfileQuery } from "@/src/features/technicians/hooks/useTechnicianProfileQuery";
import { useThemeColors } from "@/src/lib/theme";
import InfoRow from "./InfoRow";
import StatCard from "./StatCard";
import TechnicianAvatar from "./TechnicianAvatar";

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
    const themeColors = useThemeColors();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [sheetState, setSheetState] = useState<SheetState>({
      technicianId: null,
      initials: "",
    });

    const {
      data: profile,
      isLoading,
      isError,
      refetch,
    } = useTechnicianProfileQuery(sheetState.technicianId);

    const { height } = useWindowDimensions();
    const snapPoints = useMemo(() => [Math.min(height * 0.55, 480)], [height]);

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
          opacity={1}
          pressBehavior="close"
          style={{ backgroundColor: themeColors.overlayDim }}
        />
      ),
      [themeColors.overlayDim],
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: themeColors.surfaceBase,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        handleIndicatorStyle={{
          backgroundColor: themeColors.borderDefault,
          width: 40,
        }}
      >
        <BottomSheetView
          className="flex-1 px-6 pb-6"
          style={{ backgroundColor: themeColors.surfaceBase }}
        >
          {isLoading && (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={themeColors.primary} />
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
                className="text-center font-semibold text-[15px] text-danger"
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
              <TouchableOpacity
                onPress={() => refetch()}
                activeOpacity={0.7}
                className="mt-3 rounded-xl px-5 py-2.5"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Text
                  className="font-semibold text-[14px] text-white"
                  style={{ fontFamily: "GoogleSans_600SemiBold" }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
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
                className="mt-3 text-center font-bold text-[20px] text-content"
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
                  icon={
                    <Briefcase
                      size={18}
                      color={themeColors.primary}
                      strokeWidth={2}
                    />
                  }
                  label="Completed"
                  value={profile.completedOrders}
                />
                <StatCard
                  icon={
                    <ClipboardList
                      size={18}
                      color={themeColors.primary}
                      strokeWidth={2}
                    />
                  }
                  label="Bookings"
                  value={profile.totalBookings}
                />
              </View>

              <View className="mt-4">
                <InfoRow
                  icon={
                    <Star
                      size={16}
                      color={themeColors.ratingDefault}
                      fill={themeColors.ratingDefault}
                      strokeWidth={0}
                    />
                  }
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
