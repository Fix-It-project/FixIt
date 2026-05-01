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
import { spacing, useThemeColors } from "@/src/lib/theme";
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
					style={{ backgroundColor: themeColors.backdrop }}
				/>
			),
			[themeColors.backdrop],
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
					width: spacing.sheet.handleWidth,
				}}
			>
				<BottomSheetView
					className="flex-1 px-button-x pb-stack-xl"
					style={{ backgroundColor: themeColors.surfaceBase }}
				>
					{isLoading && (
						<View className="flex-1 items-center justify-center">
							<ActivityIndicator size="large" color={themeColors.primary} />
							<Text variant="bodySm" className="mt-stack-md text-content-muted">
								Loading profile…
							</Text>
						</View>
					)}

					{isError && !isLoading && (
						<View className="flex-1 items-center justify-center">
							<Text variant="buttonLg" className="text-center text-danger">
								Unable to load profile
							</Text>
							<Text
								variant="bodySm"
								className="mt-stack-xs text-center text-content-muted"
							>
								Please try again later.
							</Text>
							<TouchableOpacity
								onPress={() => refetch()}
								activeOpacity={0.7}
								className="mt-stack-md rounded-button px-control-compact-cta-x py-control-compact-cta-y"
								style={{ backgroundColor: themeColors.primary }}
							>
								<Text variant="buttonMd" className="text-surface-on-primary">
									Retry
								</Text>
							</TouchableOpacity>
						</View>
					)}

					{profile && !isLoading && (
						<View className="flex-1 items-center">
							<View className="mt-stack-xs">
								<TechnicianAvatar
									id={sheetState.technicianId ?? ""}
									initials={sheetState.initials}
									size="lg"
								/>
							</View>

							<Text
								variant="h3"
								className="mt-stack-md text-center text-content"
								numberOfLines={1}
							>
								{profile.name}
							</Text>

							<Text
								variant="bodySm"
								className="mt-stack-xs px-card text-center text-content-secondary"
								numberOfLines={2}
							>
								{profile.description}
							</Text>

							<View className="mt-card-roomy w-full flex-row gap-stack-md">
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

							<View className="mt-stack-lg">
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
