import { create } from 'zustand';
import type { TechnicianOrder } from '@/src/services/tech-calendar/schemas/response.schema';

interface TechRequestsStore {
  selectedOrder: TechnicianOrder | null;
  isModalVisible: boolean;
  openModal: (order: TechnicianOrder) => void;
  closeModal: () => void;
}

export const useTechRequestsStore = create<TechRequestsStore>((set) => ({
  selectedOrder: null,
  isModalVisible: false,
  openModal: (order) => set({ selectedOrder: order, isModalVisible: true }),
  closeModal: () => set({ isModalVisible: false }),
}));
