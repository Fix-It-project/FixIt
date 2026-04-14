/** Shared formatting utilities for booking-related UI. */
import { getActiveThemeTokens } from "@/src/lib/theme";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getAvatarPalette() {
  const tokens = getActiveThemeTokens();
  return [
    tokens.category.blue,
    tokens.category.orange,
    tokens.category.green,
    tokens.category.purple,
    tokens.category.cyan,
    tokens.category.brown,
    tokens.category.indigo,
    tokens.category.red,
  ];
}

/** Format "2026-03-27" → "Mar 27, 2026". */
export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

/** "Mohamed Ali" → "MA". */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

/** Deterministic avatar background color from a name string. */
export function getAvatarColor(name: string | null | undefined): string {
  const avatarPalette = getAvatarPalette();
  if (!name) return avatarPalette[0];
  let hash = 0;
  for (const char of name) hash = (char.codePointAt(0) ?? 0) + ((hash << 5) - hash);
  return avatarPalette[Math.abs(hash) % avatarPalette.length];
}
