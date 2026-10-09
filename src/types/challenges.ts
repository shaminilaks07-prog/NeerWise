import type { ISODate } from './water';

export interface Member {
  id: string;
  name: string;
}

export interface ChallengeLog {
  id: string;
  memberId: string;
  actionId: string;
  date: ISODate;
  units: number;
  loggedAt: string;
}

export interface ConservationAction {
  id: string;
  title: string;
  detail: string;
  cadence: 'daily' | 'weekly';
  unitLabel: string;
  litresPerUnit: number;
  /** How the per-unit figure was derived. Shown wherever the figure is shown. */
  basis: string;
  maxUnitsPerLog: number;
  /** Rough number of units a household could do in a week. Used only for ranking tips. */
  weeklyUnits: (people: number) => number;
}
