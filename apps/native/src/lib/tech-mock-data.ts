/**
 * Mock data for the FixIt technician dashboard.
 * Replace with real API calls once the backend is ready.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IncomingRequest {
  id: string;
  serviceType: string;
  icon: string; // lucide icon name
  iconColor: string;
  description: string;
  distance: string;
  price: string;
  location: string;
  isHighlighted?: boolean;
}

export interface ScheduleItem {
  id: string;
  clientName: string;
  serviceType: string;
  icon: string;
  time: string;
  location: string;
  status: "in-progress" | "upcoming";
}

export interface TechProfile {
  name: string;
  specialty: string;
  avatarInitials: string;
  avatarColor: string;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
}

export interface ReviewItem {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

// ─── Mock Profile ────────────────────────────────────────────────────────────

export const TECH_PROFILE: TechProfile = {
  name: "Alex Rivera",
  specialty: "HVAC Specialist",
  avatarInitials: "AR",
  avatarColor: "#036ded",
  rating: 4.8,
  reviewCount: 127,
  isOnline: true,
};

// ─── Incoming Requests ───────────────────────────────────────────────────────

export const INCOMING_REQUESTS: IncomingRequest[] = [
  {
    id: "req-1",
    serviceType: "AC Repair",
    icon: "Snowflake",
    iconColor: "#036ded",
    description: "Unit not cooling, makes loud noise",
    distance: "4.2 km away",
    price: "850 EGP",
    location: "752 Ocean Ave, Maadi",
    isHighlighted: true,
  },
  {
    id: "req-2",
    serviceType: "Pipe Leakage",
    icon: "Droplets",
    iconColor: "#2196F3",
    description: "Kitchen pipe leaking under sink",
    distance: "1.8 km away",
    price: "1,200 EGP",
    location: "120 Tahrir St, Downtown",
  },
  {
    id: "req-3",
    serviceType: "Electrical Issue",
    icon: "Zap",
    iconColor: "#FF9800",
    description: "Frequent power trips in bedroom",
    distance: "3.5 km away",
    price: "600 EGP",
    location: "45 Nile Corniche, Zamalek",
  },
];

// ─── Today's Schedule ────────────────────────────────────────────────────────

export const TODAY_SCHEDULE: ScheduleItem[] = [
  {
    id: "sched-1",
    clientName: "Sarah Jenkins",
    serviceType: "Electrical Inspection",
    icon: "Zap",
    time: "09:00 AM",
    location: "14 Garden Ct, Heliopolis",
    status: "in-progress",
  },
  {
    id: "sched-2",
    clientName: "Michael Chen",
    serviceType: "Cabinet Repair",
    icon: "Hammer",
    time: "01:30 PM",
    location: "228 Park Ave, Nasr City",
    status: "upcoming",
  },
  {
    id: "sched-3",
    clientName: "Emma Wilson",
    serviceType: "Deep Cleaning",
    icon: "Sparkles",
    time: "04:00 PM",
    location: "50 Central Road, Mohandessin",
    status: "upcoming",
  },
];

// ─── Earnings ────────────────────────────────────────────────────────────────

export const EARNINGS = {
  weeklyAmount: "14,200 EGP",
  trendPercentage: "+12%",
  trendDirection: "up" as const,
  barData: [40, 60, 40, 80, 60, 90], // relative heights for mini chart
};

export const WALLET = {
  balance: "4,500 EGP",
};

// ─── Technician Bookings ─────────────────────────────────────────────────────

export interface TechBooking {
  id: string;
  clientName: string;
  avatarInitials: string;
  avatarColor: string;
  serviceType: string;
  rating: number;
  distance: number;
  city: string;
  address: string;
  price: number;
  currency: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  time: string;
  verified: boolean;
}

/**
 * Helper – returns an ISO date string offset from "today" (2026-03-17).
 * Keeps dates deterministic so mock data works without a real clock.
 */
function offsetDate(days: number): string {
  const d = new Date(2026, 2, 17); // March 17 2026
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export const TECH_BOOKINGS: TechBooking[] = [
  {
    id: "book-1",
    clientName: "Sarah Jenkins",
    avatarInitials: "SJ",
    avatarColor: "#2196F3",
    serviceType: "Electrical Inspection",
    rating: 4.7,
    distance: 2.3,
    city: "Heliopolis",
    address: "14 Garden Ct",
    price: 650,
    currency: "EGP",
    date: offsetDate(0),
    time: "09:00 AM",
    verified: true,
  },
  {
    id: "book-2",
    clientName: "Michael Chen",
    avatarInitials: "MC",
    avatarColor: "#FF9800",
    serviceType: "Cabinet Repair",
    rating: 4.2,
    distance: 5.1,
    city: "Nasr City",
    address: "228 Park Ave",
    price: 480,
    currency: "EGP",
    date: offsetDate(0),
    time: "01:30 PM",
    verified: false,
  },
  {
    id: "book-3",
    clientName: "Emma Wilson",
    avatarInitials: "EW",
    avatarColor: "#4CAF50",
    serviceType: "Deep Cleaning",
    rating: 4.9,
    distance: 1.8,
    city: "Mohandessin",
    address: "50 Central Road",
    price: 350,
    currency: "EGP",
    date: offsetDate(0),
    time: "04:00 PM",
    verified: true,
  },
  {
    id: "book-4",
    clientName: "Omar Hassan",
    avatarInitials: "OH",
    avatarColor: "#00BCD4",
    serviceType: "AC Unit Servicing",
    rating: 4.8,
    distance: 4.2,
    city: "Maadi",
    address: "752 Ocean Ave",
    price: 850,
    currency: "EGP",
    date: offsetDate(1),
    time: "10:00 AM",
    verified: true,
  },
  {
    id: "book-5",
    clientName: "Layla Farouk",
    avatarInitials: "LF",
    avatarColor: "#9C27B0",
    serviceType: "Pipe Leakage Fix",
    rating: 4.5,
    distance: 3.6,
    city: "Zamalek",
    address: "120 Tahrir St",
    price: 520,
    currency: "EGP",
    date: offsetDate(1),
    time: "02:00 PM",
    verified: false,
  },
  {
    id: "book-6",
    clientName: "James Parker",
    avatarInitials: "JP",
    avatarColor: "#795548",
    serviceType: "Wall Painting",
    rating: 4.3,
    distance: 6.0,
    city: "New Cairo",
    address: "88 Fifth Settlement",
    price: 720,
    currency: "EGP",
    date: offsetDate(3),
    time: "11:00 AM",
    verified: true,
  },
  {
    id: "book-7",
    clientName: "Nadia Saleh",
    avatarInitials: "NS",
    avatarColor: "#5C6BC0",
    serviceType: "Appliance Repair",
    rating: 4.6,
    distance: 2.9,
    city: "Dokki",
    address: "33 Mesaha Sq",
    price: 600,
    currency: "EGP",
    date: offsetDate(5),
    time: "03:00 PM",
    verified: true,
  },
];

// ─── User Reviews ────────────────────────────────────────────────────────────

export const USER_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    userName: "Ahmed M.",
    rating: 5,
    comment: "Excellent service, very professional!",
    date: "2 days ago",
  },
  {
    id: "rev-2",
    userName: "Fatma S.",
    rating: 4,
    comment: "Good work, arrived on time.",
    date: "5 days ago",
  },
  {
    id: "rev-3",
    userName: "Omar K.",
    rating: 5,
    comment: "Fixed my AC perfectly. Highly recommend!",
    date: "1 week ago",
  },
];
