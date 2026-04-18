import { z } from "zod";
import { orderStatusSchema } from "@/src/schemas/shared.schema";

export const orderSchema = z.object({
  id: z.string(),
  technician_id: z.string(),
  user_id: z.string(),
  service_id: z.string(),
  scheduled_date: z.string(),
  status: orderStatusSchema,
  problem_description: z.string().nullable(),
  attachment: z.string().nullable().optional(),
  cancellation_reason: z.string().nullable().optional(),
  active: z.boolean(),
  created_at: z.string(),
  technician_name: z.string().nullable().optional(),
  technician_image: z.string().nullable().optional(),
  technician_phone: z.string().nullable().optional(),
  service_name: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
});

export const technicianBookingSchema = z.object({
  id: z.string(),
  status: orderStatusSchema,
  scheduled_date: z.string(),
  problem_description: z.string().nullable(),
  attachment: z.string().nullable().optional(),
  cancellation_reason: z.string().nullable().optional(),
  user_name: z.string().nullable().optional(),
  user_phone: z.string().nullable().optional(),
  user_address: z.string().nullable().optional(),
  service_name: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
});

export const orderResponseSchema = z.object({ data: orderSchema });
export const ordersResponseSchema = z.object({ data: z.array(orderSchema) });
export const technicianBookingResponseSchema = z.object({
  data: technicianBookingSchema,
});
export const technicianBookingsResponseSchema = z.object({
  data: z.array(technicianBookingSchema),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type OrdersResponse = z.infer<typeof ordersResponseSchema>;
export type TechnicianBooking = z.infer<typeof technicianBookingSchema>;
export type TechnicianBookingResponse = z.infer<typeof technicianBookingResponseSchema>;
export type TechnicianBookingsResponse = z.infer<typeof technicianBookingsResponseSchema>;
