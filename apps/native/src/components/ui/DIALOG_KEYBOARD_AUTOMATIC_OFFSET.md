# Dialog Keyboard Follow-Up

## Why This Is Parked

`react-native-keyboard-controller@1.21.0` adds `automaticOffset` to
`KeyboardAvoidingView`. That option is the right long-term fix for portaled
dialogs because it measures the view's real screen position instead of relying
only on parent-relative layout coordinates.

We tried this shape:

```tsx
<KeyboardAvoidingView
	automaticOffset
	behavior="position"
	contentContainerStyle={styles.keyboardAvoidingContent}
	style={styles.keyboardAvoidingView}
>
	{children}
</KeyboardAvoidingView>
```

It should let the dialog sit exactly above the keyboard without hardcoded
padding. We reverted it for now because the current Expo/RN setup cannot support
`react-native-keyboard-controller@1.21.0` safely yet.

## Current State

- `react-native-keyboard-controller` is pinned back to `1.18.5`.
- `Dialog` keeps the working React Native Reusables / `@rn-primitives/dialog`
  portal implementation.
- Keyboard avoidance uses the compatible `KeyboardAvoidingView` API without
  `automaticOffset`.

## Retry Later

When Expo/RN is upgraded enough to support `react-native-keyboard-controller`
`1.21.x` or newer:

1. Upgrade `react-native-keyboard-controller`.
2. Add `automaticOffset` back to the dialog `KeyboardAvoidingView`.
3. Keep `behavior="position"`.
4. Re-test CancelReasonModal fast typing/backspace and keyboard placement on
   Android first.
