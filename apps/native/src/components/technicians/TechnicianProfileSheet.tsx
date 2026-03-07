import { useCallback, useMemo, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Phone, Briefcase, ClipboardList, Star } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { useTechnicianProfileQuery } from "@/src/hooks/technicians/useTechnicianProfileQuery";

// ─── Avatar colours (same palette as the list card) ─────────────────────────
const AVATAR_COLORS = [
  "#2196F3", "#4CAF50", "#FF9800", "#9C27B0",
  "#00BCD4", "#F44336", "#3F51B5", "#795548",
];

function seededIndex(id: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % max;
}

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
    const stateRef = useRef<SheetState>({ technicianId: null, initials: "" });

    // We need state to trigger re-render when technicianId changes
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
        stateRef.current = { technicianId, initials };
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

    const avatarColor =
      sheetState.technicianId
        ? AVATAR_COLORS[seededIndex(sheetState.technicianId, AVATAR_COLORS.length)]
        : Colors.brand;

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
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 24 }}>
          {/* ── Loading state ── */}
          {isLoading && (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color={Colors.brand} />
              <Text
                style={{
                  fontFamily: "GoogleSans_400Regular",
                  color: Colors.textMuted,
                  fontSize: 13,
                  marginTop: 12,
                }}
              >
                Loading profile…
              </Text>
            </View>
          )}

          {/* ── Error state ── */}
          {isError && !isLoading && (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text
                style={{
                  fontFamily: "GoogleSans_600SemiBold",
                  color: Colors.error,
                  fontSize: 15,
                  textAlign: "center",
                }}
              >
                Unable to load profile
              </Text>
              <Text
                style={{
                  fontFamily: "GoogleSans_400Regular",
                  color: Colors.textMuted,
                  fontSize: 13,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                Please try again later.
              </Text>
            </View>
          )}

          {/* ── Profile content ── */}
          {profile && !isLoading && (
            <View style={{ flex: 1, alignItems: "center" }}>
              {/* Avatar */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: avatarColor,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 4,
                }}
              >
                {profile.profilePicture ? null : (
                  <Text
                    style={{
                      fontFamily: "GoogleSans_700Bold",
                      color: "#fff",
                      fontSize: 28,
                    }}
                  >
                    {sheetState.initials}
                  </Text>
                )}
              </View>

              {/* Name */}
              <Text
                style={{
                  fontFamily: "GoogleSans_700Bold",
                  fontSize: 20,
                  color: Colors.textPrimary,
                  marginTop: 12,
                  textAlign: "center",
                }}
                numberOfLines={1}
              >
                {profile.name}
              </Text>

              {/* Description */}
              <Text
                style={{
                  fontFamily: "GoogleSans_400Regular",
                  fontSize: 13,
                  color: Colors.textSecondary,
                  marginTop: 4,
                  textAlign: "center",
                  paddingHorizontal: 16,
                }}
                numberOfLines={2}
              >
                {profile.description}
              </Text>

              {/* ── Stats row ── */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  gap: 12,
                  width: "100%",
                }}
              >
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

              {/* ── Reviews ── */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 16,
                  backgroundColor: Colors.surfaceGray,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  width: "100%",
                  gap: 8,
                }}
              >
                <Star size={16} color={Colors.star} fill={Colors.star} strokeWidth={0} />
                <Text
                  style={{
                    fontFamily: "GoogleSans_400Regular",
                    fontSize: 13,
                    color: Colors.textSecondary,
                    flex: 1,
                  }}
                >
                  {profile.reviews}
                </Text>
              </View>

              {/* ── Phone number ── */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                  backgroundColor: Colors.surfaceGray,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  width: "100%",
                  gap: 8,
                }}
              >
                <Phone size={16} color={Colors.brand} strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: "GoogleSans_400Regular",
                    fontSize: 13,
                    color: Colors.textSecondary,
                    flex: 1,
                  }}
                >
                  {profile.phoneNumber}
                </Text>
              </View>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

// ─── Stat Card sub-component ─────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
}: Readonly<{ icon: React.ReactNode; label: string; value: string }>) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surfaceGray,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: "center",
        gap: 4,
      }}
    >
      {icon}
      <Text
        style={{
          fontFamily: "GoogleSans_700Bold",
          fontSize: 16,
          color: Colors.textPrimary,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: "GoogleSans_400Regular",
          fontSize: 11,
          color: Colors.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default TechnicianProfileSheet;
