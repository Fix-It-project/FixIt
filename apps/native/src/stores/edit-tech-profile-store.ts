import { create } from "zustand";

interface EditTechProfileState {
  firstName: string;
  lastName: string;
  phone: string;
  description: string;

  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setPhone: (value: string) => void;
  setDescription: (value: string) => void;
  hydrate: (data: { firstName: string; lastName: string; phone: string; description: string }) => void;
  reset: () => void;
}

const initialState = {
  firstName: "",
  lastName: "",
  phone: "",
  description: "",
};

export const useEditTechProfileStore = create<EditTechProfileState>((set) => ({
  ...initialState,
  setFirstName: (value) => set({ firstName: value }),
  setLastName: (value) => set({ lastName: value }),
  setPhone: (value) => set({ phone: value }),
  setDescription: (value) => set({ description: value }),
  hydrate: (data) => set({ firstName: data.firstName, lastName: data.lastName, phone: data.phone, description: data.description }),
  reset: () => set(initialState),
}));
