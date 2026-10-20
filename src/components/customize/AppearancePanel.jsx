import React, { useState } from 'react';
import { ImagePlus, RotateCcw, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
import { FieldRow, NoteBlock, SegmentedControl, SettingsSection } from './controls';
import { useSettings } from '@/lib/settings-context';
import { ACCENTS, DENSITIES, FONTS, MODES, TEXT_SIZES } from '@/lib/settings';
import { isHex } from '@/lib/theme-apply';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function AppearancePanel() {
  const { settings, set, merge, resetSection } = useSettings();
  const appearance = settings.appearance;
  const [hexDraft, setHexDraft] = useState(appearance.accentHex);
  const [uploadError, setUploadError] = useState('');

  const applyAccent = (accent) => {
    set('appearance.accentId', accent.id);
    set('appearance.accentHex', accent.hex);
    setHexDraft(accent.hex);
  };

  const applyCustomHex = (value) => {
    setHexDraft(value);
    if (isHex(value)) {
      set('appearance.accentId', 'custom');
      set('appearance.accentHex', value.startsWith('#') ? value : `#${value}`);
    }
  };

  const uploadBackground = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    setUploadError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      set('appearance.backgroundUrl', file_url);
    } catch (e) {
      setUploadError('That image could not be uploaded. Try a smaller file.');
    }
  };

  return (
    <div className="space-y-4">
      <SettingsSection title="Theme" description="Applies to every screen straight away and survives closing the app.">
        <FieldRow label="Mode">
          <SegmentedControl
            className="min-w-[280px]"
            value={appearance.mode}
            onChange={(id) => set('appearance.mode', id)}
            options={MODES}
          />
        </FieldRow>

        <div>
          <Label className="font-heading text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">Accent colour</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACCENTS.map((accent) => (
              <button
                key={accent.id}
                type="button"
                onClick={() => applyAccent(accent)}
                title={accent.label}
                aria-label={accent.label}
                className={cn(
                  'h-9 w-9 rounded-full border-2 transition-transform hover:scale-105',
                  appearance.accentHex.toLowerCase() === accent.hex.toLowerCase()
                    ? 'border-foreground'
                    : 'border-transparent',
                )}
                style={{ backgroundColor: accent.hex }}
              />
            ))}
          </div>
        </div>

        <FieldRow label="Custom colour" hint="Any HEX or RGB value. Type it or use the colour picker.">
          <div className="flex items-center gap-2">
            <Input
              value={hexDraft}
              onChange={(e) => applyCustomHex(e.target.value)}
              className="tnum w-32 font-mono text-xs"
              placeholder="#2D7FF9"
            />
            <input
              type="color"
              aria-label="Pick an accent colour"
              value={isHex(appearance.accentHex) ? (appearance.accentHex.startsWith('#') ? appearance.accentHex : `#${appearance.accentHex}`) : '#2D7FF9'}
              onChange={(e) => applyCustomHex(e.target.value)}
              className="h-9 w-10 cursor-pointer rounded-[calc(var(--radius)-4px)] border border-border bg-transparent"
            />
          </div>
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Background" description="An optional image behind the cockpit. Keep it dark and simple for readability.">
        <FieldRow label="Background image" hint="Uploaded images are stored publicly — anyone with the link can open them.">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={uploadBackground} />
              </label>
            </Button>
            {appearance.backgroundUrl ? (
              <Button size="sm" variant="ghost" onClick={() => set('appearance.backgroundUrl', '')}>
                <X className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </Button>
            ) : null}
          </div>
        </FieldRow>

        <FieldRow label="Or paste an image link">
          <Input
            value={appearance.backgroundUrl}
            onChange={(e) => set('appearance.backgroundUrl', e.target.value)}
            placeholder="https://…"
            className="w-56 text-xs"
          />
        </FieldRow>

        <FieldRow label="Dimming" hint={`${Math.round(appearance.backgroundDim * 100)}% wash over the image so text stays readable.`}>
          <Slider
            className="w-48"
            min={0.3}
            max={0.95}
            step={0.05}
            value={[appearance.backgroundDim]}
            onValueChange={(values) => set('appearance.backgroundDim', values[0])}
          />
        </FieldRow>

        {appearance.backgroundUrl ? (
          <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
            <ImagePlus className="h-3.5 w-3.5" />
            Background applied.
          </div>
        ) : null}
        {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}
      </SettingsSection>

      <SettingsSection title="Typography" description="Type and text size across the whole app.">
        <FieldRow label="Typeface">
          <SegmentedControl
            className="min-w-[280px]"
            value={appearance.fontId}
            onChange={(id) => set('appearance.fontId', id)}
            options={FONTS}
          />
        </FieldRow>
        <FieldRow label="Text size">
          <SegmentedControl
            className="min-w-[240px]"
            value={appearance.textScale}
            onChange={(id) => set('appearance.textScale', id)}
            options={TEXT_SIZES}
          />
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Layout & motion" description="How much space the interface takes up, and how much it moves.">
        <FieldRow label="Interface density">
          <SegmentedControl
            className="min-w-[260px]"
            value={appearance.density}
            onChange={(id) => set('appearance.density', id)}
            options={DENSITIES}
          />
        </FieldRow>
        <FieldRow label="Card corner radius" hint={`${appearance.radius} px`}>
          <Slider
            className="w-48"
            min={0}
            max={28}
            step={1}
            value={[appearance.radius]}
            onValueChange={(values) => set('appearance.radius', values[0])}
          />
        </FieldRow>
        <FieldRow label="Reduced motion" hint="Turns off gauge sweeps and transitions — steadier while driving.">
          <Switch checked={appearance.reduceMotion} onCheckedChange={(checked) => set('appearance.reduceMotion', checked)} />
        </FieldRow>
        <FieldRow label="Card shadows">
          <Switch checked={appearance.cardShadow} onCheckedChange={(checked) => set('appearance.cardShadow', checked)} />
        </FieldRow>
      </SettingsSection>

      <NoteBlock>
        <span className="flex items-start justify-between gap-3">
          <span>Every choice above is saved on this phone and applied the moment you change it.</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 shrink-0 px-2 text-[0.65rem]">
                <RotateCcw className="mr-1.5 h-3 w-3" />
                Reset appearance
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset appearance to defaults?</AlertDialogTitle>
                <AlertDialogDescription>
                  Theme, accent colour, background, type, density and motion return to their original values. Your vehicle
                  profiles and trips are not touched.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my look</AlertDialogCancel>
                <AlertDialogAction onClick={() => resetSection('appearance')}>Reset appearance</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </span>
      </NoteBlock>
    </div>
  );
}