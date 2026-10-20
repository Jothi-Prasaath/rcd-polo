import React from 'react';
import { ArrowDown, ArrowUp, GripVertical, RotateCcw } from 'lucide-react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { CARD_CATALOG, DEFAULT_CARDS, LAYOUTS, SPEEDO_STYLES } from '@/lib/settings';

export default function DashboardPanel() {
  const { settings, set, resetSection } = useSettings();
  const cards = settings.dashboard.cards || [];

  const move = (from, to) => {
    if (to < 0 || to >= cards.length) return;
    const next = [...cards];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    set('dashboard.cards', next);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  const updateCard = (id, patch) => {
    set(
      'dashboard.cards',
      cards.map((card) => (card.id === id ? { ...card, ...patch } : card)),
    );
  };

  return (
    <div className="space-y-4">
      <SettingsSection title="Layout" description="How the dashboard cards are arranged on the Drive screen.">
        <FieldRow label="Layout">
          <SegmentedControl
            className="min-w-[280px]"
            value={settings.dashboard.layout}
            onChange={(id) => set('dashboard.layout', id)}
            options={LAYOUTS}
          />
        </FieldRow>
        <FieldRow label="Speedometer" hint="Both styles show the same GPS-derived speed.">
          <SegmentedControl
            className="min-w-[260px]"
            value={settings.dashboard.speedo}
            onChange={(id) => set('dashboard.speedo', id)}
            options={SPEEDO_STYLES}
          />
        </FieldRow>
      </SettingsSection>

      <SettingsSection
        title="Cards"
        description="Drag a card by its grip to reorder, or use the arrows. Switch a card off to hide it completely."
        action={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Restore default
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restore the default dashboard?</AlertDialogTitle>
                <AlertDialogDescription>
                  Card order, visibility, labels, layout and speedometer style all return to their original values.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep mine</AlertDialogCancel>
                <AlertDialogAction onClick={() => set('dashboard', { ...settings.dashboard, layout: 'cockpit', speedo: 'digital', cards: JSON.parse(JSON.stringify(DEFAULT_CARDS)) })}>
                  Restore default
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard-cards">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {cards.map((card, index) => {
                  const meta = CARD_CATALOG.find((c) => c.id === card.id) || { label: card.id, hint: '' };
                  return (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className="rounded-[calc(var(--radius)-4px)] border border-border/70 bg-muted/25 p-2.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              {...drag.dragHandleProps}
                              className="cursor-grab text-muted-foreground active:cursor-grabbing"
                              aria-label={`Reorder ${meta.label}`}
                            >
                              <GripVertical className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium">{meta.label}</p>
                              <p className="truncate text-[0.68rem] text-muted-foreground">{meta.hint}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                disabled={index === 0}
                                onClick={() => move(index, index - 1)}
                                aria-label="Move up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                disabled={index === cards.length - 1}
                                onClick={() => move(index, index + 1)}
                                aria-label="Move down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <Switch
                              checked={!!card.visible}
                              onCheckedChange={(checked) => updateCard(card.id, { visible: checked })}
                              aria-label={`Show ${meta.label}`}
                            />
                          </div>
                          <Input
                            value={card.label || ''}
                            placeholder={`Custom label (default: ${meta.label})`}
                            onChange={(e) => updateCard(card.id, { label: e.target.value })}
                            className="mt-2.5 h-8 text-xs"
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </SettingsSection>

      <NoteBlock>
        Hiding every card leaves the Drive screen with your trip controls only — the buttons to start, pause and save a
        trip never disappear.
      </NoteBlock>
    </div>
  );
}