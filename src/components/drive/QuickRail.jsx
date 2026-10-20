import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Music, Phone, SlidersHorizontal } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { openDirections, openMusic, dial, musicTarget } from '@/lib/launch';
import { NAV_APPS } from '@/lib/settings';

function RailButton({ icon: Icon, label, onClick, to }) {
  const classes =
    'flex min-w-0 items-center justify-center gap-2 rounded-[calc(var(--radius)-4px)] border border-border/70 bg-card px-2.5 py-2.5 font-heading text-[0.66rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground';
  if (to) {
    return (
      <Link to={to} className={classes}>
        <Icon className="h-4 w-4" />
        <span className="truncate">{label}</span>
      </Link>
    );
  }
  return (
    <button type="button" className={classes} onClick={onClick}>
      <Icon className="h-4 w-4" />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function QuickRail() {
  const { settings } = useSettings();
  const navApp = NAV_APPS.find((a) => a.id === settings.shortcuts.navApp);
  const music = musicTarget(settings.shortcuts.musicApp);
  const firstDestination = (settings.shortcuts.destinations || []).find((d) => d.address && d.address.trim());

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <RailButton
        icon={MapPin}
        label={firstDestination ? firstDestination.label || 'Navigate' : navApp ? navApp.label : 'Navigate'}
        onClick={() => openDirections({ destination: firstDestination?.address, appId: settings.shortcuts.navApp })}
      />
      <RailButton icon={Music} label={music.label} onClick={() => openMusic(music.id, 'app')} />
      <RailButton
        icon={Phone}
        label={settings.shortcuts.dialer && settings.shortcuts.dialer.number ? settings.shortcuts.dialer.label || 'Call' : 'Call'}
        onClick={() => dial(settings.shortcuts.dialer && settings.shortcuts.dialer.number)}
      />
      <RailButton icon={SlidersHorizontal} label="Customize" to="/customize" />
    </div>
  );
}