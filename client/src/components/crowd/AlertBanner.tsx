/**
 * StadiumPulse AI - Alert Banner Component
 *
 * Live region for real-time crowd density alerts.
 * Uses aria-live="assertive" for screen reader announcements.
 * Includes AI-suggested alternate routes.
 */
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { useCrowdStore } from '@/stores/crowdStore';
import { cn } from '@/lib/utils';

export function AlertBanner() {
  const { alerts } = useCrowdStore();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const activeAlerts = alerts.filter((a) => !dismissed.has(a.zoneId));

  if (activeAlerts.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="space-y-2"
    >
      {activeAlerts.map((alert) => (
        <div
          key={alert.zoneId}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl animate-slide-in border',
            alert.density >= 0.85
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          )}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium">{alert.message}</p>
            <p className="text-xs opacity-75 mt-0.5">
              Density: {Math.round(alert.density * 100)}% — Consider using an alternate route
            </p>
          </div>
          <button
            onClick={() => setDismissed((prev) => new Set(prev).add(alert.zoneId))}
            className="p-1 rounded hover:bg-white/10 flex-shrink-0"
            aria-label={`Dismiss alert for ${alert.zoneName}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
