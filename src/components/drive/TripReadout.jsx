import React from 'react';
import StatTile from './StatTile';
import { formatClock, formatDistance, formatDuration, formatSpeed, UNIT_LABEL } from '@/lib/geo';

export default function TripReadout({ tracker, units, compact = false }) {
  const { stats, status, lastSaved } = tracker;
  const speedUnit = units.speed;
  const distUnit = units.distance;
  const live = status !== 'idle';

  return (
    <div className="space-y-3">
      <div className={compact ? 'grid grid-cols-2 gap-2.5' : 'grid grid-cols-2 gap-2.5 sm:grid-cols-4'}>
        <StatTile label="Distance" value={formatDistance(stats.distanceM, distUnit)} unit={UNIT_LABEL.distance[distUnit]} tone={live ? 'accent' : 'default'} />
        <StatTile label="Moving time" value={formatClock(stats.elapsedS)} unit={live ? 'live' : 'stopped'} />
        <StatTile label="Average" value={formatSpeed(stats.avgSpeedKmh, speedUnit)} unit={UNIT_LABEL.speed[speedUnit]} />
        <StatTile label="Maximum" value={formatSpeed(stats.maxSpeedKmh, speedUnit)} unit={UNIT_LABEL.speed[speedUnit]} />
      </div>
      {!live && lastSaved ? (
        <p className="text-xs text-muted-foreground">
          Saved just now — {formatDistance(lastSaved.distanceM, distUnit)} {UNIT_LABEL.distance[distUnit]} in{' '}
          {formatDuration(lastSaved.durationS)}.
        </p>
      ) : null}
    </div>
  );
}