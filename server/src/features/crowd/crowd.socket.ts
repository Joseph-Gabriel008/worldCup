/**
 * StadiumPulse AI - Crowd WebSocket Handler
 *
 * Manages real-time crowd density updates via Socket.io.
 * Emits density data to all connected clients every 5 seconds
 * and triggers alert events when zones exceed safe thresholds.
 *
 * PRODUCTION SCALE NOTE:
 * For multi-server deployment, use the Socket.io Redis adapter
 * to share events across all Node.js instances:
 * `io.adapter(createAdapter(pubClient, subClient))`
 */
import { Server as SocketServer } from 'socket.io';
import * as crowdService from './crowd.service';
import { createLogger } from '../../utils/logger';

const logger = createLogger('CrowdSocket');

const EMIT_INTERVAL_MS = 5_000;       // Emit density updates every 5 seconds
const PERSIST_INTERVAL_MS = 60_000;   // Save snapshot to DB every 60 seconds
const FORECAST_INTERVAL_MS = 60_000;  // Update AI forecast every 60 seconds
const SUMMARY_INTERVAL_MS = 900_000;  // Generate situation summary every 15 minutes

let emitTimer: ReturnType<typeof setInterval> | null = null;
let persistTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Initializes crowd-related WebSocket handlers and background emitters.
 */
export function initCrowdSocket(io: SocketServer): void {
  const crowdNamespace = io.of('/crowd');

  crowdNamespace.on('connection', (socket) => {
    logger.info(`Client connected to /crowd: ${socket.id}`);

    // Send initial data immediately on connect
    crowdService.getAllZoneDensities().then((densities) => {
      socket.emit('density-update', densities);
    }).catch((err) => {
      logger.error('Failed to send initial density', err);
    });

    socket.on('disconnect', () => {
      logger.debug(`Client disconnected from /crowd: ${socket.id}`);
    });

    // Client can request a forecast on demand
    socket.on('request-forecast', async () => {
      try {
        const forecast = await crowdService.getCrowdForecast();
        socket.emit('forecast-update', { forecast, timestamp: new Date().toISOString() });
      } catch (error) {
        logger.error('Forecast request failed', error);
        socket.emit('forecast-update', {
          forecast: 'Unable to generate forecast at this time.',
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  // Background: emit density updates every 5 seconds to all connected clients
  emitTimer = setInterval(async () => {
    try {
      const densities = await crowdService.getAllZoneDensities();
      crowdNamespace.emit('density-update', densities);

      // Check for alerts and emit if needed
      const alerts = await crowdService.checkAlerts();
      if (alerts.length > 0) {
        crowdNamespace.emit('crowd-alert', alerts);
      }
    } catch (error) {
      logger.error('Density emission error', error);
    }
  }, EMIT_INTERVAL_MS);

  // Background: persist snapshots every 60 seconds for historical data
  persistTimer = setInterval(async () => {
    try {
      const densities = await crowdService.getAllZoneDensities();
      await crowdService.persistSnapshot(densities);
    } catch (error) {
      logger.error('Snapshot persistence error', error);
    }
  }, PERSIST_INTERVAL_MS);

  // Background: update AI forecast every 60 seconds and broadcast
  setInterval(async () => {
    try {
      const forecast = await crowdService.getCrowdForecast();
      crowdNamespace.emit('forecast-update', {
        forecast,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Forecast update error', error);
    }
  }, FORECAST_INTERVAL_MS);

  // Background: generate situation summary every 15 minutes
  setInterval(async () => {
    try {
      const { generateSituationSummary } = await import('../ai/gemini.service');
      const densities = await crowdService.getAllZoneDensities();
      const alerts = await crowdService.checkAlerts();

      const summary = await generateSituationSummary(
        densities,
        [], // Recent incidents would come from incident service
        alerts.map((a) => a.message),
      );

      crowdNamespace.emit('situation-summary', {
        summary,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Situation summary error', error);
    }
  }, SUMMARY_INTERVAL_MS);

  logger.info('Crowd WebSocket initialized — emitting every 5s');
}

/**
 * Cleanup function for graceful shutdown.
 */
export function cleanupCrowdSocket(): void {
  if (emitTimer) clearInterval(emitTimer);
  if (persistTimer) clearInterval(persistTimer);
}
