import React from 'react';
import MusicPanel from '@/components/music/MusicPanel';

export default function Music() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Music</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your in-car soundtrack, handed to the player you already use.
        </p>
      </header>
      <MusicPanel />
    </div>
  );
}