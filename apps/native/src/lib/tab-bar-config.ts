import { Colors } from "@/src/lib/colors";

/**
 * Shared tab-bar styling for both customer and technician layouts.
 */
export const TAB_BAR_STYLE = {
  backgroundColor: Colors.surfaceBase,
  borderTopWidth: 0,
  height: 80,
  paddingBottom: 20,
  paddingTop: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 8,
} as const;

export const TAB_BAR_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: "600" as const,
  marginTop: 2,
} as const;
