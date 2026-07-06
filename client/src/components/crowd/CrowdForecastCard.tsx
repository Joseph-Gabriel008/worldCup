/**
 * StadiumPulse AI - Crowd Forecast Card Component
 */
import { Brain, RefreshCw, Clock } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useCrowdStore } from '@/stores/crowdStore';
import { requestForecast } from '@/services/socket';
import { cn } from '@/lib/utils';

export function CrowdForecastCard({ className }: { className?: string }) {
  const { forecast } = useCrowdStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    requestForecast();
    setTimeout(() => setIsRefreshing(false), 2000);
  }, []);

  return (
    <div className={cn('glass-card p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Crowd Forecast</h3>
            <p className="text-xs text-muted-foreground">Gemini-powered predictions</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground disabled:opacity-50"
          aria-label="Refresh forecast"
          title="Refresh forecast"
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
        </button>
      </div>

      {forecast ? (
        <div className="space-y-3">
          <p className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-line">
            {forecast.forecast}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" aria-hidden="true" />
            <span>
              Updated{' '}
              {new Date(forecast.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Generating forecast...</p>
        </div>
      )}
    </div>
  );
}
