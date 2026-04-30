import { create } from "zustand";
import type { DashboardOrder } from "@/src/features/dashboard/schemas/response.schema";

interface TechRequestsStore {
	selectedOrder: DashboardOrder | null;
	isModalVisible: boolean;
	openModal: (order: DashboardOrder) => void;
	closeModal: () => void;
}

export const useTechRequestsStore = create<TechRequestsStore>((set) => ({
	selectedOrder: null,
	isModalVisible: false,
	openModal: (order) => set({ selectedOrder: order, isModalVisible: true }),
	closeModal: () => set({ isModalVisible: false }),
}));
