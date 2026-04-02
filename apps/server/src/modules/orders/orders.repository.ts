import { supabaseAdmin } from '../../shared/db/supabase.js';

const supabase = supabaseAdmin;

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled_by_user'
  | 'cancelled_by_technician'
  | 'completed';

export interface Order {
  id: string;
  technician_id: string;
  user_id: string;
  service_id: string;
  status: OrderStatus;
  problem_description: string | null;
  attachment: string | null;
  cancellation_reason: string | null;
  scheduled_date: string;
  active: boolean;
  created_at: string;
  user_address?: string | null;
  service_name?: string | null;
  category_id?: string | null;
  user_name?: string | null;
  user_phone?: string | null;
  technician_name?: string | null;
  technician_image?: string | null;
  technician_phone?: string | null;
}

export interface CreateOrderData {
  technician_id: string;
  user_id: string;
  service_id: string;
  problem_description?: string;
  attachment?: string;
  scheduled_date: string;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  active?: boolean;
  cancellation_reason?: string | null;
  attachment?: string | null;
}

export class OrdersRepository {
  async createOrder(data: CreateOrderData): Promise<Order> {
    const { data: row, error } = await supabase
      .from('orders')
      .insert({
        technician_id: data.technician_id,
        user_id: data.user_id,
        service_id: data.service_id,
        problem_description: data.problem_description ?? null,
        attachment: data.attachment ?? null,
        status: 'pending',
        scheduled_date: data.scheduled_date,
        active: false,
      })
      .select()
      .single();

    if (error) throw error;
    return row as Order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, technicians(first_name, last_name, profile_image, phone), services(name, category_id)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row: any) => {
      const tech = Array.isArray(row.technicians) ? row.technicians[0] : row.technicians;
      const svc = Array.isArray(row.services) ? row.services[0] : row.services;
      return {
        ...row,
        technicians: undefined,
        services: undefined,
        technician_name: tech ? `${tech.first_name} ${tech.last_name}` : null,
        technician_image: tech?.profile_image ?? null,
        technician_phone: row.status === 'accepted' ? (tech?.phone ?? null) : null,
        service_name: svc?.name ?? null,
        category_id: svc?.category_id ?? null,
      };
    }) as Order[];
  }

  async getTechnicianOrders(technicianId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, users(full_name, phone, addresses(city, street, building_no)), services(name, category_id)')
      .eq('technician_id', technicianId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row: any) => {
      const usr = Array.isArray(row.users) ? row.users[0] : row.users;
      const addr = Array.isArray(usr?.addresses) ? usr.addresses[0] : (usr?.addresses ?? null);
      const parts = [addr?.building_no, addr?.street, addr?.city].filter(Boolean);
      const svc = Array.isArray(row.services) ? row.services[0] : row.services;
      return {
        ...row,
        users: undefined,
        services: undefined,
        user_address: parts.length > 0 ? parts.join(', ') : null,
        service_name: svc?.name ?? null,
        category_id: svc?.category_id ?? null,
        user_name: usr?.full_name ?? null,
        user_phone: row.status === 'accepted' ? (usr?.phone ?? null) : null,
      };
    }) as Order[];
  }

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Order;
  }

  async getActiveOrdersCountForDate(technicianId: string, date: string): Promise<number> {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('technician_id', technicianId)
      .eq('scheduled_date', date)
      .eq('active', true);

    if (error) throw error;
    return count ?? 0;
  }

  async checkTechnicianAvailability(technicianId: string, dayOfWeek: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('availability_templates')
      .select('*')
      .eq('technician_id', technicianId)
      .eq('day_of_week', dayOfWeek)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false; // No template found = not available
      throw error;
    }
  
    if (data.active !== undefined && data.active === false) return false;
    
    return true;
  }

  async updateOrder(id: string, dto: UpdateOrderData): Promise<Order> {
    const updates: Record<string, any> = {};
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.active !== undefined) updates.active = dto.active;
    if (dto.cancellation_reason !== undefined) updates.cancellation_reason = dto.cancellation_reason;
    if (dto.attachment !== undefined) updates.attachment = dto.attachment;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }

  // check for pending orders
  async hasPendingBooking(userId: string, technicianId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .eq('technician_id', technicianId)
      .eq('status', 'pending')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
}

export const ordersRepository = new OrdersRepository();