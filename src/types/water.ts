export type ISODate = string; // YYYY-MM-DD, local calendar date

/** Where a number came from. Every stored record carries one. */
export type DataSource = 'measured' | 'user-entered' | 'sample' | 'predicted';
export type StoredSource = Exclude<DataSource, 'predicted'>;

export interface DailyRecord {
  date: ISODate;
  litres: number;
  source: StoredSource;
}

export interface HourlyRecord {
  date: ISODate;
  hour: number; // 0-23
  litres: number;
  source: StoredSource;
}

export type BudgetPeriod = 'daily' | 'weekly';

export interface BudgetSetting {
  period: BudgetPeriod;
  litres: number;
}

export interface HouseholdProfile {
  name: string;
  people: number;
}
