import {
  type LucideIcon,
  Fan,
  SatelliteDish,
  Thermometer,
  Sparkles,
  Flame,
  PaintRoller,
  Droplets,
  Hammer,
  Zap,
} from "lucide-react-native";

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "1d85a9ac-ffbb-4164-9f3f-6bb4100c9908", label: "Air Condition", icon: Fan, color: "#00BCD4" },
  { id: "078c039e-72a6-4b81-9940-3b440cbcd8da", label: "Dish", icon: SatelliteDish, color: "#5C6BC0" },
  { id: "bbfc1ee7-38bc-4927-af90-4d90a3afce22", label: "Fan", icon: Fan, color: "#00BCD4" },
  { id: "223d2864-9b6d-4e87-ae6c-432a4e85f35e", label: "Fridge/Freezer", icon: Thermometer, color: "#EF5350" },
  { id: "fe099ba2-300f-434f-b2e9-34fb196d9ac8", label: "Home Cleaning", icon: Sparkles, color: "#4CAF50" },
  { id: "2aeeb262-c098-40c3-8ac9-8542864446b6", label: "Oven/Cooker", icon: Flame, color: "#F44336" },
  { id: "65d7cd90-0752-4bc6-9e54-97cb1a38dd78", label: "Painter", icon: PaintRoller, color: "#9C27B0" },
  { id: "57954692-2cf3-489f-aa9d-42d0da4cf95c", label: "Plumbing", icon: Droplets, color: "#2196F3" },
  { id: "a1b2c3d4-1111-2222-3333-444455556666", label: "Carpenter", icon: Hammer, color: "#795548" },
  { id: "b2c3d4e5-5555-6666-7777-888899990000", label: "Electrician", icon: Zap, color: "#FF9800" },
];
