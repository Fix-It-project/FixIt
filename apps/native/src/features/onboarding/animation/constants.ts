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
