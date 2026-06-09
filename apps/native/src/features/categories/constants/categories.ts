import type { TFunction } from "i18next";
import {
	AirVent,
	BrushCleaning,
	CookingPot,
	Drill,
	Fan,
	HousePlug,
	type LucideIcon,
	Paintbrush,
	Refrigerator,
	SatelliteDish,
	ShowerHead,
} from "lucide-react-native";

export interface Category {
	id: string;
	label: string;
	/** Stable translation key suffix — see `categories` i18n namespace `labels`. */
	slug: string;
	icon: LucideIcon;
}

// Categories are unified under the primary brand color — no per-category colors.
export const CATEGORIES: Category[] = [
	{
		id: "1d85a9ac-ffbb-4164-9f3f-6bb4100c9908",
		label: "Air Condition",
		slug: "airCondition",
		icon: AirVent,
	},
	{
		id: "078c039e-72a6-4b81-9940-3b440cbcd8da",
		label: "Dish",
		slug: "dish",
		icon: SatelliteDish,
	},
	{
		id: "bbfc1ee7-38bc-4927-af90-4d90a3afce22",
		label: "Fan",
		slug: "fan",
		icon: Fan,
	},
	{
		id: "223d2864-9b6d-4e87-ae6c-432a4e85f35e",
		label: "Fridge/Freezer",
		slug: "fridge",
		icon: Refrigerator,
	},
	{
		id: "fe099ba2-300f-434f-b2e9-34fb196d9ac8",
		label: "Home Cleaning",
		slug: "homeCleaning",
		icon: BrushCleaning,
	},
	{
		id: "2aeeb262-c098-40c3-8ac9-8542864446b6",
		label: "Oven/Cooker",
		slug: "oven",
		icon: CookingPot,
	},
	{
		id: "65d7cd90-0752-4bc6-9e54-97cb1a38dd78",
		label: "Painter",
		slug: "painter",
		icon: Paintbrush,
	},
	{
		id: "57954692-2cf3-489f-aa9d-42d0da4cf95c",
		label: "Plumbing",
		slug: "plumbing",
		icon: ShowerHead,
	},
	{
		id: "085ce9ea-0285-4724-a9c6-47f5197899c6",
		label: "Carpentry",
		slug: "carpenter",
		icon: Drill,
	},
	{
		id: "78a4f849-710e-4bfa-815a-fe210ce184ad",
		label: "Electrical",
		slug: "electrician",
		icon: HousePlug,
	},
];

const CATEGORY_SLUG_BY_NORMALIZED_NAME: Record<string, string> = {
	"air condition": "airCondition",
	ac: "airCondition",
	hvac: "airCondition",
	dish: "dish",
	fan: "fan",
	"fridge freezer": "fridge",
	fridge: "fridge",
	freezer: "fridge",
	refrigerator: "fridge",
	"home cleaning": "homeCleaning",
	cleaning: "homeCleaning",
	"oven cooker": "oven",
	oven: "oven",
	cooker: "oven",
	painter: "painter",
	painting: "painter",
	plumbing: "plumbing",
	carpenter: "carpenter",
	carpentry: "carpenter",
	electrician: "electrician",
	electrical: "electrician",
};

const SERVICE_SLUG_BY_ID: Record<string, string> = {
	"ea92ea59-642a-492c-ab99-acc7ec26d9c2": "dishRepairs",
	"ad5061e9-e138-46cb-ae72-b886533fb17e": "dishInstallations",
	"8f4379a8-cfc2-4b42-8519-398dd60307e0": "hangTv",
	"d5a70cad-eaa2-4698-b141-e87ee09e2c94": "uninstallDish",
	"a9fd4a24-e889-41ad-af53-1a960334e0e6": "acMaintenanceCleaning",
	"4e146305-a8a9-49c1-b98e-da59e5b76187": "acLeakingWater",
	"f29c3dd1-6b54-4857-bd3b-37896d62e879": "acNotCooling",
	"9722e1e5-0a32-401b-b9f1-0521062bf682": "houseCleaning",
	"5855089e-9d56-482c-ab25-7395490fa10d": "carpetCleaning",
	"82b47ad3-f607-4c94-a457-db8d87354c74": "fridgeLoudNoises",
	"4bf8fbe1-77a0-4053-b6be-d27e608f2142": "thermostatReplacement",
	"1592723e-8302-4110-aad2-0b88a80cc630": "fridgeWaterLeakage",
	"fae42414-6d92-4fe4-b3c1-fe7fc93865da": "ovenDoorNotClosing",
	"99680059-e2ea-4c4e-bcb1-755eae8e5478": "ovenNotHeating",
	"2d1c00b1-3000-445c-8c5d-e7456b0e8bfd": "weakOvenHeat",
	"3c72b62f-5b42-42e1-85de-f94367fa8ce6": "wallPaintPeeling",
	"e6456fbc-808a-4aef-b9a1-93cabbbdda32": "doorPainting",
	"e2fbc8a6-d82f-49f1-b863-8bd4a91faa93": "fullRoomPainting",
	"4373c8fa-1984-4efa-b931-6eeff4cc8b36": "toiletNotFlushing",
	"3b691f2a-5c68-4c78-9356-5f1058822f0f": "toiletLeakage",
	"c3c80cc4-6f0a-4e46-bab3-e9e3ecf7b32d": "lowWaterPressure",
	"6d36d437-fa04-4998-9622-d567dc6ba644": "fanNotSpinning",
	"1b865293-9ad6-446b-86c4-ecac178507bd": "fanMakingNoise",
	"3f9ac2fb-7a08-47d7-8225-aa3bf6e0bd10": "fanCleaning",
	"9668cb1b-6fa0-40e6-82d3-3b83289f7e50": "doorInstallationFixing",
	"9df92ed3-27fd-4cd9-b138-44623ac7fe74": "furnitureAssemblyRepair",
	"01415597-3078-4e39-a194-92fd9a7d6d98": "customShelvesCabinets",
	"5df055f8-75fe-40f4-a838-0b98b559e0a7": "electricalWiring",
	"d17f04b3-d481-4dcc-9b38-ee187dac4deb": "powerOutlets",
	"73a1b2b2-98ef-45d1-9c06-67472c06d22c": "lightingInstallationRepair",
};

