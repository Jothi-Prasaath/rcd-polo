export const APP_VERSION = '1.0.0';

export const MODES = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'amoled', label: 'AMOLED black' },
];

export const ACCENTS = [
  { id: 'electric', label: 'Electric blue', hex: '#2D7FF9' },
  { id: 'amber', label: 'Signal amber', hex: '#F5A524' },
  { id: 'torque', label: 'Torque red', hex: '#E5484D' },
  { id: 'kerb', label: 'Kerb green', hex: '#30A46C' },
  { id: 'violet', label: 'Nightshade violet', hex: '#8E4EC6' },
  { id: 'graphite', label: 'Graphite', hex: '#9BA1A6' },
];

const SYSTEM = 'ui-sans-serif, system-ui, -apple-system, sans-serif';

export const FONTS = [
  {
    id: 'chakra',
    label: 'Technical',
    heading: `'Chakra Petch', ${SYSTEM}`,
    body: `'Inter', ${SYSTEM}`,
    display: `'Chakra Petch', ${SYSTEM}`,
    mono: `'JetBrains Mono', ui-monospace, monospace`,
  },
  {
    id: 'inter',
    label: 'Clean',
    heading: `'Inter', ${SYSTEM}`,
    body: `'Inter', ${SYSTEM}`,
    display: `'Inter', ${SYSTEM}`,
    mono: `'JetBrains Mono', ui-monospace, monospace`,
  },
  {
    id: 'grotesk',
    label: 'Geometric',
    heading: `'Space Grotesk', ${SYSTEM}`,
    body: `'Space Grotesk', ${SYSTEM}`,
    display: `'Space Grotesk', ${SYSTEM}`,
    mono: `'JetBrains Mono', ui-monospace, monospace`,
  },
  {
    id: 'system',
    label: 'System default',
    heading: SYSTEM,
    body: SYSTEM,
    display: SYSTEM,
    mono: 'ui-monospace, monospace',
  },
];

export const DENSITIES = [
  { id: 'compact', label: 'Compact' },
  { id: 'standard', label: 'Standard' },
  { id: 'spacious', label: 'Spacious' },
];

export const TEXT_SIZES = [
  { id: 0.9, label: 'Small' },
  { id: 1, label: 'Standard' },
  { id: 1.12, label: 'Large' },
];

export const LAYOUTS = [
  { id: 'cockpit', label: 'Cockpit', hint: 'Dense two-column instrument cluster' },
  { id: 'grid', label: 'Two columns', hint: 'Even two-column grid with wider gaps' },
  { id: 'list', label: 'Single column', hint: 'One card per row — easiest to read at a glance' },
];

export const SPEEDO_STYLES = [
  { id: 'digital', label: 'Digital', hint: 'Large numeric readout' },
  { id: 'analogue', label: 'Analogue dial', hint: 'Needle and scale' },
];

export const CARD_CATALOG = [
  { id: 'speed', label: 'GPS speed', span: 2, hint: 'Large speed readout with GPS quality' },
  { id: 'trip', label: 'Trip readout', span: 2, hint: 'Live distance, time, average and maximum speed' },
  { id: 'gps', label: 'GPS status', hint: 'Fix quality, accuracy and coordinates' },
  { id: 'navigation', label: 'Navigation shortcut', span: 2, hint: 'Open a saved destination in your map app' },
  { id: 'media', label: 'Music shortcut', span: 2, hint: 'Open your chosen music player' },
  { id: 'clock', label: 'Clock', hint: 'Time and date' },
  { id: 'vehicle', label: 'Vehicle profile', span: 2, hint: 'Summary of the active vehicle' },
  { id: 'maintenance', label: 'Maintenance reminder', hint: 'The next service item that is coming up' },
  { id: 'fuel', label: 'Fuel economy (manual)', hint: 'Economy calculated from the fill-ups you log' },
  { id: 'dialer', label: 'Call shortcut', span: 2, hint: 'Dial the number saved in Shortcuts' },
  { id: 'obd', label: 'OBD-II telemetry', hint: 'Not available in this build — see Data & capabilities' },
];

