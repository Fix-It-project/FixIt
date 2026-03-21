export interface CreateOrderPayload {
  technician_id: string;
  service_id: string;
  scheduled_date: string; // YYYY-MM-DD
  problem_description?: string;
}
