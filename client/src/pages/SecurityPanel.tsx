/**
 * StadiumPulse AI - Security Panel
 *
 * Live crowd density monitoring with alerts and incident overview.
 */
import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Activity, Eye } from 'lucide-react';
import { StadiumMap } from '@/components/maps/StadiumMap';
import { AlertBanner } from '@/components/crowd/AlertBanner';
import { CrowdForecastCard } from '@/components/crowd/CrowdForecastCard';
import { useCrowdStore } from '@/stores/crowdStore';
import * as api from '@/services/api';
import type { Incident } from '@/types';
import { cn } from '@/lib/utils';

export default function SecurityPanel() {
  const { densities, alerts } = useCrowdStore();
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    api.getIncidents({ page: 1 }).then((res) => {
      if (res.success && res.data) setIncidents(res.data);
    });
  }, []);

  const securityIncidents = incidents.filter((i) => i.category === 'SECURITY' || i.category === 'CROWD');

  return (
    <div className="page-shell max-w-screen-2xl mx-auto px-4 py-6 lg:py-8 space-y-6 lg:space-y-8 animate-fade-in relative">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20 border border-white/10">
          <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm leading-none">Security Command</h1>
          <p className="text-sm font-medium text-slate-400 mt-1 max-w-2xl leading-relaxed flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {alerts.length} active alerts</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> {securityIncidents.length} security incidents</span>
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      <AlertBanner />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 lg:gap-8">
        
        {/* Live Map */}
        <div className="lg:col-span-1 xl:col-span-3 glass-card p-4 sm:p-5 lg:p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
              <Eye className="w-4 h-4 text-red-400" aria-hidden="true" />
            </div>
            Live Surveillance View
          </h2>
          <div className="flex-1 relative rounded-xl overflow-hidden border border-white/5 bg-slate-900/50 shadow-inner min-h-[20rem] sm:min-h-[24rem] lg:min-h-[32rem]">
            <StadiumMap className="w-full h-[20rem] sm:h-[24rem] lg:h-[32rem] object-cover" />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 xl:col-span-2 flex flex-col gap-8 h-full">
          <CrowdForecastCard />

          {/* Zone Density Table */}
          <div className="glass-card p-4 sm:p-5 lg:p-6 flex flex-col relative overflow-hidden flex-1">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5 relative z-10">
              <div className="p-2 rounded-lg bg-accent/20 border border-accent/30">
                <Activity className="w-4 h-4 text-accent" aria-hidden="true" />
              </div>
              Zone Status
            </h3>
            
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-3 custom-scrollbar relative z-10" role="table" aria-label="Zone density status">
              {densities
                .sort((a, b) => b.density - a.density)
                .map((zone) => (
                  <div
                    key={zone.zoneId}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20 transition-all duration-300"
                    role="row"
                  >
                    <span className="text-[0.95rem] font-semibold text-slate-200 truncate max-w-[12rem]" role="cell">
                      {zone.zoneName}
                    </span>
                    <div className="flex items-center gap-3" role="cell">
                      <div className="w-20 h-2 bg-slate-900/80 rounded-full overflow-hidden shadow-inner border border-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-500 shadow-[0_0_10px_currentColor]"
                          style={{
                            width: `${Math.round(zone.density * 100)}%`,
                            backgroundColor:
                              zone.level === 'CRITICAL' ? '#ef4444'
                                : zone.level === 'HIGH' ? '#f97316'
                                : zone.level === 'MODERATE' ? '#eab308'
                                : '#10b981',
                            color: zone.level === 'CRITICAL' ? 'rgba(239,68,68,0.5)'
                                : zone.level === 'HIGH' ? 'rgba(249,115,22,0.5)'
                                : zone.level === 'MODERATE' ? 'rgba(234,179,8,0.5)'
                                : 'rgba(16,185,129,0.5)',
                          }}
                        />
                      </div>
                      <span className={cn('text-xs font-bold tracking-wider w-10 text-right uppercase', `density-${zone.level.toLowerCase()}`)}>
                        {Math.round(zone.density * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Security Incidents */}
          <div className="glass-card p-4 sm:p-5 lg:p-6 flex flex-col relative overflow-hidden flex-1">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5 relative z-10">
              <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                <AlertTriangle className="w-4 h-4 text-orange-400" aria-hidden="true" />
              </div>
              Security Incidents
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-3 custom-scrollbar relative z-10">
              {securityIncidents.length > 0 ? (
                securityIncidents.map((i) => (
                  <div key={i.id} className="bg-slate-900/50 border border-white/5 rounded-xl p-3.5 hover:bg-slate-800/60 transition-colors">
                    <p className="text-[0.95rem] font-bold text-slate-100 mb-1">{i.title}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-white/5">{i.zone?.name}</span>
                      <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border', 
                        i.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        i.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      )}>{i.severity}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">{i.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-center bg-slate-900/30 rounded-xl border border-white/5 border-dashed">
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
