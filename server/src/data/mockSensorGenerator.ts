/**
 * StadiumPulse AI - Mock Sensor Data Generator
 *
 * Simulates IoT crowd density sensors for each stadium zone.
 * Generates realistic patterns:
 * - Pre-match: gradual buildup at gates, then flow to seating
 * - Match time: high density in seating, moderate in food courts at halftime
 * - Post-match: surge at gates and exits
 *
 * PRODUCTION SCALE NOTE:
 * In a real deployment, this would be replaced by:
 * - Turnstile counter APIs (FIFA ticketing integration)
 * - Computer vision crowd counting from CCTV feeds
 * - WiFi/BLE device density sensors per zone
 * - LiDAR people-counting sensors at choke points
 * Each would publish to a message queue (e.g., Kafka) consumed by this service.
 */

import venueData from './venueGraph.json';

export interface ZoneDensity {
  zoneId: string;
  zoneName: string;
  zoneType: string;
  currentCount: number;
  capacity: number;
  density: number; // 0.0 to 1.0
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  trend: 'RISING' | 'STABLE' | 'FALLING';
  timestamp: string;
}

// Internal state tracking for each zone
interface ZoneState {
  prevDensity: number;
  currentDensity: number;
}

const zoneStates: Map<string, ZoneState> = new Map();

// Initialize zone states
for (const zone of venueData.zones) {
  zoneStates.set(zone.id, {
    prevDensity: 0.1 + Math.random() * 0.2,
    currentDensity: 0.1 + Math.random() * 0.2,
  });
}

/**
 * Calculates a simulated density value using sinusoidal patterns with noise.
 *
 * The simulation models a ~4 hour event window:
 * - t=0 to t=60 min: Pre-match buildup (gates spike, seating fills gradually)
 * - t=60 to t=105 min: First half (seating high, gates low)
 * - t=105 to t=120 min: Halftime (food courts spike, some gate movement)
 * - t=120 to t=165 min: Second half (seating high again)
 * - t=165+: Post-match (gates and exits spike, seating empties)
 */
function calculateDensity(zoneType: string, _zoneId: string): number {
  const now = Date.now();
  // Use a 4-hour cycle (14400 seconds)
  const cyclePosition = (now % 14_400_000) / 14_400_000;
  const minuteInCycle = cyclePosition * 240; // 0-240 minutes

  let baseDensity: number;

  switch (zoneType) {
    case 'GATE': {
      // Gates: high pre-match (0-60min), low during play, high post-match (165+)
      if (minuteInCycle < 60) {
        baseDensity = 0.3 + 0.5 * Math.sin((minuteInCycle / 60) * Math.PI);
      } else if (minuteInCycle < 165) {
        baseDensity = 0.1 + 0.15 * Math.sin((minuteInCycle / 30) * Math.PI);
      } else {
        baseDensity = 0.4 + 0.5 * Math.sin(((minuteInCycle - 165) / 75) * Math.PI);
      }
      break;
    }
    case 'SEATING': {
      // Seating: fills during pre-match, stays high during play, empties post-match
      if (minuteInCycle < 60) {
        baseDensity = 0.1 + 0.7 * (minuteInCycle / 60);
      } else if (minuteInCycle < 105) {
        baseDensity = 0.75 + 0.15 * Math.sin((minuteInCycle / 20) * Math.PI);
      } else if (minuteInCycle < 120) {
        baseDensity = 0.6 + 0.1 * Math.random(); // halftime dip
      } else if (minuteInCycle < 165) {
        baseDensity = 0.8 + 0.1 * Math.sin((minuteInCycle / 20) * Math.PI);
      } else {
        baseDensity = Math.max(0.05, 0.8 - 0.8 * ((minuteInCycle - 165) / 75));
      }
      break;
    }
    case 'FOOD_COURT': {
      // Food: moderate normally, spikes at halftime
      if (minuteInCycle >= 100 && minuteInCycle <= 125) {
        baseDensity = 0.6 + 0.3 * Math.sin(((minuteInCycle - 100) / 25) * Math.PI);
      } else {
        baseDensity = 0.2 + 0.2 * Math.sin((minuteInCycle / 40) * Math.PI);
      }
      break;
    }
    case 'RESTROOM': {
      // Restrooms: moderate spikes at halftime and pre-match
      if (minuteInCycle >= 100 && minuteInCycle <= 125) {
        baseDensity = 0.5 + 0.35 * Math.sin(((minuteInCycle - 100) / 25) * Math.PI);
      } else {
        baseDensity = 0.2 + 0.25 * Math.sin((minuteInCycle / 30) * Math.PI);
      }
      break;
    }
    case 'CONCOURSE': {
      // Concourses: flow-through, moderate most of the time
      baseDensity = 0.3 + 0.3 * Math.sin((minuteInCycle / 40) * Math.PI);
      break;
    }
    case 'MEDICAL': {
      // Medical: generally low
      baseDensity = 0.05 + 0.15 * Math.random();
      break;
    }
    case 'EXIT': {
      // Exits: surge post-match
      if (minuteInCycle >= 165) {
        baseDensity = 0.3 + 0.6 * Math.sin(((minuteInCycle - 165) / 75) * Math.PI);
      } else {
        baseDensity = 0.05 + 0.1 * Math.random();
      }
      break;
    }
    default:
      baseDensity = 0.2;
  }

  // Add random noise (±10%)
  const noise = (Math.random() - 0.5) * 0.2;
  return Math.max(0.01, Math.min(0.99, baseDensity + noise));
}

