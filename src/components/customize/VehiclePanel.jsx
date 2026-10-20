import React, { useState } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import VehicleForm, { validateVehicle } from './VehicleForm';
import { NoteBlock, SettingsSection } from './controls';
import { useSettings } from '@/lib/settings-context';
import { DEFAULT_VEHICLE } from '@/lib/settings';
import { base44 } from '@/api/base44Client';
import { formatDistance, UNIT_LABEL } from '@/lib/geo';

function emptyVehicle() {
  return {
    ...JSON.parse(JSON.stringify(DEFAULT_VEHICLE)),
    id: `v_${Date.now()}`,
    nickname: '',
    displayName: '',
    make: '',
    model: '',
    year: '',
    trim: '',
    engine: '',
    displacement: '',
    fuelType: '',
    transmission: '',
    tankCapacity: '',
    odometer: 0,
    imageUrl: '',
    economyTarget: '',
    notes: '',
    customFields: [],
  };
}

export default function VehiclePanel() {
  const { settings, set } = useSettings();
  const profiles = settings.vehicle.profiles || [];
  const units = settings.units;

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  const openNew = () => {
    setForm(emptyVehicle());
    setErrors({});
    setEditing('new');
  };

  const openEdit = (vehicle) => {
    setForm({ ...vehicle, customFields: [...(vehicle.customFields || [])] });
    setErrors({});
    setEditing(vehicle.id);
  };

  const save = () => {
    const found = validateVehicle(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = {
      ...form,
      year: form.year === '' ? '' : Number(form.year),
      tankCapacity: form.tankCapacity === '' ? '' : Number(form.tankCapacity),
      odometer: form.odometer === '' ? 0 : Number(form.odometer),
      economyTarget: form.economyTarget === '' ? '' : Number(form.economyTarget),
      customFields: (form.customFields || []).filter((f) => f.key.trim() || f.value.trim()),
    };

    if (editing === 'new') {
      set('vehicle.profiles', [...profiles, payload]);
      set('vehicle.activeId', payload.id);
    } else {
      set('vehicle.profiles', profiles.map((v) => (v.id === payload.id ? payload : v)));
    }
    setEditing(null);
    setForm(null);
  };

  const remove = (id) => {
    const next = profiles.filter((v) => v.id !== id);
    set('vehicle.profiles', next);
    if (settings.vehicle.activeId === id && next.length > 0) {
      set('vehicle.activeId', next[0].id);
    }
  };

  const uploadImage = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setForm((prev) => ({ ...prev, imageUrl: file_url }));
    } catch (e) {
      setErrors((prev) => ({ ...prev, imageUrl: 'That image could not be uploaded.' }));
    }
  };

  return (
    <div className="space-y-4">
      <SettingsSection
        title="Vehicle profiles"
        description="Rename the app's vehicle, or add a completely different car. Every field below is yours to edit."
        action={
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add vehicle
          </Button>
        }
      >
        <div className="space-y-2.5">
          {profiles.map((vehicle) => {
            const active = vehicle.id === settings.vehicle.activeId;
            return (
              <div
                key={vehicle.id}
                className={
                  active
                    ? 'rounded-[calc(var(--radius)-4px)] border border-primary/50 bg-primary/8 p-3'
                    : 'rounded-[calc(var(--radius)-4px)] border border-border/70 bg-muted/25 p-3'
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold">
                      {vehicle.nickname || vehicle.displayName || 'Unnamed vehicle'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[vehicle.displayName, vehicle.year, vehicle.trim].filter(Boolean).join(' · ') || 'Details not filled in yet'}
                    </p>
                    <p className="mt-1 text-[0.7rem] text-muted-foreground">
                      Odometer {formatDistance(Number(vehicle.odometer || 0) * 1000, units.distance)}{' '}
                      {UNIT_LABEL.distance[units.distance]} · you entered this
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {active ? (
                      <Badge variant="secondary" className="font-heading text-[0.6rem] uppercase tracking-[0.12em]">
                        Active
                      </Badge>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-[0.65rem]" onClick={() => set('vehicle.activeId', vehicle.id)}>
                        <Check className="mr-1 h-3 w-3" />
                        Set active
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(vehicle)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {profiles.length > 1 ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove this vehicle?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {vehicle.nickname || vehicle.displayName} will be deleted from this phone. Trips already
                              recorded stay in your history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep it</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(vehicle.id)}>Remove vehicle</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <NoteBlock>
        Manufacturer, model, engine and trim are what you type in — the app does not decode a VIN, connect to the car or
        verify any of it. Odometer and fuel figures stay exactly as you entered them.
      </NoteBlock>

      <Dialog open={editing !== null} onOpenChange={(open) => (open ? null : setEditing(null))}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing === 'new' ? 'Add a vehicle' : 'Edit vehicle'}
            </DialogTitle>
            <DialogDescription>
              All of this is stored on this phone and can be changed at any time.
            </DialogDescription>
          </DialogHeader>

          {form ? (
            <VehicleForm form={form} setForm={setForm} errors={errors} onChangeImage={uploadImage} />
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}