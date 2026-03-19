import { ordersRepository, type Order, type OrderStatus } from './orders.repository.js';
import { technicianCalendarService } from '../technician-calendar/technician-calendar.service.js';

export interface CreateOrderRequest {
  technician_id: string;
  category_id: string; // Changed from service_id to category_id
  scheduled_date: string; // YYYY-MM-DD
  problem_description?: string;
}

export interface TechnicianUpdateOrderRequest {
  status?: OrderStatus;
}

export interface UserUpdateOrderRequest {
  cancel?: boolean;
}

export class OrdersService {
  private normalizeDate(date: string) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      throw { status: 400, message: 'Invalid date format. Use YYYY-MM-DD.' };
    }
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  private ensureFutureBookingDate(date: string) {
    const normalized = this.normalizeDate(date);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const booking = new Date(normalized);
    booking.setHours(0, 0, 0, 0);

    if (booking < today) {
      throw { status: 400, message: 'Bookings can only be created for today or a future day.' };
    }

    return normalized;
  }

  // USER: create order, default active=false
  async createOrderForUser(userId: string, body: CreateOrderRequest): Promise<Order> {
    const { technician_id, category_id, scheduled_date, problem_description } = body;
    const normalizedDate = this.ensureFutureBookingDate(scheduled_date);
    
    // 0. NEW: Check if user already has a pending booking with this technician
    const hasPending = await ordersRepository.hasPendingBooking(userId, technician_id);
    if (hasPending) {
      throw { status: 400, message: 'You already have a pending booking with this technician.' };
    }

    // 1. Check template availability
    const dateObj = new Date(normalizedDate);
    const dayOfWeek = dateObj.getDay();
    const isAvailable = await ordersRepository.checkTechnicianAvailability(technician_id, dayOfWeek);
    
    if (!isAvailable) {
      throw { status: 400, message: 'Technician is not available on this day of the week.' };
    }

    // 2. Check if there's a specific holiday/exception
    const isHoliday = await technicianCalendarService.isDateHoliday(technician_id, normalizedDate);
    if (isHoliday) {
      throw { status: 400, message: 'Technician is on holiday/unavailable on this specific date.' };
    }

    // 3. Look up a valid service id using just the category id
    const serviceId = await ordersRepository.getServiceId(category_id);
    if (!serviceId) {
      throw { status: 400, message: 'No service exists for the requested category.' };
    }

    // 4. Create the order immediately.
    const order = await ordersRepository.createOrder({
      technician_id,
      user_id: userId,
      service_id: serviceId, 
      problem_description: problem_description || 'General Service Request',
      scheduled_date: normalizedDate,
    });
    
    return order;
  }

  async getUserOrders(userId: string) {
    return ordersRepository.getUserOrders(userId);
  }

  async getTechnicianOrders(technicianId: string) {
    return ordersRepository.getTechnicianOrders(technicianId);
  }

  async getUserOrderById(userId: string, id: string) {
    const order = await ordersRepository.getOrderById(id);
    if (!order || order.user_id !== userId) {
      throw { status: 404, message: 'Order not found' };
    }
    return order;
  }

  async getTechnicianOrderById(technicianId: string, id: string) {
    const order = await ordersRepository.getOrderById(id);
    if (!order || order.technician_id !== technicianId) {
      throw { status: 404, message: 'Order not found' };
    }
    return order;
  }

  // TECHNICIAN: change status
  async technicianUpdateOrder(technicianId: string, id: string, body: TechnicianUpdateOrderRequest) {
    const order = await this.getTechnicianOrderById(technicianId, id);
    const updates: any = {};

    if (body.status) {
      updates.status = body.status;
    }

    // Handle acceptance and active checks
    if (body.status === 'accepted') {
      const activeCount = await ordersRepository.getActiveOrdersCountForDate(technicianId, order.scheduled_date);
      if (activeCount >= 5) {
        throw { 
          status: 409, 
          message: 'Maximum number of active bookings (5) reached for this day.' 
        };
      }
      updates.active = true;
    }

    // Cancel by tech -> no longer active
    if (body.status === 'cancelled_by_technician' || body.status === 'rejected') {
      updates.active = false;
    }

    if (Object.keys(updates).length === 0) return order;
    return ordersRepository.updateOrder(order.id, updates);
  }

  // USER: cancel only
  async userUpdateOrder(userId: string, id: string, body: UserUpdateOrderRequest) {
    const order = await this.getUserOrderById(userId, id);
    const updates: any = {};

    if (body.cancel) {
      updates.status = 'cancelled_by_user' as OrderStatus;
      updates.active = false; // Deactivate if user cancels
    }

    if (Object.keys(updates).length === 0) return order;
    return ordersRepository.updateOrder(order.id, updates);
  }
}

export const ordersService = new OrdersService();