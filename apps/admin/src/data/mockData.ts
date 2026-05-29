import type {
	ActiveTech,
	Category,
	HistoryOrder,
	Homeowner,
	HomeownerOrderHistory,
	Order,
	OrderReview,
	PendingTech,
	Report,
	StatusMeta,
} from "@/types";

export const CATEGORIES: Category[] = [
	{ id: "ac", name: "Air Conditioning", color: "#06b6d4", icon: "fan" },
	{ id: "plumb", name: "Plumbing", color: "#3b82f6", icon: "droplets" },
	{ id: "elec", name: "Electrical", color: "#f97316", icon: "zap" },
	{ id: "clean", name: "Home Cleaning", color: "#22c55e", icon: "sparkles" },
	{ id: "paint", name: "Painting", color: "#a855f7", icon: "paint-bucket" },
	{ id: "carp", name: "Carpentry", color: "#92400e", icon: "hammer" },
	{ id: "oven", name: "Oven & Cooker", color: "#f43f5e", icon: "flame" },
	{ id: "fridge", name: "Fridge / Freezer", color: "#ef4444", icon: "thermometer" },
];

export const ORDERS: Order[] = [
	{ id: "ORD-21847", customer: "Yasmin Hassan", tech: "Mahmoud Khaled", techInitials: "MK", techColor: "#3b82f6", category: "plumb", status: "accepted", amount: 480, time: "12m", when: "Today, 11:08 AM" },
	{ id: "ORD-21846", customer: "Karim El-Sayed", tech: "Nour Ibrahim", techInitials: "NI", techColor: "#06b6d4", category: "ac", status: "in_progress", amount: 920, time: "28m", when: "Today, 10:52 AM" },
	{ id: "ORD-21845", customer: "Salma Mostafa", tech: "Tarek Younis", techInitials: "TY", techColor: "#f97316", category: "elec", status: "pending", amount: 340, time: "41m", when: "Today, 10:39 AM" },
	{ id: "ORD-21844", customer: "Omar Farouk", tech: "Hala Adel", techInitials: "HA", techColor: "#22c55e", category: "clean", status: "completed", amount: 600, time: "1h", when: "Today, 10:20 AM", review: { rating: 5, comment: "Hala was wonderful. The kitchen and bathrooms are spotless. Will book again next month.", customer: "Omar F.", date: "25 May" } },
	{ id: "ORD-21843", customer: "Mariam Saleh", tech: "Yousef Magdy", techInitials: "YM", techColor: "#f43f5e", category: "oven", status: "completed", amount: 520, time: "1h", when: "Today, 10:04 AM", review: { rating: 4, comment: "Fixed the oven ignition. A bit pricey but the issue is fully resolved.", customer: "Mariam S.", date: "25 May" } },
	{ id: "ORD-21842", customer: "Ahmed Refaat", tech: "Lina Khoury", techInitials: "LK", techColor: "#a855f7", category: "paint", status: "cancelled", amount: 0, time: "2h", when: "Today, 9:18 AM", cancelReason: "Customer cancelled · last-minute — tenant moved out before scheduled date and the apartment is being repainted by a different vendor, refund requested for the deposit" },
	{ id: "ORD-21841", customer: "Nada Ezz", tech: "Tamer Hosny", techInitials: "TH", techColor: "#92400e", category: "carp", status: "in_progress", amount: 1100, time: "2h", when: "Today, 8:55 AM" },
	{ id: "ORD-21840", customer: "Hussein Magdi", tech: "Rana Said", techInitials: "RS", techColor: "#ef4444", category: "fridge", status: "completed", amount: 780, time: "3h", when: "Today, 7:42 AM", review: { rating: 5, comment: "Fridge is back to running cold within an hour. Very professional.", customer: "Hussein M.", date: "25 May" } },
	{ id: "ORD-21839", customer: "Mona Khaled", tech: "Mahmoud Khaled", techInitials: "MK", techColor: "#3b82f6", category: "plumb", status: "completed", amount: 420, time: "5h", when: "Today, 5:30 AM", review: { rating: 5, comment: "Leak fixed cleanly under the sink. Friendly and on time.", customer: "Mona K.", date: "25 May" } },
	{ id: "ORD-21838", customer: "Tarek Bassem", tech: "Heba Saad", techInitials: "HS", techColor: "#06b6d4", category: "ac", status: "completed", amount: 1320, time: "8h", when: "Yesterday, 8:20 PM", review: { rating: 4, comment: "AC is cooling well now. Charge was on the higher side though.", customer: "Tarek B.", date: "24 May" } },
	{ id: "ORD-21837", customer: "Layla Hassan", tech: "Adel Farouk", techInitials: "AF", techColor: "#f97316", category: "elec", status: "cancelled", amount: 0, time: "10h", when: "Yesterday, 6:10 PM", cancelReason: "Quote rejected by customer — homeowner found a neighbour with the same issue, decided to fix together with a single visit next week" },
	{ id: "ORD-21836", customer: "Karim Mostafa", tech: "Hala Adel", techInitials: "HA", techColor: "#22c55e", category: "clean", status: "completed", amount: 540, time: "12h", when: "Yesterday, 4:45 PM", review: { rating: 3, comment: "Living room and kitchen were cleaned but bathroom corners were missed.", customer: "Karim M.", date: "24 May" } },
	{ id: "ORD-21835", customer: "Dina Adel", tech: "Lina Khoury", techInitials: "LK", techColor: "#a855f7", category: "paint", status: "in_progress", amount: 2200, time: "14h", when: "Yesterday, 2:30 PM" },
	{ id: "ORD-21834", customer: "Ahmed Galal", tech: "Yousef Magdy", techInitials: "YM", techColor: "#f43f5e", category: "oven", status: "completed", amount: 460, time: "16h", when: "Yesterday, 12:15 PM", review: { rating: 5, comment: "Ignition replaced perfectly. Cleaned up everything before leaving.", customer: "Ahmed G.", date: "24 May" } },
	{ id: "ORD-21833", customer: "Sara Tawfik", tech: "Tamer Hosny", techInitials: "TH", techColor: "#92400e", category: "carp", status: "completed", amount: 880, time: "18h", when: "Yesterday, 10:08 AM" },
	{ id: "ORD-21832", customer: "Rami Othman", tech: "Rana Said", techInitials: "RS", techColor: "#ef4444", category: "fridge", status: "pending", amount: 350, time: "1d", when: "Yesterday, 8:45 AM" },
	{ id: "ORD-21831", customer: "Heba Magdy", tech: "Nour Ibrahim", techInitials: "NI", techColor: "#06b6d4", category: "ac", status: "completed", amount: 980, time: "1d", when: "2 days ago", review: { rating: 5, comment: "Great service. AC running like new.", customer: "Heba M.", date: "23 May" } },
	{ id: "ORD-21830", customer: "Youssef Adel", tech: "Mahmoud Khaled", techInitials: "MK", techColor: "#3b82f6", category: "plumb", status: "cancelled", amount: 0, time: "2d", when: "2 days ago", cancelReason: "Address inaccessible — building entrance code was wrong and tenant did not respond to calls" },
	{ id: "ORD-21829", customer: "Nadine Sami", tech: "Hala Adel", techInitials: "HA", techColor: "#22c55e", category: "clean", status: "completed", amount: 720, time: "2d", when: "2 days ago", review: { rating: 4, comment: "Good clean. Took a bit longer than expected.", customer: "Nadine S.", date: "23 May" } },
	{ id: "ORD-21828", customer: "Mostafa Yehia", tech: "Tarek Younis", techInitials: "TY", techColor: "#f97316", category: "elec", status: "accepted", amount: 510, time: "2d", when: "2 days ago" },
	{ id: "ORD-21827", customer: "Reem Wagdy", tech: "Sara Mansour", techInitials: "SM", techColor: "#06b6d4", category: "ac", status: "completed", amount: 1100, time: "3d", when: "3 days ago", review: { rating: 2, comment: "AC needed re-visit two days later for the same issue. Disappointing.", customer: "Reem W.", date: "22 May" } },
	{ id: "ORD-21826", customer: "Hany Fathi", tech: "Yousef Magdy", techInitials: "YM", techColor: "#f43f5e", category: "oven", status: "completed", amount: 380, time: "3d", when: "3 days ago" },
	{ id: "ORD-21825", customer: "Marwa Said", tech: "Tamer Hosny", techInitials: "TH", techColor: "#92400e", category: "carp", status: "cancelled", amount: 0, time: "3d", when: "3 days ago", cancelReason: "Customer rescheduled and never confirmed the new slot" },
	{ id: "ORD-21824", customer: "Bassem Adel", tech: "Lina Khoury", techInitials: "LK", techColor: "#a855f7", category: "paint", status: "completed", amount: 1640, time: "3d", when: "3 days ago", review: { rating: 5, comment: "Excellent finish on the bedroom walls. Highly recommend.", customer: "Bassem A.", date: "22 May" } },
	{ id: "ORD-21823", customer: "Yara Hossam", tech: "Rana Said", techInitials: "RS", techColor: "#ef4444", category: "fridge", status: "completed", amount: 660, time: "4d", when: "4 days ago", review: { rating: 4, comment: "Compressor diagnosed and replaced. Working well.", customer: "Yara H.", date: "21 May" } },
];

