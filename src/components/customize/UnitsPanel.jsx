import React from 'react';
import { Slider } from '@/components/ui/slider';
import { FieldRow, NoteBlock, SegmentedControl, SettingsSection } from './controls';
import { useSettings } from '@/lib/settings-context';
import { UNIT_OPTIONS } from '@/lib/settings';

const GROUPS = [
  { key: 'speed', label: 'Speed', hint: 'Used on the speedometer, trip tiles and trip history.' },
  { key: 'distance', label: 'Distance', hint: 'Trip distance, odometer and fuel economy.' },
  { key: 'temperature', label: 'Temperature', hint: 'Used wherever a temperature is shown.' },
  { key: 'volume', label: 'Fuel volume', hint: 'Labels on the fuel log.' },
];

export default function UnitsPanel() {
  const { settings, set } = useSettings();
  const units = settings.units;
  const tracking = settings.tracking;

  return (
    <div className="space-y-4">
      <SettingsSection title="Units" description="Changing a unit converts every value already recorded — nothing is lost.">
        {GROUPS.map((group) => (
          <FieldRow key={group.key} label={group.label} hint={group.hint}>
            <SegmentedControl
              className="min-w-[240px]"
              value={units[group.key]}
              onChange={(id) => set(`units.${group.key}`, id)}
              options={UNIT_OPTIONS[group.key]}
            />
          </FieldRow>
        ))}
      </SettingsSection>

      <SettingsSection
        title="GPS filtering"
        description="Your phone's location is noisy. These limits decide which readings count towards distance."
      >
        <FieldRow
          label="Ignore fixes less accurate than"
          hint={`${tracking.maxAccuracyM} m. Readings worse than this are shown but never added to your distance.`}
        >
          <Slider
            className="w-48"
            min={10}
            max={100}
            step={5}
            value={[tracking.maxAccuracyM]}
            onValueChange={(values) => set('tracking.maxAccuracyM', values[0])}
          />
        </FieldRow>
        <FieldRow
          label="Ignore movement smaller than"
          hint={`${tracking.minMoveM} m. Stops a parked phone from slowly inventing distance.`}
        >
          <Slider
            className="w-48"
            min={2}
            max={25}
            step={1}
            value={[tracking.minMoveM]}
            onValueChange={(values) => set('tracking.minMoveM', values[0])}
          />
        </FieldRow>
        <NoteBlock>
          Defaults suit a phone on a dashboard mount. Raise the accuracy limit if your distance looks too long, lower it if
          short trips are being missed.
        </NoteBlock>
      </SettingsSection>
    </div>
  );
}