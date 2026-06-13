export type ServiceRequestStatus = "pending" | "approved" | "rejected";

/** A technician's custom-service request as shown in the admin review queue. */
export interface AdminServiceRequest {
	id: string;
	technicianId: string;
	technicianName: string;
	technicianInitials: string;
	color: string;
	categoryName: string | null;
	name: string;
	description: string | null;
	minPrice: number;
	maxPrice: number;
	/** Min of `min_price` across the category's catalog services (null if none). */
	categoryCatalogMin: number | null;
	/** Max of `max_price` across the category's catalog services (null if none). */
	categoryCatalogMax: number | null;
	status: ServiceRequestStatus;
	rejectReason: string | null;
	reviewedBy: string | null;
	reviewedAt: string | null;
	createdAt: string;
}
