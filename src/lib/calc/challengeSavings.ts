import type { ChallengeLog, ConservationAction } from '../../types/challenges';
import type { ISODate } from '../../types/water';

export function actionById(actions: ConservationAction[], id: string) {
  return actions.find((a) => a.id === id);
}

/** units * litresPerUnit. Unknown actions and invalid units count as 0. */
export function logSavings(log: ChallengeLog, actions: ConservationAction[]): number {
  const a = actionById(actions, log.actionId);
  if (!a || !Number.isFinite(log.units) || log.units <= 0) return 0;
  return log.units * a.litresPerUnit;
}

export interface ChallengeSummary {
  totalLitres: number;
  entries: number;
  byMember: Record<string, { litres: number; entries: number }>;
  byAction: Record<string, { litres: number; units: number }>;
}

/** Summarise logs dated within [start, end] inclusive. All figures are self-reported estimates. */
export function summarize(
  logs: ChallengeLog[],
  actions: ConservationAction[],
  start: ISODate,
  end: ISODate,
): ChallengeSummary {
  const s: ChallengeSummary = { totalLitres: 0, entries: 0, byMember: {}, byAction: {} };
  for (const log of logs) {
    if (log.date < start || log.date > end) continue;
    const l = logSavings(log, actions);
    if (l === 0) continue;
    s.totalLitres += l;
    s.entries += 1;
    const m = (s.byMember[log.memberId] ??= { litres: 0, entries: 0 });
    m.litres += l;
    m.entries += 1;
    const a = (s.byAction[log.actionId] ??= { litres: 0, units: 0 });
    a.litres += l;
    a.units += log.units;
  }
  return s;
}

/** Progress toward a goal as a 0..1 share (capped at 1). Zero goal gives 0. */
export function progressShare(litres: number, goal: number): number {
  if (!(goal > 0)) return 0;
  return Math.min(1, Math.max(0, litres / goal));
}
