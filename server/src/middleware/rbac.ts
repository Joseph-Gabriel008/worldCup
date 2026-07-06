/**
 * StadiumPulse AI - Role-Based Access Control Middleware
 *
 * Guards routes based on user roles. Must be used after authenticate middleware.
 * Supports multiple allowed roles per route.
 */
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

type Role = 'FAN' | 'VOLUNTEER' | 'ORGANIZER' | 'ADMIN';

/**
 * Creates middleware that restricts access to specified roles.
 * ADMIN role always has access to everything.
 *
 * @example
 * router.get('/dashboard', authenticate, requireRole('ORGANIZER'), handler);
 * router.post('/tasks', authenticate, requireRole('ORGANIZER', 'ADMIN'), handler);
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const userRole = req.user.role as Role;

    // ADMIN always has access
    if (userRole === 'ADMIN' || allowedRoles.includes(userRole)) {
      next();
      return;
    }

    throw new ForbiddenError(
      `Role '${userRole}' is not authorized. Required: ${allowedRoles.join(' or ')}`,
    );
  };
}
