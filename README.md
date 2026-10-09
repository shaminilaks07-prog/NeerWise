# NeerWise

A local-only prototype that helps a household log daily water use, compare it with a weekly budget, review unusual days, and try small conservation challenges.

The product name is configured in `src/config/brand.ts` (or override with `VITE_APP_NAME` in a local `.env`).

> **Honest scope.** There is no meter or sensor connection. All demo figures are generated sample data, clearly labelled in the UI. Estimates are simple averages, not AI. Alerts flag suspicious patterns and never confirm a leak.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # TypeScript, strict mode
npm test           # unit tests for the calculation library
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build locally
```

## Features

| Page | What it does |
| --- | --- |
| Overview | Used so far, budget, remaining, estimated end of week, last 14 days, open alerts, next actions |
| Water Budget | Scenario slider (reduce remaining use by X%), water saved, reduction needed to meet budget, week-by-day chart, step-by-step calculation with your numbers |
| Waste Detective | Daily-spike and overnight-flow rules, explanation, hourly chart, causes, checklist, acknowledge / dismiss / restore |
| Challenges | Daily and weekly habits, participation log, weekly goal progress, household member view |
| History | Validated daily entry form, 7/14/28-day chart, weekly totals, entry list with delete |
| Settings | Household, budget (daily or weekly), load sample / delete use / reset |
| Methodology, Privacy, Terms | Formulas, limitations, draft legal pages with owner-confirmation notes |

## Architecture

```
src/
  config/        brand.ts (name), defaults.ts (thresholds, limits)
  types/         shared TypeScript types
  data/          sampleData.ts (seeded generator), conservationActions.ts (assumptions + basis)
  lib/           dates.ts, format.ts, validate.ts
  lib/calc/      aggregate, budget, projection, scenario, anomaly, challengeSavings, recommend  (pure, tested)
  store/         reducer + context + localStorage persistence + useDerived (all derived values)
  components/    layout/, ui/, charts/
  features/      overview, budget, detective, challenges, history, settings, info
  navigation.ts  sidebar items      routes.tsx  route registry
```

Rules that keep it honest:

- Every stored record has a `source`: `measured`, `user-entered`, `sample`. Calculated values are shown with an "Estimate" badge.
- Derived values (projection, alerts) are computed from state and never stored.
- All thresholds live in `src/config/defaults.ts` and are listed on the Methodology page.
- Persistence is `localStorage` only, key `water-budget-app:v1`. No server, no accounts, no analytics.

## Data limitations

- Sample data is generated for roughly 35 days ending today, and includes two injected events (a high-use day 9 days ago and a night of continuous use 4 days ago) so the detective has something to find. Use Settings, Load sample data, to re-anchor it to a new date.
- Hourly analysis only works on sample data. Manual entries are daily totals.
- Challenge litres-per-unit values are planning assumptions with their basis shown in the UI.

## Demo script (about 3 minutes)

1. **Overview.** Point out the sample-data banner, the gauge, and the estimated end of week against the budget.
2. **Water Budget.** Drag the slider to see water saved. Note the "reduction needed" message. Open "How these numbers were calculated".
3. **Waste Detective.** Open the High alert, show the hourly chart or explanation, tick checklist items, then Acknowledge. Switch to the Acknowledged tab and restore it.
4. **Challenges.** Log "Turn off the tap while brushing" with 4 units. Watch goal progress change. Add a household member and log for them.
5. **History.** Enter a value for yesterday. Go back to Overview and see the numbers update.
6. **Settings.** Change the budget to a daily 450 L. Show Reset.

## Three-person Git workflow (sequential)

See `docs/GIT_WORKFLOW.md`. Suggested split, so edits rarely collide:

- **Member 1**: scaffold, shell, store, calc library, Overview, History, Settings.
- **Member 2**: `src/features/budget/` or `src/features/detective/`.
- **Member 3**: `src/features/challenges/` and `src/features/info/`, README polish.

## Launch status

Nothing in `docs/LAUNCH_CHECKLIST.md` is checked off yet. A local dev build is not a production launch.
