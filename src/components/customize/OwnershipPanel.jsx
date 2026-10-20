import React, { useState } from 'react';
import { Fuel, Pencil, Plus, Trash2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { NoteBlock, SettingsSection } from './controls';
import { useSettings } from '@/lib/settings-context';
import { formatDay, formatDistance, kmPerLitre, litresToUnit, metersToUnit, UNIT_LABEL } from '@/lib/geo';

export default function OwnershipPanel() {
  const { settings, set } = useSettings();
  const units = settings.units;
  const maintenance = settings.maintenance || [];
  const fuelLog = settings.fuelLog || [];

  const [itemDraft, setItemDraft] = useState(null);
  const [fuelDraft, setFuelDraft] = useState(null);

  const saveItem = () => {
    if (!itemDraft.label.trim()) return;
    const exists = maintenance.some((i) => i.id === itemDraft.id);
    set('maintenance', exists ? maintenance.map((i) => (i.id === itemDraft.id ? itemDraft : i)) : [...maintenance, itemDraft]);
    setItemDraft(null);
  };

  const saveFuel = () => {
    const odometerKm = Number(fuelDraft.odometerInput);
    const litres = units.volume === 'gal' ? Number(fuelDraft.litresInput) * 3.785411784 : Number(fuelDraft.litresInput);
    if (!Number.isFinite(odometerKm) || odometerKm <= 0 || !Number.isFinite(litres) || litres <= 0) return;
    const entry = {
      id: fuelDraft.id,
      date: fuelDraft.date,
      odometerKm,
      litres,
      cost: Number(fuelDraft.cost) || 0,
      notes: fuelDraft.notes || '',
    };
    const exists = fuelLog.some((e) => e.id === entry.id);
    set('fuelLog', exists ? fuelLog.map((e) => (e.id === entry.id ? entry : e)) : [...fuelLog, entry]);
    setFuelDraft(null);
  };

  const runs = [...fuelLog]
    .filter((e) => e.odometerKm > 0 && e.litres > 0)
    .sort((a, b) => a.odometerKm - b.odometerKm)
    .map((entry, index, all) => {
      if (index === 0) return { entry, kmpl: null };
      const distance = entry.odometerKm - all[index - 1].odometerKm;
      return { entry, kmpl: distance > 0 ? kmPerLitre(distance * 1000, entry.litres) : null };
    });

  return (
    <div className="space-y-4">
      <SettingsSection
        title="Maintenance"
        description="Service dates and reminders you plan yourself. The app reminds, it does not diagnose."
        action={
          <Button size="sm" onClick={() => setItemDraft({ id: `m_${Date.now()}`, label: '', dueDate: '', dueOdometerKm: '', notes: '', done: false })}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add item
          </Button>
        }
      >
        {maintenance.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nothing planned yet. Add a service, insurance renewal or tyre change.</p>
        ) : (
          <div className="space-y-2">
            {maintenance.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[calc(var(--radius)-4px)] border border-border/70 bg-muted/25 p-3">
                <div className="min-w-0">
                  <p className={item.done ? 'text-xs font-medium line-through opacity-60' : 'text-xs font-medium'}>{item.label}</p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    {item.dueDate ? `Due ${formatDay(item.dueDate)}` : 'No date'}
                    {item.dueOdometerKm ? ` · at ${Math.round(metersToUnit(Number(item.dueOdometerKm) * 1000, units.distance))} ${UNIT_LABEL.distance[units.distance]}` : ''}
                    {item.notes ? ` · ${item.notes}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={!!item.done}
                    onCheckedChange={(checked) => set('maintenance', maintenance.map((i) => (i.id === item.id ? { ...i, done: checked } : i)))}
                    aria-label={`Mark ${item.label} done`}
                  />
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setItemDraft({ ...item })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete “{item.label}”?</AlertDialogTitle>
                        <AlertDialogDescription>This reminder will be removed from this phone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep it</AlertDialogCancel>
                        <AlertDialogAction onClick={() => set('maintenance', maintenance.filter((i) => i.id !== item.id))}>
                          Delete item
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        title="Fuel log"
        description="Log what you put in and at what odometer reading. Economy is calculated between fills."
        action={
          <Button
            size="sm"
            onClick={() =>
              setFuelDraft({
                id: `f_${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                odometerInput: '',
                litresInput: '',
                cost: '',
                notes: '',
              })
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add fill-up
          </Button>
        }
      >
        {fuelLog.length === 0 ? (
          <p className="text-xs text-muted-foreground">No fill-ups logged yet.</p>
        ) : (
          <div className="space-y-2">
            {runs
              .slice()
              .reverse()
              .map(({ entry, kmpl }) => (
                <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[calc(var(--radius)-4px)] border border-border/70 bg-muted/25 p-3">
                  <div>
                    <p className="text-xs font-medium">
                      {formatDay(entry.date)} · {litresToUnit(entry.litres, units.volume).toFixed(2)}{' '}
                      {UNIT_LABEL.volume[units.volume]}
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Odometer {Math.round(metersToUnit(entry.odometerKm * 1000, units.distance))} {UNIT_LABEL.distance[units.distance]}
                      {entry.cost ? ` · cost ${entry.cost}` : ''}
                      {kmpl ? ` · ${(units.distance === 'mi' ? kmpl * 2.35215 : kmpl).toFixed(1)} ${units.distance === 'mi' ? 'mpg' : 'km/L'}` : ''}
                    </p>
                    {entry.notes ? <p className="text-[0.7rem] text-muted-foreground">{entry.notes}</p> : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => {
                        const odometerValue = metersToUnit(entry.odometerKm * 1000, units.distance);
                        setFuelDraft({
                          ...entry,
                          odometerInput: odometerValue.toFixed(1),
                          litresInput: litresToUnit(entry.litres, units.volume).toFixed(2),
                          cost: entry.cost === undefined ? '' : String(entry.cost),
                        });
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-destructive"
                      onClick={() => set('fuelLog', fuelLog.filter((e) => e.id !== entry.id))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
        <NoteBlock>
          <span className="flex items-start gap-2">
            <Fuel className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              These are your own readings — nothing comes from the car's computer. Distance between fills is taken from the
              odometer figures you type in, in {UNIT_LABEL.distance[units.distance]}.
            </span>
          </span>
        </NoteBlock>
      </SettingsSection>

      <Dialog open={!!itemDraft} onOpenChange={(open) => (open ? null : setItemDraft(null))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Wrench className="h-4 w-4" />
              {maintenance.some((i) => i.id === itemDraft?.id) ? 'Edit item' : 'New maintenance item'}
            </DialogTitle>
          </DialogHeader>
          {itemDraft ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">What is it?</Label>
                <Input value={itemDraft.label} placeholder="Oil and filter change" onChange={(e) => setItemDraft({ ...itemDraft, label: e.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Due date</Label>
                  <Input type="date" value={itemDraft.dueDate || ''} onChange={(e) => setItemDraft({ ...itemDraft, dueDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Or odometer (km)</Label>
                  <Input
                    type="number"
                    value={itemDraft.dueOdometerKm || ''}
                    onChange={(e) => setItemDraft({ ...itemDraft, dueOdometerKm: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Notes</Label>
                <Textarea rows={2} value={itemDraft.notes || ''} onChange={(e) => setItemDraft({ ...itemDraft, notes: e.target.value })} />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setItemDraft(null)}>
              Cancel
            </Button>
            <Button onClick={saveItem} disabled={!itemDraft || !itemDraft.label.trim()}>
              Save item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fuelDraft} onOpenChange={(open) => (open ? null : setFuelDraft(null))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Fuel className="h-4 w-4" />
              {fuelLog.some((e) => e.id === fuelDraft?.id) ? 'Edit fill-up' : 'New fill-up'}
            </DialogTitle>
          </DialogHeader>
          {fuelDraft ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Date</Label>
                <Input type="date" value={fuelDraft.date || ''} onChange={(e) => setFuelDraft({ ...fuelDraft, date: e.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Odometer ({UNIT_LABEL.distance[units.distance]})
                  </Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={fuelDraft.odometerInput}
                    onChange={(e) => setFuelDraft({ ...fuelDraft, odometerInput: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Fuel added ({UNIT_LABEL.volume[units.volume]})
                  </Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={fuelDraft.litresInput}
                    onChange={(e) => setFuelDraft({ ...fuelDraft, litresInput: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Cost (optional)</Label>
                <Input type="number" inputMode="decimal" value={fuelDraft.cost || ''} onChange={(e) => setFuelDraft({ ...fuelDraft, cost: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">Notes</Label>
                <Textarea rows={2} value={fuelDraft.notes || ''} onChange={(e) => setFuelDraft({ ...fuelDraft, notes: e.target.value })} />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFuelDraft(null)}>
              Cancel
            </Button>
            <Button onClick={saveFuel}>Save fill-up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}