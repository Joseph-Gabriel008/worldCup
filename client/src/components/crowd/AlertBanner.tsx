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
      className="space-y-4"
    >
      {activeAlerts.map((alert) => (
        <div
          key={alert.zoneId}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-2xl animate-slide-in border shadow-lg relative overflow-hidden backdrop-blur-md',
            alert.density >= 0.85
              ? 'bg-gradient-to-r from-red-500/20 to-red-900/5 border-red-500/30 text-red-50'
              : 'bg-gradient-to-r from-orange-500/20 to-orange-900/5 border-orange-500/30 text-orange-50',
          )}
        >
          {/* Pulsating background glow */}
          <div className={cn(
            "absolute -left-10 top-1/2 -translate-y-1/2 w-32 h-32 blur-[40px] opacity-40 animate-pulse-glow pointer-events-none",
            alert.density >= 0.85 ? "bg-red-500" : "bg-orange-500"
          )} />
          
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/20 border border-white/10 flex-shrink-0 shadow-inner">
             <AlertTriangle className={cn("w-4 h-4", alert.density >= 0.85 ? "text-red-400" : "text-orange-400")} aria-hidden="true" />
          </div>
          <div className="flex-1 relative z-10 min-w-0">
            <p className="text-sm font-bold tracking-wide truncate">{alert.message}</p>
            <div className="text-[11px] font-medium text-white/60 mt-0.5 uppercase tracking-wider flex items-center gap-1.5 truncate">
               <span className="relative flex w-1.5 h-1.5 shrink-0">
                 <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", alert.density >= 0.85 ? "bg-red-400" : "bg-orange-400")}></span>
                 <span className={cn("relative inline-flex rounded-full w-1.5 h-1.5", alert.density >= 0.85 ? "bg-red-500" : "bg-orange-500")}></span>
               </span>
               <span className="truncate">Density: {Math.round(alert.density * 100)}% — Alternate route suggested</span>
            </div>
          </div>
          <button
            onClick={() => setDismissed((prev) => new Set(prev).add(alert.zoneId))}
            className="p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0 relative z-10 transition-colors"
            aria-label={`Dismiss alert for ${alert.zoneName}`}
          >
            <X className="w-4 h-4 text-white/50 hover:text-white" />
          </button>
        </div>
      ))}
    </div>
  );
}
