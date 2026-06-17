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

// ---- Aggregate-view rows (computed in Postgres; see admin-dashboard-aggregates.sql) ----

/** Single-row headline KPIs from `admin_dashboard_kpis`. */
export interface DashboardKpisRow {
	total_orders: number;
	active_orders: number;
	completed_orders: number;
	revenue_total: number;
}

/** Orders created per day (`admin_order_created_daily`). */
export interface OrderCreatedDailyRow {
	day: string;
	orders_made: number;
}

/** Orders completed per day + revenue (`admin_order_completed_daily`). */
export interface OrderCompletedDailyRow {
	day: string;
	completed: number;
	revenue: number;
}

/** Technician-accept events per day (`admin_accept_daily`). */
export interface AcceptDailyRow {
	day: string;
	accepted: number;
}

/** Review ratings per day (`admin_review_daily`). */
export interface ReviewDailyRow {
	day: string;
	rating_sum: number;
	rating_count: number;
}

/** Order count per raw status (`admin_status_share`). */
export interface StatusShareRow {
	status: string;
	count: number;
}

/** Order count per category (`admin_category_share`). */
export interface CategoryShareCountRow {
	category_id: string;
	count: number;
}

/** Completed jobs + revenue per technician (`admin_tech_order_stats`). */
export interface TechOrderStatsRow {
	technician_id: string;
	completed_jobs: number;
	completed_revenue: number;
}

/** One aggregated row per homeowner (`admin_homeowner_stats`). */
export interface HomeownerStatsRow {
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
	city: string | null;
	total_orders: number;
	completed: number;
	cancelled: number;
	spend: number;
	last_order_at: string | null;
	review_given_sum: number;
	review_given_count: number;
	report_count: number;
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
	report_count: number;
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
	serviceName: string | null;
	categoryName: string | null;
	review: { rating: number; comment: string | null; created_at: string } | null;
	quotes: OrderQuoteRow[];
	events: OrderEventRow[];
	payments: OrderPaymentRow[];
}

/** One denormalized row from the `admin_orders` flat view (list + history). */
export interface AdminOrderListRow {
	id: string;
	id_text: string;
	created_at: string;
	status: string;
	final_price: number | null;
	user_id: string | null;
	technician_id: string | null;
	customer_name: string | null;
	tech_name: string | null;
	category_name: string | null;
	review_rating: number | null;
	review_comment: string | null;
	review_created_at: string | null;
	cancellation_reason: string | null;
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
