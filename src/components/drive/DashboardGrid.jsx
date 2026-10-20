import React from 'react';
import { Activity, Bluetooth, Car, Clock, Crosshair, Fuel, Gauge, MapPin, Music, Phone, Wrench } from 'lucide-react';
import DashCard from './DashCard';
import Speedometer from './Speedometer';
import GpsStatus from './GpsStatus';
import TripReadout from './TripReadout';
import {
  ClockBody,
  DialerBody,
  FuelBody,
  MaintenanceBody,
  MediaBody,
  NavBody,
  ObdBody,
  VehicleBody,
} from './DashCardBodies';
import { useActiveVehicle, useSettings } from '@/lib/settings-context';
import { cardById } from '@/lib/settings';
import { cn } from '@/lib/utils';

const ICONS = {
  speed: Gauge,
  trip: Activity,
  gps: Crosshair,
  navigation: MapPin,
  media: Music,
  clock: Clock,
  vehicle: Car,
  maintenance: Wrench,
  fuel: Fuel,
  dialer: Phone,
  obd: Bluetooth,
};

export default function DashboardGrid({ tracker }) {
  const { settings } = useSettings();
  const vehicle = useActiveVehicle();
  const layout = settings.dashboard.layout || 'cockpit';
  const cards = (settings.dashboard.cards || []).filter((c) => c.visible);
  const speedo = settings.dashboard.speedo || 'digital';

  if (cards.length === 0) {
    return (
      <section className="surface card-pad text-center">
        <p className="font-display text-sm font-semibold">Every dashboard card is hidden</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Turn cards back on in Customize → Dashboard.
        </p>
      </section>
    );
  }

  return (
    <div className={cn('dash-grid', `layout-${layout}`)}>
      {cards.map((card) => {
        const meta = cardById(card.id) || { label: card.id, span: 1 };
        const title = card.label || meta.label;
        const Icon = ICONS[card.id];

        if (card.id === 'speed') {
          return (
            <DashCard key={card.id} title={title} icon={Icon} span={2}>
              <Speedometer speedKmh={tracker.fix ? tracker.fix.speedKmh : 0} unit={settings.units.speed} variant={speedo} />
            </DashCard>
          );
        }

        if (card.id === 'trip') {
          return (
            <DashCard key={card.id} title={title} icon={Icon} span={2}>
              <TripReadout tracker={tracker} units={settings.units} compact />
            </DashCard>
          );
        }

        return (
          <DashCard key={card.id} title={title} icon={Icon} span={meta.span || 1}>
            {card.id === 'gps' ? <GpsStatus fix={tracker.fix} active={tracker.isActive} /> : null}
            {card.id === 'navigation' ? (
              <NavBody destinations={settings.shortcuts.destinations} navApp={settings.shortcuts.navApp} />
            ) : null}
            {card.id === 'media' ? <MediaBody musicAppId={settings.shortcuts.musicApp} /> : null}
            {card.id === 'clock' ? <ClockBody /> : null}
            {card.id === 'vehicle' ? <VehicleBody vehicle={vehicle} units={settings.units} /> : null}
            {card.id === 'maintenance' ? <MaintenanceBody items={settings.maintenance} vehicle={vehicle} /> : null}
            {card.id === 'fuel' ? <FuelBody log={settings.fuelLog} units={settings.units} /> : null}
            {card.id === 'dialer' ? <DialerBody dialer={settings.shortcuts.dialer} /> : null}
            {card.id === 'obd' ? <ObdBody /> : null}
          </DashCard>
        );
      })}
    </div>
  );
}