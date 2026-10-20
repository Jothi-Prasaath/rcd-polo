import React from 'react';
import { Activity, Clock, Gauge, Route } from 'lucide-react';
import StatTile from '@/components/drive/StatTile';
import { formatDistance, formatDuration, formatSpeed, UNIT_LABEL } from '@/lib/geo';
import { tripTotals } from '@/lib/trips';

export default function TripStats({ trips, units }) {
  const totals = tripTotals(trips);
  const speedUnit = units.speed;
  const distanceUnit = units.distance;

  if (totals.count === 0) {
    return (
      <section className="surface card-pad">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-muted text-muted-foreground">
            <Route className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold">No trips recorded yet</p>
            <p className="text-xs text-muted-foreground">
              Start a trip on the Drive screen and it will appear here with distance, time and speeds.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="surface card-pad">
      <h3 className="flex items-center gap-2 font-heading text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Activity className="h-3.5 w-3.5" />
        All trips
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile label="Trips" value={String(totals.count)} />
        <StatTile label="Distance" value={formatDistance(totals.distanceM, distanceUnit)} unit={UNIT_LABEL.distance[distanceUnit]} tone="accent" />
        <StatTile label="Time driving" value={formatDuration(totals.durationS)} />
        <StatTile label="Overall average" value={formatSpeed(totals.avgSpeedKmh, speedUnit)} unit={UNIT_LABEL.speed[speedUnit]} />
      </div>
      {totals.longest ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Gauge className="h-3.5 w-3.5" />
          Longest trip: {formatDistance(totals.longest.distanceM, distanceUnit)} {UNIT_LABEL.distance[distanceUnit]}
          <span className="mx-1">·</span>
          <Clock className="h-3.5 w-3.5" />
          {formatDuration(totals.longest.durationS)}
        </p>
      ) : null}
    </section>
  );
}