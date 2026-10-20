import React from 'react';
import { cn } from '@/lib/utils';

export default function StatTile({ label, value, unit, tone = 'default', className }) {
  return (
    <div className={cn('rounded-[calc(var(--radius)-4px)] border border-border/70 bg-muted/40 px-3 py-2.5', className)}>
      <p className="font-heading text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p
        className={cn(
          'tnum mt-1 font-display text-xl font-semibold leading-none',
          tone === 'accent' ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}
        {unit ? <span className="ml-1 font-heading text-[0.65rem] font-medium tracking-wide text-muted-foreground">{unit}</span> : null}
      </p>
    </div>
  );
}