import { create } from "zustand";

interface EditProfileState {
  fullName: string;
  email: string;
  phone: string;

  setFullName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  hydrate: (data: { fullName: string; email: string; phone: string }) => void;
  reset: () => void;
}

const initialState = {
  fullName: "",
  email: "",
  phone: "",
};

export const useEditProfileStore = create<EditProfileState>((set) => ({
  ...initialState,
  setFullName: (value) => set({ fullName: value }),
  setEmail: (value) => set({ email: value }),
  setPhone: (value) => set({ phone: value }),
  hydrate: (data) => set({ fullName: data.fullName, email: data.email, phone: data.phone }),
  reset: () => set(initialState),
}));
