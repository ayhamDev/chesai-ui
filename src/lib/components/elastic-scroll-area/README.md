# Elastic scroll input behavior

## Diagnosis

- The previous wheel handler canceled Ctrl+wheel at boundaries. Browsers also deliver trackpad pinch as Ctrl+wheel. The viewport's `pan-y` / `pan-x` touch action additionally excluded pinch zoom.
- Touch distance was measured from the initial finger position even after native scrolling had consumed much of the swipe. Reaching an edge could therefore introduce a large, unbounded transform. Touch damping was hard-coded instead of using `dampingFactor`.
- Custom transforms were applied even when the browser's touch event could not be canceled, allowing native momentum/bounce and synthetic displacement to compete.
- A second finger did not reset the original touch state. `touchcancel` ran the same refresh path as a successful release.
- Wheel recovery used a 50ms timer, ignored small momentum events, and could trigger refresh. Reversal and interrupted spring animations could leave stale displacement. Indicator animations were not tracked for cleanup, and rejected refresh promises were unhandled.

## Refactored behavior

Native gestures that start by scrolling remain native through their entire sequence. A cancelable, single-finger gesture that starts by pulling outward at an edge can claim elastic handling. Its displacement is bounded and uses `dampingFactor`; reversing unwinds the pull and scrolls inward. Browser-owned, cross-axis, multi-touch, and nested scrolling gestures are left alone.

Wheel scrolling remains native inside the viewport. Boundary wheel input uses normalized pixel/line/page deltas and settles after 120ms of inactivity. Ctrl/Meta-wheel is never canceled, including over the Radix scrollbar. Wheel input no longer triggers pull-to-refresh: refresh requires a completed single-touch pull above the configured threshold. `onRefreshError` optionally handles refresh failures; otherwise they are logged, and loading still resets.

Native overscroll is suppressed on the elastic axis to avoid double bounce and scroll chaining. With both elasticity and refresh disabled, native overscroll behavior is retained. Refresh-only mode stretches only at the top. Reduced-motion preference skips recovery animation. Timers, listeners, and animations are cleaned up when options change or the component unmounts.

## Verification

Run `node node_modules/vitest/vitest.mjs run src/lib/components/elastic-scroll-area/elastic-scroll-area.test.tsx` and `node node_modules/typescript/bin/tsc --noEmit`.

Use the **Gesture Regression** Storybook story on iOS Safari, Android Chrome, and a desktop trackpad to check native momentum and actual browser zoom. Test top/bottom flings, repeated interrupted pulls, reversal, adding/removing a second finger, nested scrolling, and Ctrl+wheel over both content and scrollbar. Also check horizontal orientation and 125%/200% browser zoom. Unit tests exercise event ownership and state transitions with deterministic animations; they do not prove physical browser gesture behavior.

Ancestor touch restrictions or modal scroll locks can still block zoom outside this component's control. In this repository the fullscreen dialog sets `touch-action: none` on its draggable shell and `pan-y` on an inner wrapper. Its drag/scroll-lock integration needs separate device verification when embedding this component in that dialog; a child cannot override an ancestor's pinch restriction. Host pages must also permit zoom in their viewport metadata.

Browser references: [wheel events](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event), [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action).
