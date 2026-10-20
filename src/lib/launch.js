import { MUSIC_APPS } from './settings';

/** Opens an external app or web page. Returns false when the browser blocks it. */
export function openExternal(url) {
  if (!url) return false;
  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = url;
      return true;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function buildDirectionsUrl(destination, appId = 'gmaps', mode = 'driving') {
  const target = String(destination || '').trim();
  const encoded = encodeURIComponent(target);
  if (appId === 'waze') {
    return target
      ? `https://www.waze.com/ul?navigate=yes&q=${encoded}`
      : 'https://www.waze.com/ul';
  }
  if (appId === 'apple') {
    return target ? `https://maps.apple.com/?daddr=${encoded}&dirflg=d` : 'https://maps.apple.com/';
  }
  return target
    ? `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=${mode}`
    : 'https://www.google.com/maps';
}

export function openDirections({ destination, appId = 'gmaps', mode = 'driving' }) {
  return openExternal(buildDirectionsUrl(destination, appId, mode));
}

export function musicTarget(appId) {
  return MUSIC_APPS.find((a) => a.id === appId) || MUSIC_APPS[0];
}

/** mode: 'app' opens the installed player, 'web' opens its web player. */
export function openMusic(appId, mode = 'web') {
  const target = musicTarget(appId);
  return openExternal(mode === 'app' ? target.scheme : target.web);
}

export function dial(number) {
  const digits = String(number || '').replace(/[^\d+]/g, '');
  if (!digits) return false;
  return openExternal(`tel:${digits}`);
}

export function isValidPhone(number) {
  const digits = String(number || '').replace(/[^\d]/g, '');
  return digits.length >= 6 && digits.length <= 15;
}