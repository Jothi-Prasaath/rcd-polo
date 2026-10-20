import React from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Image } from '@/components/ui/image';

const FIELDS = [
  { key: 'nickname', label: 'Nickname', placeholder: 'The Polo' },
  { key: 'displayName', label: 'Display name', placeholder: 'Volkswagen Polo' },
  { key: 'make', label: 'Manufacturer', placeholder: 'Volkswagen' },
  { key: 'model', label: 'Model', placeholder: 'Polo' },
  { key: 'trim', label: 'Trim / variant', placeholder: 'Highline Plus' },
  { key: 'engine', label: 'Engine type', placeholder: 'Diesel' },
  { key: 'displacement', label: 'Displacement', placeholder: '1.5 L' },
  { key: 'fuelType', label: 'Fuel type', placeholder: 'Diesel' },
  { key: 'transmission', label: 'Transmission', placeholder: 'Manual' },
];

export function validateVehicle(form) {
  const errors = {};
  if (!String(form.nickname || '').trim() && !String(form.displayName || '').trim()) {
    errors.nickname = 'Give the vehicle a nickname or a display name.';
  }
  if (!String(form.make || '').trim()) errors.make = 'Manufacturer is required.';
  if (!String(form.model || '').trim()) errors.model = 'Model is required.';

  const year = Number(form.year);
  if (form.year !== '' && form.year !== null && (!Number.isFinite(year) || year < 1900 || year > 2100)) {
    errors.year = 'Model year must be between 1900 and 2100.';
  }
  ['tankCapacity', 'odometer', 'economyTarget'].forEach((key) => {
    const value = form[key];
    if (value === '' || value === null || value === undefined) return;
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) errors[key] = 'Enter a number of 0 or more.';
  });
  return errors;
}

export default function VehicleForm({ form, setForm, errors, onChangeImage }) {
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addCustomField = () => {
    setForm((prev) => ({
      ...prev,
      customFields: [...(prev.customFields || []), { key: '', value: '' }],
    }));
  };

  const updateCustomField = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      customFields: (prev.customFields || []).map((field, i) => (i === index ? { ...field, ...patch } : field)),
    }));
  };

  const removeCustomField = (index) => {
    setForm((prev) => ({
      ...prev,
      customFields: (prev.customFields || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
              {field.label}
            </Label>
            <Input
              value={form[field.key] || ''}
              placeholder={field.placeholder}
              onChange={(e) => set(field.key, e.target.value)}
            />
            {errors[field.key] ? <p className="text-[0.68rem] text-destructive">{errors[field.key]}</p> : null}
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Model year</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={form.year ?? ''}
            onChange={(e) => set('year', e.target.value === '' ? '' : Number(e.target.value))}
          />
          {errors.year ? <p className="text-[0.68rem] text-destructive">{errors.year}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
            Tank capacity (litres)
          </Label>
          <Input
            type="number"
            inputMode="decimal"
            value={form.tankCapacity ?? ''}
            onChange={(e) => set('tankCapacity', e.target.value === '' ? '' : Number(e.target.value))}
          />
          {errors.tankCapacity ? <p className="text-[0.68rem] text-destructive">{errors.tankCapacity}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
            Odometer (km)
          </Label>
          <Input
            type="number"
            inputMode="numeric"
            value={form.odometer ?? ''}
            onChange={(e) => set('odometer', e.target.value === '' ? '' : Number(e.target.value))}
          />
          {errors.odometer ? <p className="text-[0.68rem] text-destructive">{errors.odometer}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
            Expected economy (km/L)
          </Label>
          <Input
            type="number"
            inputMode="decimal"
            value={form.economyTarget ?? ''}
            onChange={(e) => set('economyTarget', e.target.value === '' ? '' : Number(e.target.value))}
          />
          {errors.economyTarget ? <p className="text-[0.68rem] text-destructive">{errors.economyTarget}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
          Vehicle artwork
        </Label>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={onChangeImage} />
            </label>
          </Button>
          {form.imageUrl ? (
            <Button size="sm" variant="ghost" onClick={() => set('imageUrl', '')}>
              <X className="mr-1.5 h-3.5 w-3.5" />
              Remove
            </Button>
          ) : null}
        </div>
        {form.imageUrl ? (
          <Image src={form.imageUrl} alt="Vehicle artwork" className="h-28 w-full max-w-xs rounded-[calc(var(--radius)-4px)]" fittingType="fill" />
        ) : null}
        <Input
          value={form.imageUrl || ''}
          placeholder="Or paste an image link"
          onChange={(e) => set('imageUrl', e.target.value)}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Notes</Label>
        <Textarea
          rows={2}
          value={form.notes || ''}
          placeholder="Service history, tyre size, insurance renewal…"
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
            Your own fields
          </Label>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-[0.65rem]" onClick={addCustomField}>
            <Plus className="mr-1.5 h-3 w-3" />
            Add field
          </Button>
        </div>
        {(form.customFields || []).map((field, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={field.key}
              placeholder="Name"
              onChange={(e) => updateCustomField(index, { key: e.target.value })}
              className="text-xs"
            />
            <Input
              value={field.value}
              placeholder="Value"
              onChange={(e) => updateCustomField(index, { value: e.target.value })}
              className="text-xs"
            />
            <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive" onClick={() => removeCustomField(index)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {(form.customFields || []).length === 0 ? (
          <p className="text-[0.7rem] text-muted-foreground">Add anything the standard fields do not cover.</p>
        ) : null}
      </div>
    </div>
  );
}