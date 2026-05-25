export interface CreateOrderPayload {
	technician_id: string;
	service_id: string;
	scheduled_date: string; // YYYY-MM-DD
	scheduled_start_at: string; // ISO datetime
	problem_description?: string;
	destination_address_id?: string;
}
