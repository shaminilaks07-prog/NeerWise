import { useMemo } from 'react';
import { detectAnomalies } from '../lib/calc/anomaly';
import { budgetStatus, projectionState, weeklyBudgetOf } from '../lib/calc/budget';
import { projectWeek } from '../lib/calc/projection';
import type { Alert, AlertStatusEntry } from '../types/alerts';
import { useAppState } from './AppStateProvider';

export interface AlertView extends Alert {
  status: AlertStatusEntry | null;
}

/** Everything the pages need that is calculated from state. Nothing here is stored. */
export function useDerived() {
  const { state, today, nowHour } = useAppState();

  return useMemo(() => {
    const weeklyBudget = weeklyBudgetOf(state.budget);
    const projection = projectWeek(state.daily, today);
    const status = budgetStatus(projection.usedSoFar, weeklyBudget);
    const projState = projectionState(projection.projectedTotal, weeklyBudget);
    const alerts: AlertView[] = detectAnomalies({ daily: state.daily, hourly: state.hourly, today }).map((a) => ({
      ...a,
      status: state.alertStatus[a.id] ?? null,
    }));
    const openAlerts = alerts.filter((a) => a.status === null);
    const latestDate = state.daily.reduce<string | null>((max, d) => (max === null || d.date > max ? d.date : max), null);
    return { today, nowHour, weeklyBudget, projection, status, projState, alerts, openAlerts, latestDate };
  }, [state, today, nowHour]);
}
