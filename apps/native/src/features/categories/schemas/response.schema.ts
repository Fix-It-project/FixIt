import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string(),
});

export const categoriesResponseSchema = z.object({
  categories: z.array(categorySchema),
});

export const categoryResponseSchema = z.object({
  category: categorySchema,
});

export type Category = z.infer<typeof categorySchema>;
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
