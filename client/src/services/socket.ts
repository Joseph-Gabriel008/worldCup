/**
 * StadiumPulse AI - Socket.io Client Service
 */
import { io, Socket } from 'socket.io-client';
import type { ZoneDensity, CrowdAlert, CrowdForecast } from '@/types';

const WS_URL = import.meta.env.VITE_WS_URL || window.location.origin;

let crowdSocket: Socket | null = null;

export function connectCrowdSocket(callbacks: {
  onDensityUpdate?: (data: ZoneDensity[]) => void;
  onCrowdAlert?: (alerts: CrowdAlert[]) => void;
  onForecastUpdate?: (forecast: CrowdForecast) => void;
  onSituationSummary?: (data: { summary: string; timestamp: string }) => void;
}): Socket {
  if (crowdSocket?.connected) return crowdSocket;

  crowdSocket = io(`${WS_URL}/crowd`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  crowdSocket.on('connect', () => {
    // Connection established
  });

  crowdSocket.on('density-update', (data: ZoneDensity[]) => {
    callbacks.onDensityUpdate?.(data);
  });

  crowdSocket.on('crowd-alert', (alerts: CrowdAlert[]) => {
    callbacks.onCrowdAlert?.(alerts);
  });

  crowdSocket.on('forecast-update', (forecast: CrowdForecast) => {
    callbacks.onForecastUpdate?.(forecast);
  });

  crowdSocket.on('situation-summary', (data: { summary: string; timestamp: string }) => {
    callbacks.onSituationSummary?.(data);
  });

  return crowdSocket;
}

export function requestForecast(): void {
  crowdSocket?.emit('request-forecast');
}

export function disconnectCrowdSocket(): void {
  crowdSocket?.disconnect();
  crowdSocket = null;
}