export const DEFAULT_CARDS = [
  { id: 'speed', visible: true },
  { id: 'trip', visible: true },
  { id: 'gps', visible: true },
  { id: 'navigation', visible: true },
  { id: 'media', visible: true },
  { id: 'clock', visible: true },
  { id: 'vehicle', visible: true },
  { id: 'maintenance', visible: true },
  { id: 'fuel', visible: true },
  { id: 'dialer', visible: false },
  { id: 'obd', visible: false },
];

export const UNIT_OPTIONS = {
  speed: [
    { id: 'kmh', label: 'km/h' },
    { id: 'mph', label: 'mph' },
  ],
  distance: [
    { id: 'km', label: 'Kilometres' },
    { id: 'mi', label: 'Miles' },
  ],
  temperature: [
    { id: 'c', label: 'Celsius' },
    { id: 'f', label: 'Fahrenheit' },
  ],
  volume: [
    { id: 'l', label: 'Litres' },
    { id: 'gal', label: 'Gallons' },
  ],
};

export const NAV_APPS = [
  { id: 'gmaps', label: 'Google Maps' },
  { id: 'waze', label: 'Waze' },
  { id: 'apple', label: 'Apple Maps' },
];

export const MUSIC_APPS = [
  { id: 'spotify', label: 'Spotify', scheme: 'spotify:', web: 'https://open.spotify.com' },
  { id: 'ytmusic', label: 'YouTube Music', scheme: 'youtubemusic://', web: 'https://music.youtube.com' },
  { id: 'applemusic', label: 'Apple Music', scheme: 'music://', web: 'https://music.apple.com' },
  { id: 'amazonmusic', label: 'Amazon Music', scheme: 'amznmp3://', web: 'https://music.amazon.in' },
  { id: 'gaana', label: 'Gaana', scheme: 'gaana://', web: 'https://gaana.com' },
  { id: 'jiosaavn', label: 'JioSaavn', scheme: 'jiosaavn://', web: 'https://www.jiosaavn.com' },
];

export const DEFAULT_VEHICLE = {
  id: 'v1',
  nickname: 'The Polo',
  displayName: 'Volkswagen Polo',
  make: 'Volkswagen',
  model: 'Polo',
  year: 2019,
  trim: 'Highline Plus',
  engine: 'Diesel',
  displacement: '1.5 L',
  fuelType: 'Diesel',
  transmission: 'Manual',
  tankCapacity: 45,
  odometer: 0,
  imageUrl: '',
  economyTarget: 20,
  notes: 'Engine and trim entered by you. Nothing here is read from the car.',
  customFields: [],
};

export const DEFAULT_SETTINGS = {
  version: 1,
  appearance: {
    mode: 'dark',
    accentId: 'electric',
    accentHex: '#2D7FF9',
    fontId: 'chakra',
    textScale: 1,
    density: 'standard',
    radius: 14,
    reduceMotion: false,
    cardShadow: true,
    backgroundUrl: '',
    backgroundDim: 0.72,
  },
  units: { speed: 'kmh', distance: 'km', temperature: 'c', volume: 'l' },
  tracking: { maxAccuracyM: 50, minMoveM: 5 },
  vehicle: { activeId: DEFAULT_VEHICLE.id, profiles: [DEFAULT_VEHICLE] },
  dashboard: { layout: 'cockpit', speedo: 'digital', cards: DEFAULT_CARDS },
  shortcuts: {
    navApp: 'gmaps',
    travelMode: 'driving',
    musicApp: 'spotify',
    destinations: [
      { id: 'home', label: 'Home', address: '' },
      { id: 'work', label: 'Work', address: '' },
    ],
    dialer: { label: 'Call', number: '' },
  },
  maintenance: [],
  fuelLog: [],
};

export function defaultSettings() {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

export function cardById(id) {
  return CARD_CATALOG.find((c) => c.id === id);
}