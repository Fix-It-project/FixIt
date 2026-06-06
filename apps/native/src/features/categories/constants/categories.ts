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
} from "lucide-react-native";

export interface Category {
	id: string;
	label: string;
	icon: LucideIcon;
}

// Categories are unified under the primary brand color — no per-category colors.
export const CATEGORIES: Category[] = [
	{ id: "1d85a9ac-ffbb-4164-9f3f-6bb4100c9908", label: "Air Condition", icon: Fan },
	{ id: "078c039e-72a6-4b81-9940-3b440cbcd8da", label: "Dish", icon: SatelliteDish },
	{ id: "bbfc1ee7-38bc-4927-af90-4d90a3afce22", label: "Fan", icon: Fan },
	{ id: "223d2864-9b6d-4e87-ae6c-432a4e85f35e", label: "Fridge/Freezer", icon: Thermometer },
	{ id: "fe099ba2-300f-434f-b2e9-34fb196d9ac8", label: "Home Cleaning", icon: Sparkles },
	{ id: "2aeeb262-c098-40c3-8ac9-8542864446b6", label: "Oven/Cooker", icon: Flame },
	{ id: "65d7cd90-0752-4bc6-9e54-97cb1a38dd78", label: "Painter", icon: PaintRoller },
	{ id: "57954692-2cf3-489f-aa9d-42d0da4cf95c", label: "Plumbing", icon: Droplets },
	{ id: "a1b2c3d4-1111-2222-3333-444455556666", label: "Carpenter", icon: Hammer },
	{ id: "b2c3d4e5-5555-6666-7777-888899990000", label: "Electrician", icon: Zap },
];

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
