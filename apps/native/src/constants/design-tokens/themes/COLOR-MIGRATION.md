# Light Themes & Card Primitive — single source of truth

This explains the **two light themes**, how they stay single-source, and the
**`<Card>`** primitive. Dark + forest are unchanged. Brand primary (Walmart True
Blue `#0053e2`) is unchanged.

## Two light themes (pick in Settings → theme control: Light · White · Dark · System)

| | **`light`** (default, = `system` light) | **`white`** (explicit pick) |
|---|---|---|
| page canvas (`surfaceBase` / `--background`) | **#f5f5f5** soft gray | **#ffffff** white |
| cards (`bg-card` / `surfaceElevated`) | **#ffffff** white | **#f2f2f2** gray |
| wells/chips (`secondary`/`muted`/`accent`/`surfaceMuted`) | #ececec | #e8e8e8 |
| text | `#0f0f0f` / `#606060` / `#909090` (Google-neutral) | same |
| borders / brand / functional / tint | `#e5e5e5` / blue / unchanged | same |
| card outlines | **none** (separate by fill + shadow) | **none** |

Both are the *same look inverted*: white cards on a gray page, vs gray cards on a
white page. Same text, brand, borders, everything else.

## Why this is single-source

- All colors live in `themes/definitions.ts`. Changing any color = **one file**.
- The two light themes are NOT duplicated: `white` is built by
  **spreading `lightTheme` and overriding only ~6 surface tokens** —
  `const whiteTheme: ThemeTokens = { ...lightTheme, id: "white", surfaceBase, surfaceElevated, surfaceMuted, primitives: whitePrimitives, navigation }`.
  Edit a shared token once → both light themes update.
- Components never hardcode colors; they use `bg-surface` (page) / `bg-card` (card) /
  `text-content*`, which resolve from the active theme. **Switching the whole light
  model is token-only — no component edits.**
- Adding another theme = one `themeRegistry` entry + one `ThemeId` literal + one
  picker option. (`resolution.ts` `resolveThemeId` maps `system`→`light`/`dark`;
  `white` is explicit-only.)

> ⚠️ TDZ: `white` must derive from a named `const lightTheme` declared **before**
> `themeRegistry` — you cannot reference `themeRegistry.light` while initializing it.

## `<Card>` primitive — single source for card STRUCTURE

`components/ui/card.tsx` centralizes the card surface (radius + `bg-card` fill +
**no outline** + optional shadow). Change card radius/border/shadow for the whole app
**here once**.

- Plain `<View>` cards: `<Card className="p-card">…</Card>` (or `<Card elevated …>` for a
  shadow — shadow color comes from `useThemeColors()`, live across theme switches).
- Interactive cards (`TouchableOpacity` / `PressableScale` / `Pressable`): keep the
  element, use `className={cn(CARD_BASE, "…")}` (both share the same `CARD_BASE` string).
- Overrides (e.g. `rounded-[14px]`) pass via `className` — `cn` uses `tailwind-merge`.

**Adoption is incremental.** Migrated so far: `BookingDescriptionCard`,
`BookingAttachmentCard`. Remaining cards work unchanged and adopt `<Card>` / `CARD_BASE`
opportunistically (low-risk, mechanical). **Do not** route selection/focus surfaces
(`CategoryChip`, `DocumentUploadField`), `newbooking/*`, `RoleCard`, or alerts/toasts
through `<Card>` — those are not plain content cards.
