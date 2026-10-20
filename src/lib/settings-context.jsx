import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultSettings } from './settings';
import { KEYS, readJSON, removeKey, writeJSON } from './storage';
import { applyTheme } from './theme-apply';

const SettingsContext = createContext(null);

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Stored settings merged over the defaults, so new options appear after an update. */
export function mergeDeep(base, override) {
  if (!isPlainObject(override)) return override === undefined ? base : override;
  const out = { ...base };
  Object.keys(override).forEach((key) => {
    if (isPlainObject(base?.[key]) && isPlainObject(override[key])) {
      out[key] = mergeDeep(base[key], override[key]);
    } else if (override[key] !== undefined) {
      out[key] = override[key];
    }
  });
  return out;
}

export function getIn(obj, path) {
  return String(path)
    .split('.')
    .reduce((acc, key) => (acc === undefined || acc === null ? acc : acc[key]), obj);
}

export function setIn(obj, path, value) {
  const keys = String(path).split('.');
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  let cursor = clone;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const current = cursor[key];
    cursor[key] = Array.isArray(current) ? [...current] : { ...(current || {}) };
    cursor = cursor[key];
  }
  cursor[keys[keys.length - 1]] = value;
  return clone;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() =>
    mergeDeep(defaultSettings(), readJSON(KEYS.settings, {})),
  );

  useEffect(() => {
    writeJSON(KEYS.settings, settings);
  }, [settings]);

  useEffect(() => {
    applyTheme(settings);
  }, [settings]);

  const set = useCallback((path, value) => {
    setSettings((prev) => setIn(prev, path, value));
  }, []);

  const merge = useCallback((path, patch) => {
    setSettings((prev) => setIn(prev, path, { ...(getIn(prev, path) || {}), ...patch }));
  }, []);

  const resetSection = useCallback((path) => {
    setSettings((prev) => setIn(prev, path, JSON.parse(JSON.stringify(getIn(defaultSettings(), path)))));
  }, []);

  const resetAll = useCallback(() => {
    removeKey(KEYS.settings);
    setSettings(defaultSettings());
  }, []);

  const value = useMemo(
    () => ({ settings, setSettings, set, merge, resetSection, resetAll }),
    [settings, set, merge, resetSection, resetAll],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}

export function useActiveVehicle() {
  const { settings } = useSettings();
  const profiles = settings.vehicle.profiles || [];
  return profiles.find((v) => v.id === settings.vehicle.activeId) || profiles[0] || null;
}