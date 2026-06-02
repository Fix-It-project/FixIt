import { Easing } from "react-native-reanimated";

export const DUR_REVEAL = 520;
export const DUR_STAGGER = 380;
export const DUR_COLLAPSE = 720;
export const DUR_CARDS = 460;
export const STAGGER_GAP = 90;

export const SPLASH_HOLD_MS = 1100;

export const EASE_OUT_EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_OUT_QUART = Easing.bezier(0.25, 1, 0.5, 1);

export const SPRING_SOFT = { damping: 18, stiffness: 180, mass: 1 } as const;
export const SPRING_PRESS = { damping: 22, stiffness: 320, mass: 0.6 } as const;

// Entrance animations for Phase 14 home screen sections
export const DUR_FADE_IN = 380; // Standard fade-in for single elements
export const DUR_SLIDE_UP = 420; // Slide + fade for cards/sections
export const ENTRANCE_STAGGER = 60; // Tighter stagger for list sections (vs STAGGER_GAP 90)

export const SPRING_CARD = { damping: 20, stiffness: 200, mass: 0.8 } as const; // Card hover/press
export const SPRING_CHIP = { damping: 24, stiffness: 280, mass: 0.5 } as const; // Category chip press

// Pulse animation for status dot (active order)
export const DUR_PULSE_IN = 400;
export const DUR_PULSE_OUT = 800;
export const PULSE_SCALE_MAX = 1.8;
