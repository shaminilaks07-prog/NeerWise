import { STORAGE_KEY } from '../config/defaults';
import type { AppState } from '../types/state';

/** Light structural check so a corrupted or old save cannot crash the app. */
function looksValid(x: unknown): x is AppState {
  if (!x || typeof x !== 'object') return false;
  const s = x as Partial<AppState>;
  return (
    s.version === 1 &&
    !!s.profile &&
    !!s.budget &&
    Array.isArray(s.daily) &&
    Array.isArray(s.hourly) &&
    !!s.alertStatus &&
    !!s.challenge &&
    Array.isArray(s.challenge.members) &&
    s.challenge.members.length > 0 &&
    Array.isArray(s.challenge.logs)
  );
}

export function loadState(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return looksValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false; // storage full or blocked; the app keeps working in memory
  }
}

export function clearSavedState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
