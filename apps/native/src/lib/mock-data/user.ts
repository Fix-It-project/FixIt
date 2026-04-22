/**
 * Mock data for the FixIt homepage.
 * Replace with real API calls once the backend is ready.
 */

import type { ImageSourcePropType } from "react-native";

export interface Technician {
	id: string;
	name: string;
	initials: string;
	avatarColor: string;
	category: string;
	rating: number;
	reviewCount: number;
	distance?: string;
	coverImage: ImageSourcePropType;
	tagline: string;
}

export interface PreviousOrder {
	id: string;
	technicianName: string;
	initials: string;
	category: string;
	date: string;
	categoryColor: string;
	price: string;
}

// ─── Previous Orders ─────────────────────────────────────────────────────────

export const PREVIOUS_ORDERS: PreviousOrder[] = [
	{
		id: "order-1",
		technicianName: "Ahmed Hassan",
		initials: "AH",
		category: "Plumbing",
		date: "25 Feb 2026",
		categoryColor: "#2196F3",
		price: "350 EGP",
	},
	{
		id: "order-2",
		technicianName: "Mohamed Ali",
		initials: "MA",
		category: "Electrician",
		date: "18 Feb 2026",
		categoryColor: "#FF9800",
		price: "500 EGP",
	},
	{
		id: "order-3",
		technicianName: "Youssef Samir",
		initials: "YS",
		category: "Painter",
		date: "10 Feb 2026",
		categoryColor: "#9C27B0",
		price: "1,200 EGP",
	},
];

// ─── Recommended Technicians ─────────────────────────────────────────────────

export const RECOMMENDED_TECHNICIANS: Technician[] = [
	{
		id: "tech-1",
		name: "Ahmed Hassan",
		initials: "AH",
		avatarColor: "#2196F3",
		category: "Plumbing",
		rating: 4.9,
		reviewCount: 127,
		tagline: "Expert pipe & leak repair",
		coverImage: require("@/src/assets/covers/cover_plumbing.png"),
	},
	{
		id: "tech-2",
		name: "Omar Khaled",
		initials: "OK",
		avatarColor: "#4CAF50",
		category: "Carpenter",
		rating: 4.8,
		reviewCount: 98,
		tagline: "Custom woodwork & furniture",
		coverImage: require("@/src/assets/covers/cover_carpentry.png"),
	},
	{
		id: "tech-3",
		name: "Youssef Samir",
		initials: "YS",
		avatarColor: "#FF9800",
		category: "Electrician",
		rating: 4.7,
		reviewCount: 84,
		tagline: "Wiring, panels & smart home",
		coverImage: require("@/src/assets/covers/cover_electrical.png"),
	},
	{
		id: "tech-4",
		name: "Karim Farouk",
		initials: "KF",
		avatarColor: "#9C27B0",
		category: "Painter",
		rating: 4.6,
		reviewCount: 62,
		tagline: "Interior & exterior painting",
		coverImage: require("@/src/assets/covers/cover_painting.png"),
	},
	{
		id: "tech-5",
		name: "Tarek Nabil",
		initials: "TN",
		avatarColor: "#F44336",
		category: "Oven/Cooker",
		rating: 4.5,
		reviewCount: 45,
		tagline: "Appliance repair specialist",
		coverImage: require("@/src/assets/covers/cover_oven.png"),
	},
];

// ─── Near You Technicians ────────────────────────────────────────────────────

export const NEARBY_TECHNICIANS: Technician[] = [
	{
		id: "near-1",
		name: "Ali Mostafa",
		initials: "AM",
		avatarColor: "#00BCD4",
		category: "Air Condition",
		rating: 4.8,
		reviewCount: 91,
		distance: "0.5 km",
		tagline: "AC install & maintenance",
		coverImage: require("@/src/assets/covers/cover_ac.png"),
	},
	{
		id: "near-2",
		name: "Hassan Ibrahim",
		initials: "HI",
		avatarColor: "#2196F3",
		category: "Plumbing",
		rating: 4.7,
		reviewCount: 73,
		distance: "1.2 km",
		tagline: "Fast fix for any leak",
		coverImage: require("@/src/assets/covers/cover_plumbing.png"),
	},
	{
		id: "near-3",
		name: "Mahmoud Adel",
		initials: "MA",
		avatarColor: "#FF9800",
		category: "Electrician",
		rating: 4.6,
		reviewCount: 58,
		distance: "1.8 km",
		tagline: "Safe & reliable wiring",
		coverImage: require("@/src/assets/covers/cover_electrical.png"),
	},
	{
		id: "near-4",
		name: "Sayed Ragab",
		initials: "SR",
		avatarColor: "#4CAF50",
		category: "Carpenter",
		rating: 4.5,
		reviewCount: 42,
		distance: "2.3 km",
		tagline: "Quality craftsmanship",
		coverImage: require("@/src/assets/covers/cover_carpentry.png"),
	},
	{
		id: "near-5",
		name: "Khaled Emad",
		initials: "KE",
		avatarColor: "#9C27B0",
		category: "Home Cleaning",
		rating: 4.9,
		reviewCount: 110,
		distance: "3.1 km",
		tagline: "Deep clean & sanitizing",
		coverImage: require("@/src/assets/covers/cover_cleaning.png"),
	},
];

// ─── Technician Listings (mock API fallback) ─────────────────────────────────

import type { TechnicianListItem } from "@/src/features/technicians/schemas/response.schema";

/** Mock technicians indexed by category ID (matches CATEGORIES ids). */
export const MOCK_TECHNICIANS_BY_CATEGORY: Record<
	string,
	TechnicianListItem[]
