/**
 * StadiumPulse AI - Navigation Routes
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { aiRateLimiter } from '../../middleware/rateLimiter';
import * as navService from './nav.service';
import { successResponse } from '../../utils/apiResponse';

const router = Router();

// POST /api/navigation/ask — AI-powered navigation chat
router.post(
  '/ask',
  aiRateLimiter,
  validate({
    body: z.object({
      query: z.string().min(1, 'Query is required').max(500),
      currentLocation: z.string().optional(),
      language: z.string().default('en'),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query, currentLocation, language } = req.body;
      const result = await navService.askNavigation(query, currentLocation, language);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/navigation/directions — pathfinding between two zones
router.get(
  '/directions',
  validate({
    query: z.object({
      from: z.string().min(1, 'From zone is required'),
      to: z.string().min(1, 'To zone is required'),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.query as { from: string; to: string };
      const path = navService.findShortestPath(from, to);
      res.json(successResponse(path));
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/navigation/venue — venue layout data for map
router.get('/venue', (_req: Request, res: Response) => {
  const zones = navService.getVenueZones();
  const info = navService.getVenueInfo();
  res.json(successResponse({ info, zones }));
});

export default router;
