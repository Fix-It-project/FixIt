import type { LucideIcon } from "lucide-react-native";
import {
  Wrench,
  Zap,
  Paintbrush,
  PaintRoller,
  Hammer,
  Drill,
  Droplets,
  Fan,
  Thermometer,
  ShieldCheck,
  HardHat,
  SprayCan,
  Bug,
  Flame,
  Lock,
  House,
  Armchair,
  Scissors,
  TreePine,
  Sparkles,
  Plug,
  BrickWall,
  ShowerHead,
  SolarPanel,
  SatelliteDish,
  Monitor,
  Shovel,
  Ruler,
} from "lucide-react-native";

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "plumber",            label: "Plumber",            icon: Droplets,      color: "#2196F3" },
  { id: "electrician",        label: "Electrician",        icon: Zap,           color: "#FF9800" },
  { id: "painter",            label: "Painter",            icon: PaintRoller,   color: "#9C27B0" },
  { id: "carpenter",          label: "Carpenter",          icon: Hammer,        color: "#FF5722" },
  { id: "hvac",               label: "HVAC Technician",    icon: Fan,           color: "#00BCD4" },
  { id: "locksmith",          label: "Locksmith",          icon: Lock,          color: "#607D8B" },
  { id: "general_repair",     label: "General Repair",     icon: Wrench,        color: "#795548" },
  { id: "cleaning",           label: "Cleaning",           icon: Sparkles,      color: "#4CAF50" },
  { id: "pest_control",       label: "Pest Control",       icon: Bug,           color: "#8BC34A" },
  { id: "welding",            label: "Welding",            icon: Flame,         color: "#F44336" },
  { id: "masonry",            label: "Masonry",            icon: BrickWall,     color: "#78909C" },
  { id: "landscaping",        label: "Landscaping",        icon: TreePine,      color: "#43A047" },
  { id: "appliance_repair",   label: "Appliance Repair",   icon: Plug,          color: "#E91E63" },
  { id: "home_security",      label: "Home Security",      icon: ShieldCheck,   color: "#3F51B5" },
  { id: "furniture_assembly", label: "Furniture Assembly", icon: Armchair,      color: "#FFA000" },
  { id: "bathroom_fitting",   label: "Bathroom Fitting",   icon: ShowerHead,    color: "#26C6DA" },
  { id: "solar_installation", label: "Solar Installation", icon: SolarPanel,    color: "#FFC107" },
  { id: "satellite_tv",       label: "Satellite & TV",     icon: SatelliteDish, color: "#5C6BC0" },
  { id: "it_networking",      label: "IT & Networking",    icon: Monitor,       color: "#009688" },
  { id: "drilling",           label: "Drilling",           icon: Drill,         color: "#EF6C00" },
  { id: "gardening",          label: "Gardening",          icon: Shovel,        color: "#66BB6A" },
  { id: "tiling",             label: "Tiling",             icon: Ruler,         color: "#8D6E63" },
  { id: "decoration",         label: "Decoration",         icon: Paintbrush,    color: "#EC407A" },
  { id: "deep_cleaning",      label: "Deep Cleaning",      icon: SprayCan,      color: "#00ACC1" },
  { id: "construction",       label: "Construction",       icon: HardHat,       color: "#FF7043" },
  { id: "home_renovation",    label: "Home Renovation",    icon: House,         color: "#7E57C2" },
  { id: "tailoring",          label: "Tailoring",          icon: Scissors,      color: "#AB47BC" },
  { id: "heating",            label: "Heating",            icon: Thermometer,   color: "#EF5350" },
];
