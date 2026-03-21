import { z } from "zod";

export function safeParseResponse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  context?: string,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(
      `[API Validation] ${context ?? "Unknown"}:`,
      result.error.flatten(),
    );
    throw new Error(`Invalid API response${context ? ` in ${context}` : ""}`);
  }
  return result.data;
}
