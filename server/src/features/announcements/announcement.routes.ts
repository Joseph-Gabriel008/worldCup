/**
 * StadiumPulse AI - Announcement Routes
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { aiRateLimiter } from '../../middleware/rateLimiter';
import * as announcementService from './announcement.service';
import { successResponse } from '../../utils/apiResponse';

const router = Router();

// POST /api/announcements — create (admin/organizer, triggers multi-language translation)
router.post(
  '/',
  authenticate,
  requireRole('ORGANIZER'),
  aiRateLimiter,
  validate({
    body: z.object({
      text: z.string().min(5).max(1000),
      priority: z.enum(['INFO', 'WARNING', 'EMERGENCY']).optional(),
      expiresAt: z.string().datetime().optional(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const announcement = await announcementService.createAnnouncement(req.body);
      res.status(201).json(successResponse(announcement, 'Announcement created and translated'));
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/announcements — active announcements (public)
router.get(
  '/',
  validate({
    query: z.object({
      language: z.string().optional().default('en'),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const language = (req.query.language as string) || 'en';
      const announcements = await announcementService.getActiveAnnouncements(language);
      res.json(successResponse(announcements));
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/announcements/:id — deactivate (admin/organizer)
router.delete(
  '/:id',
  authenticate,
  requireRole('ORGANIZER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await announcementService.deactivateAnnouncement(req.params.id as string);
      res.json(successResponse(null, 'Announcement deactivated'));
    } catch (error) {
      next(error);
    }
  },
);

export default router;
