import { ordersRepository, type Order, type OrderStatus } from './orders.repository.js';
import { technicianCalendarService } from '../technician-calendar/technician-calendar.service.js';
import { storageRepository } from '../../shared/storage/storage.repository.js';

export interface CreateOrderRequest {
  technician_id: string;
  service_id: string;
  scheduled_date: string; // YYYY-MM-DD
  problem_description?: string;
  attachment?: Express.Multer.File;
}

export interface TechnicianUpdateOrderRequest {
  status?: OrderStatus;
  cancellation_reason?: string;
}

export interface UserUpdateOrderRequest {
  cancel?: boolean;
  cancellation_reason?: string;
}

/** Which statuses a technician can transition FROM → TO */
const TECHNICIAN_TRANSITIONS: Record<string, OrderStatus[]> = {
  pending:  ['accepted', 'rejected'],
  accepted: ['cancelled_by_technician', 'completed'],
};

/** Which statuses a user can cancel from */
const USER_CANCELLABLE: OrderStatus[] = ['pending', 'accepted'];

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
    const { technician_id, service_id, scheduled_date, problem_description, attachment } = body;
    const normalizedDate = this.ensureFutureBookingDate(scheduled_date);
    
    // 0. Check if user already has a pending booking with this technician
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

    // 3. Create the order to obtain its ID
    const order = await ordersRepository.createOrder({
      technician_id,
      user_id: userId,
      service_id,
      problem_description,
      scheduled_date: normalizedDate,
    });

    // 4. Upload attachment (if provided) and store its URL
    if (attachment) {
      const attachmentUrl = await storageRepository.uploadOrderAttachment(order.id, attachment);
      return ordersRepository.updateOrder(order.id, { attachment: attachmentUrl });
    }

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

  // TECHNICIAN: change status with transition guards
  async technicianUpdateOrder(technicianId: string, id: string, body: TechnicianUpdateOrderRequest) {
    const order = await this.getTechnicianOrderById(technicianId, id);

    if (!body.status) return order;

    const allowed = TECHNICIAN_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(body.status)) {
      throw {
        status: 400,
        message: `Cannot transition from '${order.status}' to '${body.status}'.`,
      };
    }

    const updates: { status: OrderStatus; active?: boolean; cancellation_reason?: string | null } = { status: body.status };

    if (body.status === 'accepted') {
      const activeCount = await ordersRepository.getActiveOrdersCountForDate(technicianId, order.scheduled_date);
      if (activeCount >= 5) {
        throw {
          status: 409,
          message: 'Maximum number of active bookings (5) reached for this day.',
        };
      }
      updates.active = true;
    }

    if (body.status === 'rejected' || body.status === 'cancelled_by_technician' || body.status === 'completed') {
      updates.active = false;
    }

    if (body.cancellation_reason !== undefined) {
      updates.cancellation_reason = body.cancellation_reason;
    }

    return ordersRepository.updateOrder(order.id, updates);
  }

  // USER: cancel only (from pending or accepted)
  async userUpdateOrder(userId: string, id: string, body: UserUpdateOrderRequest) {
    const order = await this.getUserOrderById(userId, id);

    if (!body.cancel) return order;

    if (!USER_CANCELLABLE.includes(order.status)) {
      throw {
        status: 400,
        message: `Cannot cancel an order that is '${order.status}'.`,
      };
    }

    return ordersRepository.updateOrder(order.id, {
      status: 'cancelled_by_user',
      active: false,
      ...(body.cancellation_reason !== undefined && { cancellation_reason: body.cancellation_reason }),
    });
  }
}

export const ordersService = new OrdersService();