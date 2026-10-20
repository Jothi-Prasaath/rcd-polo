import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Info, MapPin, Music, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDay, formatDistance, kmPerLitre, litresToUnit, UNIT_LABEL } from '@/lib/geo';
import { openDirections, openMusic, dial, musicTarget } from '@/lib/launch';
import { NAV_APPS } from '@/lib/settings';

export function useNow(intervalMs = 20000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

export function ClockBody() {
  const now = useNow(10000);
  return (
    <div>
      <p className="tnum font-display text-3xl font-semibold leading-none">
        {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </div>
  );
}

export function VehicleBody({ vehicle, units }) {
  if (!vehicle) {
    return (
      <p className="text-xs text-muted-foreground">
        No vehicle profile yet.{' '}
        <Link to="/customize" className="text-primary underline-offset-4 hover:underline">
          Add one
        </Link>
        .
      </p>
    );
  }
  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-base font-semibold leading-tight">{vehicle.displayName || vehicle.nickname}</p>
          <p className="text-xs text-muted-foreground">
            {[vehicle.year, vehicle.trim].filter(Boolean).join(' · ') || 'Year and trim not set'}
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 font-heading text-[0.6rem] uppercase tracking-[0.12em]">
          Your entry
        </Badge>
      </div>
      <dl className="space-y-1 border-t border-border/70 pt-2.5 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Odometer</dt>
          <dd className="tnum font-medium">
            {formatDistance(Number(vehicle.odometer || 0) * 1000, units.distance)} {UNIT_LABEL.distance[units.distance]}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Engine</dt>
          <dd className="text-right font-medium">
            {[vehicle.displacement, vehicle.engine].filter(Boolean).join(' ') || 'Not set'}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Transmission</dt>
          <dd className="font-medium">{vehicle.transmission || 'Not set'}</dd>
        </div>
      </dl>
    </div>
  );
}

export function MaintenanceBody({ items, vehicle }) {
  const pending = (items || [])
    .filter((i) => !i.done)
    .sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999')));
  const next = pending[0];

  if (!next) {
    return (
      <p className="text-xs text-muted-foreground">
        No service items due.{' '}
        <Link to="/customize" className="text-primary underline-offset-4 hover:underline">
          Plan maintenance
        </Link>
        .
      </p>
    );
  }

  const days = next.dueDate ? Math.ceil((new Date(next.dueDate).getTime() - Date.now()) / 86400000) : null;
  const dueKm = next.dueOdometerKm ? Number(next.dueOdometerKm) - Number(vehicle?.odometer || 0) : null;

  return (
    <div className="space-y-2">
      <p className="font-display text-base font-semibold leading-tight">{next.label}</p>
      <p className="text-xs text-muted-foreground">
        {next.dueDate ? `Due ${formatDay(next.dueDate)}` : 'No date set'}
        {days !== null ? ` · ${days > 0 ? `in ${days} days` : 'overdue'}` : ''}
        {dueKm !== null && dueKm > 0 ? ` · in ${Math.round(dueKm)} km` : ''}
        {dueKm !== null && dueKm <= 0 ? ' · odometer reached' : ''}
      </p>
      {next.notes ? <p className="text-xs text-muted-foreground">{next.notes}</p> : null}
    </div>
  );
}

export function FuelBody({ log, units }) {
  const sorted = [...(log || [])]
    .filter((e) => Number(e.odometerKm) > 0 && Number(e.litres) > 0)
    .sort((a, b) => Number(a.odometerKm) - Number(b.odometerKm));

  const runs = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const distanceKm = Number(sorted[i].odometerKm) - Number(sorted[i - 1].odometerKm);
    const litres = Number(sorted[i].litres);
    if (distanceKm > 0 && litres > 0) runs.push({ kmpl: kmPerLitre(distanceKm * 1000, litres) });
  }

  if (runs.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Log two fill-ups to calculate economy.{' '}
        <Link to="/customize" className="text-primary underline-offset-4 hover:underline">
          Add fill-ups
        </Link>
        .
      </p>
    );
  }

  const latest = runs[runs.length - 1].kmpl;
  const average = runs.reduce((acc, r) => acc + r.kmpl, 0) / runs.length;
  const useMpg = units.distance === 'mi';
  const factor = useMpg ? 2.35215 : 1;
  const label = useMpg ? 'mpg' : 'km/L';

  return (
    <div className="space-y-2">
      <p className="tnum font-display text-3xl font-semibold leading-none">
        {latest ? (latest * factor).toFixed(1) : '—'}
        <span className="ml-1.5 font-heading text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Last fill-up · average {(average * factor).toFixed(1)} {label} over {runs.length} fill-ups
      </p>
      <p className="text-[0.68rem] text-muted-foreground">
        Calculated from the fill-ups you entered, not from the car.
      </p>
    </div>
  );
}

export function MediaBody({ musicAppId }) {
  const target = musicTarget(musicAppId);
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground">
        Opens {target.label}. Playback happens inside that app — this companion cannot control it.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => openMusic(target.id, 'app')}>
          <Music className="mr-1.5 h-4 w-4" />
          Open {target.label}
        </Button>
        <Button size="sm" variant="outline" onClick={() => openMusic(target.id, 'web')}>
          Web player
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function NavBody({ destinations, navApp }) {
  const filled = (destinations || []).filter((d) => d.address && d.address.trim());
  const provider = NAV_APPS.find((a) => a.id === navApp);
  return (
    <div className="space-y-2.5">
      {filled.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No saved destinations yet.{' '}
          <Link to="/customize" className="text-primary underline-offset-4 hover:underline">
            Add one
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filled.slice(0, 3).map((d) => (
            <Button key={d.id} size="sm" variant="secondary" onClick={() => openDirections({ destination: d.address, appId: navApp })}>
              <MapPin className="mr-1.5 h-3.5 w-3.5" />
              {d.label}
            </Button>
          ))}
        </div>
      )}
      <Button size="sm" variant="outline" className="max-w-full" onClick={() => openDirections({ destination: filled[0]?.address, appId: navApp })}>
        <span className="truncate">Open {provider ? provider.label : 'Maps'}</span>
        <ExternalLink className="ml-1.5 h-3.5 w-3.5 shrink-0" />
      </Button>
    </div>
  );
}

export function DialerBody({ dialer }) {
  const hasNumber = !!(dialer && dialer.number);
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground">
        {hasNumber ? `${dialer.label || 'Call'} · ${dialer.number}` : 'No number saved yet.'}
      </p>
      {hasNumber ? (
        <Button size="sm" onClick={() => dial(dialer.number)}>
          <Phone className="mr-1.5 h-4 w-4" />
          Call {dialer.label || 'number'}
        </Button>
      ) : (
        <Button size="sm" variant="outline" asChild>
          <Link to="/customize">Add a number</Link>
        </Button>
      )}
    </div>
  );
}

export function ObdBody() {
  return (
    <div className="space-y-2">
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        No OBD-II data is shown, because no adapter has been connected and verified. Nothing on this screen is a
        simulated engine reading.
      </p>
      <p className="text-[0.68rem] text-muted-foreground">
        An ELM327 adapter plugs into the car, and reading it needs a native app with Bluetooth access. Read the notes in
        Customize → Data &amp; capabilities.
      </p>
    </div>
  );
}