const SERVICE_SLUG_BY_NORMALIZED_NAME: Record<string, string> = {
	"dish repairs": "dishRepairs",
	"dish installations": "dishInstallations",
	"hang tv on the wall": "hangTv",
	"uninstall dish": "uninstallDish",
	"maintenance and cleaning": "acMaintenanceCleaning",
	"ac is leaking water": "acLeakingWater",
	"ac is not cooling properly": "acNotCooling",
	"house cleaning": "houseCleaning",
	"carpet cleaning": "carpetCleaning",
	"fridge loud noises": "fridgeLoudNoises",
	"thermostat replacement": "thermostatReplacement",
	"fridge water leakage": "fridgeWaterLeakage",
	"oven door not closing properly": "ovenDoorNotClosing",
	"oven not heating": "ovenNotHeating",
	"weak oven heat": "weakOvenHeat",
	"wall paint peeling": "wallPaintPeeling",
	"door painting wood metal": "doorPainting",
	"full room painting": "fullRoomPainting",
	"toilet not flushing properly": "toiletNotFlushing",
	"toilet leakage": "toiletLeakage",
	"low water pressure": "lowWaterPressure",
	"fan not spinning": "fanNotSpinning",
	"fan making noise": "fanMakingNoise",
	"fan cleaning service": "fanCleaning",
	"door installation and fixing": "doorInstallationFixing",
	"furniture assembly and repair": "furnitureAssemblyRepair",
	"custom shelves and cabinets": "customShelvesCabinets",
	"fix electrical wiring issues": "electricalWiring",
	"install or repair power outlets": "powerOutlets",
	"lighting installation and repair": "lightingInstallationRepair",
};

function normalizeTaxonomyName(value?: string | null): string {
	return (value ?? "")
		.toLowerCase()
		.replace(/[/()_-]+/g, " ")
		.replace(/[^a-z0-9\s]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

/** Stable translation-key suffix for a category id, or null if unknown. */
export function getCategorySlug(
	categoryId?: string | null,
	categoryName?: string | null,
): string | null {
	const idSlug = categoryId
		? CATEGORIES.find((item) => item.id === categoryId)?.slug
		: null;
	if (idSlug) return idSlug;
	const normalizedName = normalizeTaxonomyName(categoryName);
	return CATEGORY_SLUG_BY_NORMALIZED_NAME[normalizedName] ?? null;
}

export function getCategoryMeta(categoryId?: string | null) {
	if (!categoryId) {
		return undefined;
	}

	const category = CATEGORIES.find((item) => item.id === categoryId);
	if (!category) {
		return undefined;
	}

	return {
		icon: category.icon,
	};
}

export function getServiceSlug(
	serviceId?: string | null,
	serviceName?: string | null,
): string | null {
	if (serviceId && SERVICE_SLUG_BY_ID[serviceId]) {
		return SERVICE_SLUG_BY_ID[serviceId];
	}
	const normalizedName = normalizeTaxonomyName(serviceName);
	return SERVICE_SLUG_BY_NORMALIZED_NAME[normalizedName] ?? null;
}

export function translateCategoryLabel(
	t: TFunction<"categories">,
	categoryId?: string | null,
	fallbackName?: string | null,
): string {
	const slug = getCategorySlug(categoryId, fallbackName);
	return slug
		? t(`labels.${slug}` as Parameters<typeof t>[0])
		: (fallbackName ?? "");
}

export function translateServiceName(
	t: TFunction<"categories">,
	serviceId?: string | null,
	fallbackName?: string | null,
): string {
	const slug = getServiceSlug(serviceId, fallbackName);
	return slug
		? t(`services.labels.${slug}` as Parameters<typeof t>[0])
		: (fallbackName ?? "");
}

export function translateServiceDescription(
	t: TFunction<"categories">,
	serviceId?: string | null,
	fallbackDescription?: string | null,
): string | null {
	const slug = getServiceSlug(serviceId);
	return slug
		? t(`services.descriptions.${slug}` as Parameters<typeof t>[0])
		: (fallbackDescription ?? null);
}