const CANCEL_REASONS = [
	"Customer rescheduled and never confirmed",
	"Out-of-area · technician declined",
	"Quote rejected by customer",
	"Customer cancelled · last-minute",
	"Parts unavailable",
	"Address inaccessible",
	"Job duplicate · merged with newer request",
];

const CANCEL_BY: Array<"customer" | "technician" | "system"> = [
	"customer",
	"technician",
	"customer",
	"customer",
	"system",
	"system",
	"system",
];

const NO_SHOW_REASONS = [
	"Technician marked unreachable on day-of",
	"Customer no-show at scheduled slot",
	"Technician late · customer cancelled",
];

const NO_SHOW_BY: Array<"customer" | "technician" | "system"> = [
	"technician",
	"customer",
	"customer",
];

const REVIEW_POOL: (Omit<OrderReview, "customer" | "date"> | null)[] = [
	{ rating: 5, comment: "Excellent service — arrived on time and fixed everything in one visit." },
	{ rating: 5, comment: "Very professional and polite. Cleaned up the area after the job was done." },
	{ rating: 4, comment: "Good work overall. Took a bit longer than estimated but the quality was solid." },
	{ rating: 5, comment: "Perfect, exactly what I needed. Quick, friendly, and reasonably priced." },
	null,
	{ rating: 3, comment: "Got the job done but I had to remind them to clean up afterwards." },
	{ rating: 5, comment: null },
	null,
	{ rating: 4, comment: "Skilled technician. Slightly expensive for the time spent but the result is good." },
	{ rating: 5, comment: "Outstanding — went above and beyond. Highly recommend." },
	{ rating: 2, comment: "Late by over an hour with no update. The work itself was fine but I won't book again." },
	{ rating: 4, comment: null },
];

function buildHistory(completedCount: number, opts: { cancelled?: number; no_show?: number; salt?: number } = {}): HistoryOrder[] {
	const cancelled = opts.cancelled ?? Math.max(0, 10 - completedCount - (opts.no_show ?? 0));
	const no_show = opts.no_show ?? 0;
	const salt = opts.salt ?? 0;
	const cats = ["Plumbing", "AC service", "Cleaning", "Electrical", "Painting", "Carpentry", "Oven repair", "Fridge repair"];
	const customers = ["Yasmin H.", "Karim E.", "Salma M.", "Omar F.", "Mariam S.", "Ahmed R.", "Nada E.", "Hussein M.", "Mona K.", "Tarek B."];
	const today = new Date(2026, 4, 25);
	const slots: Array<"completed" | "cancelled" | "no_show"> = [
		...Array(completedCount).fill("completed" as const),
		...Array(cancelled).fill("cancelled" as const),
		...Array(no_show).fill("no_show" as const),
	];
	slots.sort((a, b) => a.localeCompare(b));
	return slots.map((status, i) => {
		const d = new Date(today);
		d.setDate(d.getDate() - (i * 3 + 1));
		const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
		const customer = customers[(i + 2 * salt) % customers.length] ?? "Customer";
		let cancelReason: string | null = null;
		let cancelledBy: "customer" | "technician" | "system" | null = null;
		if (status === "cancelled") {
			cancelReason = CANCEL_REASONS[(i + salt) % CANCEL_REASONS.length] ?? "";
			cancelledBy = CANCEL_BY[(i + salt) % CANCEL_BY.length] ?? "system";
		} else if (status === "no_show") {
			cancelReason = NO_SHOW_REASONS[(i + salt) % NO_SHOW_REASONS.length] ?? "";
			cancelledBy = NO_SHOW_BY[(i + salt) % NO_SHOW_BY.length] ?? "customer";
		}
		let review: OrderReview | null = null;
		if (status === "completed") {
			const r = REVIEW_POOL[(i + salt) % REVIEW_POOL.length];
			if (r) review = { ...r, customer, date: dateStr };
		}
		return {
			id: `ORD-${21900 - i * 7 - salt}`,
			date: dateStr,
			category: cats[(i + salt) % cats.length] ?? "General",
			customer,
			status,
			cancelReason,
			cancelledBy,
			review,
			amount: status === "completed" ? 200 + ((i + salt) % 9) * 80 : 0,
		};
	});
}

