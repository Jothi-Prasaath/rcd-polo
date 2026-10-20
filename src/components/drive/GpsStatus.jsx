import React, { useEffect, useState } from 'react';
import { accuracyInfo, coordLabel } from '@/lib/geo';
import { cn } from '@/lib/utils';

const TONE = {
  high: 'bg-emerald-500/15 text-emerald-500',
  medium: 'bg-amber-500/15 text-amber-500',
  low: 'bg-destructive/15 text-destructive',
  none: 'bg-muted text-muted-foreground',
};

export default function GpsStatus({ fix, active }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const timer = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const secondsSinceFix = fix ? (Date.now() - fix.at) / 1000 : null;
  const info = accuracyInfo(fix ? fix.accuracy : null, secondsSinceFix);

  return (
    <div className="space-y-2.5">
      <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-heading text-[0.62rem] uppercase tracking-[0.14em]', TONE[info.tone])}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {info.label}
      </span>
      <p className="text-xs text-muted-foreground">{info.detail}</p>
      <dl className="space-y-1 border-t border-border/70 pt-2.5 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Position</dt>
          <dd className="tnum text-right font-medium">{coordLabel(fix?.lat, fix?.lng)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Speed source</dt>
          <dd className="text-right font-medium">
            {fix ? (fix.speedSource === 'gps' ? 'Phone GPS' : 'Calculated from distance') : '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Last fix</dt>
          <dd className="text-right font-medium">
            {secondsSinceFix === null ? 'None yet' : `${Math.round(secondsSinceFix)}s ago`}
          </dd>
        </div>
      </dl>
    </div>
  );
}