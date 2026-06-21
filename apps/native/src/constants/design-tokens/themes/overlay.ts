// Single source of truth for overlay primitive tokens. Change here → propagates to all Dialog + BottomSheet instances.
import { Easing } from "react-native-reanimated";

export const overlayTokens = {
  backdrop: {
    opacity: 0.5,
    // color sourced from theme via useThemeColors() at runtime — not hardcoded here
  },
  dialog: {
    maxWidth: 480,
    minWidth: 280,
    radius: 16,
    padding: 24,
    viewportMargin: 20,
    minViewportMargin: 12,
    portalElevation: 1000,
    keyboardGap: 12,
    titleBodyGap: 12,
    bodyFooterGap: 24,
    footerGap: 8,
    enter: {
      duration: 150,
      easing: Easing.bezier(0.4, 0, 0.2, 1), // MD2 standard
      scaleFrom: 0.85,
      backdropDuration: 100,
      backdropEasing: Easing.bezier(0, 0, 0.2, 1), // MD2 decelerate
    },
    exit: {
      duration: 120,
      easing: Easing.bezier(0.4, 0, 1, 1), // MD2 accelerate
      scaleTo: 0.85,
      backdropDuration: 120,
      backdropEasing: Easing.bezier(0.4, 0, 1, 1), // MD2 accelerate
      opacityDuration: 80,
    },
    shadow: {
      ios: {
        offset: { width: 0, height: 8 },
        opacity: 0.15,
        radius: 24,
      },
      androidElevation: 24,
    },
  },
  bottomSheet: {
    backdropOpacity: 0.5,
    radius: 16,
    snapPoints: ["50%", "90%"] as readonly string[],
    // colors sourced via useThemeColors() at runtime — not hardcoded here
  },
} as const;

export type OverlayTokens = typeof overlayTokens;
