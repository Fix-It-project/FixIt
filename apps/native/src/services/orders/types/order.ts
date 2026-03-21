import type { OrderStatus } from '@/src/services/shared/types';

export type { OrderStatus };

export interface CreateOrderPayload {
  technician_id: string;
  service_id: string;
  scheduled_date: string; // YYYY-MM-DD
  problem_description?: string;
}

export interface Order {
  id: string;
  technician_id: string;
  user_id: string;
  service_id: string;
  scheduled_date: string;
  status: OrderStatus;
  problem_description: string;
}

export interface OrderResponse {
  data: Order;
}