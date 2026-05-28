import {
	Droplets,
	Fan,
	Flame,
	Hammer,
	type LucideIcon,
	PaintRoller,
	SatelliteDish,
	Sparkles,
	Thermometer,
	Zap,
} from "lucide-react";

export interface CategoryMeta {
	id: string;
	label: string;
	icon: LucideIcon;
	color: string;
}

// Icons + colors mirror the native app (apps/native categories constants +
// the --category-* palette in apps/native/global.css).
export const CATEGORY_METAS: CategoryMeta[] = [
	{ id: "ac", label: "Air Conditioning", icon: Fan, color: "#06b6d4" },
	{ id: "plumb", label: "Plumbing", icon: Droplets, color: "#3b82f6" },
	{ id: "elec", label: "Electrical", icon: Zap, color: "#f59e0b" },
	{ id: "clean", label: "Home Cleaning", icon: Sparkles, color: "#22c55e" },
	{ id: "paint", label: "Painting", icon: PaintRoller, color: "#d946ef" },
	{ id: "carp", label: "Carpentry", icon: Hammer, color: "#78716c" },
	{ id: "oven", label: "Oven & Cooker", icon: Flame, color: "#f43f5e" },
	{ id: "fridge", label: "Fridge / Freezer", icon: Thermometer, color: "#ef4444" },
	{ id: "dish", label: "Dish Installation", icon: SatelliteDish, color: "#6366f1" },
	{ id: "fan", label: "Fan", icon: Fan, color: "#06b6d4" },
];

const BY_ID: Record<string, CategoryMeta> = Object.fromEntries(
	CATEGORY_METAS.map((m) => [m.id, m]),
);

// Specialty / category-name → slug. Covers both the title-case names used in
// mock data and the lowercase DB category names returned by the API.
const NAME_TO_ID: Record<string, string> = {
	"plumbing": "plumb",
	"air conditioning": "ac",
	"air condition": "ac",
	"fan": "fan",
	"electrician": "elec",
	"electrical": "elec",
	"home cleaning": "clean",
	"painter": "paint",
	"painting": "paint",
	"carpentry": "carp",
	"carpenter": "carp",
	"oven & cooker": "oven",
	"oven/cooker": "oven",
	"fridge / freezer": "fridge",
	"fridge/freezer": "fridge",
	"dish installation": "dish",
	"dish": "dish",
};

export function getCategoryMetaById(id: string | null | undefined): CategoryMeta | undefined {
	if (!id) return undefined;
	return BY_ID[id];
}

export function getCategoryMetaBySpecialty(specialty: string | null | undefined): CategoryMeta | undefined {
	if (!specialty) return undefined;
	const id = NAME_TO_ID[specialty.trim().toLowerCase()];
	return id ? BY_ID[id] : undefined;
}
