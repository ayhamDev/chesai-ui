# Elastic scroll input behavior

## Scrollbar visibility

Hide both scrollbars without disabling wheel, touch, keyboard, or programmatic scrolling:

```tsx
<ElasticScrollArea scrollbarVisibility="hidden">{content}</ElasticScrollArea>
```

To hide them only on small screens, use `hideScrollbarOnMobile`. This uses the Tailwind `md` breakpoint (768px by default) and works with any `scrollbarVisibility` mode:

```tsx
<ElasticScrollArea hideScrollbarOnMobile>{content}</ElasticScrollArea>
```

The bars stay mounted so Radix keeps both scroll axes enabled. Only their visual display changes; the viewport and scroll position are preserved across resizing. The mobile app-layout story uses hidden scrollbars; the dedicated visibility stories demonstrate both axes and responsive hiding.

Scrollbars are layered within the scroll area's isolated stacking context, so they cannot paint over portalled dialogs or menu overlays. Hover visibility and scroll behavior are unchanged.

## Diagnosis

- The previous wheel handler canceled Ctrl+wheel at boundaries. Browsers also deliver trackpad pinch as Ctrl+wheel. The viewport's `pan-y` / `pan-x` touch action additionally excluded pinch zoom.
- Touch distance was measured from the initial finger position even after native scrolling had consumed much of the swipe. Reaching an edge could therefore introduce a large, unbounded transform. Touch damping was hard-coded instead of using `dampingFactor`.
- Custom transforms were applied even when the browser's touch event could not be canceled, allowing native momentum/bounce and synthetic displacement to compete.
- A second finger did not reset the original touch state. `touchcancel` ran the same refresh path as a successful release.
- Wheel recovery used a 50ms timer, ignored small momentum events, and could trigger refresh. Reversal and interrupted spring animations could leave stale displacement. Indicator animations were not tracked for cleanup, and rejected refresh promises were unhandled.

## Refactored behavior

Native gestures that start by scrolling remain native through their entire sequence. A cancelable, single-finger gesture that starts by pulling outward at an edge can claim elastic handling. Its displacement is bounded and uses `dampingFactor`; reversing unwinds the pull and scrolls inward. Browser-owned, cross-axis, multi-touch, and nested scrolling gestures are left alone.

Wheel scrolling remains native inside the viewport. Boundary wheel input uses normalized pixel/line/page deltas and settles after 120ms of inactivity. Ctrl/Meta-wheel is never canceled, including over the Radix scrollbar. Wheel input no longer triggers pull-to-refresh: refresh requires a completed single-touch pull above the configured threshold. `onRefreshError` optionally handles refresh failures; otherwise they are logged, and loading still resets.

Native overscroll is suppressed on the elastic axis to avoid double bounce and scroll chaining. With both elasticity and refresh disabled, native overscroll behavior is retained. With elasticity disabled, only a top-edge touch pull drives the refresh indicator; content stays stationary and wheel input stays native. Reduced-motion preference skips recovery animation. Timers, listeners, and animations are cleaned up when options change or the component unmounts.

## Verification

Run `node node_modules/vitest/vitest.mjs run src/lib/components/elastic-scroll-area/elastic-scroll-area.test.tsx` and `node node_modules/typescript/bin/tsc --noEmit`.

Use the **Gesture Regression** Storybook story on iOS Safari, Android Chrome, and a desktop trackpad to check native momentum and actual browser zoom. Test top/bottom flings, repeated interrupted pulls, reversal, adding/removing a second finger, nested scrolling, and Ctrl+wheel over both content and scrollbar. Also check horizontal orientation and 125%/200% browser zoom. Unit tests exercise event ownership and state transitions with deterministic animations; they do not prove physical browser gesture behavior.

Ancestor touch restrictions or modal scroll locks can still block zoom outside this component's control. In this repository the fullscreen dialog sets `touch-action: none` on its draggable shell and `pan-y` on an inner wrapper. Its drag/scroll-lock integration needs separate device verification when embedding this component in that dialog; a child cannot override an ancestor's pinch restriction. Host pages must also permit zoom in their viewport metadata.

Browser references: [wheel events](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event), [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action).


## Pull to refresh without elasticity

```tsx
<ElasticScrollArea
  elasticity={false}
  pullToRefresh
  onRefresh={reloadItems}
  onRefreshError={showRefreshError}
  scrollbarVisibility="hidden"
>
  {content}
</ElasticScrollArea>
```

Pull down from the top using one finger, then release after reaching `pullThreshold` (80 by default). Disabling elasticity suppresses content bounce, while the refresh indicator remains available. A zero `dampingFactor` also leaves touch refresh available with the default pull resistance. Refresh requires a vertical viewport and an `onRefresh` callback; missing callbacks do not capture gestures or suppress native overscroll.

Short pulls, reversal below the threshold, touch cancellation, and multi-touch do not refresh. Wheel/trackpad scrolling does not trigger a refresh. Only one request can run at a time; rejection clears loading and lets the user retry. Changing gesture options during a request keeps the loading indicator visible when refresh remains enabled, and failures still reach the current `onRefreshError`. Unmounting removes listeners and animations and ignores subsequent request completion; it does not cancel the caller's network request.

The **Pull to refresh without elasticity** story includes a refresh counter and a failure toggle. Regression coverage includes gesture ownership and a rendered component check for stationary content with an active indicator and hidden scrollbars. Physical touch behavior on Safari/Chrome still needs device verification; simulated events cannot prove native touch arbitration.
