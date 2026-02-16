import { create } from "zustand";

interface TechnicianSignupState {
  // Step 1
  email: string;
  // Step 2
  phone: string;
  // Step 3
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  // Step 4
  nationalId: string;
  criminalRecord: string;
  certificate: string;
  city: string;
  address: string;

  // Setters
  setStep1Data: (data: { email: string }) => void;
  setStep2Data: (data: { phone: string }) => void;
  setStep3Data: (data: {
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
  }) => void;
  setStep4Data: (data: {
    nationalId: string;
    criminalRecord: string;
    certificate: string;
    city: string;
    address: string;
  }) => void;
  reset: () => void;
}

const initialState = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
  nationalId: "",
  criminalRecord: "",
  certificate: "",
  city: "",
  address: "",
};

export const useTechnicianSignupStore = create<TechnicianSignupState>(
  (set) => ({
    ...initialState,
    setStep1Data: (data) => set(data),
    setStep2Data: (data) => set(data),
    setStep3Data: (data) => set(data),
    setStep4Data: (data) => set(data),
    reset: () => set(initialState),
  })
);
