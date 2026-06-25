import { type ErrorRequestHandler, type Request, type Response } from 'express';
import { AppError } from './app-error.js';
import { randomUUID } from 'node:crypto';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  userMessage: string;
  token?: string;
  fields?: Record<string, string>;
  traceId: string;
  timestamp: string;
}

const getHttpStatusTitle = (status: number): string => {
  const statusTitles: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    500: 'Internal Server Error',
  };
  return statusTitles[status] || 'Internal Server Error';
};

export const finalErrorMiddleware: ErrorRequestHandler = (err, req: Request, res: Response, _next) => {
  const traceId = String((req as any).id || randomUUID());
  const timestamp = new Date().toISOString();

  let status = 500;
  let code = 'INTERNAL_ERROR';
  let detail = 'An unexpected error occurred';
  let userMessage = detail;
  let token: string | undefined;
  let fields: Record<string, string> | undefined;

  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    detail = err.message;
    userMessage = err.userMessage;
    token = err.opts.token;
    fields = err.opts.fields;
  } else {
    req.log.error(
      {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        path: req.path,
        userId: (req as any).user?.id,
        traceId,
      },
      'Unexpected error occurred'
    );
  }

  const problemDetails: ProblemDetails = {
    type: `https://api.fixit.local/errors/${code.toLowerCase()}`,
    title: getHttpStatusTitle(status),
    status,
    detail,
    instance: req.path,
    code,
    userMessage,
    ...(token ? { token } : {}),
    ...(fields ? { fields } : {}),
    traceId,
    timestamp,
  };

  req.log.error(
    {
      code,
      path: req.path,
      userId: (req as any).user?.id,
      traceId,
    },
    `Error: ${code}`
  );

  res.setHeader('Content-Type', 'application/problem+json');
  res.status(status).json(problemDetails);
};
