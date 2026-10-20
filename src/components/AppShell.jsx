import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Car, Gauge, Music, Navigation, Route, SlidersHorizontal } from 'lucide-react';
import { useActiveVehicle } from '@/lib/settings-context';
import { useSettings } from '@/lib/settings-context';
import { cn } from '@/lib/utils';

export const TABS = [
  { to: '/', label: 'Drive', icon: Gauge },
  { to: '/music', label: 'Music', icon: Music },
  { to: '/navigate', label: 'Navigate', icon: Navigation },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/customize', label: 'Customize', icon: SlidersHorizontal },
];

function TabLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex min-w-0 flex-col items-center gap-1 px-0.5 py-2.5 text-[0.6rem] font-medium transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'flex h-8 w-full max-w-11 items-center justify-center rounded-md transition-colors',
              isActive && 'bg-primary/12',
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span className="w-full truncate text-center">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function RailLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center gap-1.5 rounded-[calc(var(--radius)-4px)] px-2 py-3 text-[0.62rem] font-medium uppercase tracking-[0.12em] transition-colors',
          isActive ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppShell() {
  const { settings } = useSettings();
  const vehicle = useActiveVehicle();
  const background = settings.appearance.backgroundUrl;

  return (
    <div className="relative min-h-screen">
      {background ? (
        <div className="app-bg" style={{ backgroundImage: `url("${background}")` }} />
      ) : null}

      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-primary text-primary-foreground">
              <Car className="h-4 w-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="font-heading text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                VW Polo Companion
              </p>
              <p className="truncate font-display text-sm font-semibold">
                {vehicle ? vehicle.nickname || vehicle.displayName : 'No vehicle profile'}
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-5xl">
          <nav className="sticky top-[61px] hidden h-[calc(100vh-61px)] w-[86px] shrink-0 flex-col gap-1 border-r border-border/60 px-2 py-4 lg:flex">
            {TABS.map((tab) => (
              <RailLink key={tab.to} {...tab} />
            ))}
          </nav>
          <main className="w-full min-w-0 px-4 pb-28 pt-4 lg:pb-12">
            <Outlet />
          </main>
        </div>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto grid w-full max-w-lg grid-cols-5">
          {TABS.map((tab) => (
            <TabLink key={tab.to} {...tab} />
          ))}
        </div>
      </nav>
    </div>
  );
}