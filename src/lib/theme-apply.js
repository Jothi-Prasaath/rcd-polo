import { FONTS } from './settings';

const MODE_TOKENS = {
  dark: {
    '--background': '222 16% 5%',
    '--foreground': '210 20% 96%',
    '--card': '222 15% 8%',
    '--card-foreground': '210 20% 96%',
    '--popover': '222 15% 8%',
    '--popover-foreground': '210 20% 96%',
    '--secondary': '222 14% 13%',
    '--secondary-foreground': '210 20% 96%',
    '--muted': '222 14% 13%',
    '--muted-foreground': '215 14% 64%',
    '--accent': '222 14% 15%',
    '--accent-foreground': '210 20% 96%',
    '--destructive': '0 72% 52%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '222 14% 17%',
    '--input': '222 14% 16%',
  },
  light: {
    '--background': '210 24% 97%',
    '--foreground': '222 28% 12%',
    '--card': '0 0% 100%',
    '--card-foreground': '222 28% 12%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222 28% 12%',
    '--secondary': '210 24% 93%',
    '--secondary-foreground': '222 28% 12%',
    '--muted': '210 24% 93%',
    '--muted-foreground': '215 16% 42%',
    '--accent': '210 24% 92%',
    '--accent-foreground': '222 28% 12%',
    '--destructive': '0 72% 48%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '214 20% 87%',
    '--input': '214 20% 88%',
  },
  amoled: {
    '--background': '0 0% 0%',
    '--foreground': '210 20% 96%',
    '--card': '0 0% 4%',
    '--card-foreground': '210 20% 96%',
    '--popover': '0 0% 4%',
    '--popover-foreground': '210 20% 96%',
    '--secondary': '0 0% 10%',
    '--secondary-foreground': '210 20% 96%',
    '--muted': '0 0% 9%',
    '--muted-foreground': '215 12% 62%',
    '--accent': '0 0% 12%',
    '--accent-foreground': '210 20% 96%',
    '--destructive': '0 72% 50%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '0 0% 14%',
    '--input': '0 0% 12%',
  },
};

export function hexToHslChannels(hex) {
  let value = String(hex || '').trim().replace('#', '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return '210 90% 58%';
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function relativeLuminance(hex) {
  let value = String(hex || '').replace('#', '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return 0;
  return [0, 2, 4]
    .map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
}

export function isHex(value) {
  const v = String(value || '').trim().replace('#', '');
  return /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);
}

export function buildVars(settings) {
  const appearance = (settings && settings.appearance) || {};
  const mode = MODE_TOKENS[appearance.mode] ? appearance.mode : 'dark';
  const tokens = MODE_TOKENS[mode];
  const accentHex = isHex(appearance.accentHex) ? appearance.accentHex : '#2D7FF9';
  const accent = hexToHslChannels(accentHex);
  const onAccent = relativeLuminance(accentHex) > 0.45 ? '222 30% 10%' : '0 0% 100%';
  const font = FONTS.find((f) => f.id === appearance.fontId) || FONTS[0];

  return {
    mode,
    density: appearance.density || 'standard',
    reduceMotion: !!appearance.reduceMotion,
    cardShadow: appearance.cardShadow !== false,
    textScale: appearance.textScale || 1,
    vars: {
      ...tokens,
      '--primary': accent,
      '--primary-foreground': onAccent,
      '--ring': accent,
      '--chart-1': accent,
      '--chart-2': '160 60% 45%',
      '--chart-3': '30 80% 55%',
      '--chart-4': '280 65% 60%',
      '--chart-5': '340 75% 55%',
      '--radius': `${appearance.radius === undefined ? 14 : appearance.radius}px`,
      '--font-heading': font.heading,
      '--font-body': font.body,
      '--font-display': font.display,
      '--font-mono': font.mono,
    },
  };
}

export function applyTheme(settings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const built = buildVars(settings);
  Object.entries(built.vars).forEach(([key, value]) => root.style.setProperty(key, value));
  root.classList.toggle('dark', built.mode !== 'light');
  root.dataset.mode = built.mode;
  root.dataset.density = built.density;
  root.dataset.motion = built.reduceMotion ? 'reduced' : 'full';
  root.dataset.cardShadow = built.cardShadow ? 'on' : 'off';
  root.style.fontSize = `${(16 * built.textScale).toFixed(2)}px`;
}