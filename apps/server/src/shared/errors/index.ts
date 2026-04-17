import { AppError } from './app-error.js';

export { AppError };

export function normalizeError(err: unknown): { status: number; message: string } {
  if (err instanceof AppError) {
    return { status: err.status, message: err.message };
  }
  if (err instanceof Error) {
    return { status: 500, message: err.message };
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const e = err as { status?: number; message: string };
    return { status: e.status ?? 500, message: e.message };
  }
  return { status: 500, message: 'Internal server error' };
}
