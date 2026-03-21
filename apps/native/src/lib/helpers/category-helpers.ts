import { CATEGORIES } from "@/src/lib/categories";

/**
 * Lookup map: category UUID → { icon, color }.
 * Shared by CategoryGrid, CategoriesScreen, and any future consumer.
 */
export const ICON_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, { icon: c.icon, color: c.color }])
);
