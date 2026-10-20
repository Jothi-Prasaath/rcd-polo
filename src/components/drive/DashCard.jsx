import React from 'react';
import { cn } from '@/lib/utils';

export default function DashCard({ title, icon: Icon, span = 1, action, children, className }) {
  return (
    <section className={cn('surface card-pad flex min-w-0 flex-col gap-3', span === 2 && 'span-2', className)}>
      <header className="flex min-w-0 items-start justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2 font-heading text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
          <span className="truncate">{title}</span>
        </h3>
        {action}
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}