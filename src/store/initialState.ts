import {
  DEFAULT_BUDGET,
  DEFAULT_GOAL_LITRES,
  DEFAULT_HOUSEHOLD_NAME,
  DEFAULT_PEOPLE,
} from '../config/defaults';
import { generateSample } from '../data/sampleData';
import type { AppState } from '../types/state';
import type { ISODate } from '../types/water';

export const SELF_MEMBER_ID = 'member-you';

export function createInitialState(today: ISODate, nowHour: number, withSample = true): AppState {
  const sample = withSample ? generateSample(today, nowHour) : { daily: [], hourly: [] };
  return {
    version: 1,
    profile: { name: DEFAULT_HOUSEHOLD_NAME, people: DEFAULT_PEOPLE },
    budget: { ...DEFAULT_BUDGET },
    daily: sample.daily,
    hourly: sample.hourly,
    alertStatus: {},
    challenge: {
      goalLitres: DEFAULT_GOAL_LITRES,
      members: [{ id: SELF_MEMBER_ID, name: 'You' }],
      logs: [],
    },
  };
}
