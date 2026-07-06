/**
 * StadiumPulse AI - Mock Socket Service
 *
 * Provides mock real-time data for Netlify frontend-only deployments.
 */
import type { ZoneDensity, CrowdAlert, CrowdForecast } from '@/types';

// Mock Socket Type to prevent breaking changes in hooks
type MockSocket = {
  connected: boolean;
  on: (event: string, callback: any) => void;
  emit: (event: string, data?: any) => void;
  disconnect: () => void;
};

let mockSocket: MockSocket | null = null;
let intervalId: any = null;

const mockZones: ZoneDensity[] = [
  { zoneId: 'north-gate', zoneName: 'North Gate', zoneType: 'GATE', currentCount: 850, capacity: 1000, density: 85, level: 'HIGH', trend: 'RISING', timestamp: new Date().toISOString() },
  { zoneId: 'food-court', zoneName: 'Food Court', zoneType: 'CONCESSION', currentCount: 200, capacity: 500, density: 40, level: 'LOW', trend: 'STABLE', timestamp: new Date().toISOString() },
  { zoneId: 'merch-stand', zoneName: 'Merchandise Stand', zoneType: 'RETAIL', currentCount: 190, capacity: 200, density: 95, level: 'CRITICAL', trend: 'RISING', timestamp: new Date().toISOString() },
];

export function connectCrowdSocket(callbacks: {
  onDensityUpdate?: (data: ZoneDensity[]) => void;
  onCrowdAlert?: (alerts: CrowdAlert[]) => void;
  onForecastUpdate?: (forecast: CrowdForecast) => void;
  onSituationSummary?: (data: { summary: string; timestamp: string }) => void;
}): MockSocket {
  if (mockSocket?.connected) return mockSocket;

  mockSocket = {
    connected: true,
    on: () => {},
    emit: (event) => {
      if (event === 'request-forecast') {
        callbacks.onForecastUpdate?.({
          forecast: JSON.stringify({
            timestamps: ['12:00', '13:00', '14:00', '15:00', '16:00'],
            series: [
              { name: 'North Gate', data: [30, 45, 85, 90, 60] },
              { name: 'Food Court', data: [10, 20, 40, 80, 50] },
            ]
          }),
          timestamp: new Date().toISOString()
        });
      }
    },
    disconnect: () => {
      if (intervalId) clearInterval(intervalId);
      mockSocket = null;
    }
  };

  // Simulate initial load
  setTimeout(() => {
    callbacks.onDensityUpdate?.(mockZones);
    callbacks.onCrowdAlert?.([
      { zoneId: 'north-gate', zoneName: 'North Gate', density: 85, message: 'High density at North Gate', level: 'HIGH' },
      { zoneId: 'merch-stand', zoneName: 'Merchandise Stand', density: 95, message: 'Critical density at Merchandise Stand.', level: 'CRITICAL' }
    ]);
    callbacks.onSituationSummary?.({ summary: "Overall situation is stable. High density observed at the merchandise stand.", timestamp: new Date().toISOString() });
  }, 1000);

  // Simulate periodic updates
  intervalId = setInterval(() => {
    const updatedZones = mockZones.map(zone => {
      const newDensity = Math.max(0, Math.min(100, zone.density + (Math.random() * 10 - 5)));
      return {
        ...zone,
        density: newDensity,
        currentCount: Math.floor((newDensity / 100) * zone.capacity),
        timestamp: new Date().toISOString()
      };
    });
    callbacks.onDensityUpdate?.(updatedZones);
  }, 5000);

  return mockSocket;
}

export function requestForecast(): void {
  mockSocket?.emit('request-forecast');
}

export function disconnectCrowdSocket(): void {
  mockSocket?.disconnect();
}
