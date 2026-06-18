import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { Button } from "@/src/components/ui/button";
import { confirm } from "@/src/components/ui/dialog";
import { RadioGroup } from "@/src/components/ui/radio-group";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import AddressListItem from "@/src/features/addresses/components/user/AddressListItem";
import { MAX_ADDRESSES } from "@/src/features/addresses/constants";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { useDeleteAddressMutation } from "@/src/features/addresses/hooks/useDeleteAddressMutation";
import { useSetActiveAddressMutation } from "@/src/features/addresses/hooks/useSetActiveAddressMutation";
import { showError } from "@/src/lib/errors";
import { ROUTES } from "@/src/lib/navigation";

export default function MyAddressesScreen() {
	const { t } = useTranslation("addresses");
	const themeColors = useThemeColors();

	const { data: addresses, isLoading, isError } = useAddressesQuery();
	const setActiveMutation = useSetActiveAddressMutation();
	const deleteMutation = useDeleteAddressMutation();

	const count = addresses?.length ?? 0;
	const atMax = count >= MAX_ADDRESSES;
	const activeId = addresses?.find((a) => a.is_active)?.id;

	const handleActivate = (addressId: string) => {
		if (addressId === activeId) return;
		setActiveMutation.mutate(addressId);
	};

	const handleDelete = async (addressId: string) => {
		const ok = await confirm({
			title: t("manage.deleteTitle"),
			description: t("manage.deleteMessage"),
			primary: { label: t("manage.deleteConfirm"), destructive: true },
			secondary: { label: t("manage.deleteCancel") },
		});
		if (ok) {
			deleteMutation.mutate(addressId, { onError: (e) => showError(e) });
		}
	};

	const goAdd = () => router.push(ROUTES.user.profileAddressNew);

	return (
		<ScreenSafeAreaView
			className="flex-1"
			style={{ backgroundColor: themeColors.surfaceBase }}
		>
			<PageHeader title={t("manage.title")} variant="surface" />

			<View className="flex-1 px-screen-x">
				{isLoading ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color={themeColors.primary} />
					</View>
				) : isError || !addresses ? (
					<View className="flex-1 items-center justify-center">
						<Text variant="buttonLg" className="text-center text-danger">
							{t("manage.loadError")}
						</Text>
					</View>
				) : (
					<>
						<Text
							variant="bodySm"
							className="py-stack-md text-content-secondary"
						>
							{atMax
								? t("manage.maxReached", { max: MAX_ADDRESSES })
								: t("manage.max", { max: MAX_ADDRESSES })}
						</Text>

						<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
							{count === 0 ? (
								<Text
									variant="body"
									className="py-stack-2xl text-center text-content-muted"
								>
									{t("manage.empty")}
								</Text>
							) : (
								<RadioGroup
									value={activeId}
									onValueChange={handleActivate}
									className="gap-0"
								>
									{addresses.map((item, index) => (
										<Fragment key={item.id}>
											{index > 0 ? <View className="h-px bg-edge" /> : null}
											<AddressListItem
												address={item}
												isActive={item.is_active}
												onPress={() => handleActivate(item.id)}
												onDelete={
													count > 1 ? () => handleDelete(item.id) : undefined
												}
												deleteDisabled={item.is_active}
												deleteLabel={t("manage.delete")}
											/>
										</Fragment>
									))}
								</RadioGroup>
							)}
						</ScrollView>

						<Button
							variant="primary"
							onPress={goAdd}
							disabled={atMax}
							fullWidth
							iconLeft={Plus}
							className="my-stack-md"
							accessibilityLabel={t("manage.add")}
						>
							{t("manage.add")}
						</Button>
					</>
				)}
			</View>
		</ScreenSafeAreaView>
	);
}
