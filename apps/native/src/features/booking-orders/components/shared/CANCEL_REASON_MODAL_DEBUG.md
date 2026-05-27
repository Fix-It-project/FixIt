# Cancel Reason Modal TextInput Debug Log

Purpose: isolate the source of Android TextInput glitches in `CancelReasonModal`.

## Baseline Symptom

- Typing fast duplicates text.
- Backspace sometimes fails to delete words or causes text to jump/glitch.

## Experiments

1. Shared `Input` replaced with bare React Native `TextInput`.
   - File: `CancelReasonModal.tsx`
   - Result: issue still present.
   - Conclusion: shared `Input` is not the primary cause.

2. `Dialog.Form` replaced with plain `View`.
   - File: `CancelReasonModal.tsx`
   - Marker comment in code: `Debug isolation: plain View + React Native TextInput...`
   - Result: issue still present.
   - Conclusion: `Dialog.Form` is not the primary cause.

3. Removed `useReanimatedKeyboardAnimation` from `Dialog`.
   - File: `apps/native/src/components/ui/dialog.tsx`
   - Removed keyboard progress/height hook and keyboard-driven `translateY`.
   - Dialog still uses portal, backdrop, ScrollView wrapper, and entry/exit animation.
   - Result: issue still present.
   - Conclusion: `useReanimatedKeyboardAnimation` is not the primary cause.

4. Replaced `DialogInternal` `ScrollView` wrapper with plain `View`.
   - File: `apps/native/src/components/ui/dialog.tsx`
   - Removed `ScrollView`, `keyboardShouldPersistTaps`, and scroll responder wrapping around dialog children.
   - Dialog still uses portal, backdrop, and entry/exit animation.
   - Result: issue still present.
   - Conclusion: `ScrollView` wrapper is not the primary cause.

5. Bypassed `@rn-primitives/portal` in `Dialog`.
   - File: `apps/native/src/components/ui/dialog.tsx`
   - Initial direct in-place render placed the dialog at the bottom of the screen because absolute positioning became relative to the caller tree.
   - Revised test renders `Dialog` and `DialogProvider` through React Native `Modal` instead of `@rn-primitives/portal`.
   - Dialog still uses backdrop, content wrapper, and entry/exit animation.
   - Result: issue stopped.
   - Conclusion: the `@rn-primitives/portal` render path is the active culprit.

## Audit Conclusion

The text glitch is not caused by:

- Shared `Input`
- Controlled cancel reason state
- `Dialog.Form`
- Dialog keyboard avoidance via `useReanimatedKeyboardAnimation`
- Dialog `ScrollView` content wrapper

The bug is tied to rendering the dialog through `@rn-primitives/portal`. Rendering the same dialog internals through React Native `Modal` avoids the TextInput duplication/backspace glitch.

Active debug state after cleanup:

- `CancelReasonModal.tsx` restored to shared `Input` + `Dialog.Form`.
- `input.tsx` restored to its pre-debug implementation.
- `Dialog` keyboard avoidance restored.
- `Dialog` `ScrollView` wrapper restored.
- `Dialog` still bypasses `@rn-primitives/portal` and temporarily uses React Native `Modal`.

Do not treat this as the final design fix yet; it is the isolated failing boundary.

## Revert Checklist

When finished debugging:

- Restore `CancelReasonModal` to the intended component structure.
- Restore `Dialog.Form` usage if ruled out.
- Restore shared `Input` usage if ruled out.
- Restore dialog keyboard avoidance if `useReanimatedKeyboardAnimation` is ruled out.
- Restore dialog `ScrollView` content wrapper if ruled out.
- Restore dialog portal rendering and remove temporary native `Modal` host if ruled out.
- Decide final portal fix: replace `@rn-primitives/portal`, patch usage, or keep native `Modal` for text-entry dialogs.
- Remove this debug log if no longer needed.
