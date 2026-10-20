import React from 'react';
import NavPanel from '@/components/nav/NavPanel';

export default function Navigation() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Navigate</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Send a destination to your map app, save the places you use often, and keep your call shortcut close.
        </p>
      </header>
      <NavPanel />
    </div>
  );
}