export const ACTIVE_TECHS: ActiveTech[] = [
	{ id: "t-001", name: "Mahmoud Khaled", initials: "MK", color: "#3b82f6", specialty: "Plumbing", city: "Maadi, Cairo", joined: "Feb 2024", completed: 184, rating: 4.92, reviews: 162, revenue: "82.4k", availability: "online", blocked: false, phone: "+20 100 4421 887", email: "mahmoud.khaled@example.com", history: buildHistory(10, { salt: 1 }) },
	{ id: "t-002", name: "Nour Ibrahim", initials: "NI", color: "#06b6d4", specialty: "Air Conditioning", city: "Heliopolis, Cairo", joined: "Sep 2023", completed: 156, rating: 4.88, reviews: 144, revenue: "76.1k", availability: "online", blocked: false, phone: "+20 100 3318 220", email: "nour.ibrahim@example.com", history: buildHistory(9, { salt: 2 }) },
	{ id: "t-003", name: "Hala Adel", initials: "HA", color: "#22c55e", specialty: "Home Cleaning", city: "Zamalek, Cairo", joined: "Mar 2024", completed: 142, rating: 4.85, reviews: 131, revenue: "54.2k", availability: "offline", blocked: false, phone: "+20 122 7110 902", email: "hala.adel@example.com", history: buildHistory(8, { salt: 3 }) },
	{ id: "t-004", name: "Tarek Younis", initials: "TY", color: "#f97316", specialty: "Electrician", city: "Nasr City, Cairo", joined: "Jun 2023", completed: 128, rating: 4.81, reviews: 118, revenue: "61.8k", availability: "online", blocked: false, phone: "+20 100 9088 432", email: "tarek.younis@example.com", history: buildHistory(9, { salt: 4 }) },
	{ id: "t-005", name: "Lina Khoury", initials: "LK", color: "#a855f7", specialty: "Painter", city: "Dokki, Giza", joined: "Jan 2024", completed: 112, rating: 4.79, reviews: 104, revenue: "48.6k", availability: "online", blocked: false, phone: "+20 122 6042 178", email: "lina.khoury@example.com", history: buildHistory(7, { salt: 5 }) },
	{ id: "t-006", name: "Yousef Magdy", initials: "YM", color: "#f43f5e", specialty: "Oven & Cooker", city: "6th October", joined: "Nov 2023", completed: 98, rating: 4.74, reviews: 89, revenue: "39.0k", availability: "online", blocked: false, phone: "+20 122 4490 661", email: "yousef.magdy@example.com", history: buildHistory(8, { salt: 6 }) },
	{ id: "t-007", name: "Rana Said", initials: "RS", color: "#ef4444", specialty: "Fridge / Freezer", city: "New Cairo", joined: "Aug 2023", completed: 87, rating: 4.71, reviews: 80, revenue: "44.2k", availability: "offline", blocked: false, phone: "+20 100 7733 014", email: "rana.said@example.com", history: buildHistory(6, { salt: 7 }) },
	{ id: "t-008", name: "Tamer Hosny", initials: "TH", color: "#78350f", specialty: "Carpentry", city: "Mohandessin, Giza", joined: "May 2023", completed: 79, rating: 4.68, reviews: 72, revenue: "37.5k", availability: "online", blocked: false, phone: "+20 122 5510 998", email: "tamer.hosny@example.com", history: buildHistory(6, { salt: 8 }) },
	{ id: "t-009", name: "Karim Wafy", initials: "KW", color: "#6366f1", specialty: "Dish Installation", city: "Maadi, Cairo", joined: "Jul 2024", completed: 41, rating: 4.1, reviews: 34, revenue: "18.4k", availability: "offline", blocked: false, phone: "+20 122 8801 552", email: "karim.wafy@example.com", history: buildHistory(4, { salt: 9, no_show: 2 }) },
	{ id: "t-010", name: "Heba Saad", initials: "HS", color: "#06b6d4", specialty: "Air Conditioning", city: "Heliopolis, Cairo", joined: "Apr 2024", completed: 28, rating: 3.94, reviews: 22, revenue: "12.1k", availability: "offline", blocked: false, phone: "+20 100 6612 008", email: "heba.saad@example.com", history: buildHistory(3, { salt: 10, no_show: 3 }) },
	{ id: "t-011", name: "Sara Mansour", initials: "SM", color: "#06b6d4", specialty: "Air Conditioning", city: "Maadi, Cairo", joined: "Oct 2024", completed: 62, rating: 4.32, reviews: 54, revenue: "21.0k", availability: "offline", blocked: true, phone: "+20 100 2245 117", email: "sara.mansour@example.com", history: buildHistory(2, { salt: 11, no_show: 4 }), blockedReason: "Repeated late cancellations", blockedAt: "18 May 2026", blockedBy: "Ahmed Refaat" },
	{ id: "t-012", name: "Adel Farouk", initials: "AF", color: "#f97316", specialty: "Electrician", city: "Maadi, Cairo", joined: "Dec 2023", completed: 53, rating: 3.82, reviews: 47, revenue: "19.4k", availability: "offline", blocked: true, phone: "+20 122 7740 113", email: "adel.farouk@example.com", history: buildHistory(3, { salt: 12, no_show: 4 }), blockedReason: "Disputed work quality on 3 jobs", blockedAt: "9 May 2026", blockedBy: "Ahmed Refaat" },
	{ id: "t-013", name: "Omar Salama", initials: "OS", color: "#0ea5e9", specialty: "Plumbing", city: "Sheikh Zayed", joined: "Feb 2025", completed: 71, rating: 4.66, reviews: 64, revenue: "33.8k", availability: "online", blocked: false, phone: "+20 100 5512 776", email: "omar.salama@example.com", history: buildHistory(7, { salt: 13 }) },
	{ id: "t-014", name: "Marwan Helmy", initials: "MH", color: "#10b981", specialty: "Home Cleaning", city: "Tagamoa, Cairo", joined: "Mar 2024", completed: 134, rating: 4.83, reviews: 121, revenue: "52.7k", availability: "online", blocked: false, phone: "+20 122 3401 882", email: "marwan.helmy@example.com", history: buildHistory(9, { salt: 14 }) },
	{ id: "t-015", name: "Dina Fouad", initials: "DF", color: "#ec4899", specialty: "Painter", city: "Garden City, Cairo", joined: "Jul 2023", completed: 96, rating: 4.7, reviews: 88, revenue: "41.2k", availability: "offline", blocked: false, phone: "+20 100 9981 245", email: "dina.fouad@example.com", history: buildHistory(7, { salt: 15 }) },
	{ id: "t-016", name: "Khaled Nabil", initials: "KN", color: "#92400e", specialty: "Carpentry", city: "Nasr City, Cairo", joined: "Sep 2024", completed: 58, rating: 4.45, reviews: 51, revenue: "26.9k", availability: "online", blocked: false, phone: "+20 122 7765 003", email: "khaled.nabil@example.com", history: buildHistory(6, { salt: 16, cancelled: 1 }) },
	{ id: "t-017", name: "Mona El-Sayed", initials: "ME", color: "#06b6d4", specialty: "Air Conditioning", city: "Maadi, Cairo", joined: "Aug 2024", completed: 84, rating: 4.78, reviews: 76, revenue: "44.5k", availability: "online", blocked: false, phone: "+20 100 1124 658", email: "mona.elsayed@example.com", history: buildHistory(8, { salt: 17 }) },
	{ id: "t-018", name: "Hossam Magdy", initials: "HM", color: "#f59e0b", specialty: "Electrician", city: "Dokki, Giza", joined: "Jan 2025", completed: 47, rating: 4.38, reviews: 41, revenue: "22.1k", availability: "offline", blocked: false, phone: "+20 122 5588 110", email: "hossam.magdy@example.com", history: buildHistory(5, { salt: 18, cancelled: 1 }) },
	{ id: "t-019", name: "Rania Gamal", initials: "RG", color: "#a855f7", specialty: "Home Cleaning", city: "Zamalek, Cairo", joined: "Apr 2025", completed: 39, rating: 4.55, reviews: 33, revenue: "16.8k", availability: "online", blocked: false, phone: "+20 100 8843 197", email: "rania.gamal@example.com", history: buildHistory(4, { salt: 19 }) },
	{ id: "t-020", name: "Bassem Khalil", initials: "BK", color: "#ef4444", specialty: "Fridge / Freezer", city: "Heliopolis, Cairo", joined: "Oct 2024", completed: 67, rating: 4.62, reviews: 60, revenue: "31.4k", availability: "online", blocked: false, phone: "+20 122 6677 209", email: "bassem.khalil@example.com", history: buildHistory(7, { salt: 20 }) },
	{ id: "t-021", name: "Layla Mostafa", initials: "LM", color: "#f43f5e", specialty: "Oven & Cooker", city: "6th October", joined: "Nov 2024", completed: 52, rating: 4.41, reviews: 46, revenue: "20.7k", availability: "offline", blocked: false, phone: "+20 100 3367 884", email: "layla.mostafa@example.com", history: buildHistory(5, { salt: 21, no_show: 1 }) },
	{ id: "t-022", name: "Sherif Adel", initials: "SA", color: "#dc2626", specialty: "Electrician", city: "Mohandessin, Giza", joined: "Mar 2025", completed: 31, rating: 3.78, reviews: 27, revenue: "13.6k", availability: "offline", blocked: true, phone: "+20 122 9912 304", email: "sherif.adel@example.com", history: buildHistory(2, { salt: 22, no_show: 3, cancelled: 2 }), blockedReason: "Failed to show for 3 confirmed visits", blockedAt: "2 May 2026", blockedBy: "Ahmed Refaat" },
];

