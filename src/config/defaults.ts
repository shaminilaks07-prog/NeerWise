import type { AnomalyConfig, ProjectionConfig } from '../types/alerts';
import type { BudgetSetting } from '../types/water';

export const DEFAULT_BUDGET: BudgetSetting = { period: 'weekly', litres: 3600 };
export const DEFAULT_PEOPLE = 4;
export const DEFAULT_HOUSEHOLD_NAME = 'My household';
export const DEFAULT_GOAL_LITRES = 150;

export const PROJECTION_CONFIG: ProjectionConfig = {
  baselineDays: 14,
  minBaselineDays: 3,
};

export const ANOMALY_CONFIG: AnomalyConfig = {
  lookbackDays: 14,
  baselineWindow: 14,
  minBaselineDays: 7,
  sigma: 2,
  minExcessLitres: 50,
  minExcessFraction: 0.2,
  highExcessFraction: 0.5,
  overnight: {
    startHour: 0,
    endHour: 4,
    minLitresPerHour: 5,
    minConsecutiveHours: 3,
    highLitres: 100,
  },
};

/** Projected use at or above this share of budget is shown as "close to budget". */
export const NEAR_BUDGET_SHARE = 0.9;

export const LIMITS = {
  maxDailyLitres: 20000,
  maxBudgetLitres: 200000,
  maxPeople: 30,
  maxNameLength: 40,
} as const;

export const SAMPLE_CONFIG = { days: 35, seed: 42 } as const;
export const STORAGE_KEY = 'water-budget-app:v1';
