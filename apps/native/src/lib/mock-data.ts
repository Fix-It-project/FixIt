/**
 * Mock data for the FixIt homepage.
 * Replace with real API calls once the backend is ready.
 */

export interface Technician {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance?: string;
}

export interface PreviousOrder {
  id: string;
  technicianName: string;
  category: string;
  date: string;
  categoryColor: string;
}

// ─── Previous Orders ─────────────────────────────────────────────────────────

export const PREVIOUS_ORDERS: PreviousOrder[] = [
  {
    id: "order-1",
    technicianName: "Ahmed Hassan",
    category: "Plumbing",
    date: "25 February 2026",
    categoryColor: "#2196F3",
  },
  {
    id: "order-2",
    technicianName: "Mohamed Ali",
    category: "Electrician",
    date: "18 February 2026",
    categoryColor: "#FF9800",
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
  },
  {
    id: "tech-2",
    name: "Omar Khaled",
    initials: "OK",
    avatarColor: "#4CAF50",
    category: "Carpenter",
    rating: 4.8,
    reviewCount: 98,
  },
  {
    id: "tech-3",
    name: "Youssef Samir",
    initials: "YS",
    avatarColor: "#FF9800",
    category: "Electrician",
    rating: 4.7,
    reviewCount: 84,
  },
  {
    id: "tech-4",
    name: "Karim Farouk",
    initials: "KF",
    avatarColor: "#9C27B0",
    category: "Painter",
    rating: 4.6,
    reviewCount: 62,
  },
  {
    id: "tech-5",
    name: "Tarek Nabil",
    initials: "TN",
    avatarColor: "#F44336",
    category: "Oven/Cooker",
    rating: 4.5,
    reviewCount: 45,
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
  },
];
