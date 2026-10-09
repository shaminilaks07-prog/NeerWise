import type { ConservationAction } from '../types/challenges';

/**
 * Planning assumptions, not measurements. Real savings depend on the fixture, flow rate and habits.
 * Each entry states how its litres-per-unit figure was derived so the UI can show it.
 */
export const ACTIONS: ConservationAction[] = [
  {
    id: 'tap-off-brushing',
    title: 'Turn off the tap while brushing teeth',
    detail: 'Wet the brush, close the tap, rinse with a cup.',
    cadence: 'daily',
    unitLabel: 'person-day',
    litresPerUnit: 8,
    basis: 'Assumes an open tap runs about 6 L per minute and about 1.5 minutes of running is avoided per person per day.',
    maxUnitsPerLog: 10,
    weeklyUnits: (p) => p * 7,
  },
  {
    id: 'shorter-shower',
    title: 'Shorten one shower or bucket bath by 2 minutes',
    detail: 'Wet, turn off, soap, then rinse. With a bucket, fill it less.',
    cadence: 'daily',
    unitLabel: 'shower',
    litresPerUnit: 18,
    basis: 'Assumes a shower head flows about 9 L per minute and 2 minutes are saved. Bucket baths and low-flow heads will differ.',
    maxUnitsPerLog: 10,
    weeklyUnits: (p) => p * 7,
  },
  {
    id: 'reuse-rinse-water',
    title: 'Reuse kitchen rinse water for plants',
    detail: 'Collect vegetable or rice rinse water in a bucket and use it on plants.',
    cadence: 'daily',
    unitLabel: '5 L bucket',
    litresPerUnit: 5,
    basis: 'Assumes each bucket holds 5 L and replaces 5 L of tap water used for plants.',
    maxUnitsPerLog: 5,
    weeklyUnits: () => 7,
  },
  {
    id: 'full-load-wash',
    title: 'Run the washing machine only with full loads',
    detail: 'Combine two part loads into one cycle.',
    cadence: 'weekly',
    unitLabel: 'avoided run',
    litresPerUnit: 30,
    basis: 'Assumes each avoided cycle saves about 30 L. Machines range widely, so check your manual for litres per cycle.',
    maxUnitsPerLog: 7,
    weeklyUnits: () => 2,
  },
  {
    id: 'fix-drip',
    title: 'Fix or report a dripping tap',
    detail: 'Replace the washer or call your plumber or building manager.',
    cadence: 'weekly',
    unitLabel: 'tap-day',
    litresPerUnit: 4,
    basis: 'Assumes one drip per second, about 4 L per day. Faster drips lose more.',
    maxUnitsPerLog: 7,
    weeklyUnits: () => 7,
  },
];