export const PENDING_TECHS: PendingTech[] = [
	{
		id: "p-001", name: "Ahmed Sami", initials: "AS", color: "#3b82f6",
		specialty: "Plumbing", city: "Maadi, Cairo", appliedAt: "Today, 9:42 AM", yearsExp: 6,
		phone: "+20 100 4901 332", email: "ahmed.sami@example.com",
		documents: [
			{ kind: "National ID", status: "uploaded", filename: "national-id-front.jpg", size: "2.1 MB", uploaded: "9:42 AM" },
			{ kind: "National ID (back)", status: "uploaded", filename: "national-id-back.jpg", size: "1.8 MB", uploaded: "9:42 AM" },
			{ kind: "Trade certificate", status: "uploaded", filename: "plumbing-license.pdf", size: "640 KB", uploaded: "9:43 AM" },
			{ kind: "Insurance policy", status: "uploaded", filename: "insurance-2024.pdf", size: "1.2 MB", uploaded: "9:43 AM" },
			{ kind: "Profile photo", status: "uploaded", filename: "headshot.jpg", size: "820 KB", uploaded: "9:43 AM" },
		],
		flags: [],
	},
	{
		id: "p-002", name: "Heba Othman", initials: "HO", color: "#22c55e",
		specialty: "Home Cleaning", city: "Heliopolis, Cairo", appliedAt: "Today, 8:15 AM", yearsExp: 3,
		phone: "+20 122 6611 408", email: "heba.othman@example.com",
		documents: [
			{ kind: "National ID", status: "uploaded", filename: "natid-front.jpg", size: "1.6 MB", uploaded: "8:14 AM" },
			{ kind: "National ID (back)", status: "uploaded", filename: "natid-back.jpg", size: "1.4 MB", uploaded: "8:14 AM" },
			{ kind: "Trade certificate", status: "missing" },
			{ kind: "Insurance policy", status: "uploaded", filename: "insurance-cleaning.pdf", size: "910 KB", uploaded: "8:16 AM" },
			{ kind: "Profile photo", status: "uploaded", filename: "photo.jpg", size: "1.1 MB", uploaded: "8:16 AM" },
		],
		flags: ["Trade certificate missing"],
	},
	{
		id: "p-003", name: "Mostafa Wahba", initials: "MW", color: "#f97316",
		specialty: "Electrician", city: "Nasr City, Cairo", appliedAt: "Yesterday, 6:08 PM", yearsExp: 11,
		phone: "+20 100 8814 220", email: "mostafa.wahba@example.com",
		documents: [
			{ kind: "National ID", status: "uploaded", filename: "id-1.jpg", size: "2.0 MB", uploaded: "Yesterday" },
			{ kind: "National ID (back)", status: "uploaded", filename: "id-2.jpg", size: "1.9 MB", uploaded: "Yesterday" },
			{ kind: "Trade certificate", status: "uploaded", filename: "elec-license.pdf", size: "1.8 MB", uploaded: "Yesterday" },
			{ kind: "Insurance policy", status: "uploaded", filename: "elec-insurance.pdf", size: "1.4 MB", uploaded: "Yesterday" },
			{ kind: "Profile photo", status: "uploaded", filename: "selfie.jpg", size: "1.0 MB", uploaded: "Yesterday" },
		],
		flags: [],
	},
	{
		id: "p-004", name: "Dina Rashed", initials: "DR", color: "#a855f7",
		specialty: "Painter", city: "Dokki, Giza", appliedAt: "Yesterday, 2:31 PM", yearsExp: 4,
		phone: "+20 122 0911 776", email: "dina.rashed@example.com",
		documents: [
			{ kind: "National ID", status: "uploaded", filename: "natid-front-dr.jpg", size: "1.7 MB", uploaded: "Yesterday" },
			{ kind: "National ID (back)", status: "uploaded", filename: "natid-back-dr.jpg", size: "1.5 MB", uploaded: "Yesterday" },
			{ kind: "Trade certificate", status: "uploaded", filename: "painter-cert.pdf", size: "880 KB", uploaded: "Yesterday" },
			{ kind: "Insurance policy", status: "expired", filename: "insurance-2022.pdf", size: "720 KB", uploaded: "Yesterday", note: "Policy expired Dec 2023" },
			{ kind: "Profile photo", status: "uploaded", filename: "dr-photo.jpg", size: "640 KB", uploaded: "Yesterday" },
		],
		flags: ["Insurance policy expired"],
	},
];

export const STATUS_META: Record<string, StatusMeta> = {
	pending: { label: "Waiting for tech", cls: "warn" },
	accepted: { label: "Accepted", cls: "success" },
	in_progress: { label: "In progress", cls: "muted" },
	completed: { label: "Completed", cls: "success" },
	cancelled: { label: "Cancelled", cls: "danger" },
};

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

function buildHomeownerHistory(rows: Array<Partial<HomeownerOrderHistory> & { id: string; date: string }>): HomeownerOrderHistory[] {
	return rows.map((r) => ({
		id: r.id,
		date: r.date,
		category: r.category ?? "plumb",
		tech: r.tech ?? "Mahmoud Khaled",
		status: r.status ?? "completed",
		amount: r.amount ?? 480,
	}));
}

