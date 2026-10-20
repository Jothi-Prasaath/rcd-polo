import React from 'react';
import { AlertTriangle, Pause, Play, RotateCcw, Square } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import TripReadout from './TripReadout';
import { formatDistance, UNIT_LABEL } from '@/lib/geo';
import { cn } from '@/lib/utils';

const STATUS_LABEL = {
  idle: 'Not recording',
  tracking: 'Recording trip',
  paused: 'Paused',
};

export default function TripControls({ tracker, units }) {
  const { toast } = useToast();
  const { status, start, pause, resume, stop, discard, error } = tracker;

  const handleStop = () => {
    const saved = stop();
    if (saved) {
      toast({
        title: 'Trip saved',
        description: `${formatDistance(saved.distanceM, units.distance)} ${UNIT_LABEL.distance[units.distance]} added to your trip history.`,
      });
    } else {
      toast({
        title: 'Nothing recorded',
        description: 'No distance was measured, so no trip was saved.',
      });
    }
  };

  return (
    <section className="surface card-pad">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-2 w-2 rounded-full',
              status === 'tracking' ? 'animate-pulse bg-primary' : status === 'paused' ? 'bg-amber-500' : 'bg-muted-foreground/50',
            )}
          />
          <div>
            <p className="font-heading text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
              {STATUS_LABEL[status]}
            </p>
            <p className="font-display text-sm font-semibold">Trip recording</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {status === 'idle' ? (
            <Button size="sm" onClick={start}>
              <Play className="mr-1.5 h-4 w-4" />
              Start trip
            </Button>
          ) : null}

          {status === 'tracking' ? (
            <Button size="sm" variant="secondary" onClick={pause}>
              <Pause className="mr-1.5 h-4 w-4" />
              Pause
            </Button>
          ) : null}

          {status === 'paused' ? (
            <Button size="sm" onClick={resume}>
              <Play className="mr-1.5 h-4 w-4" />
              Resume
            </Button>
          ) : null}

          {status !== 'idle' ? (
            <Button size="sm" onClick={handleStop}>
              <Square className="mr-1.5 h-3.5 w-3.5" />
              Stop &amp; save
            </Button>
          ) : null}

          {status !== 'idle' ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" title="Discard this trip">
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Discard
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard this trip?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The distance and time recorded so far will be thrown away and nothing will be saved to your trip
                    history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep recording</AlertDialogCancel>
                  <AlertDialogAction onClick={discard}>Discard trip</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <TripReadout tracker={tracker} units={units} />
      </div>

      {error ? (
        <p className="mt-3 flex gap-2 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error.message}</span>
        </p>
      ) : null}
    </section>
  );
}