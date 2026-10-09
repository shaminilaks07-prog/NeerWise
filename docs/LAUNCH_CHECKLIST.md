# Launch checklist

Status key: [ ] not done. Tick a box only after you personally verified it, and note who and when.

## Build quality
- [ ] `npm install` succeeds on a clean clone
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes and `npm run preview` loads every route
- [ ] Browser console shows no errors on every page
- [ ] Reloading a deep link (for example `/privacy`) works on the host (`public/_redirects` for Netlify, `vercel.json` for Vercel)

## Functionality
- [ ] Every nav link opens the right page
- [ ] Entry form rejects empty, negative, non-numeric, future-date and very large values
- [ ] Changing the budget in Settings updates Overview and Water Budget
- [ ] Scenario slider and number box stay in sync and reject values outside 0 to 100
- [ ] Acknowledge, Dismiss and Move back to open all work, and survive a reload
- [ ] Challenge logging updates goal progress and household view; deleting an entry reverses it
- [ ] Reset and Delete all logged use work and ask for confirmation

## Honesty
- [ ] No fabricated customers, rankings, impact figures or testimonials anywhere
- [ ] Sample data is labelled wherever it appears
- [ ] No text claims confirmed leak detection or guaranteed savings

## Responsive and accessible
- [ ] Checked at about 360 px, 768 px and 1280 px widths
- [ ] Whole app usable by keyboard alone, focus always visible
- [ ] Form errors are announced and tied to their inputs
- [ ] Colour contrast checked (for example with browser dev tools)
- [ ] Charts have a table alternative

## Legal pages
- [ ] Owner filled in every "Owner to confirm" note on Privacy and Terms
- [ ] Reviewed by a qualified person before public launch (these are drafts)

## Publishing (not started)
- [ ] Hosting chosen and the site deployed
- [ ] Custom domain connected and HTTPS verified
- [ ] Favicon appears in the browser tab (file: `public/favicon.svg`)
- [ ] Final product name set in `src/config/brand.ts`
- [ ] Confirm no host-injected "Made with AI" badge is present, and remove it if the host allows
