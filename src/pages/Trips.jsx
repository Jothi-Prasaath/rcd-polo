import React, { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import TripStats from '@/components/trips/TripStats';
import TripList from '@/components/trips/TripList';
import { useSettings } from '@/lib/settings-context';
import { useDataVersion } from '@/lib/storage';
import { clearTrips, listTrips } from '@/lib/trips';

export default function Trips() {
  const { settings } = useSettings();
  const version = useDataVersion();
  const trips = useMemo(() => listTrips(), [version]);

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Trips</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved from your phone's GPS. Distances are what your phone measured, not what the car reported.
          </p>
        </div>
        {trips.length > 0 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="shrink-0 text-destructive">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all {trips.length} trips?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your whole trip history will be erased from this phone. Exported backups are not affected, and this
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my trips</AlertDialogCancel>
                <AlertDialogAction onClick={clearTrips}>Delete everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </header>

      <TripStats trips={trips} units={settings.units} />
      {trips.length > 0 ? <TripList trips={trips} units={settings.units} /> : null}

      <p className="px-1 text-[0.7rem] leading-relaxed text-muted-foreground">
        Trips are stored on this phone only. Nothing leaves the device unless you export a backup yourself.
      </p>
    </div>
  );
}