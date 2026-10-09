import { NEAR_BUDGET_SHARE } from '../../config/defaults';
import type { BudgetSetting } from '../../types/water';

/** Weekly budget in litres. A daily budget is multiplied by 7. Invalid input gives 0. */
export function weeklyBudgetOf(b: BudgetSetting): number {
  if (!Number.isFinite(b.litres) || b.litres <= 0) return 0;
  return b.period === 'daily' ? b.litres * 7 : b.litres;
}

export type BudgetState = 'no-budget' | 'on-track' | 'near' | 'over';

export interface BudgetStatus {
  remaining: number | null; // negative when over budget
  utilization: number | null; // used / budget, 0.5 = 50%
  state: BudgetState;
}

export function budgetStatus(used: number, weeklyBudget: number): BudgetStatus {
  if (!(weeklyBudget > 0)) return { remaining: null, utilization: null, state: 'no-budget' };
  const utilization = used / weeklyBudget;
  const state: BudgetState = used > weeklyBudget ? 'over' : utilization >= NEAR_BUDGET_SHARE ? 'near' : 'on-track';
  return { remaining: weeklyBudget - used, utilization, state };
}

/** How a projected total compares with the budget. */
export function projectionState(projected: number | null, weeklyBudget: number): BudgetState {
  if (projected === null) return 'no-budget';
  if (!(weeklyBudget > 0)) return 'no-budget';
  if (projected > weeklyBudget) return 'over';
  if (projected >= NEAR_BUDGET_SHARE * weeklyBudget) return 'near';
  return 'on-track';
}
