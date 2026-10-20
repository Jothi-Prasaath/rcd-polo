import { useEffect, useState } from 'react';
import { APP_VERSION } from './settings';

export const KEYS = {
  settings: 'vwpolo.settings.v1',
  trips: 'vwpolo.trips.v1',
};

export const DATA_EVENT = 'vwpolo:data';

export function emitDataChange() {
  try {
    window.dispatchEvent(new Event(DATA_EVENT));
  } catch (e) {
    /* no-op */
  }
}

/** Bumps whenever local trip or vehicle data changes, so screens re-read it. */
export function useDataVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(DATA_EVENT, bump);
    return () => window.removeEventListener(DATA_EVENT, bump);
  }, []);
  return version;
}

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (e) {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    /* no-op */
  }
}

export function exportAll() {
  return {
    app: 'VW Polo Companion',
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: readJSON(KEYS.settings, {}),
    trips: readJSON(KEYS.trips, []),
  };
}

export function importAll(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('That file is not a VW Polo Companion backup.');
  }
  if (!payload.settings && !Array.isArray(payload.trips)) {
    throw new Error('That backup contains no settings or trip data.');
  }
  if (payload.settings && typeof payload.settings === 'object') {
    writeJSON(KEYS.settings, payload.settings);
  }
  if (Array.isArray(payload.trips)) {
    writeJSON(KEYS.trips, payload.trips);
  }
  emitDataChange();
  return {
    hasSettings: !!payload.settings,
    tripCount: Array.isArray(payload.trips) ? payload.trips.length : 0,
  };
}

export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('That file could not be read.'));
    reader.readAsText(file);
  });
}

export function storageSize() {
  let bytes = 0;
  try {
    Object.values(KEYS).forEach((key) => {
      const raw = window.localStorage.getItem(key);
      if (raw) bytes += raw.length;
    });
  } catch (e) {
    return 0;
  }
  return bytes;
}