/**
 * Determines density level and color code.
 * Density thresholds align with international crowd safety standards.
 */
function getDensityLevel(density: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
  if (density < 0.4) return 'LOW';
  if (density < 0.65) return 'MODERATE';
  if (density < 0.85) return 'CRITICAL';
  return 'CRITICAL';
}

/**
 * Determines crowd trend based on previous vs current density.
 */
function getTrend(prev: number, current: number): 'RISING' | 'STABLE' | 'FALLING' {
  const delta = current - prev;
  if (delta > 0.05) return 'RISING';
  if (delta < -0.05) return 'FALLING';
  return 'STABLE';
}

/**
 * Generates a single tick of crowd density data for all zones.
 * Called every 5 seconds by the WebSocket emitter.
 */
export function generateCrowdSnapshot(): ZoneDensity[] {
  return venueData.zones.map((zone) => {
    const state = zoneStates.get(zone.id)!;
    const newDensity = calculateDensity(zone.type, zone.id);

    // Update state for trend tracking
    state.prevDensity = state.currentDensity;
    state.currentDensity = newDensity;

    const roundedDensity = Math.round(newDensity * 1000) / 1000;
    const currentCount = Math.round(roundedDensity * zone.capacity);

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      zoneType: zone.type,
      currentCount,
      capacity: zone.capacity,
      density: roundedDensity,
      level: getDensityLevel(roundedDensity),
      trend: getTrend(state.prevDensity, state.currentDensity),
      timestamp: new Date().toISOString(),
    };
  });
}

/**
 * Gets the current density for a specific zone.
 */
export function getZoneDensity(zoneId: string): ZoneDensity | null {
  const zone = venueData.zones.find((z) => z.id === zoneId);
  if (!zone) return null;

  const state = zoneStates.get(zone.id);
  if (!state) return null;

  const roundedDensity = Math.round(state.currentDensity * 1000) / 1000;

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    zoneType: zone.type,
    currentCount: Math.round(roundedDensity * zone.capacity),
    capacity: zone.capacity,
    density: roundedDensity,
    level: getDensityLevel(roundedDensity),
    trend: getTrend(state.prevDensity, state.currentDensity),
    timestamp: new Date().toISOString(),
  };
}
