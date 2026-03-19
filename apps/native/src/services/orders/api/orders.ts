import apiClient from '@/src/lib/api-client';
import type { CreateOrderPayload, OrderResponse } from '../types/order';

export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  const response = await apiClient.post<OrderResponse>('/api/orders/user/orders', payload);
  return response.data;
}