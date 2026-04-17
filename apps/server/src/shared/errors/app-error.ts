export class AppError extends Error {
  readonly status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 400);
  }

  static unauthorized(message: string): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message: string): AppError {
    return new AppError(message, 403);
  }

  static notFound(message: string): AppError {
    return new AppError(message, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409);
  }
}
