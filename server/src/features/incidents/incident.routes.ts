/**
 * StadiumPulse AI - Incident Routes
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { aiRateLimiter } from '../../middleware/rateLimiter';
import * as incidentService from './incident.service';
import { successResponse, paginatedResponse } from '../../utils/apiResponse';

const router = Router();

// POST /api/incidents — create incident (any authenticated user)
router.post(
  '/',
  authenticate,
  aiRateLimiter,
  validate({
    body: z.object({
      title: z.string().min(3).max(200),
      description: z.string().min(10).max(2000),
      zoneId: z.string().min(1),
      photoUrl: z.string().url().optional(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const incident = await incidentService.createIncident({
        ...req.body,
        reporterId: req.user!.userId,
      });
      res.status(201).json(successResponse(incident, 'Incident reported and auto-categorized'));
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/incidents — list incidents (organizer/admin only)
router.get(
  '/',
  authenticate,
  requireRole('ORGANIZER', 'VOLUNTEER'),
  validate({
    query: z.object({
      page: z.string().optional().default('1'),
      limit: z.string().optional().default('20'),
      status: z.string().optional(),
      category: z.string().optional(),
      zoneId: z.string().optional(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, status, category, zoneId } = req.query as Record<string, string>;
      const result = await incidentService.getIncidents({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        status,
        category,
        zoneId,
      });
      res.json(paginatedResponse(result.incidents, result.total, result.page, result.limit));
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/incidents/:id — single incident
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const incident = await incidentService.getIncidentById(req.params.id as string);
      res.json(successResponse(incident));
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/incidents/:id/status — update status (organizer/admin)
router.patch(
  '/:id/status',
  authenticate,
  requireRole('ORGANIZER'),
  validate({
    body: z.object({
      status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const incident = await incidentService.updateIncidentStatus(req.params.id as string, req.body.status);
      res.json(successResponse(incident, 'Status updated'));
    } catch (error) {
      next(error);
    }
  },
);

export default router;
