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
