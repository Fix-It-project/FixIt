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
import { Colors } from "@/src/lib/theme";

export interface Category {
	id: string;
	label: string;
	icon: LucideIcon;
	color: string;
}

function createCategory(
	id: string,
	label: string,
	icon: LucideIcon,
	getColor: () => string,
): Category {
	return {
		id,
		label,
		icon,
		get color() {
			return getColor();
		},
	};
}

export const CATEGORIES: Category[] = [
	createCategory(
		"1d85a9ac-ffbb-4164-9f3f-6bb4100c9908",
		"Air Condition",
		Fan,
		() => Colors.category.cyan,
	),
	createCategory(
		"078c039e-72a6-4b81-9940-3b440cbcd8da",
		"Dish",
		SatelliteDish,
		() => Colors.category.indigo,
	),
	createCategory(
		"bbfc1ee7-38bc-4927-af90-4d90a3afce22",
		"Fan",
		Fan,
		() => Colors.category.cyan,
	),
	createCategory(
		"223d2864-9b6d-4e87-ae6c-432a4e85f35e",
		"Fridge/Freezer",
		Thermometer,
		() => Colors.category.red,
	),
	createCategory(
		"fe099ba2-300f-434f-b2e9-34fb196d9ac8",
		"Home Cleaning",
		Sparkles,
		() => Colors.category.green,
	),
	createCategory(
		"2aeeb262-c098-40c3-8ac9-8542864446b6",
		"Oven/Cooker",
		Flame,
		() => Colors.category.rose,
	),
	createCategory(
		"65d7cd90-0752-4bc6-9e54-97cb1a38dd78",
		"Painter",
		PaintRoller,
		() => Colors.category.purple,
	),
	createCategory(
		"57954692-2cf3-489f-aa9d-42d0da4cf95c",
		"Plumbing",
		Droplets,
		() => Colors.category.blue,
	),
	createCategory(
		"a1b2c3d4-1111-2222-3333-444455556666",
		"Carpenter",
		Hammer,
		() => Colors.category.brown,
	),
	createCategory(
		"b2c3d4e5-5555-6666-7777-888899990000",
		"Electrician",
		Zap,
		() => Colors.category.orange,
	),
];
