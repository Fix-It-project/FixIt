/** Shared formatting utilities for booking-related UI. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AVATAR_PALETTE = [
  "#2196F3", "#FF9800", "#4CAF50", "#9C27B0",
  "#00BCD4", "#795548", "#5C6BC0", "#EF5350",
];

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
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
