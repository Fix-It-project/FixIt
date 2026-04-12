import { CATEGORIES } from "@/src/lib/helpers/categories";

/**
 * Resolves icon + current theme-aware color for a category id.
 */
export function getCategoryMeta(categoryId?: string | null) {
  if (!categoryId) {
    return undefined;
  }

  const category = CATEGORIES.find((item) => item.id === categoryId);
  if (!category) {
    return undefined;
  }

  return {
    icon: category.icon,
    color: category.color,
  };
}
