import type { Request, Response, NextFunction } from 'express';
import { type ZodTypeAny } from 'zod';

type ValidationTarget = 'body' | 'params' | 'query';

interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const targets: ValidationTarget[] = ['params', 'query', 'body'];

    for (const target of targets) {
      const schema = schemas[target];
      if (!schema) continue;

      const result = schema.safeParse(req[target]);
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.length > 0 ? issue.path.join('.') : '_root',
          message: issue.message,
        }));
        res.status(400).json({
          error: details[0]?.message ?? 'Validation failed',
          details,
        });
        return;
      }

      (req as any)[target] = result.data;
    }

    next();
  };
}
