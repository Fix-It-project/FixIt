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

export const CATEGORY_METAS: CategoryMeta[] = [
	{ id: "ac", label: "Air Conditioning", icon: Fan, color: "#06b6d4" },
	{ id: "plumb", label: "Plumbing", icon: Droplets, color: "#3b82f6" },
	{ id: "elec", label: "Electrical", icon: Zap, color: "#f97316" },
	{ id: "clean", label: "Home Cleaning", icon: Sparkles, color: "#22c55e" },
	{ id: "paint", label: "Painting", icon: PaintRoller, color: "#a855f7" },
	{ id: "carp", label: "Carpentry", icon: Hammer, color: "#92400e" },
	{ id: "oven", label: "Oven & Cooker", icon: Flame, color: "#f43f5e" },
	{ id: "fridge", label: "Fridge / Freezer", icon: Thermometer, color: "#ef4444" },
	{ id: "dish", label: "Dish Installation", icon: SatelliteDish, color: "#6366f1" },
];

const BY_ID: Record<string, CategoryMeta> = Object.fromEntries(
	CATEGORY_METAS.map((m) => [m.id, m]),
);

const SPECIALTY_TO_ID: Record<string, string> = {
	"Plumbing": "plumb",
	"Air Conditioning": "ac",
	"Electrician": "elec",
	"Electrical": "elec",
	"Home Cleaning": "clean",
	"Painter": "paint",
	"Painting": "paint",
	"Carpentry": "carp",
	"Carpenter": "carp",
	"Oven & Cooker": "oven",
	"Fridge / Freezer": "fridge",
	"Dish Installation": "dish",
};

export function getCategoryMetaById(id: string | null | undefined): CategoryMeta | undefined {
	if (!id) return undefined;
	return BY_ID[id];
}

export function getCategoryMetaBySpecialty(specialty: string | null | undefined): CategoryMeta | undefined {
	if (!specialty) return undefined;
	const id = SPECIALTY_TO_ID[specialty];
	return id ? BY_ID[id] : undefined;
}
