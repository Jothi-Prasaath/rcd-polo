import React from 'react';
import { cn } from '@/lib/utils';

export function SettingsSection({ title, description, action, children, className }) {
  return (
    <section className={cn('surface card-pad', className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-sm font-semibold">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      <div className="mt-3.5 space-y-3.5">{children}</div>
    </section>
  );
}

export function SegmentedControl({ value, onChange, options, className }) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-1.5 rounded-[calc(var(--radius)-2px)] border border-border/70 bg-muted/40 p-1',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={String(option.id)}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-[calc(var(--radius)-6px)] px-3 py-1.5 font-heading text-[0.68rem] uppercase tracking-[0.1em] transition-colors',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function FieldRow({ label, hint, children, stacked = false }) {
  return (
    <div className={cn('gap-3', stacked ? 'block' : 'flex flex-wrap items-center justify-between')}>
      <div className="min-w-0">
        <p className="text-xs font-medium">{label}</p>
        {hint ? <p className="mt-0.5 text-[0.7rem] leading-relaxed text-muted-foreground">{hint}</p> : null}
      </div>
      <div className={cn('min-w-0 max-w-full sm:shrink-0', stacked && 'mt-2')}>{children}</div>
    </div>
  );
}

export function NoteBlock({ children }) {
  return (
    <p className="rounded-[calc(var(--radius)-4px)] border border-border/70 bg-muted/40 px-3 py-2.5 text-[0.7rem] leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}