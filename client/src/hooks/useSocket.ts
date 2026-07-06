/**
 * StadiumPulse AI - Custom Hooks: useSocket
 */
import { useEffect, useRef } from 'react';
import { connectCrowdSocket, disconnectCrowdSocket } from '@/services/socket';
import { useCrowdStore } from '@/stores/crowdStore';

export function useSocket() {
  const hasConnected = useRef(false);
  const { setDensities, setAlerts, setForecast, setSituationSummary } = useCrowdStore();

  useEffect(() => {
    if (hasConnected.current) return;
    hasConnected.current = true;

    connectCrowdSocket({
      onDensityUpdate: setDensities,
      onCrowdAlert: setAlerts,
      onForecastUpdate: setForecast,
      onSituationSummary: (data) => setSituationSummary(data.summary),
    });

    return () => {
      disconnectCrowdSocket();
      hasConnected.current = false;
    };
  }, [setDensities, setAlerts, setForecast, setSituationSummary]);
}
