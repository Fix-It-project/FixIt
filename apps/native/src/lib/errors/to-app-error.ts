import {
  AppError,
  fromProblemDetails,
  mapHttpStatus,
  mapPostgrestError,
  mapZodError,
} from "@FixIt/errors";
import axios from "axios";

const GENERIC_USER_MESSAGE = "Something went wrong. Please try again.";

function looksLikePostgrest(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.code === "string" &&
    typeof v.message === "string" &&
    "hint" in v &&
    !("isAxiosError" in v) &&
    !("response" in v) &&
    !("request" in v)
  );
}

function looksLikeZod(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.name === "ZodError" && Array.isArray(v.issues);
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (axios.isAxiosError(err)) {
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data;

      if (data && typeof data === "object") {
        const candidate = fromProblemDetails(data);
        if (candidate.code !== "UNKNOWN") {
          return new AppError(candidate.code, candidate.userMessage, {
            ...candidate.opts,
            status,
            cause: err,
          });
        }
      }

      const mapped = mapHttpStatus(status, data);
      return new AppError(mapped.code, mapped.userMessage, {
        ...mapped.opts,
        status,
        cause: err,
      });
    }

    if (err.code === "ECONNABORTED") {
      return new AppError("TIMEOUT", "Request timed out.", { cause: err });
    }

    if (err.request) {
      return new AppError("NETWORK", "Network unavailable.", { cause: err });
    }

    return new AppError("UNKNOWN", GENERIC_USER_MESSAGE, {
      devMessage: err.message,
      cause: err,
    });
  }

  if (looksLikePostgrest(err)) {
    return mapPostgrestError(err as Parameters<typeof mapPostgrestError>[0]);
  }

  if (looksLikeZod(err)) {
    return mapZodError(err as Parameters<typeof mapZodError>[0]);
  }

  if (err instanceof Error) {
    return new AppError("UNKNOWN", GENERIC_USER_MESSAGE, {
      devMessage: err.message,
      cause: err,
    });
  }

  if (err === undefined || err === null) {
    return new AppError("UNKNOWN", GENERIC_USER_MESSAGE);
  }

  return new AppError("UNKNOWN", GENERIC_USER_MESSAGE, {
    devMessage: String(err),
  });
}

export function getErrorMessage(err: unknown): string {
  return toAppError(err).userMessage;
}