> = {
	// Air Condition
	"1d85a9ac-ffbb-4164-9f3f-6bb4100c9908": [
		{
			id: "t-ac-1",
			first_name: "Ahmed",
			last_name: "Hassan",
			email: "ahmed@fix.it",
			phone: "+201234567890",
			is_available: true,
			category_id: "1d85a9ac-ffbb-4164-9f3f-6bb4100c9908",
			city: null,
			street: null,
			distance_km: null,
		},
		{
			id: "t-ac-2",
			first_name: "Karim",
			last_name: "Nasser",
			email: "karim@fix.it",
			phone: "+201234567891",
			is_available: true,
			category_id: "1d85a9ac-ffbb-4164-9f3f-6bb4100c9908",
			city: null,
			street: null,
			distance_km: null,
		},
		{
			id: "t-ac-3",
			first_name: "Omar",
			last_name: "Khaled",
			email: "omar@fix.it",
			phone: "+201234567892",
			is_available: true,
			category_id: "1d85a9ac-ffbb-4164-9f3f-6bb4100c9908",
			city: null,
			street: null,
			distance_km: null,
		},
		{
			id: "t-ac-4",
			first_name: "Mostafa",
			last_name: "Ali",
			email: "mostafa@fix.it",
			phone: "+201234567893",
			is_available: false,
			category_id: "1d85a9ac-ffbb-4164-9f3f-6bb4100c9908",
			city: null,
			street: null,
			distance_km: null,
		},
		{
			id: "t-ac-5",
			first_name: "Youssef",
			last_name: "Ibrahim",
			email: "youssef@fix.it",
			phone: "+201234567894",
			is_available: true,
			category_id: "1d85a9ac-ffbb-4164-9f3f-6bb4100c9908",
			city: null,
			street: null,
			distance_km: null,
		},
		{
			id: "t-ac-6",
			first_name: "Hassan",
			last_name: "Mahmoud",
			email: "hassan@fix.it",
			phone: "+201234567895",
			is_available: false,
			category_id: "1d85a9ac-ffbb-4164-9f3f-6bb4100c9908",
			city: null,
			street: null,
			distance_km: null,
		},
	],
	// Dish
	"078c039e-72a6-4b81-9940-3b440cbcd8da": [
		{
			id: "t-ds-1",
			first_name: "Tarek",
			last_name: "Saeed",
			email: "tarek@fix.it",
			phone: "+201234567800",
			is_available: true,
			category_id: "078c039e-72a6-4b81-9940-3b440cbcd8da",
			city: null,
			street: null,
			distance_km: null,
		},
		{
			id: "t-ds-2",
			first_name: "Amr",
			last_name: "Farouk",
			email: "amr@fix.it",
			phone: "+201234567801",
			is_available: true,
			category_id: "078c039e-72a6-4b81-9940-3b440cbcd8da",
			city: null,
			street: null,
			distance_km: null,
		},
	],
	// Fan
	"bbfc1ee7-38bc-4927-af90-4d90a3afce22": [
		{
			id: "t-fn-1",
			first_name: "Mahmoud",
			last_name: "Adel",
			email: "mahmoud@fix.it",
			phone: "+201234567810",
			is_available: true,
			category_id: "bbfc1ee7-38bc-4927-af90-4d90a3afce22",
			city: null,
			street: null,
			distance_km: null,
		},
	],
	// Fridge/Freezer
	"223d2864-9b6d-4e87-ae6c-432a4e85f35e": [
		{
			id: "t-ff-1",
			first_name: "Sayed",
			last_name: "Ragab",
			email: "sayed@fix.it",
			phone: "+201234567820",
			is_available: true,
			category_id: "223d2864-9b6d-4e87-ae6c-432a4e85f35e",
			city: null,
			street: null,
			distance_km: null,
		},
		{
			id: "t-ff-2",
			first_name: "Khaled",
			last_name: "Emad",
			email: "khaled@fix.it",
			phone: "+201234567821",
			is_available: false,
			category_id: "223d2864-9b6d-4e87-ae6c-432a4e85f35e",
			city: null,
			street: null,
			distance_km: null,
		},
	],
	// Plumbing
	"57954692-2cf3-489f-aa9d-42d0da4cf95c": [
		{
			id: "t-pl-1",
			first_name: "Ali",
			last_name: "Mostafa",
			email: "ali@fix.it",
			phone: "+201234567830",
			is_available: true,
			category_id: "57954692-2cf3-489f-aa9d-42d0da4cf95c",
			city: null,
			street: null,
			distance_km: null,
		},
		{
			id: "t-pl-2",
			first_name: "Waleed",
			last_name: "Sami",
			email: "waleed@fix.it",
			phone: "+201234567831",
			is_available: true,
			category_id: "57954692-2cf3-489f-aa9d-42d0da4cf95c",
			city: null,
			street: null,
			distance_km: null,
		},
		{
			id: "t-pl-3",
			first_name: "Ibrahim",
			last_name: "Gamal",
			email: "ibrahim@fix.it",
			phone: "+201234567832",
			is_available: false,
			category_id: "57954692-2cf3-489f-aa9d-42d0da4cf95c",
			city: null,
			street: null,
			distance_km: null,
		},
	],
	// Electrician
	"b2c3d4e5-5555-6666-7777-888899990000": [
		{
			id: "t-el-1",
			first_name: "Nabil",
			last_name: "Hamed",
			email: "nabil@fix.it",
			phone: "+201234567840",
			is_available: true,
			category_id: "b2c3d4e5-5555-6666-7777-888899990000",
			city: null,
			street: null,
			distance_km: null,
		},
		{
			id: "t-el-2",
			first_name: "Sherif",
			last_name: "Youssef",
			email: "sherif@fix.it",
			phone: "+201234567841",
			is_available: true,
			category_id: "b2c3d4e5-5555-6666-7777-888899990000",
			city: null,
			street: null,
			distance_km: null,
		},
	],
};
