import React, { useState } from 'react';
import { ExternalLink, Info, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DestinationsEditor from '@/components/nav/DestinationsEditor';
import { FieldRow, NoteBlock, SegmentedControl, SettingsSection } from '@/components/customize/controls';
import { useSettings } from '@/lib/settings-context';
import { NAV_APPS } from '@/lib/settings';
import { dial, isValidPhone, openDirections } from '@/lib/launch';

const TRAVEL_MODES = [
  { id: 'driving', label: 'Driving' },
  { id: 'two-wheeler', label: 'Two-wheeler' },
  { id: 'walking', label: 'Walking' },
  { id: 'transit', label: 'Transit' },
];

export default function NavPanel() {
  const { settings, set } = useSettings();
  const [query, setQuery] = useState('');
  const provider = NAV_APPS.find((a) => a.id === settings.shortcuts.navApp);
  const dialer = settings.shortcuts.dialer || { label: '', number: '' };

  return (
    <div className="space-y-4">
      <SettingsSection
        title="Where to?"
        description={`Destination opens in ${provider ? provider.label : 'your map app'}. Navigation itself runs in that app, not inside this companion.`}
      >
        <div className="space-y-2.5">
          <Label className="font-heading text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            Destination
          </Label>
          <Input
            placeholder="Address, landmark or place name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') openDirections({ destination: query, appId: settings.shortcuts.navApp, mode: settings.shortcuts.travelMode });
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={!query.trim()}
              onClick={() => openDirections({ destination: query, appId: settings.shortcuts.navApp, mode: settings.shortcuts.travelMode })}
            >
              <MapPin className="mr-1.5 h-4 w-4" />
              Start navigation
            </Button>
            <Button size="sm" variant="outline" onClick={() => openDirections({ destination: '', appId: settings.shortcuts.navApp })}>
              Just open {provider ? provider.label : 'Maps'}
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <FieldRow label="Map app" hint="Used by this screen and by the dashboard navigation card.">
          <SegmentedControl
            className="min-w-[260px]"
            value={settings.shortcuts.navApp}
            onChange={(id) => set('shortcuts.navApp', id)}
            options={NAV_APPS}
          />
        </FieldRow>

        <FieldRow label="Travel mode" hint="Sent with the destination where the map app supports it.">
          <SegmentedControl
            className="min-w-[280px]"
            value={settings.shortcuts.travelMode}
            onChange={(id) => set('shortcuts.travelMode', id)}
            options={TRAVEL_MODES}
          />
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Saved places" description="Up to a handful of places you use often — they appear as one-tap buttons on the dashboard.">
        <DestinationsEditor />
      </SettingsSection>

      <SettingsSection title="Phone" description="Dials through your phone's dialer.">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="font-heading text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">Button label</Label>
            <Input
              placeholder="Roadside assistance"
              value={dialer.label}
              onChange={(e) => set('shortcuts.dialer', { ...dialer, label: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-heading text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">Number</Label>
            <Input
              placeholder="+91 00000 00000"
              value={dialer.number}
              onChange={(e) => set('shortcuts.dialer', { ...dialer, number: e.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="secondary" disabled={!isValidPhone(dialer.number)} onClick={() => dial(dialer.number)}>
            <Phone className="mr-1.5 h-4 w-4" />
            Test call shortcut
          </Button>
          {dialer.number && !isValidPhone(dialer.number) ? (
            <p className="text-xs text-destructive">That does not look like a phone number yet.</p>
          ) : null}
        </div>
      </SettingsSection>

      <NoteBlock>
        <span className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            This screen keeps no turn-by-turn guidance of its own. Handing the destination to Google Maps, Waze or Apple
            Maps is a shortcut into that app — the guidance you follow in the car comes from there.
          </span>
        </span>
      </NoteBlock>
    </div>
  );
}