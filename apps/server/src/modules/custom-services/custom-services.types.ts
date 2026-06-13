/** A technician-unique custom service. A row begins as a pending request and the
 *  same row becomes the live unique service once an admin approves it. */
export interface CustomService {
	id: string;
	technician_id: string;
	category_id: string | null;
	name: string;
	description: string | null;
	min_price: number;
	max_price: number;
	status: "pending" | "approved" | "rejected";
	reject_reason: string | null;
	reviewed_by: string | null;
	reviewed_at: string | null;
	created_at: string;
}

/** Row shape returned by the `admin_custom_service_requests` view: the request
 *  plus technician display fields and the category's catalog price range
 *  (for the admin price-comparison band). */
export interface AdminCustomServiceRow extends CustomService {
	first_name: string | null;
	last_name: string | null;
	category_name: string | null;
	category_catalog_min: number | null;
	category_catalog_max: number | null;
}

export interface SubmitCustomServiceInput {
	technicianId: string;
	name: string;
	description?: string | null;
	minPrice: number;
	maxPrice: number;
}

export interface SetCustomServiceStatusInput {
	status: "approved" | "rejected";
	rejectReason?: string | null;
	reviewedBy: string;
}
