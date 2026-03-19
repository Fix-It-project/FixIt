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
  scheduled_date: string;
  active: boolean;
  created_at: string;
}

export interface CreateOrderData {
  technician_id: string;
  user_id: string;
  service_id: string;
  problem_description?: string;
  scheduled_date: string;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  active?: boolean;
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
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Order[];
  }

  async getTechnicianOrders(technicianId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('technician_id', technicianId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Order[];
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

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }
}

export const ordersRepository = new OrdersRepository();