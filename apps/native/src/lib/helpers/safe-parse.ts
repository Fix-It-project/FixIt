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
      z.flattenError(result.error),
    );
    const errorMessage = context
      ? `Invalid API response in ${context}`
      : "Invalid API response";
    throw new Error(errorMessage);
  }
  return result.data;
}
