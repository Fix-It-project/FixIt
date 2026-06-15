# Dark-mode primary → deep hero blue

## What changed

In **dark theme only**, the `primary` color moved from the bright **blue-500** to the
deeper **blue-700** (the same blue the dark hero gradient starts from). Light / white /
forest themes are untouched.

Two values in [`definitions.ts`](./definitions.ts), changed together so the runtime
palette and the NativeWind primitive stay in sync:

| Consumer | Token | Before | After |
| --- | --- | --- | --- |
| NativeWind `bg-primary` / `text-primary` (shadcn primitive) | `darkPrimitives.primary` | `tok(blue[500])` | `tok(blue[700])` |
| Runtime `useThemeColors().primary` (buttons, headers, active tab tint, button shadow) | dark `ThemeTokens.primary` | `hex(blue[500])` | `hex(blue[700])` |

`primaryForeground` stays white and `ring` stays `blue[400]` (focus ring), so the focus
state and white button text are unchanged.

## Why

The user preferred the dark hero's deeper blue as the global dark primary. Deep blue +
white text raises white-on-primary contrast on filled buttons and page headers; the
brighter blue-500 was the low-contrast case.

## Known caveat

`primary` is also used as a **text** color in dark mode (links / `text-app-primary`,
tonal-button text) on the near-black surface. blue-700-on-near-black is darker than
blue-500-on-near-black — if links read too dim, either revert (below) or split the token
(keep a brighter `primary` for text, deep blue only for fills).

## How to revert

In [`definitions.ts`](./definitions.ts), set both back to `blue[500]`:

- `darkPrimitives.primary`: `tok(blue[700])` → `tok(blue[500])`
- dark `ThemeTokens.primary`: `hex(blue[700])` → `hex(blue[500])`

Then delete this file.
