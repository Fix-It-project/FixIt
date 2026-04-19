export function getPfpInitialsFallback(
  name: string | null | undefined,
): string {
  if (!name) return "??";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
