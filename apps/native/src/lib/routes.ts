import type { Href } from "expo-router";

export const ROUTES = {
  root: "/" as const,

  auth: {
    welcome: "/welcome" as const,
    roleSelection: "/role-selection" as const,
    login: "/login" as const,
    signup: "/signup" as const,
    forgotPassword: "/forgot-password" as const,
    resetPassword: "/reset-password" as const,
    techLogin: "/tech-login" as const,
    techSignup: "/tech-signup" as const,
    techSignupStep: (n: 2 | 3 | 4 | 5) => {
      switch (n) {
        case 2:
          return "/tech-signup/step-2" as const;
        case 3:
          return "/tech-signup/step-3" as const;
        case 4:
          return "/tech-signup/step-4" as const;
        default:
          return "/tech-signup/step-5" as const;
      }
    },
  },

  user: {
    home: "/user" as const,
    categories: "/user/categories" as const,
    orders: "/user/orders" as const,
    orderDetail: (orderId: string) =>
      ({
        pathname: "/user/orders/[orderId]" as const,
        params: { orderId },
      }),
    profile: "/user/profile" as const,
    profileEdit: "/user/profile/edit" as const,
    profileAddressNew: "/user/profile/addresses/new" as const,
    profileOrderHistory: "/user/profile/orders/history" as const,
    services: "/user/services" as const,
    technicians: "/user/technicians" as const,
    bookingRoot: (technicianId: string) =>
      ({
        pathname: "/user/booking/[technicianId]" as const,
        params: { technicianId },
      }),
    bookingDate: (technicianId: string) =>
      ({
        pathname: "/user/booking/[technicianId]/date" as const,
        params: { technicianId },
      }),
    bookingDetails: (technicianId: string) =>
      ({
        pathname: "/user/booking/[technicianId]/details" as const,
        params: { technicianId },
      }),
    chat: "/user/chat" as const,
    settings: "/user/settings" as const,
    settingsPrivacy: "/user/settings/privacy-security" as const,
    settingsHelp: "/user/settings/help-support" as const,
  },

  technician: {
    home: "/technician" as const,
    schedule: "/technician/schedule" as const,
    bookings: "/technician/bookings" as const,
    bookingDetail: (bookingId: string) =>
      ({
        pathname: "/technician/bookings/[bookingId]" as const,
        params: { bookingId },
      }),
    wallet: "/technician/wallet" as const,
    chat: "/technician/chat" as const,
    profile: "/technician/profile" as const,
    profileEdit: "/technician/profile/edit" as const,
    profileBookingHistory: "/technician/profile/bookings/history" as const,
    settings: "/technician/settings" as const,
    settingsPrivacy: "/technician/settings/privacy-security" as const,
    settingsHelp: "/technician/settings/help-support" as const,
  },
} as const;

export type AppRoute = Href;
