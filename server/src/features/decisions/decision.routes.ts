/**
 * StadiumPulse AI - Decision Support Routes
 * 
 * Organizer-facing AI decision support endpoints.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { aiRateLimiter } from '../../middleware/rateLimiter';
import { generateDecisionSupport, generateSituationSummary } from '../ai/gemini.service';
import * as crowdService from '../crowd/crowd.service';
import { getRecentIncidents } from '../incidents/incident.service';
import { successResponse } from '../../utils/apiResponse';

const router = Router();

// POST /api/decisions/query — AI decision support query
router.post(
  '/query',
  authenticate,
  requireRole('ORGANIZER'),
  aiRateLimiter,
  validate({
    body: z.object({
      query: z.string().min(5).max(1000),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const densities = await crowdService.getAllZoneDensities();
      const incidents = await getRecentIncidents(30);

      const incidentContext = incidents.map((i: any) => ({
        category: i.category,
        severity: i.severity,
        zoneName: i.zone.name,
        status: i.status,
      }));

      const recommendations = await generateDecisionSupport(
        req.body.query,
        densities,
        incidentContext,
      );

      res.json(
        successResponse({
          query: req.body.query,
          recommendations,
          timestamp: new Date().toISOString(),
          context: {
            totalZones: densities.length,
            criticalZones: densities.filter((z) => z.level === 'CRITICAL').length,
            activeIncidents: incidents.filter((i: any) => i.status !== 'CLOSED').length,
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/decisions/summary — situation summary
router.get(
  '/summary',
  authenticate,
  requireRole('ORGANIZER'),
  aiRateLimiter,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const densities = await crowdService.getAllZoneDensities();
      const incidents = await getRecentIncidents(15);
      const alerts = await crowdService.checkAlerts();

      const summary = await generateSituationSummary(
        densities,
        incidents.map((i: any) => ({
          category: i.category,
          severity: i.severity,
          zoneName: i.zone.name,
          time: i.createdAt.toISOString(),
        })),
        alerts.map((a: any) => a.message),
      );

      res.json(
        successResponse({
          summary,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      next(error);
    }
  },
);

export default router;
