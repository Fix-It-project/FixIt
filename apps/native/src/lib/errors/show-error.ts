// This is the ONLY file allowed to call Toast.show({ type: "error", ... }).
// Biome rule LGUARD-02 (plan 12-09) enforces this.

import { AppError } from "@FixIt/errors";
import Toast from "react-native-toast-message";
import { toAppError } from "./to-app-error";

export function showError(err: AppError | unknown): void {
  const app = err instanceof AppError ? err : toAppError(err);
  switch (app.code) {
    case "UNAUTHENTICATED":
      // auth-interceptor owns refresh + redirect
      return;
    case "VALIDATION":
      // form owns inline field errors
      return;
    case "FORBIDDEN":
      // screen owns ForbiddenState
      return;
    case "NOT_FOUND":
      // screen owns NotFoundState
      return;
    case "NETWORK":
    case "OFFLINE":
    case "TIMEOUT":
      // screen owns QueryError onRetry
      return;
    case "CONFLICT":
    case "RATE_LIMITED":
      Toast.show({
        type: "error",
        text1: app.userMessage,
        text2: "Try again.",
      });
      return;
    case "SERVER":
    case "MAINTENANCE":
    case "UNKNOWN":
    default:
      Toast.show({
        type: "error",
        text1: app.userMessage,
      });
      return;
  }
}
