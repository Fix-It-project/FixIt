import { type Request, type Response, type NextFunction, type RequestHandler } from 'express';

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export const asyncHandler = (fn: AsyncHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export type AsyncMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Structurally identical to asyncHandler; aliased to avoid a duplicate body.
export const asyncMiddleware: (fn: AsyncMiddleware) => RequestHandler =
  asyncHandler;
