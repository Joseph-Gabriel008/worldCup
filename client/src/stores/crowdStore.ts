/**
 * StadiumPulse AI - Crowd Data Store (Zustand)
 */
import { create } from 'zustand';
import type { ZoneDensity, CrowdAlert, CrowdForecast } from '@/types';

interface CrowdState {
  densities: ZoneDensity[];
  alerts: CrowdAlert[];
  forecast: CrowdForecast | null;
  situationSummary: string | null;
  selectedZone: string | null;
  setDensities: (data: ZoneDensity[]) => void;
  setAlerts: (alerts: CrowdAlert[]) => void;
  setForecast: (forecast: CrowdForecast) => void;
  setSituationSummary: (summary: string) => void;
  setSelectedZone: (zoneId: string | null) => void;
}

export const useCrowdStore = create<CrowdState>((set) => ({
  densities: [],
  alerts: [],
  forecast: null,
  situationSummary: null,
  selectedZone: null,

  setDensities: (data) => set({ densities: data }),
  setAlerts: (alerts) => set({ alerts }),
  setForecast: (forecast) => set({ forecast }),
  setSituationSummary: (summary) => set({ situationSummary: summary }),
  setSelectedZone: (zoneId) => set({ selectedZone: zoneId }),
}));
