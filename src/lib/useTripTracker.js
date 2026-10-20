import { useCallback, useEffect, useRef, useState } from 'react';
import { haversineMeters, mpsToKmh } from './geo';
import { addTrip } from './trips';

const EMPTY_STATS = { distanceM: 0, elapsedS: 0, maxSpeedKmh: 0, avgSpeedKmh: 0 };
const STOP_SPEED_MPS = 0.7;

const ERROR_TEXT = {
  1: 'Location permission was denied. Allow location access for this app in your phone settings, then start a trip again.',
  2: 'Your phone cannot provide a location right now. Move somewhere with a clearer view of the sky.',
  3: 'No GPS fix yet. Tracking stays on while the phone keeps searching for satellites.',
};

/**
 * GPS trip tracking.
 * Speeds and distance are derived from the phone's location fixes, never from the car.
 * Movement is filtered so that a stationary phone does not accumulate phantom distance.
 */
export default function useTripTracker(options = {}) {
  const { vehicleId = null, vehicleName = '' } = options;
  const [status, setStatus] = useState('idle');
  const [fix, setFix] = useState(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  const optionsRef = useRef({ vehicleId, vehicleName });
  optionsRef.current = { vehicleId, vehicleName };

  const watchRef = useRef(null);
  const timerRef = useRef(null);
  const wakeRef = useRef(null);
  const statusRef = useRef('idle');
  const acc = useRef({
    distanceM: 0,
    maxSpeedKmh: 0,
    startedAt: 0,
    pausedAt: 0,
    pausedMs: 0,
    prev: null,
    lastDerivedKmh: 0,
    smoothedKmh: 0,
  });

  const clearWatch = useCallback(() => {
    if (watchRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchRef.current);
    }
    watchRef.current = null;
  }, []);

  const releaseWake = useCallback(() => {
    try {
      if (wakeRef.current) wakeRef.current.release();
    } catch (e) {
      /* no-op */
    }
    wakeRef.current = null;
  }, []);

  const requestWake = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        wakeRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (e) {
      wakeRef.current = null;
    }
  }, []);

  const handleFix = useCallback((position) => {
    const now = Date.now();
    const a = acc.current;
    const coords = position.coords || {};
    const lat = coords.latitude;
    const lng = coords.longitude;
    const accuracy = typeof coords.accuracy === 'number' ? coords.accuracy : null;
    const rawSpeed = typeof coords.speed === 'number' && coords.speed >= 0 ? coords.speed : null;

    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    const dt = a.prev ? (now - a.prev.at) / 1000 : 0;
    let derivedKmh = a.lastDerivedKmh;

    if (a.prev && dt > 0) {
      const moved = haversineMeters(a.prev, { lat, lng });
      derivedKmh = mpsToKmh(moved / dt);
      const fresh = dt < 20;
      const goodQuality = accuracy !== null && accuracy <= 50;
      const plausible = derivedKmh <= 220;
      const realMove = moved >= Math.max(5, (accuracy || 0) * 0.25);
      const stationary = rawSpeed !== null && rawSpeed < STOP_SPEED_MPS && !realMove;
      a.prev = { lat, lng, at: now };
      if (statusRef.current === 'tracking' && fresh && goodQuality && plausible && realMove && !stationary) {
        a.distanceM += moved;
        if (derivedKmh > a.maxSpeedKmh) a.maxSpeedKmh = derivedKmh;
      }
    } else {
      a.prev = { lat, lng, at: now };
    }

    a.lastDerivedKmh = derivedKmh;
    const instant = rawSpeed !== null ? mpsToKmh(rawSpeed) : derivedKmh;
    a.smoothedKmh = a.smoothedKmh ? a.smoothedKmh * 0.55 + instant * 0.45 : instant;

    setError(null);
    setFix({
      lat,
      lng,
      accuracy,
      heading: typeof coords.heading === 'number' ? coords.heading : null,
      speedKmh: a.smoothedKmh,
      speedSource: rawSpeed !== null ? 'gps' : 'derived',
      at: now,
    });
  }, []);

  const handleError = useCallback(
    (err) => {
      setError({ code: err.code, message: ERROR_TEXT[err.code] || err.message || 'Location error' });
      if (err.code === 1) {
        clearWatch();
        clearInterval(timerRef.current);
        releaseWake();
        statusRef.current = 'idle';
        setStatus('idle');
      }
    },
    [clearWatch, releaseWake],
  );

  const tick = useCallback(() => {
    const a = acc.current;
    if (!a.startedAt) return;
    const pausedTotal = a.pausedMs + (statusRef.current === 'paused' ? Date.now() - a.pausedAt : 0);
    const elapsed = Math.max(0, (Date.now() - a.startedAt - pausedTotal) / 1000);
    setStats({
      distanceM: a.distanceM,
      elapsedS: elapsed,
      maxSpeedKmh: a.maxSpeedKmh,
      avgSpeedKmh: elapsed > 1 ? mpsToKmh(a.distanceM / elapsed) : 0,
    });
  }, []);

  const start = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError({ code: 0, message: 'This device does not offer location to the browser.' });
      return;
    }
    acc.current = {
      distanceM: 0,
      maxSpeedKmh: 0,
      startedAt: Date.now(),
      pausedAt: 0,
      pausedMs: 0,
      prev: null,
      lastDerivedKmh: 0,
      smoothedKmh: 0,
    };
    setStats(EMPTY_STATS);
    setError(null);
    setLastSaved(null);
    statusRef.current = 'tracking';
    setStatus('tracking');
    clearWatch();
    watchRef.current = navigator.geolocation.watchPosition(handleFix, handleError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000,
    });
    clearInterval(timerRef.current);
    timerRef.current = window.setInterval(tick, 1000);
    requestWake();
  }, [clearWatch, handleError, handleFix, requestWake, tick]);

  const pause = useCallback(() => {
    if (statusRef.current !== 'tracking') return;
    statusRef.current = 'paused';
    acc.current.pausedAt = Date.now();
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') return;
    acc.current.pausedMs += Date.now() - acc.current.pausedAt;
    acc.current.pausedAt = 0;
    statusRef.current = 'tracking';
    setStatus('tracking');
  }, []);

  const stop = useCallback(
    ({ save = true, notes = '' } = {}) => {
      const a = acc.current;
      const wasPaused = statusRef.current === 'paused';
      const pausedMs = a.pausedMs + (wasPaused ? Date.now() - a.pausedAt : 0);
      const startedAt = a.startedAt;
      const durationS = startedAt ? Math.max(0, (Date.now() - startedAt - pausedMs) / 1000) : 0;
      const distanceM = a.distanceM;
      const maxSpeedKmh = a.maxSpeedKmh;

      clearWatch();
      clearInterval(timerRef.current);
      releaseWake();
      statusRef.current = 'idle';
      setStatus('idle');
      setStats(EMPTY_STATS);
      acc.current = { ...a, startedAt: 0, prev: null, pausedAt: 0, pausedMs: 0, distanceM: 0 };

      const trip = {
        id: `t_${Date.now()}`,
        vehicleId: optionsRef.current.vehicleId,
        vehicleName: optionsRef.current.vehicleName,
        startedAt: startedAt ? new Date(startedAt).toISOString() : new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationS,
        distanceM,
        maxSpeedKmh,
        avgSpeedKmh: durationS > 1 ? mpsToKmh(distanceM / durationS) : 0,
        source: 'gps',
        notes,
      };

      if (save && distanceM > 0) {
        const stored = addTrip(trip);
        setLastSaved(stored);
        return stored;
      }
      return null;
    },
    [clearWatch, releaseWake],
  );

  const discard = useCallback(() => stop({ save: false }), [stop]);

  useEffect(
    () => () => {
      clearWatch();
      clearInterval(timerRef.current);
      releaseWake();
    },
    [clearWatch, releaseWake],
  );

  return {
    status,
    isActive: status !== 'idle',
    isPaused: status === 'paused',
    fix,
    stats,
    error,
    lastSaved,
    start,
    pause,
    resume,
    stop,
    discard,
  };
}