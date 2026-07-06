/**
 * StadiumPulse AI - Crowd Routes
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { aiRateLimiter } from '../../middleware/rateLimiter';
import * as crowdService from './crowd.service';
import { successResponse } from '../../utils/apiResponse';

const router = Router();

// GET /api/crowd/zones — all zone densities
router.get('/zones', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const densities = await crowdService.getAllZoneDensities();
    res.json(successResponse(densities));
  } catch (error) {
    next(error);
  }
});

// GET /api/crowd/zones/:id — single zone density
router.get(
  '/zones/:id',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const density = await crowdService.getZoneDensityById(req.params.id as string);
      if (!density) {
        res.status(404).json({ success: false, error: 'Zone not found' });
        return;
      }
      res.json(successResponse(density));
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/crowd/forecast — AI crowd forecast
router.get(
  '/forecast',
  aiRateLimiter,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const forecast = await crowdService.getCrowdForecast();
      res.json(
        successResponse({
          forecast,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/crowd/alerts — current active alerts
router.get('/alerts', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await crowdService.checkAlerts();
    res.json(successResponse(alerts));
  } catch (error) {
    next(error);
  }
});

// GET /api/crowd/history/:zoneId — historical density for a zone
router.get(
  '/history/:zoneId',
  validate({
    params: z.object({ zoneId: z.string().min(1) }),
    query: z.object({ limit: z.string().optional().default('30') }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 30;
      const history = await crowdService.getZoneHistory(req.params.zoneId as string, limit);
      res.json(successResponse(history));
    } catch (error) {
      next(error);
    }
  },
);

export default router;
