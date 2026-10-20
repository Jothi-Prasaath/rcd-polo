import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldRow, NoteBlock, SegmentedControl, SettingsSection } from './controls';
import { useSettings } from '@/lib/settings-context';
import { MUSIC_APPS, NAV_APPS } from '@/lib/settings';
import { dial, isValidPhone } from '@/lib/launch';

const TRAVEL_MODES = [
  { id: 'driving', label: 'Driving' },
  { id: 'two-wheeler', label: 'Two-wheeler' },
  { id: 'walking', label: 'Walking' },
  { id: 'transit', label: 'Transit' },
];

export default function ShortcutsPanel() {
  const { settings, set } = useSettings();
  const dialer = settings.shortcuts.dialer || { label: '', number: '' };

  return (
    <div className="space-y-4">
      <SettingsSection title="Shortcut targets" description="What the quick rail and dashboard shortcut cards open.">
        <FieldRow label="Map app">
          <SegmentedControl
            className="min-w-[260px]"
            value={settings.shortcuts.navApp}
            onChange={(id) => set('shortcuts.navApp', id)}
            options={NAV_APPS}
          />
        </FieldRow>
        <FieldRow label="Travel mode">
          <SegmentedControl
            className="min-w-[280px]"
            value={settings.shortcuts.travelMode}
            onChange={(id) => set('shortcuts.travelMode', id)}
            options={TRAVEL_MODES}
          />
        </FieldRow>
        <FieldRow label="Music app">
          <SegmentedControl
            className="min-w-[280px]"
            value={settings.shortcuts.musicApp}
            onChange={(id) => set('shortcuts.musicApp', id)}
            options={MUSIC_APPS.map((app) => ({ id: app.id, label: app.label }))}
          />
        </FieldRow>
        <NoteBlock>
          Saved places are managed on the{' '}
          <Link to="/navigate" className="text-primary underline-offset-4 hover:underline">
            Navigate screen
          </Link>
          , where you can also send a new destination straight to your map app.
        </NoteBlock>
      </SettingsSection>

      <SettingsSection title="Call shortcut" description="A single number for roadside help, home or the workshop.">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Input
              placeholder="Label (Roadside assistance)"
              value={dialer.label}
              onChange={(e) => set('shortcuts.dialer', { ...dialer, label: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Input
              placeholder="Phone number"
              value={dialer.number}
              onChange={(e) => set('shortcuts.dialer', { ...dialer, number: e.target.value })}
            />
          </div>
        </div>
        <Button size="sm" variant="secondary" disabled={!isValidPhone(dialer.number)} onClick={() => dial(dialer.number)}>
          <Phone className="mr-1.5 h-4 w-4" />
          Test call shortcut
        </Button>
        {!isValidPhone(dialer.number) && dialer.number ? (
          <p className="text-xs text-destructive">Enter a phone number with at least 6 digits.</p>
        ) : null}
      </SettingsSection>
    </div>
  );
}