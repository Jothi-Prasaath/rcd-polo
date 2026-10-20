import React from 'react';
import QuickRail from '@/components/drive/QuickRail';
import TripControls from '@/components/drive/TripControls';
import DashboardGrid from '@/components/drive/DashboardGrid';
import useTripTracker from '@/lib/useTripTracker';
import { useActiveVehicle, useSettings } from '@/lib/settings-context';

export default function Drive() {
  const { settings } = useSettings();
  const vehicle = useActiveVehicle();
  const tracker = useTripTracker({
    vehicleId: vehicle ? vehicle.id : null,
    vehicleName: vehicle ? vehicle.displayName || vehicle.nickname : '',
  });

  return (
    <div className="space-y-4">
      <QuickRail />
      <TripControls tracker={tracker} units={settings.units} />
      <DashboardGrid tracker={tracker} />

      <p className="px-1 text-[0.7rem] leading-relaxed text-muted-foreground">
        Speed and distance come from your phone's GPS, not from the car. Trip recording keeps running while this screen is
        open — phones pause web apps when the screen is off or the browser is in the background. Speed displays are for
        information only and are never a substitute for your dashboard.
      </p>
    </div>
  );
}