/**
 * StadiumPulse AI - Express Application Setup
 *
 * Configures middleware, routes, and error handling.
 * The actual HTTP server and Socket.io are set up in server.ts.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { generalRateLimiter } from './middleware/rateLimiter';

// Route imports
import authRoutes from './features/auth/auth.routes';
import crowdRoutes from './features/crowd/crowd.routes';
import navRoutes from './features/navigation/nav.routes';
import incidentRoutes from './features/incidents/incident.routes';
import volunteerRoutes from './features/volunteers/volunteer.routes';
import announcementRoutes from './features/announcements/announcement.routes';
import decisionRoutes from './features/decisions/decision.routes';

const app = express();

// ── Security Middleware ─────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  }),
);

// ── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── General Rate Limiting ───────────────────────────────────
app.use(generalRateLimiter);

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/navigation', navRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/decisions', decisionRoutes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// ── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

export default app;
