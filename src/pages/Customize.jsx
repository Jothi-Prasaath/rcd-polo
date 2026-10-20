import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppearancePanel from '@/components/customize/AppearancePanel';
import VehiclePanel from '@/components/customize/VehiclePanel';
import DashboardPanel from '@/components/customize/DashboardPanel';
import UnitsPanel from '@/components/customize/UnitsPanel';
import ShortcutsPanel from '@/components/customize/ShortcutsPanel';
import OwnershipPanel from '@/components/customize/OwnershipPanel';
import DataPanel from '@/components/customize/DataPanel';

const TABS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'units', label: 'Units' },
  { id: 'shortcuts', label: 'Shortcuts' },
  { id: 'ownership', label: 'Maintenance & fuel' },
  { id: 'data', label: 'Data & capabilities' },
];

export default function Customize() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Customize</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Make the cockpit yours — appearance, vehicle, dashboard, units, shortcuts and everything saved on this phone.
        </p>
      </header>

      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList className="no-scrollbar flex h-auto w-full justify-start gap-1 overflow-x-auto bg-muted/40 p-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="shrink-0 font-heading text-[0.66rem] uppercase tracking-[0.12em]"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <AppearancePanel />
        </TabsContent>
        <TabsContent value="vehicle" className="space-y-4">
          <VehiclePanel />
        </TabsContent>
        <TabsContent value="dashboard" className="space-y-4">
          <DashboardPanel />
        </TabsContent>
        <TabsContent value="units" className="space-y-4">
          <UnitsPanel />
        </TabsContent>
        <TabsContent value="shortcuts" className="space-y-4">
          <ShortcutsPanel />
        </TabsContent>
        <TabsContent value="ownership" className="space-y-4">
          <OwnershipPanel />
        </TabsContent>
        <TabsContent value="data" className="space-y-4">
          <DataPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}