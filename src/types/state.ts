import type { AlertDecision, AlertStatusEntry } from './alerts';
import type { ChallengeLog, Member } from './challenges';
import type {
  BudgetSetting,
  DailyRecord,
  HourlyRecord,
  HouseholdProfile,
  ISODate,
} from './water';

export interface AppState {
  version: 1;
  profile: HouseholdProfile;
  budget: BudgetSetting;
  daily: DailyRecord[];
  hourly: HourlyRecord[];
  alertStatus: Record<string, AlertStatusEntry>;
  challenge: {
    goalLitres: number;
    members: Member[];
    logs: ChallengeLog[];
  };
}

export type AppAction =
  | { type: 'SET_PROFILE'; profile: HouseholdProfile }
  | { type: 'SET_BUDGET'; budget: BudgetSetting }
  | { type: 'UPSERT_DAILY'; record: DailyRecord }
  | { type: 'DELETE_DAILY'; date: ISODate }
  | { type: 'SET_ALERT'; id: string; decision: AlertDecision; at: string }
  | { type: 'CLEAR_ALERT'; id: string }
  | { type: 'LOAD_SAMPLE'; daily: DailyRecord[]; hourly: HourlyRecord[] }
  | { type: 'CLEAR_USAGE' }
  | { type: 'RESET_ALL'; state: AppState }
  | { type: 'SET_GOAL'; litres: number }
  | { type: 'ADD_MEMBER'; member: Member }
  | { type: 'REMOVE_MEMBER'; id: string }
  | { type: 'ADD_LOG'; log: ChallengeLog }
  | { type: 'DELETE_LOG'; id: string };
