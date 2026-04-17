import type { Request, Response } from 'express';
import { ordersService } from './orders.service.js';
import { normalizeError } from '../../shared/errors/index.js';

export class OrdersController {
  async createOrder(req: Request, res: Response) {
    try {
      const order = await ordersService.createOrderForUser(req.user!.id, {
        ...req.body,
        attachment: req.file,
      });
      return res.status(201).json({ data: order });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async getUserOrders(req: Request, res: Response) {
    try {
      const orders = await ordersService.getUserOrders(req.user!.id);
      return res.status(200).json({ data: orders });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async getUserOrderById(req: Request, res: Response) {
    try {
      const order = await ordersService.getUserOrderById(req.user!.id, req.params.id as string);
      return res.status(200).json({ data: order });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async userUpdateOrder(req: Request, res: Response) {
    try {
      const order = await ordersService.userUpdateOrder(req.user!.id, req.params.id as string, req.body);
      return res.status(200).json({ data: order });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async getTechnicianOrders(req: Request, res: Response) {
    try {
      const orders = await ordersService.getTechnicianOrders(req.technician!.id);
      return res.status(200).json({ data: orders });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async getTechnicianOrderById(req: Request, res: Response) {
    try {
      const order = await ordersService.getTechnicianOrderById(req.technician!.id, req.params.id as string);
      return res.status(200).json({ data: order });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async technicianUpdateOrder(req: Request, res: Response) {
    try {
      const order = await ordersService.technicianUpdateOrder(req.technician!.id, req.params.id as string, req.body);
      return res.status(200).json({ data: order });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }
}

export const ordersController = new OrdersController();
