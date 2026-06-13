// Raw DB row shapes (slim projections — only what the admin queries select).
// Internal to the data layer: coupled to the repository's SQL, never sent to the
// client. The client-facing contract types live in `admin-dashboard.types.ts`.

export interface DashboardOrderRow {
	id: string;
	status: string;
	active: boolean;
	created_at: string;
	final_price: number | null;
	service_id: string | null;
	technician_id: string | null;
	user_id: string | null;
	user_completed_at: string | null;
	technician_completed_at: string | null;
	cancellation_reason: string | null;
}

export interface CategoryRow {
	id: string;
	name: string | null;
}

export interface TechnicianRow {
	id: string;
	first_name: string | null;
	last_name: string | null;
	category_id: string | null;
}

export interface RatingStatRow {
	technician_id: string;
	review_count: number;
	rating_sum: number;
	rating: number;
}

export interface ReviewRow {
	order_id: string;
	rating: number;
	comment: string | null;
	created_at: string;
	user_id: string | null;
}

export interface HomeownerUserRow {
	id: string;
	created_at: string;
	full_name: string | null;
	email: string | null;
	phone: string | null;
	blocked: boolean;
	block_pending: boolean;
	blocked_reason: string | null;
	blocked_at: string | null;
	blocked_by: string | null;
}

/** One aggregated row per technician, from the `admin_technician_stats` view. */
export interface TechnicianStatsRow {
	id: string;
	created_at: string;
	first_name: string | null;
	last_name: string | null;
	email: string | null;
	phone: string | null;
	is_available: boolean | null;
	status: string;
	block_pending: boolean;
	blocked_reason: string | null;
	blocked_at: string | null;
	blocked_by: string | null;
	category_id: string | null;
	years_experience: number | null;
	criminal_record: string | null;
	birth_certificate: string | null;
	national_id: string | null;
	category_name: string | null;
	city: string | null;
	rating: number | null;
	review_count: number;
	total_orders: number;
	completed: number;
	cancelled: number;
	revenue: number;
}

export interface OrderQuoteRow {
	proposed_by: string;
	amount: number;
	round_number: number;
	status: string;
	notes: string | null;
	created_at: string;
}

export interface OrderEventRow {
	event_type: string;
	from_status: string | null;
	to_status: string | null;
	actor_role: string;
	metadata: unknown;
	created_at: string;
}

export interface OrderPaymentRow {
	amount: number;
	payment_method: string;
	status: string;
	paid_at: string | null;
	created_at: string;
}

/** Single order detail (admin order-detail modal). */
export interface OrderDetailRow {
	id: string;
	problem_description: string | null;
	status: string;
	created_at: string;
	scheduled_date: string | null;
	scheduled_start_at: string | null;
	arrived_at: string | null;
	user_completed_at: string | null;
	technician_completed_at: string | null;
	final_price: number | null;
	payment_method: string | null;
	cancellation_reason: string | null;
	attachment: string | null;
	customerName: string | null;
	techFirstName: string | null;
	techLastName: string | null;
	categoryName: string | null;
	review: { rating: number; comment: string | null; created_at: string } | null;
	quotes: OrderQuoteRow[];
	events: OrderEventRow[];
	payments: OrderPaymentRow[];
}

/** Fully-joined order row for the admin orders list. */
export interface DetailedOrderRow {
	id: string;
	status: string;
	created_at: string;
	final_price: number | null;
	cancellation_reason: string | null;
	customerName: string | null;
	techFirstName: string | null;
	techLastName: string | null;
	categoryName: string | null;
	review: {
		rating: number;
		comment: string | null;
		created_at: string;
		user_id: string | null;
	} | null;
}
