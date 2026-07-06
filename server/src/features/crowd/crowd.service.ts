/**
 * StadiumPulse AI - Crowd Management Service
 *
 * Core crowd density engine: reads mock sensor data, maintains history,
 * triggers alerts, and coordinates with GenAI for forecasting.
 */
import cache from '../../config/cache';
import prisma from '../../config/database';
import { generateCrowdSnapshot, getZoneDensity, ZoneDensity } from '../../data/mockSensorGenerator';
import { generateCrowdForecast } from '../ai/gemini.service';
import { createLogger } from '../../utils/logger';

const logger = createLogger('CrowdService');

// Alert threshold — zones above this density trigger notifications
const ALERT_THRESHOLD = 0.75;

/**
 * Gets the latest crowd density snapshot for all zones.
 * Results are cached for 5 seconds (the update interval).
 */
export async function getAllZoneDensities(): Promise<ZoneDensity[]> {
  const cached = await cache.get('crowd:all');
  if (cached) {
    return JSON.parse(cached) as ZoneDensity[];
  }

  const snapshot = generateCrowdSnapshot();
  await cache.set('crowd:all', JSON.stringify(snapshot), 5);
  return snapshot;
}

/**
 * Gets density for a single zone by ID.
 */
export async function getZoneDensityById(zoneId: string): Promise<ZoneDensity | null> {
  return getZoneDensity(zoneId);
}

/**
 * Generates an AI-powered crowd forecast based on current data.
 * Debounced internally by the Gemini service (30s cooldown).
 */
export async function getCrowdForecast(): Promise<string> {
  const densities = await getAllZoneDensities();
  return generateCrowdForecast(densities);
}

/**
 * Checks all zones for alert conditions and returns any active alerts.
 * An alert is triggered when density exceeds ALERT_THRESHOLD (75%).
 */
export async function checkAlerts(): Promise<
  Array<{
    zoneId: string;
    zoneName: string;
    density: number;
    level: string;
    message: string;
  }>
> {
  const densities = await getAllZoneDensities();
  const alerts = densities
    .filter((z) => z.density >= ALERT_THRESHOLD)
    .map((z) => ({
      zoneId: z.zoneId,
      zoneName: z.zoneName,
      density: z.density,
      level: z.level,
      message: `${z.zoneName} is at ${Math.round(z.density * 100)}% capacity. Consider redirecting foot traffic.`,
    }));

  return alerts;
}

/**
 * Persists a crowd snapshot to the database for historical analysis.
 * Called periodically to build the dataset used for AI forecasting.
 *
 * PRODUCTION SCALE NOTE:
 * In production, crowd snapshots would be written to a time-series database
 * (e.g., TimescaleDB, InfluxDB) for efficient range queries and aggregation.
 */
export async function persistSnapshot(densities: ZoneDensity[]): Promise<void> {
  try {
    await prisma.crowdSnapshot.createMany({
      data: densities.map((z) => ({
        zoneId: z.zoneId,
        density: z.density,
        count: z.currentCount,
      })),
    });
  } catch (error) {
    logger.error('Failed to persist crowd snapshot', error);
  }
}

/**
 * Gets historical density data for a zone (last N records).
 * Used by the AI forecast module for trend analysis.
 */
export async function getZoneHistory(
  zoneId: string,
  limit = 30,
): Promise<Array<{ density: number; count: number; timestamp: Date }>> {
  return prisma.crowdSnapshot.findMany({
    where: { zoneId },
    orderBy: { timestamp: 'desc' },
    take: limit,
    select: { density: true, count: true, timestamp: true },
  });
}
