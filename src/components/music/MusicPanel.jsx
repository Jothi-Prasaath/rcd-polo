import React from 'react';
import { ExternalLink, Info, Music as MusicIcon, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSection, NoteBlock } from '@/components/customize/controls';
import { useSettings } from '@/lib/settings-context';
import { MUSIC_APPS } from '@/lib/settings';
import { openMusic, musicTarget } from '@/lib/launch';
import { cn } from '@/lib/utils';

export default function MusicPanel() {
  const { settings, set } = useSettings();
  const selected = musicTarget(settings.shortcuts.musicApp);

  return (
    <div className="space-y-4">
      <SettingsSection
        title="Your music player"
        description={`Playback happens in ${selected.label}. VW Polo Companion opens the app for you and hands you over to it.`}
      >
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => openMusic(selected.id, 'app')}>
            <Smartphone className="mr-1.5 h-4 w-4" />
            Open {selected.label} app
          </Button>
          <Button size="sm" variant="outline" onClick={() => openMusic(selected.id, 'web')}>
            Open web player
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Choose your player" description="This becomes the music shortcut on the dashboard and in the quick rail.">
        <div className="grid gap-2 sm:grid-cols-2">
          {MUSIC_APPS.map((app) => {
            const active = app.id === settings.shortcuts.musicApp;
            return (
              <div
                key={app.id}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-[calc(var(--radius)-4px)] border px-3 py-2.5 transition-colors',
                  active ? 'border-primary/50 bg-primary/8' : 'border-border/70 bg-muted/30',
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <MusicIcon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                  <p className="truncate text-xs font-medium">{app.label}</p>
                </div>
                {active ? (
                  <span className="font-heading text-[0.6rem] uppercase tracking-[0.14em] text-primary">Selected</span>
                ) : (
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[0.65rem]" onClick={() => set('shortcuts.musicApp', app.id)}>
                    Use
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection title="What this section can and cannot do">
        <NoteBlock>
          <span className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              A web app cannot read another app's playback session, so play/pause, next/previous, track title, artist and
              artwork are not shown here. Anything of that kind needs a native Android build with media-session access.
            </span>
          </span>
        </NoteBlock>
        <NoteBlock>
          <span className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Spotify rules apply to Spotify: the app must be installed for the app button to work, a logged-out account
              stops playback, and Premium-only features and offline rules are enforced there, not here. If a player is
              missing, the button simply hands you to its web player instead.
            </span>
          </span>
        </NoteBlock>
      </SettingsSection>
    </div>
  );
}