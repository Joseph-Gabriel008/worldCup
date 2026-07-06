/**
 * StadiumPulse AI - Fan Home Page
 *
 * Primary fan-facing view with:
 * - Interactive stadium map with crowd heatmap
 * - Real-time alert banner for congested routes
 * - AI chat widget for navigation help
 * - Announcements feed
 */
import { useEffect, useState } from 'react';
import { MapPin, Megaphone, Users, TrendingUp } from 'lucide-react';
import { StadiumMap } from '@/components/maps/StadiumMap';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { AlertBanner } from '@/components/crowd/AlertBanner';
import { useCrowdStore } from '@/stores/crowdStore';
import { useAuthStore } from '@/stores/authStore';
import * as api from '@/services/api';
import type { Announcement } from '@/types';
import { cn } from '@/lib/utils';

export default function FanHome() {
  const { densities } = useCrowdStore();
  const { language } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    api.getAnnouncements(language).then((res) => {
      if (res.success && res.data) {
        setAnnouncements(res.data);
      }
    });
  }, [language]);

  const totalFans = densities.reduce((sum, z) => sum + z.currentCount, 0);
  const criticalZones = densities.filter((z) => z.level === 'CRITICAL' || z.level === 'HIGH');

  return (
    <div className="page-shell max-w-screen-2xl mx-auto px-4 py-6 lg:py-8 space-y-6 lg:space-y-8 relative">
      {/* Decorative Blur (Animated) */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none animate-float delay-100" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none animate-float delay-500" />

      {/* Page Header */}
      <div className="flex flex-col gap-4 animate-slide-in">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-[0.25em]">
            Live now
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/5 text-slate-300 border border-white/10 text-[11px] font-bold uppercase tracking-[0.25em]">
            FIFA World Cup 2026 Final
          </span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm leading-none">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">MetLife Stadium</span>
            </h1>
            <p className="text-[0.95rem] font-medium text-slate-400 mt-2 max-w-2xl leading-relaxed">
              A real-time fan companion for navigation, alerts, and crowd visibility across every concourse and gate.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <div className="animate-slide-up delay-100">
          <StatCard
            icon={Users}
            label="Total Fans"
            value={totalFans.toLocaleString()}
            color="text-primary"
            bgGlow="bg-primary/20"
          />
        </div>
        <div className="animate-slide-up delay-200">
          <StatCard
            icon={MapPin}
            label="Active Zones"
            value={`${densities.length}`}
            color="text-accent"
            bgGlow="bg-accent/20"
          />
        </div>
        <div className="animate-slide-up delay-300">
          <StatCard
            icon={TrendingUp}
            label="High Density"
            value={`${criticalZones.length} zones`}
            color={criticalZones.length > 0 ? 'text-orange-400' : 'text-emerald-400'}
            bgGlow={criticalZones.length > 0 ? 'bg-orange-500/20' : 'bg-emerald-500/20'}
          />
        </div>
        <div className="animate-slide-up delay-400">
          <StatCard
            icon={Megaphone}
            label="Announcements"
            value={`${announcements.length}`}
            color="text-yellow-400"
            bgGlow="bg-yellow-500/20"
          />
        </div>
      </div>

      {/* Alert Banner */}
      <div className="animate-fade-in delay-500">
        <AlertBanner />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Stadium Map */}
        <div className="lg:col-span-2 glass-card p-4 sm:p-5 lg:p-6 flex flex-col relative overflow-hidden group animate-slide-up delay-400 transform transition-transform hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            Live Stadium Map
          </h2>
          
          <div className="flex-1 relative rounded-xl overflow-hidden border border-white/5 bg-slate-900/50 shadow-inner min-h-[20rem] sm:min-h-[24rem] lg:min-h-[32rem]">
            <StadiumMap className="w-full h-[20rem] sm:h-[24rem] lg:h-[32rem] object-cover" />
          </div>

          <div className="flex flex-wrap items-center gap-5 mt-6 text-xs font-semibold text-slate-300" role="legend" aria-label="Density color legend">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm transition-colors hover:bg-emerald-500/20">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" aria-hidden="true" />
              Low (&lt;40%)
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 shadow-sm transition-colors hover:bg-amber-500/20">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" aria-hidden="true" />
              Moderate (40-65%)
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 shadow-sm transition-colors hover:bg-orange-500/20">
              <span className="w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]" aria-hidden="true" />
              High (65-85%)
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 shadow-sm transition-colors hover:bg-red-500/20">
              <span className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" aria-hidden="true" />
              Critical (&gt;85%)
            </span>
          </div>
        </div>

        {/* Announcements Sidebar */}
        <div className="glass-card p-4 sm:p-5 lg:p-6 flex flex-col relative overflow-hidden animate-slide-up delay-500 transform transition-transform hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <Megaphone className="w-4 h-4 text-yellow-400" aria-hidden="true" />
            </div>
            Announcements
          </h2>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {announcements.length > 0 ? (
              announcements.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    'p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
                    a.priority === 'EMERGENCY'
                      ? 'bg-red-500/10 border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]'
                      : a.priority === 'WARNING'
                        ? 'bg-orange-500/10 border-orange-500/30 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]'
                        : 'bg-slate-800/50 border-white/10'
                  )}
                >
                  <p className="text-[0.95rem] font-medium text-slate-200 leading-relaxed">{a.text}</p>
                  <p className="text-[11px] font-semibold tracking-wider text-slate-500 mt-3 uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center bg-slate-900/30 rounded-xl border border-white/5 border-dashed">
                <p className="text-sm font-medium text-slate-400">
                  No active announcements.
                </p>
              </div>
            )}
          </div>

          {/* Zone Quick Status */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gate Status</h3>
            <div className="space-y-2.5">
              {densities
                .filter((z) => z.zoneType === 'GATE')
                .sort((a, b) => b.density - a.density)
                .map((zone) => (
                  <div key={zone.zoneId} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-colors">
                    <span className="text-sm font-semibold text-slate-200">{zone.zoneName}</span>
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase shadow-sm',
                        `density-${zone.level.toLowerCase()}`,
                      )}
                    >
                      {Math.round(zone.density * 100)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgGlow
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bgGlow: string;
}) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3 relative overflow-hidden group h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20">
      <div className={cn("absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-500 animate-pulse-glow", bgGlow)} />
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-white/10 relative z-10 transition-transform duration-300 group-hover:scale-110', bgGlow, color)}>
        <Icon className="w-6 h-6" aria-hidden="true" strokeWidth={2.5} />
      </div>
      <div className="relative z-10 mt-1">
        <p className="text-3xl font-black text-white drop-shadow-sm mb-1 tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
