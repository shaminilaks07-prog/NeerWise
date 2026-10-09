import { LIMITS } from '../config/defaults';
import type { BudgetSetting, ISODate } from '../types/water';
import { isValidISODate } from './dates';

export type Errors<T extends string> = Partial<Record<T, string>>;

export function validateEntry(date: string, litresText: string, today: ISODate): Errors<'date' | 'litres'> {
  const errors: Errors<'date' | 'litres'> = {};
  if (!date) errors.date = 'Choose a date.';
  else if (!isValidISODate(date)) errors.date = 'Enter a valid date.';
  else if (date > today) errors.date = 'Future dates cannot be logged.';

  const trimmed = litresText.trim();
  const n = Number(trimmed);
  if (trimmed === '') errors.litres = 'Enter the litres used that day.';
  else if (!Number.isFinite(n)) errors.litres = 'Litres must be a number.';
  else if (n < 0) errors.litres = 'Litres cannot be negative.';
  else if (n > LIMITS.maxDailyLitres) errors.litres = `Daily use above ${LIMITS.maxDailyLitres.toLocaleString('en-IN')} L is not accepted. Check the number.`;
  return errors;
}

export function validateBudget(litresText: string): Errors<'litres'> {
  const t = litresText.trim();
  const n = Number(t);
  if (t === '') return { litres: 'Enter a budget in litres.' };
  if (!Number.isFinite(n) || n <= 0) return { litres: 'Budget must be a number above 0.' };
  if (n > LIMITS.maxBudgetLitres) return { litres: `Budget above ${LIMITS.maxBudgetLitres.toLocaleString('en-IN')} L is not accepted.` };
  return {};
}

export function validateProfile(name: string, peopleText: string): Errors<'name' | 'people'> {
  const errors: Errors<'name' | 'people'> = {};
  if (!name.trim()) errors.name = 'Enter a household name.';
  else if (name.trim().length > LIMITS.maxNameLength) errors.name = `Use ${LIMITS.maxNameLength} characters or fewer.`;
  const p = Number(peopleText);
  if (peopleText.trim() === '' || !Number.isInteger(p)) errors.people = 'Enter a whole number of people.';
  else if (p < 1 || p > LIMITS.maxPeople) errors.people = `Enter between 1 and ${LIMITS.maxPeople}.`;
  return errors;
}

export function validateUnits(unitsText: string, max: number): string | undefined {
  const n = Number(unitsText);
  if (unitsText.trim() === '' || !Number.isInteger(n)) return 'Enter a whole number.';
  if (n < 1 || n > max) return `Enter between 1 and ${max}.`;
  return undefined;
}

export function normalizeBudget(period: BudgetSetting['period'], litresText: string): BudgetSetting {
  return { period, litres: Math.round(Number(litresText)) };
}