export const HOMEOWNERS: Homeowner[] = [
	{
		id: "h-001", name: "Yasmin Hassan", initials: "YH", color: "#ec4899",
		phone: "+20 100 4421 887", email: "yasmin.hassan@example.com",
		city: "Maadi, Cairo", joined: "Jan 2024",
		totalOrders: 18, completed: 16, cancelled: 2, spend: "9.8k",
		avgRatingGiven: 4.6, lastOrder: "Today, 11:08 AM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21847", date: "26 May", category: "plumb", tech: "Mahmoud Khaled", status: "completed", amount: 480 },
			{ id: "ORD-21801", date: "20 May", category: "ac", tech: "Nour Ibrahim", status: "completed", amount: 920 },
			{ id: "ORD-21765", date: "11 May", category: "clean", tech: "Hala Adel", status: "completed", amount: 540 },
			{ id: "ORD-21720", date: "2 May", category: "elec", tech: "Tarek Younis", status: "completed", amount: 360 },
			{ id: "ORD-21688", date: "24 Apr", category: "plumb", tech: "Mahmoud Khaled", status: "cancelled", amount: 0 },
		]),
	},
	{
		id: "h-002", name: "Karim El-Sayed", initials: "KE", color: "#06b6d4",
		phone: "+20 122 3318 220", email: "karim.elsayed@example.com",
		city: "Heliopolis, Cairo", joined: "Sep 2023",
		totalOrders: 24, completed: 22, cancelled: 2, spend: "14.2k",
		avgRatingGiven: 4.8, lastOrder: "Today, 10:52 AM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21846", date: "26 May", category: "ac", tech: "Nour Ibrahim", status: "completed", amount: 920 },
			{ id: "ORD-21812", date: "22 May", category: "fridge", tech: "Rana Said", status: "completed", amount: 780 },
			{ id: "ORD-21770", date: "13 May", category: "ac", tech: "Heba Saad", status: "completed", amount: 1080 },
			{ id: "ORD-21701", date: "30 Apr", category: "elec", tech: "Adel Farouk", status: "completed", amount: 420 },
			{ id: "ORD-21640", date: "16 Apr", category: "clean", tech: "Hala Adel", status: "completed", amount: 600 },
			{ id: "ORD-21580", date: "1 Apr", category: "plumb", tech: "Mahmoud Khaled", status: "cancelled", amount: 0 },
		]),
	},
	{
		id: "h-003", name: "Salma Mostafa", initials: "SM", color: "#f97316",
		phone: "+20 100 7733 014", email: "salma.mostafa@example.com",
		city: "Zamalek, Cairo", joined: "Mar 2024",
		totalOrders: 11, completed: 10, cancelled: 1, spend: "5.4k",
		avgRatingGiven: 4.4, lastOrder: "Today, 10:39 AM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21845", date: "26 May", category: "elec", tech: "Tarek Younis", status: "completed", amount: 340 },
			{ id: "ORD-21795", date: "18 May", category: "paint", tech: "Lina Khoury", status: "completed", amount: 660 },
			{ id: "ORD-21731", date: "5 May", category: "clean", tech: "Hala Adel", status: "completed", amount: 520 },
			{ id: "ORD-21672", date: "21 Apr", category: "carp", tech: "Tamer Hosny", status: "completed", amount: 880 },
		]),
	},
	{
		id: "h-004", name: "Omar Farouk", initials: "OF", color: "#22c55e",
		phone: "+20 122 7110 902", email: "omar.farouk@example.com",
		city: "New Cairo", joined: "Nov 2023",
		totalOrders: 20, completed: 19, cancelled: 1, spend: "11.6k",
		avgRatingGiven: 4.9, lastOrder: "Today, 10:20 AM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21844", date: "26 May", category: "clean", tech: "Hala Adel", status: "completed", amount: 600 },
			{ id: "ORD-21788", date: "17 May", category: "ac", tech: "Nour Ibrahim", status: "completed", amount: 1140 },
			{ id: "ORD-21716", date: "3 May", category: "fridge", tech: "Rana Said", status: "completed", amount: 820 },
			{ id: "ORD-21651", date: "18 Apr", category: "plumb", tech: "Mahmoud Khaled", status: "completed", amount: 460 },
			{ id: "ORD-21598", date: "6 Apr", category: "elec", tech: "Tarek Younis", status: "completed", amount: 380 },
		]),
	},
	{
		id: "h-005", name: "Mariam Saleh", initials: "MS", color: "#a855f7",
		phone: "+20 100 9088 432", email: "mariam.saleh@example.com",
		city: "Dokki, Giza", joined: "Jun 2023",
		totalOrders: 32, completed: 28, cancelled: 4, spend: "18.4k",
		avgRatingGiven: 4.2, lastOrder: "Today, 10:04 AM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21843", date: "26 May", category: "oven", tech: "Yousef Magdy", status: "completed", amount: 520 },
			{ id: "ORD-21778", date: "15 May", category: "ac", tech: "Heba Saad", status: "completed", amount: 1240 },
			{ id: "ORD-21709", date: "1 May", category: "clean", tech: "Hala Adel", status: "completed", amount: 580 },
			{ id: "ORD-21642", date: "17 Apr", category: "paint", tech: "Lina Khoury", status: "cancelled", amount: 0 },
			{ id: "ORD-21585", date: "3 Apr", category: "plumb", tech: "Mahmoud Khaled", status: "completed", amount: 440 },
		]),
	},
	{
		id: "h-006", name: "Ahmed Refaat", initials: "AR", color: "#3b82f6",
		phone: "+20 122 6042 178", email: "ahmed.refaat@example.com",
		city: "Mohandessin, Giza", joined: "Aug 2024",
		totalOrders: 7, completed: 6, cancelled: 1, spend: "3.1k",
		avgRatingGiven: 4.0, lastOrder: "Today, 9:18 AM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21842", date: "26 May", category: "paint", tech: "Lina Khoury", status: "cancelled", amount: 0 },
			{ id: "ORD-21750", date: "9 May", category: "elec", tech: "Adel Farouk", status: "completed", amount: 410 },
			{ id: "ORD-21680", date: "23 Apr", category: "clean", tech: "Hala Adel", status: "completed", amount: 520 },
		]),
	},
	{
		id: "h-007", name: "Nada Ezz", initials: "NE", color: "#f43f5e",
		phone: "+20 122 4490 661", email: "nada.ezz@example.com",
		city: "Maadi, Cairo", joined: "Feb 2024",
		totalOrders: 14, completed: 12, cancelled: 2, spend: "8.2k",
		avgRatingGiven: 4.7, lastOrder: "Today, 8:55 AM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21841", date: "26 May", category: "carp", tech: "Tamer Hosny", status: "completed", amount: 1100 },
			{ id: "ORD-21772", date: "14 May", category: "fridge", tech: "Rana Said", status: "completed", amount: 760 },
			{ id: "ORD-21700", date: "30 Apr", category: "ac", tech: "Nour Ibrahim", status: "completed", amount: 980 },
			{ id: "ORD-21620", date: "13 Apr", category: "plumb", tech: "Mahmoud Khaled", status: "cancelled", amount: 0 },
		]),
	},
	{
		id: "h-008", name: "Hussein Magdi", initials: "HM", color: "#10b981",
		phone: "+20 100 6612 008", email: "hussein.magdi@example.com",
		city: "Nasr City, Cairo", joined: "Apr 2024",
		totalOrders: 9, completed: 8, cancelled: 1, spend: "5.7k",
		avgRatingGiven: 4.5, lastOrder: "Today, 7:42 AM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21840", date: "26 May", category: "fridge", tech: "Rana Said", status: "completed", amount: 780 },
			{ id: "ORD-21761", date: "10 May", category: "ac", tech: "Heba Saad", status: "completed", amount: 1320 },
			{ id: "ORD-21690", date: "27 Apr", category: "clean", tech: "Hala Adel", status: "completed", amount: 480 },
		]),
	},
	{
		id: "h-009", name: "Mona Khaled", initials: "MK", color: "#0ea5e9",
		phone: "+20 100 2245 117", email: "mona.khaled@example.com",
		city: "Heliopolis, Cairo", joined: "May 2023",
		totalOrders: 27, completed: 25, cancelled: 2, spend: "13.8k",
		avgRatingGiven: 4.8, lastOrder: "Today, 5:30 AM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21839", date: "26 May", category: "plumb", tech: "Mahmoud Khaled", status: "completed", amount: 420 },
			{ id: "ORD-21785", date: "16 May", category: "clean", tech: "Hala Adel", status: "completed", amount: 540 },
			{ id: "ORD-21712", date: "2 May", category: "ac", tech: "Nour Ibrahim", status: "completed", amount: 1080 },
			{ id: "ORD-21645", date: "17 Apr", category: "elec", tech: "Tarek Younis", status: "completed", amount: 360 },
			{ id: "ORD-21570", date: "30 Mar", category: "fridge", tech: "Rana Said", status: "completed", amount: 720 },
		]),
	},
	{
		id: "h-010", name: "Tarek Bassem", initials: "TB", color: "#92400e",
		phone: "+20 122 5510 998", email: "tarek.bassem@example.com",
		city: "6th October", joined: "Dec 2023",
		totalOrders: 15, completed: 13, cancelled: 2, spend: "10.4k",
		avgRatingGiven: 4.3, lastOrder: "Yesterday, 8:20 PM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21838", date: "25 May", category: "ac", tech: "Heba Saad", status: "completed", amount: 1320 },
			{ id: "ORD-21760", date: "10 May", category: "oven", tech: "Yousef Magdy", status: "completed", amount: 540 },
			{ id: "ORD-21683", date: "24 Apr", category: "carp", tech: "Tamer Hosny", status: "completed", amount: 920 },
		]),
	},
	{
		id: "h-011", name: "Layla Hassan", initials: "LH", color: "#dc2626",
		phone: "+20 100 7740 113", email: "layla.hassan@example.com",
		city: "Maadi, Cairo", joined: "Jul 2024",
		totalOrders: 6, completed: 3, cancelled: 3, spend: "1.4k",
		avgRatingGiven: 3.4, lastOrder: "12 May", blocked: true,
		blockedReason: "Repeated last-minute cancellations after tech dispatch (5 within 30 days)",
		blockedAt: "21 May 2026", blockedBy: "Ahmed Refaat",
		history: buildHomeownerHistory([
			{ id: "ORD-21837", date: "25 May", category: "elec", tech: "Adel Farouk", status: "cancelled", amount: 0 },
			{ id: "ORD-21758", date: "11 May", category: "paint", tech: "Lina Khoury", status: "cancelled", amount: 0 },
			{ id: "ORD-21679", date: "23 Apr", category: "plumb", tech: "Mahmoud Khaled", status: "cancelled", amount: 0 },
			{ id: "ORD-21595", date: "5 Apr", category: "clean", tech: "Hala Adel", status: "completed", amount: 480 },
		]),
	},
	{
		id: "h-012", name: "Hassan Ali", initials: "HA", color: "#7c3aed",
		phone: "+20 122 8801 552", email: "hassan.ali@example.com",
		city: "Dokki, Giza", joined: "Oct 2023",
		totalOrders: 8, completed: 4, cancelled: 4, spend: "2.2k",
		avgRatingGiven: 2.9, lastOrder: "28 Apr", blocked: true,
		blockedReason: "Verbal harassment toward two technicians on completed jobs, confirmed via review evidence",
		blockedAt: "12 May 2026", blockedBy: "Ahmed Refaat",
		history: buildHomeownerHistory([
			{ id: "ORD-21701", date: "28 Apr", category: "plumb", tech: "Mahmoud Khaled", status: "completed", amount: 460 },
			{ id: "ORD-21655", date: "19 Apr", category: "ac", tech: "Nour Ibrahim", status: "cancelled", amount: 0 },
			{ id: "ORD-21588", date: "4 Apr", category: "elec", tech: "Tarek Younis", status: "completed", amount: 380 },
		]),
	},
	{
		id: "h-013", name: "Farah Awad", initials: "FA", color: "#06b6d4",
		phone: "+20 100 3344 781", email: "farah.awad@example.com",
		city: "Sheikh Zayed", joined: "Feb 2024",
		totalOrders: 16, completed: 15, cancelled: 1, spend: "8.9k",
		avgRatingGiven: 4.7, lastOrder: "Today, 7:15 AM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21836", date: "26 May", category: "plumb", tech: "Omar Salama", status: "completed", amount: 520 },
			{ id: "ORD-21780", date: "15 May", category: "clean", tech: "Marwan Helmy", status: "completed", amount: 480 },
			{ id: "ORD-21710", date: "2 May", category: "ac", tech: "Mona El-Sayed", status: "completed", amount: 1040 },
		]),
	},
	{
		id: "h-014", name: "Ziad Helmi", initials: "ZH", color: "#22c55e",
		phone: "+20 122 5570 661", email: "ziad.helmi@example.com",
		city: "Tagamoa, Cairo", joined: "Apr 2024",
		totalOrders: 13, completed: 12, cancelled: 1, spend: "7.3k",
		avgRatingGiven: 4.5, lastOrder: "Yesterday, 3:42 PM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21835", date: "25 May", category: "elec", tech: "Hossam Magdy", status: "completed", amount: 420 },
			{ id: "ORD-21766", date: "12 May", category: "paint", tech: "Dina Fouad", status: "completed", amount: 680 },
			{ id: "ORD-21695", date: "28 Apr", category: "fridge", tech: "Bassem Khalil", status: "completed", amount: 760 },
		]),
	},
	{
		id: "h-015", name: "Aya Maged", initials: "AM", color: "#f97316",
		phone: "+20 100 2218 994", email: "aya.maged@example.com",
		city: "Maadi, Cairo", joined: "Aug 2023",
		totalOrders: 22, completed: 20, cancelled: 2, spend: "12.6k",
		avgRatingGiven: 4.6, lastOrder: "Yesterday, 11:28 AM", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21834", date: "25 May", category: "ac", tech: "Mona El-Sayed", status: "completed", amount: 1120 },
			{ id: "ORD-21772", date: "13 May", category: "carp", tech: "Khaled Nabil", status: "completed", amount: 880 },
			{ id: "ORD-21700", date: "30 Apr", category: "clean", tech: "Rania Gamal", status: "completed", amount: 520 },
			{ id: "ORD-21630", date: "14 Apr", category: "plumb", tech: "Omar Salama", status: "completed", amount: 460 },
		]),
	},
	{
		id: "h-016", name: "Fady Boutros", initials: "FB", color: "#3b82f6",
		phone: "+20 122 8809 145", email: "fady.boutros@example.com",
		city: "Heliopolis, Cairo", joined: "May 2024",
		totalOrders: 9, completed: 8, cancelled: 1, spend: "5.1k",
		avgRatingGiven: 4.4, lastOrder: "2 days ago", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21833", date: "24 May", category: "fridge", tech: "Bassem Khalil", status: "completed", amount: 780 },
			{ id: "ORD-21758", date: "11 May", category: "oven", tech: "Layla Mostafa", status: "completed", amount: 540 },
		]),
	},
	{
		id: "h-017", name: "Reem Adel", initials: "RA", color: "#a855f7",
		phone: "+20 100 6651 207", email: "reem.adel@example.com",
		city: "Zamalek, Cairo", joined: "Jun 2024",
		totalOrders: 11, completed: 10, cancelled: 1, spend: "6.4k",
		avgRatingGiven: 4.8, lastOrder: "3 days ago", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21832", date: "23 May", category: "clean", tech: "Rania Gamal", status: "completed", amount: 540 },
			{ id: "ORD-21755", date: "10 May", category: "paint", tech: "Dina Fouad", status: "completed", amount: 720 },
		]),
	},
	{
		id: "h-018", name: "Mostafa Ehab", initials: "ME", color: "#f43f5e",
		phone: "+20 122 4470 312", email: "mostafa.ehab@example.com",
		city: "Mohandessin, Giza", joined: "Sep 2023",
		totalOrders: 26, completed: 24, cancelled: 2, spend: "14.8k",
		avgRatingGiven: 4.5, lastOrder: "4 days ago", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21831", date: "22 May", category: "elec", tech: "Sherif Adel", status: "completed", amount: 460 },
			{ id: "ORD-21752", date: "9 May", category: "ac", tech: "Mona El-Sayed", status: "completed", amount: 1180 },
			{ id: "ORD-21678", date: "23 Apr", category: "carp", tech: "Khaled Nabil", status: "completed", amount: 920 },
			{ id: "ORD-21610", date: "11 Apr", category: "plumb", tech: "Mahmoud Khaled", status: "completed", amount: 480 },
		]),
	},
	{
		id: "h-019", name: "Sara Younis", initials: "SY", color: "#0ea5e9",
		phone: "+20 100 7726 583", email: "sara.younis@example.com",
		city: "New Cairo", joined: "Jul 2024",
		totalOrders: 7, completed: 6, cancelled: 1, spend: "4.2k",
		avgRatingGiven: 4.3, lastOrder: "1 week ago", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21830", date: "20 May", category: "fridge", tech: "Rana Said", status: "completed", amount: 740 },
			{ id: "ORD-21748", date: "8 May", category: "clean", tech: "Hala Adel", status: "completed", amount: 500 },
		]),
	},
	{
		id: "h-020", name: "Tarek El-Said", initials: "TS", color: "#10b981",
		phone: "+20 122 9985 446", email: "tarek.elsaid@example.com",
		city: "Garden City, Cairo", joined: "Oct 2024",
		totalOrders: 5, completed: 4, cancelled: 1, spend: "2.8k",
		avgRatingGiven: 4.2, lastOrder: "1 week ago", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21829", date: "19 May", category: "paint", tech: "Dina Fouad", status: "completed", amount: 660 },
			{ id: "ORD-21745", date: "7 May", category: "elec", tech: "Hossam Magdy", status: "completed", amount: 420 },
		]),
	},
	{
		id: "h-021", name: "Nadine Galal", initials: "NG", color: "#ec4899",
		phone: "+20 100 1147 882", email: "nadine.galal@example.com",
		city: "Maadi, Cairo", joined: "Nov 2024",
		totalOrders: 4, completed: 3, cancelled: 1, spend: "1.9k",
		avgRatingGiven: 4.1, lastOrder: "2 weeks ago", blocked: false,
		history: buildHomeownerHistory([
			{ id: "ORD-21828", date: "13 May", category: "clean", tech: "Marwan Helmy", status: "completed", amount: 520 },
			{ id: "ORD-21741", date: "5 May", category: "carp", tech: "Khaled Nabil", status: "completed", amount: 840 },
		]),
	},
	{
		id: "h-022", name: "Wael Hany", initials: "WH", color: "#dc2626",
		phone: "+20 122 6638 071", email: "wael.hany@example.com",
		city: "6th October", joined: "Aug 2024",
		totalOrders: 6, completed: 2, cancelled: 4, spend: "1.1k",
		avgRatingGiven: 3.1, lastOrder: "30 Apr", blocked: true,
		blockedReason: "Multiple no-shows after tech dispatch despite repeated reminders",
		blockedAt: "8 May 2026", blockedBy: "Ahmed Refaat",
		history: buildHomeownerHistory([
			{ id: "ORD-21827", date: "30 Apr", category: "ac", tech: "Mona El-Sayed", status: "no_show", amount: 0 },
			{ id: "ORD-21738", date: "20 Apr", category: "plumb", tech: "Omar Salama", status: "no_show", amount: 0 },
			{ id: "ORD-21670", date: "12 Apr", category: "elec", tech: "Hossam Magdy", status: "cancelled", amount: 0 },
		]),
	},
];

