export const UNIT_LABEL = {
  speed: { kmh: 'km/h', mph: 'mph' },
  distance: { km: 'km', mi: 'mi' },
  temperature: { c: '°C', f: '°F' },
  volume: { l: 'L', gal: 'gal' },
};

const DEG = Math.PI / 180;

export function haversineMeters(a, b) {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * DEG;
  const dLng = (b.lng - a.lng) * DEG;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const mpsToKmh = (mps) => (isFinite(mps) ? mps * 3.6 : 0);

export function kmhToUnit(kmh, unit) {
  return unit === 'mph' ? kmh / 1.609344 : kmh;
}

export function formatSpeed(kmh, unit) {
  if (kmh === null || kmh === undefined || !isFinite(kmh)) return '—';
  return String(Math.round(kmhToUnit(Math.max(0, kmh), unit)));
}

export function metersToUnit(meters, unit) {
  return unit === 'mi' ? meters / 1609.344 : meters / 1000;
}

export function formatDistance(meters, unit) {
  if (meters === null || meters === undefined || !isFinite(meters)) return '—';
  const value = metersToUnit(meters, unit);
  const digits = value < 10 ? 2 : 1;
  return value.toFixed(digits);
}

export function formatDuration(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '—';
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(total % 60).padStart(2, '0')}s`;
  return `${total}s`;
}

export function formatClock(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export function cToUnit(celsius, unit) {
  return unit === 'f' ? (celsius * 9) / 5 + 32 : celsius;
}

export function formatTemp(celsius, unit) {
  if (celsius === null || celsius === undefined || !isFinite(celsius)) return '—';
  return `${Math.round(cToUnit(celsius, unit))}${UNIT_LABEL.temperature[unit]}`;
}

export function litresToUnit(litres, unit) {
  return unit === 'gal' ? litres / 3.785411784 : litres;
}

/** Quality of the current GPS fix, for the status card. */
export function accuracyInfo(accuracy, secondsSinceFix, fallbackLabel = 'Searching for GPS') {
  if (accuracy === null || accuracy === undefined || !isFinite(accuracy)) {
    return { tone: 'none', label: fallbackLabel, detail: 'No position received yet' };
  }
  const rounded = Math.round(accuracy);
  if (secondsSinceFix !== null && secondsSinceFix > 15) {
    return { tone: 'low', label: 'Signal lost', detail: `Last fix ${Math.round(secondsSinceFix)}s ago (±${rounded} m)` };
  }
  if (accuracy <= 20) return { tone: 'high', label: 'Good fix', detail: `Accurate to about ±${rounded} m` };
  if (accuracy <= 50) return { tone: 'medium', label: 'Fair fix', detail: `Accurate to about ±${rounded} m` };
  return { tone: 'low', label: 'Weak fix', detail: `Accurate to about ±${rounded} m — distance is not counted at this quality` };
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDay(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTimeOfDay(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function coordLabel(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return '—';
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function litresPer100km(distanceM, litres) {
  if (!distanceM || !litres) return null;
  return (litres * 100) / (distanceM / 1000);
}

export function kmPerLitre(distanceM, litres) {
  if (!distanceM || !litres) return null;
  return distanceM / 1000 / litres;
}