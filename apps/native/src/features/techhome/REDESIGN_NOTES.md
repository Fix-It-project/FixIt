# TechHome redesign notes

Hierarchy + de-clutter pass on `features/techhome`. Goal: actionables first, fewer
cards, one type scale, slim hero. This file documents the two reversible decisions the
user wanted preserved, plus what was removed.

## Render order (current)

```
HeroHeader (slim, solid tint)
EarningsCard        ← overlaps the hero (negative margin), the ONE kept ornament
Primary slot        ← ActiveJobCard | NextJobCard | (collapses)
IncomingRequests    ← renders only when there are pending requests
ScheduleTimeline    ← renders only when there are jobs today; flat filled rows
PerformanceGrid     ← flat, bare 2×2 figures
PromoCard
```

Primary slot logic (`TechHomeScreen.tsx`):
1. `useActiveJob()` → `ActiveJobCard` (status in `ACTIVE_JOB_STATUSES`).
2. else `useNextTodayJob()` → `NextJobCard` (today's earliest `accepted` order; "Start
   tracking" runs `useStartTrackingMutation` inline → cache flips → slot becomes active).
3. else nothing. The quiet-day state is surfaced as a one-line hero status
   (`useQuietLine` in `HeroHeader.tsx`): "Next job Sat 11:00" or "all caught up".

## Reversible decision 1 — demote the earnings card below the actionables

The earnings card currently **overlaps the hero at the top** (kept because the user likes
the look). To move it BELOW the primary slot + incoming requests instead:

1. In `TechHomeScreen.tsx`, remove the negative-margin overlap wrapper around
   `<EarningsCard />`:
   ```tsx
   // from (overlapping):
   <Enter order={0}>
     <View className="px-screen-x" style={{ marginTop: -EARNINGS_OVERLAP }}>
       <EarningsCard />
     </View>
   </Enter>
   // to (demoted, plain): just move this block below the IncomingRequestsSection block
   <Enter order={3}>
     <View className="px-screen-x pt-stack-lg">
       <EarningsCard />
     </View>
   </Enter>
   ```
2. Re-number the `Enter order={…}` props so the stagger stays sequential.
3. In `HeroHeader.tsx`, drop the big `overlapPadding` bottom padding (it only exists so the
   card can overlap). Pass a smaller fixed bottom pad.
4. `EARNINGS_OVERLAP` const in `TechHomeScreen.tsx` becomes unused — delete it.

## Reversible decision 2 — restore the old hero / removed pieces

Removed in this pass (git ref before redesign: `6cc5c14`):
- **Notification bell** in the hero — the technician tab bar already has notifications.
- **`HeroBackdrop`** — decorative SVG blueprint grid + radial glow over the hero gradient.
- **`HeaderStatStrip.tsx`** — stat tiles under the hero (deleted file).
- **`AvailabilityCard.tsx`** — full-width online card with wrench icon + pulse ring +
  subtitle (deleted file). Replaced by the compact `OnlineSwitch` in the hero.
- Hero gradient → solid `tint.heroStart` fill (a plain tinted header row).

To restore any of these, recover the file/markup from `6cc5c14`:
```
git show 6cc5c14:apps/native/src/features/techhome/components/HeroHeader.tsx
git show 6cc5c14:apps/native/src/features/techhome/components/AvailabilityCard.tsx
git show 6cc5c14:apps/native/src/features/techhome/components/HeaderStatStrip.tsx
```

## Type scale (techhome only)

Strict: `display` (hero earnings figure only) · `h2` (stat values) · `h3` (all section /
card titles) · `body` (names, primary content) · `caption` (everything meta). No `h4`,
`bodySm`, `label`, `buttonLg`. Buttons use `buttonMd`. No uppercase + tracking-wide except
the compact functional status code in `ActiveJobCard` (`STATUS_LABEL`).
