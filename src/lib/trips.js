import { emitDataChange, KEYS, readJSON, writeJSON } from './storage';

const MAX_TRIPS = 2000;

export function listTrips() {
  const trips = readJSON(KEYS.trips, []);
  if (!Array.isArray(trips)) return [];
  return [...trips].sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
}

export function addTrip(trip) {
  const trips = readJSON(KEYS.trips, []);
  const safe = Array.isArray(trips) ? trips : [];
  const record = {
    id: trip.id || `t_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...trip,
  };
  const next = [record, ...safe].slice(0, MAX_TRIPS);
  writeJSON(KEYS.trips, next);
  emitDataChange();
  return record;
}

export function updateTrip(id, patch) {
  const trips = readJSON(KEYS.trips, []);
  const next = (Array.isArray(trips) ? trips : []).map((t) => (t.id === id ? { ...t, ...patch } : t));
  writeJSON(KEYS.trips, next);
  emitDataChange();
  return next;
}

export function deleteTrip(id) {
  const trips = readJSON(KEYS.trips, []);
  const next = (Array.isArray(trips) ? trips : []).filter((t) => t.id !== id);
  writeJSON(KEYS.trips, next);
  emitDataChange();
  return next;
}

export function clearTrips() {
  writeJSON(KEYS.trips, []);
  emitDataChange();
}

export function tripTotals(trips) {
  if (!trips || trips.length === 0) {
    return { count: 0, distanceM: 0, durationS: 0, maxSpeedKmh: 0, avgSpeedKmh: 0, longest: null };
  }
  let distanceM = 0;
  let durationS = 0;
  let maxSpeedKmh = 0;
  let longest = trips[0];
  trips.forEach((t) => {
    distanceM += t.distanceM || 0;
    durationS += t.durationS || 0;
    const peak = Math.max(t.maxSpeedKmh || 0, t.avgSpeedKmh || 0);
    if (peak > maxSpeedKmh) maxSpeedKmh = peak;
    if ((t.distanceM || 0) > (longest.distanceM || 0)) longest = t;
  });
  return {
    count: trips.length,
    distanceM,
    durationS,
    maxSpeedKmh,
    avgSpeedKmh: durationS > 0 ? (distanceM / 1000 / durationS) * 3600 : 0,
    longest,
  };
}