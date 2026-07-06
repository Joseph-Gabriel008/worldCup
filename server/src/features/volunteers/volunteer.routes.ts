/**
 * StadiumPulse AI - Volunteer Routes
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import * as volunteerService from './volunteer.service';
import { successResponse, paginatedResponse } from '../../utils/apiResponse';

const router = Router();

// GET /api/volunteers/tasks — task queue
router.get(
  '/tasks',
  authenticate,
  validate({
    query: z.object({
      status: z.string().optional(),
      zoneId: z.string().optional(),
      page: z.string().optional().default('1'),
      limit: z.string().optional().default('20'),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, zoneId, page, limit } = req.query as Record<string, string>;
      const isVolunteer = req.user?.role === 'VOLUNTEER';
      const result = await volunteerService.getTasks({
        assigneeId: isVolunteer ? req.user?.userId : undefined,
        status,
        zoneId,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });
      res.json(paginatedResponse(result.tasks, result.total, result.page, result.limit));
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/volunteers/tasks — create task (organizer/admin)
router.post(
  '/tasks',
  authenticate,
  requireRole('ORGANIZER'),
  validate({
    body: z.object({
      title: z.string().min(3).max(200),
      description: z.string().min(5).max(1000),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      zoneId: z.string().min(1),
      assigneeId: z.string().optional(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await volunteerService.createTask(req.body);
      res.status(201).json(successResponse(task, 'Task created'));
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/volunteers/tasks/:id — update task status
router.patch(
  '/tasks/:id',
  authenticate,
  requireRole('VOLUNTEER', 'ORGANIZER'),
  validate({
    body: z.object({
      status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED']),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await volunteerService.updateTaskStatus(
        req.params.id as string,
        req.body.status,
        req.user?.role === 'VOLUNTEER' ? req.user.userId : undefined,
      );
      res.json(successResponse(task, 'Task updated'));
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/volunteers — list volunteers
router.get(
  '/',
  authenticate,
  requireRole('ORGANIZER'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const volunteers = await volunteerService.getVolunteers();
      res.json(successResponse(volunteers));
    } catch (error) {
      next(error);
    }
  },
);

export default router;
