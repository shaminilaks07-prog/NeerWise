import type { AlertRule } from '../../types/alerts';

export interface Guidance {
  causes: string[];
  checklist: string[];
}

/** Static guidance. These are possibilities to check, not diagnoses. */
export const GUIDANCE: Record<AlertRule, Guidance> = {
  'daily-spike': {
    causes: [
      'Guests, a gathering or a change in household routine',
      'Extra laundry, cleaning or garden watering',
      'A tap, hose or fixture left running',
      'A tank or sump overflowing',
      'A data entry mistake in the daily total',
    ],
    checklist: [
      'Check that the litres entered for this day are correct.',
      'Ask the household whether anything was different that day.',
      'Walk through taps, hoses and outdoor points and look for any left running.',
      'Look at the overhead tank or sump for overflow and check the float valve.',
      'Compare with the next few days. If use is still high, investigate further.',
    ],
  },
  'overnight-flow': {
    causes: [
      'A tap, hose or fixture left running overnight',
      'A tank or sump overflowing because a float valve is stuck',
      'A leaking toilet cistern or pipe',
      'A scheduled appliance or timer, such as a washing machine, geyser or garden timer',
    ],
    checklist: [
      'Check taps, hoses and outdoor points for water running or dripping.',
      'Listen for running water when the house is quiet.',
      'Check the overhead tank overflow pipe and float valve.',
      'Add a few drops of food colouring to each toilet cistern. If colour reaches the bowl within 15 minutes without flushing, the flap may be leaking.',
      'If you have a meter, note the reading before bed and again in the morning with no one using water. A change suggests water is moving through the pipes.',
      'Check whether any timer or appliance runs at night.',
    ],
  },
};
