/**
 * StadiumPulse AI - Organizer Dashboard
 *
 * Central operations command center with:
 * - Live incident feed
 * - Crowd heatmap
 * - AI decision support panel
 * - Auto-generated situation summaries
 */
import { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Brain,
  Send,
  Loader2,
  FileText,
  Activity,
  Clock,
} from 'lucide-react';
import { StadiumMap } from '@/components/maps/StadiumMap';
import { CrowdForecastCard } from '@/components/crowd/CrowdForecastCard';
import { useCrowdStore } from '@/stores/crowdStore';
import * as api from '@/services/api';
import type { Incident } from '@/types';
import { cn } from '@/lib/utils';

export default function OrganizerDashboard() {
  const { densities, situationSummary } = useCrowdStore();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dsQuery, setDsQuery] = useState('');
  const [dsResponse, setDsResponse] = useState('');
  const [dsLoading, setDsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [latestSummary, setLatestSummary] = useState<string | null>(null);

  useEffect(() => {
    api.getIncidents({ page: 1, status: 'OPEN' }).then((res) => {
      if (res.success && res.data) setIncidents(res.data);
    });
  }, []);

  useEffect(() => {
    if (situationSummary) setLatestSummary(situationSummary);
  }, [situationSummary]);

  const handleDecisionQuery = useCallback(async () => {
    if (!dsQuery.trim() || dsLoading) return;
    setDsLoading(true);
    try {
      const res = await api.queryDecisionSupport(dsQuery);
      if (res.success && res.data) {
        setDsResponse(res.data.recommendations);
      }
    } catch {
      setDsResponse('Unable to generate recommendations at this time.');
    } finally {
      setDsLoading(false);
    }
  }, [dsQuery, dsLoading]);

  const handleGetSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await api.getSituationSummary();
      if (res.success && res.data) {
        setLatestSummary(res.data.summary);
      }
    } catch {
      setLatestSummary('Unable to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await api.updateIncidentStatus(id, status);
    if (res.success) {
      setIncidents((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: status as Incident['status'] } : i)),
      );
    }
  };

  const criticalCount = densities.filter((z) => z.level === 'CRITICAL').length;
  const highCount = densities.filter((z) => z.level === 'HIGH').length;

  return (
    <div className="page-shell max-w-screen-2xl mx-auto px-4 py-6 lg:py-8 space-y-6 lg:space-y-8 relative">
      {/* Decorative Blur (Animated) */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none animate-float delay-200" />
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 animate-slide-in">
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <LayoutDashboard className="w-6 h-6 text-white relative z-10" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm leading-none">Operations Command Center</h1>
            <p className="text-[0.95rem] font-medium text-slate-400 mt-2 max-w-2xl leading-relaxed">Real-time stadium overview for monitoring crowd pressure, incidents, and AI-supported decision making.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="animate-slide-up delay-100">
            <StatusBadge label="Critical Zones" count={criticalCount} color="text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]" />
          </div>
          <div className="animate-slide-up delay-200">
            <StatusBadge label="High Zones" count={highCount} color="text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]" />
          </div>
          <div className="animate-slide-up delay-300">
            <StatusBadge label="Open Incidents" count={incidents.length} color="text-yellow-400 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left: Map + Forecast */}
        <div className="xl:col-span-2 space-y-8">
          <div className="glass-card p-4 sm:p-5 lg:p-6 flex flex-col relative overflow-hidden group animate-slide-up delay-400 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Activity className="w-4 h-4 text-primary" aria-hidden="true" />
              </div>
              Live Crowd Heatmap
            </h2>
            <div className="flex-1 relative rounded-xl overflow-hidden border border-white/5 bg-slate-900/50 shadow-inner min-h-[20rem] sm:min-h-[24rem] lg:min-h-[32rem]">
              <StadiumMap className="w-full h-[20rem] sm:h-[24rem] lg:h-[32rem] object-cover" />
            </div>
          </div>

          <div className="animate-slide-up delay-500">
            <CrowdForecastCard />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Situation Summary */}
          <div className="glass-card p-4 sm:p-5 lg:p-6 flex flex-col relative overflow-hidden animate-slide-up delay-300 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-accent/20 border border-accent/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <FileText className="w-4 h-4 text-accent" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white">Situation Summary</h3>
              </div>
              <button
                onClick={handleGetSummary}
                disabled={summaryLoading}
                className="text-[10px] font-bold uppercase tracking-wider text-accent hover:text-white disabled:opacity-50 flex items-center gap-1.5 transition-colors bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-lg border border-accent/20"
              >
                {summaryLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Refresh
              </button>
            </div>
            
            <div className="relative z-10 flex-1">
              {latestSummary ? (
                <div className="text-[0.95rem] font-medium text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-xl border border-white/5 shadow-inner">
                  {latestSummary}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center bg-slate-900/30 rounded-xl border border-white/5 border-dashed">
                  <p className="text-sm font-medium text-slate-400">No summary available.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Decision Support */}
          <div className="glass-card p-4 sm:p-5 lg:p-6 flex flex-col relative overflow-hidden animate-slide-up delay-400 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-4 relative z-10">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Brain className="w-4 h-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Decision Support</h3>
            </div>
            
            <div className="flex gap-3 mb-5 relative z-10">
              <input
                type="text"
                value={dsQuery}
                onChange={(e) => setDsQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDecisionQuery()}
                placeholder="e.g. What if Gate 3 exceeds capacity?"
                className="flex-1 bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-500 rounded-lg px-3 py-2.5 text-[0.95rem] outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                aria-label="Decision support query"
              />
              <button
                onClick={handleDecisionQuery}
                disabled={dsLoading || !dsQuery.trim()}
                className="px-4 rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center"
                aria-label="Submit query"
              >
                {dsLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            
            {dsResponse && (
              <div className="relative z-10 text-sm font-medium text-slate-300 leading-relaxed whitespace-pre-line bg-primary/5 border border-primary/20 rounded-xl p-4 max-h-60 overflow-y-auto custom-scrollbar shadow-inner animate-fade-in">
                {dsResponse}
              </div>
            )}
          </div>

          {/* Incident Feed */}
          <div className="glass-card p-4 sm:p-5 lg:p-6 flex flex-col relative overflow-hidden animate-slide-up delay-500 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-4 relative z-10">
              <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <AlertTriangle className="w-4 h-4 text-orange-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white">Active Incidents</h3>
            </div>
            
            <div className="space-y-4 max-h-[24rem] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {incidents.length > 0 ? (
                incidents.map((incident) => (
                  <div key={incident.id} className="bg-slate-900/50 border border-white/5 rounded-xl p-4 space-y-3 hover:bg-slate-800/60 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.95rem] font-bold text-slate-100 leading-snug">{incident.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 flex items-center gap-2">
                          <span className="bg-slate-800 px-2 py-1 rounded-md border border-white/5">{incident.zone?.name}</span>
                          <span>•</span>
                          <span className="text-accent">{incident.category}</span>
                        </p>
                      </div>
                      <span
                        className={cn(
                          'text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest shadow-sm border shrink-0',
                          incident.severity === 'CRITICAL'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : incident.severity === 'HIGH'
                              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        )}
                      >
                        {incident.severity}
                      </span>
                    </div>
                    
                    {incident.aiSummary && (
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 shadow-inner">
                        <p className="text-xs font-medium text-slate-300 leading-relaxed">
                          <span className="font-bold text-primary mr-1.5 uppercase tracking-wider text-[9px]">AI Insight:</span>
                          {incident.aiSummary}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2.5 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'IN_PROGRESS')}
                        className="flex-1 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all hover:shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'RESOLVED')}
                        className="flex-1 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center bg-slate-900/30 rounded-xl border border-white/5 border-dashed">
                  <p className="text-sm font-medium text-slate-400">No active incidents</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg', color)}>
      <Clock className="w-4 h-4 opacity-70" aria-hidden="true" />
      <span className="text-xl tracking-tight">{count}</span>
      <span className="text-[10px] uppercase tracking-widest opacity-90">{label}</span>
    </div>
  );
}
