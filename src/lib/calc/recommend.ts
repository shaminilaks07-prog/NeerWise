import type { ConservationAction } from '../../types/challenges';

/** Rough weekly potential in litres if the whole household did this action as assumed. */
export function weeklyPotential(a: ConservationAction, people: number): number {
  const safePeople = Number.isFinite(people) && people > 0 ? people : 1;
  return a.litresPerUnit * a.weeklyUnits(safePeople);
}

export function rankActions(actions: ConservationAction[], people: number): ConservationAction[] {
  return [...actions].sort((a, b) => weeklyPotential(b, people) - weeklyPotential(a, people));
}
