import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/lib/settings-context';

function newDestination() {
  return { id: `d_${Date.now()}`, label: '', address: '' };
}

export default function DestinationsEditor() {
  const { settings, set } = useSettings();
  const destinations = settings.shortcuts.destinations || [];
  const [draft, setDraft] = useState({ label: '', address: '' });

  const update = (id, patch) => {
    set(
      'shortcuts.destinations',
      destinations.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    );
  };

  const add = () => {
    if (!draft.address.trim()) return;
    set('shortcuts.destinations', [...destinations, { ...newDestination(), label: draft.label.trim() || 'Saved place', address: draft.address.trim() }]);
    setDraft({ label: '', address: '' });
  };

  const remove = (id) => {
    set(
      'shortcuts.destinations',
      destinations.filter((d) => d.id !== id),
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2.5">
        {destinations.map((destination, index) => (
          <div key={destination.id} className="space-y-2 rounded-[calc(var(--radius)-4px)] border border-border/70 bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-heading text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                Place {index + 1}
              </p>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => remove(destination.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Label (Home, Office, Gym)"
                value={destination.label}
                onChange={(e) => update(destination.id, { label: e.target.value })}
              />
              <Input
                placeholder="Address or place name"
                value={destination.address}
                onChange={(e) => update(destination.id, { address: e.target.value })}
              />
            </div>
          </div>
        ))}
        {destinations.length === 0 ? (
          <p className="text-xs text-muted-foreground">No saved places yet. Add one below.</p>
        ) : null}
      </div>

      <div className="space-y-2 rounded-[calc(var(--radius)-4px)] border border-dashed border-border p-3">
        <Label className="font-heading text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">Add a place</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Label" value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} />
          <Input
            placeholder="Address or place name"
            value={draft.address}
            onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
          />
        </div>
        <Button size="sm" variant="secondary" onClick={add} disabled={!draft.address.trim()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add place
        </Button>
      </div>
    </div>
  );
}