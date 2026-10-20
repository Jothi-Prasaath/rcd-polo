import React, { useRef, useState } from 'react';
import { AlertTriangle, Download, Info, RefreshCw, ShieldAlert, Smartphone, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { APP_VERSION, DEFAULT_CARDS } from '@/lib/settings';
import {
  downloadJSON,
  exportAll,
  importAll,
  readTextFile,
  storageSize,
} from '@/lib/storage';
import { clearTrips, listTrips } from '@/lib/trips';

export default function DataPanel() {
  const { settings, setSettings, resetAll, set } = useSettings();
  const fileRef = useRef(null);
  const [message, setMessage] = useState(null);

  const trips = listTrips();
  const sizeKb = (storageSize() / 1024).toFixed(1);

  const handleExport = () => {
    downloadJSON(`vwpolo-backup-${new Date().toISOString().slice(0, 10)}.json`, exportAll());
    setMessage({ tone: 'ok', text: 'Backup file created with your settings, vehicle profiles and trips.' });
  };

  const handleImport = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      const text = await readTextFile(file);
      const parsed = JSON.parse(text);
      const result = importAll(parsed);
      if (parsed.settings) {
        setSettings(parsed.settings);
      }
      setMessage({
        tone: 'ok',
        text: `Backup restored${result.hasSettings ? ' — settings and vehicle profiles' : ''}${
          result.tripCount ? `, ${result.tripCount} trips` : ''
        }.`,
      });
    } catch (e) {
      setMessage({ tone: 'error', text: e.message || 'That backup could not be read.' });
    }
  };

  return (
    <div className="space-y-4">
      <SettingsSection
        title="Backup and restore"
        description="One file with your appearance, vehicle profiles, dashboard layout, shortcuts, maintenance, fuel log and trips."
      >
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Export backup
          </Button>
          <Button size="sm" variant="outline" onClick={() => fileRef.current && fileRef.current.click()}>
            <Upload className="mr-1.5 h-4 w-4" />
            Restore backup
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
        </div>
        {message ? (
          <p className={message.tone === 'error' ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>{message.text}</p>
        ) : null}
        <p className="text-[0.7rem] text-muted-foreground">
          Stored on this phone: {sizeKb} KB across {trips.length} saved trip{trips.length === 1 ? '' : 's'}.
        </p>
      </SettingsSection>

      <SettingsSection title="Safe resets" description="Each reset asks first, and none of them touch more than it says.">
        <div className="flex flex-wrap gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Reset dashboard only
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset the dashboard?</AlertDialogTitle>
                <AlertDialogDescription>Card order, visibility and labels return to their defaults.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep mine</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    set('dashboard', {
                      layout: 'cockpit',
                      speedo: 'digital',
                      cards: JSON.parse(JSON.stringify(DEFAULT_CARDS)),
                    })
                  }
                >
                  Reset dashboard
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-destructive">
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                Delete trip history ({trips.length})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all trip history?</AlertDialogTitle>
                <AlertDialogDescription>
                  {trips.length} saved trip{trips.length === 1 ? '' : 's'} will be erased from this phone. Your vehicle
                  profiles and settings stay untouched.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my trips</AlertDialogCancel>
                <AlertDialogAction onClick={() => clearTrips()}>Delete trips</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive">
                <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                Factory reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset everything?</AlertDialogTitle>
                <AlertDialogDescription>
                  Appearance, vehicle profiles, dashboard, shortcuts, maintenance and fuel log all return to defaults, and
                  your trip history is deleted. Export a backup first if you might want any of it back.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearTrips();
                    resetAll();
                    setMessage({ tone: 'ok', text: 'Everything is back to its original state.' });
                  }}
                >
                  Reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SettingsSection>

      <SettingsSection title="Where your data lives" description="Plain answers about privacy and reliability in this build.">
        <NoteBlock>
          <span className="flex items-start gap-2">
            <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Settings, vehicle profiles, maintenance, fuel entries and trips are kept in this phone's local app storage.
              Nothing is uploaded to a server. The only files that leave the phone are images you choose for vehicle
              artwork or a background, which are stored publicly — anyone with the link can open them. Use Export backup to
              move everything to a new phone.
            </span>
          </span>
        </NoteBlock>
        <NoteBlock>
          <span className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Clearing your browser or app data, or uninstalling the app, removes everything stored here. Exporting a backup
              is the only copy that survives.
            </span>
          </span>
        </NoteBlock>
      </SettingsSection>

      <SettingsSection title="Capabilities and limits of this build" description="What is real here, what needs hardware, and what this platform cannot do.">
        <NoteBlock>
          <strong className="font-medium text-foreground">Speed and trips.</strong> Read from your phone's GPS. Distances are
          filtered for GPS noise, but they are not the car's own measurements and can be out by a few percent. Recording
          stops when the screen is off or the browser is in the background, because phones suspend web apps.
        </NoteBlock>
        <NoteBlock>
          <strong className="font-medium text-foreground">OBD-II.</strong> Not implemented, and no engine data is faked
          anywhere in this app. Genuine RPM, coolant temperature or fault codes need a Bluetooth ELM327 adapter and a native
          Android app with Bluetooth permissions. The dashboard card explains this instead of showing invented numbers.
        </NoteBlock>
        <NoteBlock>
          <strong className="font-medium text-foreground">Android Auto and the car screen.</strong> This build is a phone
          app. Google only permits apps built with the Android for Cars App Library to appear on Android Auto — a
          custom speedometer or cockpit like this one is not eligible — and the Polo's RCD unit may predate App-Connect
          altogether. Check your head unit's menu for Android Auto or App-Connect. If it is there, this companion is best
          used with the phone on a mount, alongside the car's own screen for maps.
        </NoteBlock>
        <NoteBlock>
          <strong className="font-medium text-foreground">Music.</strong> Opening your player is a shortcut. Playback
          control, track titles and artwork cannot be read from another app by a web app.
        </NoteBlock>
        <NoteBlock>
          <strong className="font-medium text-foreground">Version.</strong> {APP_VERSION} · GPS behaviour has not been
          verified on a vehicle — check it against your dashboard on a first drive before relying on it.
        </NoteBlock>
      </SettingsSection>
    </div>
  );
}