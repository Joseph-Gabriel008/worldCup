/**
 * StadiumPulse AI - Interactive Stadium SVG Map with Heatmap Overlay
 *
 * Renders the stadium layout as an interactive SVG with:
 * - Color-coded density zones (green/yellow/orange/red)
 * - Icons and text labels (not color-only — WCAG compliant)
 * - Click-to-inspect zone details
 * - ARIA labels for screen readers
 */
import { useMemo } from 'react';
import { useCrowdStore } from '@/stores/crowdStore';
import { cn } from '@/lib/utils';
import type { ZoneDensity, DensityLevel } from '@/types';

// SVG zone shapes mapped to venue graph positions
const ZONE_SHAPES: Array<{
  id: string;
  path: string;
  labelX: number;
  labelY: number;
  icon: string;
}> = [
  // Gates (octagon perimeter)
  { id: 'gate-1', path: 'M 360,40 L 440,40 L 450,60 L 440,80 L 360,80 L 350,60 Z', labelX: 400, labelY: 62, icon: '🚪' },
  { id: 'gate-2', path: 'M 660,110 L 740,110 L 750,130 L 740,150 L 660,150 L 650,130 Z', labelX: 700, labelY: 132, icon: '🚪' },
  { id: 'gate-3', path: 'M 740,280 L 820,280 L 830,300 L 820,320 L 740,320 L 730,300 Z', labelX: 780, labelY: 302, icon: '🚪' },
  { id: 'gate-4', path: 'M 660,460 L 740,460 L 750,480 L 740,500 L 660,500 L 650,480 Z', labelX: 700, labelY: 482, icon: '🚪' },
  { id: 'gate-5', path: 'M 360,530 L 440,530 L 450,550 L 440,570 L 360,570 L 350,550 Z', labelX: 400, labelY: 552, icon: '🚪' },
  { id: 'gate-6', path: 'M 60,460 L 140,460 L 150,480 L 140,500 L 60,500 L 50,480 Z', labelX: 100, labelY: 482, icon: '🚪' },
  { id: 'gate-7', path: 'M -20,280 L 60,280 L 70,300 L 60,320 L -20,320 L -30,300 Z', labelX: 20, labelY: 302, icon: '🚪' },
  { id: 'gate-8', path: 'M 60,110 L 140,110 L 150,130 L 140,150 L 60,150 L 50,130 Z', labelX: 100, labelY: 132, icon: '🚪' },

  // Seating blocks (larger rectangles)
  { id: 'seating-a', path: 'M 290,100 L 380,100 L 380,170 L 290,170 Z', labelX: 335, labelY: 138, icon: '💺' },
  { id: 'seating-b', path: 'M 530,120 L 620,120 L 620,200 L 530,200 Z', labelX: 575, labelY: 163, icon: '💺' },
  { id: 'seating-c', path: 'M 610,250 L 700,250 L 700,330 L 610,330 Z', labelX: 655, labelY: 293, icon: '💺' },
  { id: 'seating-d', path: 'M 530,390 L 620,390 L 620,465 L 530,465 Z', labelX: 575, labelY: 430, icon: '💺' },
  { id: 'seating-e', path: 'M 290,440 L 380,440 L 380,510 L 290,510 Z', labelX: 335, labelY: 478, icon: '💺' },
  { id: 'seating-f', path: 'M 120,390 L 210,390 L 210,465 L 120,465 Z', labelX: 165, labelY: 430, icon: '💺' },
  { id: 'seating-g', path: 'M 50,250 L 150,250 L 150,330 L 50,330 Z', labelX: 100, labelY: 293, icon: '💺' },
  { id: 'seating-h', path: 'M 120,120 L 210,120 L 210,200 L 120,200 Z', labelX: 165, labelY: 163, icon: '💺' },

  // Concourses (thin long shapes)
  { id: 'concourse-n', path: 'M 220,85 L 580,85 L 580,98 L 220,98 Z', labelX: 400, labelY: 94, icon: '🏃' },
  { id: 'concourse-e', path: 'M 710,160 L 725,160 L 725,450 L 710,450 Z', labelX: 718, labelY: 305, icon: '🏃' },
  { id: 'concourse-s', path: 'M 220,512 L 580,512 L 580,525 L 220,525 Z', labelX: 400, labelY: 520, icon: '🏃' },
  { id: 'concourse-w', path: 'M 35,160 L 48,160 L 48,450 L 35,450 Z', labelX: 42, labelY: 305, icon: '🏃' },

  // Facilities
  { id: 'restroom-n', path: 'M 330,78 L 370,78 L 370,88 L 330,88 Z', labelX: 350, labelY: 84, icon: '🚻' },
  { id: 'restroom-e', path: 'M 726,270 L 750,270 L 750,290 L 726,290 Z', labelX: 738, labelY: 282, icon: '🚻' },
  { id: 'restroom-s', path: 'M 330,526 L 370,526 L 370,536 L 330,536 Z', labelX: 350, labelY: 532, icon: '🚻' },
  { id: 'restroom-w', path: 'M 10,270 L 34,270 L 34,290 L 10,290 Z', labelX: 22, labelY: 282, icon: '🚻' },
  { id: 'medical-n', path: 'M 430,78 L 470,78 L 470,88 L 430,88 Z', labelX: 450, labelY: 84, icon: '🏥' },
  { id: 'medical-s', path: 'M 430,526 L 470,526 L 470,536 L 430,536 Z', labelX: 450, labelY: 532, icon: '🏥' },
  { id: 'food-n', path: 'M 260,78 L 320,78 L 320,88 L 260,88 Z', labelX: 290, labelY: 84, icon: '🍔' },
  { id: 'food-s', path: 'M 260,526 L 320,526 L 320,536 L 260,536 Z', labelX: 290, labelY: 532, icon: '🍔' },
];

