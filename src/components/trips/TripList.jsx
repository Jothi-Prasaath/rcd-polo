import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  formatDateTime,
  formatDistance,
  formatDuration,
  formatSpeed,
  UNIT_LABEL,
} from '@/lib/geo';
import { deleteTrip, updateTrip } from '@/lib/trips';
import { downloadJSON } from '@/lib/storage';

export default function TripList({ trips, units }) {
  const [openId, setOpenId] = useState(null);
  const [draftNotes, setDraftNotes] = useState('');
  const speedUnit = units.speed;
  const distanceUnit = units.distance;

  const toggle = (trip) => {
    if (openId === trip.id) {
      setOpenId(null);
      return;
    }
    setOpenId(trip.id);
    setDraftNotes(trip.notes || '');
  };

  const exportTrips = () => {
    downloadJSON(`vwpolo-trips-${new Date().toISOString().slice(0, 10)}.json`, {
      app: 'VW Polo Companion',
      exportedAt: new Date().toISOString(),
      trips,
    });
  };

  return (
    <section className="surface card-pad">
      <header className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Trip history
        </h3>
        <Button size="sm" variant="ghost" onClick={exportTrips}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export
        </Button>
      </header>

      <div className="mt-3 space-y-2">
        {trips.map((trip) => {
          const open = openId === trip.id;
          return (
            <article key={trip.id} className="rounded-[calc(var(--radius)-4px)] border border-border/70 bg-muted/25">
              <button
                type="button"
                onClick={() => toggle(trip)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold">{trip.vehicleName || 'Trip'}</p>
                  <p className="text-[0.7rem] text-muted-foreground">{formatDateTime(trip.startedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="tnum font-display text-sm font-semibold">
                      {formatDistance(trip.distanceM, distanceUnit)}{' '}
                      <span className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                        {UNIT_LABEL.distance[distanceUnit]}
                      </span>
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground">{formatDuration(trip.durationS)}</p>
                  </div>
                  {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {open ? (
                <div className="space-y-3 border-t border-border/70 px-3 py-3">
                  <dl className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-4">
                    <div>
                      <dt className="text-muted-foreground">Average</dt>
                      <dd className="tnum font-medium">
                        {formatSpeed(trip.avgSpeedKmh, speedUnit)} {UNIT_LABEL.speed[speedUnit]}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Maximum</dt>
                      <dd className="tnum font-medium">
                        {formatSpeed(trip.maxSpeedKmh, speedUnit)} {UNIT_LABEL.speed[speedUnit]}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Started</dt>
                      <dd className="font-medium">{new Date(trip.startedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Ended</dt>
                      <dd className="font-medium">
                        {trip.endedAt
                          ? new Date(trip.endedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </dd>
                    </div>
                  </dl>

                  <div className="space-y-2">
                    <Textarea
                      rows={2}
                      placeholder="Notes about this trip (roads, fuel, passengers)"
                      value={draftNotes}
                      onChange={(e) => setDraftNotes(e.target.value)}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          updateTrip(trip.id, { notes: draftNotes });
                          setOpenId(null);
                        }}
                      >
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Save notes
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive">
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete trip
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {formatDistance(trip.distanceM, distanceUnit)} {UNIT_LABEL.distance[distanceUnit]} recorded on{' '}
                              {formatDateTime(trip.startedAt)} will be removed from your history. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep it</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteTrip(trip.id);
                                setOpenId(null);
                              }}
                            >
                              Delete trip
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}