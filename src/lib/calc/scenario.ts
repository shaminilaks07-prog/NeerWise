export interface Scenario {
  reductionPct: number;
  /** Reduction applied only to expected (not yet used) water. */
  savedLitres: number;
  scenarioTotal: number;
  /** Positive = still over budget after the reduction; negative = under budget. */
  vsBudget: number | null;
  /** Smallest reduction in remaining use that would reach the budget, or null if not needed / not possible. */
  neededPct: number | null;
  /** True when even a 100% cut of remaining use would not bring the week under budget. */
  unreachable: boolean;
}

/**
 * scenarioTotal = usedSoFar + expectedRemaining * (1 - r)
 * savedLitres   = expectedRemaining * r
 * neededPct     = (projected - budget) / expectedRemaining
 */
export function runScenario(
  usedSoFar: number,
  expectedRemaining: number,
  weeklyBudget: number,
  reductionPct: number,
): Scenario {
  const r = Math.min(100, Math.max(0, Number.isFinite(reductionPct) ? reductionPct : 0)) / 100;
  const savedLitres = expectedRemaining * r;
  const scenarioTotal = usedSoFar + expectedRemaining - savedLitres;
  const projected = usedSoFar + expectedRemaining;
  const hasBudget = weeklyBudget > 0;
  const excess = hasBudget ? projected - weeklyBudget : 0;

  let neededPct: number | null = null;
  let unreachable = false;
  if (hasBudget && excess > 0) {
    if (expectedRemaining > 0 && excess <= expectedRemaining) neededPct = (excess / expectedRemaining) * 100;
    else unreachable = true;
  }

  return {
    reductionPct: r * 100,
    savedLitres,
    scenarioTotal,
    vsBudget: hasBudget ? scenarioTotal - weeklyBudget : null,
    neededPct,
    unreachable,
  };
}
