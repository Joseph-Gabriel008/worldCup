/**
 * StadiumPulse AI - Request Validation Middleware
 *
 * Uses Zod schemas to validate request body, query params, and URL params.
 * Returns structured 400 errors for invalid input with field-level details.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Creates validation middleware for Express routes.
 *
 * @example
 * router.post('/users', validate({ body: createUserSchema }), handler);
 * router.get('/users/:id', validate({ params: userIdSchema }), handler);
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details,
        });
        return;
      }
      next(error);
    }
  };
}
