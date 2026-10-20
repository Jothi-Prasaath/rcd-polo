import React from 'react';
import { kmhToUnit, UNIT_LABEL } from '@/lib/geo';

function polar(index, total, radius) {
  const angle = (-120 + (index * 240) / (total - 1)) * (Math.PI / 180);
  return { x: 100 + radius * Math.sin(angle), y: 100 - radius * Math.cos(angle) };
}

function AnalogueDial({ shown, max, unit }) {
  const ticks = Array.from({ length: 13 }, (_, i) => i);
  const rotation = -120 + Math.min(1, shown / max) * 240;
  const labels = [0, Math.round(max / 4), Math.round(max / 2), Math.round((max * 3) / 4), max];

  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-[180px] w-[180px]" role="img" aria-label={`${Math.round(shown)} ${UNIT_LABEL.speed[unit]}`}>
        <circle cx="100" cy="100" r="94" className="fill-none stroke-border" strokeWidth="1.5" />
        {ticks.map((i) => {
          const outer = polar(i, ticks.length, 86);
          const inner = polar(i, ticks.length, i % 3 === 0 ? 74 : 79);
          return (
            <line
              key={i}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              className={i % 3 === 0 ? 'stroke-foreground' : 'stroke-muted-foreground'}
              strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
              strokeLinecap="round"
            />
          );
        })}
        {labels.map((value, index) => {
          const pos = polar(index * 3, ticks.length, 62);
          return (
            <text
              key={value}
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 11, fontFamily: 'var(--font-heading)' }}
            >
              {value}
            </text>
          );
        })}
        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px', transition: 'transform 450ms ease-out' }}>
          <line x1="100" y1="104" x2="100" y2="34" className="stroke-primary" strokeWidth="3.5" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="7" className="fill-primary" />
        <text x="100" y="140" textAnchor="middle" className="fill-foreground" style={{ fontSize: 38, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
          {Math.round(shown)}
        </text>
        <text x="100" y="158" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11, letterSpacing: '0.18em' }}>
          {UNIT_LABEL.speed[unit]}
        </text>
      </svg>
    </div>
  );
}

export default function Speedometer({ speedKmh = 0, unit = 'kmh', variant = 'digital' }) {
  const shown = Math.max(0, kmhToUnit(speedKmh || 0, unit));
  const max = unit === 'mph' ? 140 : 220;

  if (variant === 'analogue') {
    return <AnalogueDial shown={shown} max={max} unit={unit} />;
  }

  const pct = Math.min(1, shown / max);

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="tnum font-display text-[4.25rem] font-semibold leading-none tracking-tight sm:text-[5rem]">
          {Math.round(shown)}
        </span>
        <span className="font-heading text-sm uppercase tracking-[0.18em] text-muted-foreground">
          {UNIT_LABEL.speed[unit]}
        </span>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
        <span>0</span>
        <span>GPS-derived</span>
        <span>{max}</span>
      </div>
    </div>
  );
}