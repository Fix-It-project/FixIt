import type { TFunction } from "i18next";
import { z } from "zod";

/** Zod form validation schema for the "Add New Address" form. */
export const addAddressSchema = (t: TFunction<"addresses">) =>
	z.object({
		city: z.string().min(1, t("form.errors.cityRequired")),
		street: z
			.string()
			.min(5, t("form.errors.streetMin"))
			.max(200, t("form.errors.streetMax")),
		buildingNumber: z.string().optional().or(z.literal("")),
		apartmentNumber: z.string().optional().or(z.literal("")),
		/** Latitude from GPS — optional because it is captured separately, not via the form. */
		latitude: z.number().min(-90).max(90).optional(),
		/** Longitude from GPS — optional because it is captured separately, not via the form. */
		longitude: z.number().min(-180).max(180).optional(),
	});

export type AddAddressFormData = z.infer<ReturnType<typeof addAddressSchema>>;