export const REPORTS: Report[] = [
	{
		id: "RPT-0142", orderId: "ORD-21845", reporterName: "Salma Mostafa", reporterInitials: "SM", reporterColor: "#f97316", reporterRole: "customer",
		against: "Tarek Younis", category: "elec",
		filedAt: "Today, 11:24 AM", status: "open",
		summary: "Tech arrived 90 minutes late without notice",
		description: "Tech was scheduled for 9:00 AM and showed up at 10:30 AM with no call or message ahead of time. I had to reschedule a work meeting. The repair itself was fine but the delay caused real disruption and there was no apology when he arrived.",
	},
	{
		id: "RPT-0141", orderId: "ORD-21842", reporterName: "Lina Khoury", reporterInitials: "LK", reporterColor: "#a855f7", reporterRole: "technician",
		against: "Ahmed Refaat", category: "paint",
		filedAt: "Today, 10:12 AM", status: "open",
		summary: "Customer cancelled at the door after materials were purchased",
		description: "I bought the paint and primer per the customer's selection on the prior call and drove 45 minutes to the site. Customer refused entry saying he changed his mind about the color. Requesting reimbursement for the materials (EGP 620) which I cannot return opened.",
	},
	{
		id: "RPT-0140", orderId: "ORD-21841", reporterName: "Nada Ezz", reporterInitials: "NE", reporterColor: "#f43f5e", reporterRole: "customer",
		against: "Tamer Hosny", category: "carp",
		filedAt: "Today, 9:08 AM", status: "open",
		summary: "Cabinet door installed crooked, visible gap on the right side",
		description: "The new cabinet door is misaligned. There is a finger-width gap on the right side and the hinges look uneven. Tech said it was 'within tolerance' but it is clearly wrong. I have photos. Want this fixed or refunded.",
	},
	{
		id: "RPT-0139", orderId: "ORD-21838", reporterName: "Tarek Bassem", reporterInitials: "TB", reporterColor: "#92400e", reporterRole: "customer",
		against: "Heba Saad", category: "ac",
		filedAt: "Yesterday, 9:42 PM", status: "open",
		summary: "AC charge price exceeded the agreed quote",
		description: "Agreed quote was EGP 1,100 for refrigerant top-up. Final bill was 1,320 with a vague 'additional gas' line item. No call to confirm the extra charge before applying it. Want the difference refunded.",
	},
	{
		id: "RPT-0138", orderId: "ORD-21801", reporterName: "Mahmoud Khaled", reporterInitials: "MK", reporterColor: "#3b82f6", reporterRole: "technician",
		against: "Hassan Ali", category: "plumb",
		filedAt: "Yesterday, 6:32 PM", status: "open",
		summary: "Customer used abusive language during the visit",
		description: "Customer started shouting when I explained the leak was behind tiling and would need extra time. Repeated insults and accused me of inflating the job. I finished safely but I do not want to be re-dispatched to this address.",
	},
	{
		id: "RPT-0137", orderId: "ORD-21795", reporterName: "Lina Khoury", reporterInitials: "LK", reporterColor: "#a855f7", reporterRole: "technician",
		against: "Salma Mostafa", category: "paint",
		filedAt: "Yesterday, 4:18 PM", status: "open",
		summary: "Workspace was inaccessible at start of visit",
		description: "Arrived on time. Customer told me the room was 'almost ready', furniture still everywhere, took 40 minutes to clear before I could start. Job ran over schedule for my next visit. Asking platform to flag the address for time buffer next time.",
	},
	{
		id: "RPT-0136", orderId: "ORD-21770", reporterName: "Karim El-Sayed", reporterInitials: "KE", reporterColor: "#06b6d4", reporterRole: "customer",
		against: "Heba Saad", category: "ac",
		filedAt: "Yesterday, 1:55 PM", status: "open",
		summary: "AC unit still leaking water after the repair",
		description: "Tech replaced the drain pipe and said the issue was resolved. Two days later water is dripping again from the indoor unit. I have a baby in the room directly below. Need someone back today.",
	},
	{
		id: "RPT-0135", orderId: "ORD-21765", reporterName: "Yasmin Hassan", reporterInitials: "YH", reporterColor: "#ec4899", reporterRole: "customer",
		against: "Hala Adel", category: "clean",
		filedAt: "Yesterday, 11:20 AM", status: "open",
		summary: "Items missing after cleaning visit",
		description: "After the visit I noticed two small decorative items missing from the living room shelf. I am not accusing anyone directly but I want platform records of who entered the apartment and at what time, in case I need to escalate.",
	},
	{
		id: "RPT-0134", orderId: "ORD-21760", reporterName: "Yousef Magdy", reporterInitials: "YM", reporterColor: "#f43f5e", reporterRole: "technician",
		against: "Tarek Bassem", category: "oven",
		filedAt: "2 days ago", status: "open",
		summary: "Payment delayed beyond completion confirmation",
		description: "Job confirmed complete on the app three days ago. Payment still pending in my account. Customer claims it cleared on their end. Need finance to check the transaction.",
	},
	{
		id: "RPT-0133", orderId: "ORD-21731", reporterName: "Salma Mostafa", reporterInitials: "SM", reporterColor: "#f97316", reporterRole: "customer",
		against: "Hala Adel", category: "clean",
		filedAt: "5 days ago", status: "closed", resolution: "resolved",
		closedAt: "22 May 2026", closedBy: "Ahmed Refaat",
		summary: "Cleaning chemicals left strong smell, customer asthmatic",
		description: "The cleaning products used had a very strong odor. I am asthmatic and had a mild reaction. Customer asked to use only fragrance-free products going forward and was reimbursed 50% as goodwill.",
	},
	{
		id: "RPT-0132", orderId: "ORD-21720", reporterName: "Yasmin Hassan", reporterInitials: "YH", reporterColor: "#ec4899", reporterRole: "customer",
		against: "Tarek Younis", category: "elec",
		filedAt: "1 week ago", status: "closed", resolution: "resolved",
		closedAt: "20 May 2026", closedBy: "Ahmed Refaat",
		summary: "Outlet replacement charged twice on invoice",
		description: "Duplicate line item for one outlet. Confirmed in records, refunded EGP 120 to the customer wallet.",
	},
	{
		id: "RPT-0131", orderId: "ORD-21709", reporterName: "Hala Adel", reporterInitials: "HA", reporterColor: "#22c55e", reporterRole: "technician",
		against: "Mariam Saleh", category: "clean",
		filedAt: "1 week ago", status: "closed", resolution: "dismissed",
		closedAt: "19 May 2026", closedBy: "Ahmed Refaat",
		summary: "Pet was loose in the workspace, safety concern",
		description: "Customer's dog was not contained during the visit. Tech requested it be moved which customer felt was rude. Tech did complete the job. Reviewed both sides, no policy violation by either party. Reminder sent to customer about pet containment.",
	},
	{
		id: "RPT-0130", orderId: "ORD-21701", reporterName: "Adel Farouk", reporterInitials: "AF", reporterColor: "#f97316", reporterRole: "technician",
		against: "Hassan Ali", category: "elec",
		filedAt: "2 weeks ago", status: "closed", resolution: "resolved",
		closedAt: "13 May 2026", closedBy: "Ahmed Refaat",
		summary: "Customer demanded scope beyond ticket",
		description: "Booking was for a single outlet replacement. Customer insisted I rewire the kitchen as part of the same visit at no extra charge. Refused to leave a tip without it. Tech was supported, additional work ticketed as a new job which customer declined.",
	},
	{
		id: "RPT-0129", orderId: "ORD-21680", reporterName: "Ahmed Refaat", reporterInitials: "AR", reporterColor: "#3b82f6", reporterRole: "customer",
		against: "Hala Adel", category: "clean",
		filedAt: "3 weeks ago", status: "closed", resolution: "dismissed",
		closedAt: "8 May 2026", closedBy: "Ahmed Refaat",
		summary: "Service ran short of advertised duration",
		description: "Tech finished in 1h 40m for a booking listed as 2h. Reviewed photos and checklist, all advertised tasks completed, scope was satisfied. No refund issued.",
	},
];
