import type { Request, Response } from 'express';
import { ordersService } from './orders.service.js';

export class OrdersController {
  // USER endpoints -----------------------------------------------------------

  async createOrder(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const order = await ordersService.createOrderForUser(user.id, req.body);
      return res.status(201).json({ data: order });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  async getUserOrders(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const orders = await ordersService.getUserOrders(user.id);
      return res.status(200).json({ data: orders });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  async getUserOrderById(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params as any;
      const order = await ordersService.getUserOrderById(user.id, id);
      return res.status(200).json({ data: order });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  async userUpdateOrder(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params as any;
      const order = await ordersService.userUpdateOrder(user.id, id, req.body);
      return res.status(200).json({ data: order });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  // TECHNICIAN endpoints -----------------------------------------------------

  async getTechnicianOrders(req: Request, res: Response) {
    try {
      const technician = (req as any).technician;
      const orders = await ordersService.getTechnicianOrders(technician.id);
      return res.status(200).json({ data: orders });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  async getTechnicianOrderById(req: Request, res: Response) {
    try {
      const technician = (req as any).technician;
      const { id } = req.params as any;
      const order = await ordersService.getTechnicianOrderById(technician.id, id);
      return res.status(200).json({ data: order });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }

  async technicianUpdateOrder(req: Request, res: Response) {
    try {
      const technician = (req as any).technician;
      const { id } = req.params as any;
      const order = await ordersService.technicianUpdateOrder(technician.id, id, req.body);
      return res.status(200).json({ data: order });
    } catch (err: any) {
      return res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    }
  }
}

export const ordersController = new OrdersController();