const DENSITY_COLORS: Record<DensityLevel, string> = {
  LOW: '#34d399',
  MODERATE: '#fbbf24',
  HIGH: '#fb923c',
  CRITICAL: '#f87171',
};

const DENSITY_FILLS: Record<DensityLevel, string> = {
  LOW: 'rgba(52, 211, 153, 0.25)',
  MODERATE: 'rgba(251, 191, 36, 0.3)',
  HIGH: 'rgba(251, 146, 60, 0.35)',
  CRITICAL: 'rgba(248, 113, 113, 0.4)',
};

interface StadiumMapProps {
  className?: string;
  onZoneClick?: (zoneId: string) => void;
}

export function StadiumMap({ className, onZoneClick }: StadiumMapProps) {
  const { densities, selectedZone, setSelectedZone } = useCrowdStore();

  const densityMap = useMemo(() => {
    const map = new Map<string, ZoneDensity>();
    densities.forEach((d) => map.set(d.zoneId, d));
    return map;
  }, [densities]);

  const handleZoneClick = (zoneId: string) => {
    setSelectedZone(zoneId === selectedZone ? null : zoneId);
    onZoneClick?.(zoneId);
  };

  return (
    <div className={cn('relative', className)} role="img" aria-label="Interactive stadium map showing crowd density per zone">
      <svg
        viewBox="-40 20 880 570"
        className="w-full h-full drop-shadow-2xl"
        role="group"
        aria-label="Stadium zones"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Stadium outline */}
        <ellipse
          cx="400"
          cy="305"
          rx="430"
          ry="280"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="3"
        />
        <ellipse
          cx="400"
          cy="305"
          rx="450"
          ry="300"
          fill="none"
          stroke="rgba(255,255,255,0.02)"
          strokeWidth="1"
        />

        {/* Pitch */}
        <rect
          x="220"
          y="180"
          width="360"
          height="250"
          rx="12"
          fill="rgba(52, 211, 153, 0.05)"
          stroke="rgba(52, 211, 153, 0.2)"
          strokeWidth="2"
        />
        <text
          x="400"
          y="312"
          textAnchor="middle"
          fill="rgba(52, 211, 153, 0.4)"
          fontSize="1.2rem"
          fontWeight="800"
          letterSpacing="4"
        >
          ⚽ PITCH
        </text>

        {/* Zone shapes */}
        {ZONE_SHAPES.map((zone) => {
          const density = densityMap.get(zone.id);
          const level = density?.level || 'LOW';
          const isSelected = selectedZone === zone.id;
          const pct = density ? Math.round(density.density * 100) : 0;

          return (
            <g
              key={zone.id}
              role="button"
              tabIndex={0}
              aria-label={`${density?.zoneName || zone.id}: ${pct}% capacity, ${level} density`}
              onClick={() => handleZoneClick(zone.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleZoneClick(zone.id);
                }
              }}
                className="cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-sm"
            >
              <path
                d={zone.path}
                fill={DENSITY_FILLS[level]}
                stroke={isSelected ? '#ffffff' : DENSITY_COLORS[level]}
                strokeWidth={isSelected ? 3 : 1.5}
                className="transition-all duration-300 group-hover:opacity-80"
                filter={isSelected || level === 'CRITICAL' ? 'url(#glow)' : undefined}
              />
              {/* Density percentage label */}
              <text
                x={zone.labelX}
                y={zone.labelY - 6}
                textAnchor="middle"
                fill={isSelected ? '#ffffff' : DENSITY_COLORS[level]}
                fontSize="0.65rem"
                fontWeight="800"
                className="transition-colors duration-300"
              >
                {pct}%
              </text>
              {/* Zone icon (accessibility: not color-only) */}
              <text
                x={zone.labelX}
                y={zone.labelY + 8}
                textAnchor="middle"
                fontSize="0.55rem"
                opacity={isSelected ? 1 : 0.8}
                className="transition-opacity"
              >
                {zone.icon}
              </text>
              {/* Focus ring */}
              {isSelected && (
                <path
                  d={zone.path}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Selected zone detail panel */}
      {selectedZone && densityMap.has(selectedZone) && (
        <div
          className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl animate-fade-in"
          role="status"
          aria-live="polite"
        >
          <ZoneDetail density={densityMap.get(selectedZone)!} />
        </div>
      )}
    </div>
  );
}

function ZoneDetail({ density }: { density: ZoneDensity }) {
  const levelClass = `density-${density.level.toLowerCase()}`;
  const trendIcon = density.trend === 'RISING' ? '📈' : density.trend === 'FALLING' ? '📉' : '➡️';

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-base font-bold text-white tracking-wide">{density.zoneName}</h3>
        <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">
          {density.currentCount.toLocaleString()} / {density.capacity.toLocaleString()} cap
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className={cn('px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest shadow-sm', levelClass)}>
          {density.level}
        </span>
        <span className="text-xl" aria-label={`Trend: ${density.trend}`} role="img">
          {trendIcon}
        </span>
        <span className="text-3xl font-black drop-shadow-md" style={{ color: DENSITY_COLORS[density.level] }}>
          {Math.round(density.density * 100)}%
        </span>
      </div>
    </div>
  );
}
