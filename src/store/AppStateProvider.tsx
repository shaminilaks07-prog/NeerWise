import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { todayLocal } from '../lib/dates';
import type { AppAction, AppState } from '../types/state';
import type { ISODate } from '../types/water';
import { createInitialState } from './initialState';
import { loadState, saveState } from './persistence';
import { reducer } from './reducer';

interface Ctx {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  today: ISODate;
  nowHour: number;
  /** False if the browser refused to save (private mode, storage full). */
  persisted: boolean;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [clock] = useState(() => {
    const now = new Date();
    return { today: todayLocal(now), nowHour: now.getHours() };
  });
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState() ?? createInitialState(clock.today, clock.nowHour));
  const [persisted, setPersisted] = useState(true);

  useEffect(() => {
    setPersisted(saveState(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, ...clock, persisted }), [state, clock, persisted]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useAppState(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
