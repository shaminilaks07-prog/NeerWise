import type { ISODate } from './water';

export type AlertRule = 'daily-spike' | 'overnight-flow';
export type Severity = 'watch' | 'high';
export type AlertDecision = 'acknowledged' | 'dismissed';

export interface Alert {
  id: string; // `${rule}:${date}`
  rule: AlertRule;
  date: ISODate;
  severity: Severity;
  title: string;
  /** Plain-language reason the alert fired, including the numbers used. */
  explanation: string;
  observedLitres: number;
  expectedLitres: number;
  excessLitres: number;
  thresholdLitres: number | null;
  /** Hour range for overnight alerts: startHour inclusive, endHour exclusive. */
  startHour?: number;
  endHour?: number;
}

export interface AlertStatusEntry {
  decision: AlertDecision;
  at: string; // ISO timestamp
}

export interface AnomalyConfig {
  lookbackDays: number;
  baselineWindow: number;
  minBaselineDays: number;
  sigma: number;
  minExcessLitres: number;
  minExcessFraction: number;
  highExcessFraction: number;
  overnight: {
    startHour: number;
    endHour: number; // inclusive
    minLitresPerHour: number;
    minConsecutiveHours: number;
    highLitres: number;
  };
}

export interface ProjectionConfig {
  baselineDays: number;
  minBaselineDays: number;
}
