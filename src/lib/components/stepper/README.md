# Stepper

Keep the existing compound API and zero-based `currentStep`. Render `Stepper.Step` as direct children. Earlier steps are `complete`, the selected index is `current`, and later steps are `upcoming`; an index beyond the final step marks all steps complete. Steps can override `status` with `complete`, `current`, `upcoming` or `error`. The application owns navigation, validation and status text.

## Layout and direction

`orientation="horizontal"` (default) or `"vertical"`. Direction inherits from ancestors/theme scopes or an explicit root `dir="rtl"`. Horizontal RTL places the first step on the right and reverses forward connector flow. Vertical RTL places markers on the right and continues downward. Horizontal labels occupy normal flow and wrap; narrow containers scroll horizontally. No fixed label-height spacer is required.

## Customization

The **Delivery and Styling / Delivery** Storybook controls expose separate `step1`–`step4` objects. Each provides `color`, `indicator` settings and independent outgoing `connector` settings (color, line variant, wave shape, size, speed, direction and animation). These are story-only configuration objects wired to the public compound props. The final step has no outgoing connector. Local colors take precedence over the global fallback; remove a local color to inherit it.

- `color` on the root, step, indicator or separator accepts all 49 theme roles in `stepperColors`. A local color wins over a step color, which wins over the root. Colors reference live Material CSS variables. The existing root `variant` remains supported.
- `Stepper.Indicator` supports `foreground`, `size`, `shape="circle|square|diamond"`, `icon`, and `completedIcon`. Standard filled roles pair with their matching on-color; use foreground overrides and check contrast for unusual roles.
- `Stepper.Step size` sets the indicator geometry; a direct Indicator's explicit size takes precedence. Connectors use that size for alignment.
- `Stepper.Separator` supports `variant="solid|dashed|dotted"`, `shape="regular|wavy"`, `size`, `waveSize`, `animated`, `duration` and `flowDirection="forward|reverse"`, matching Timeline. Last-step separators are automatically omitted. Completed segments default to the accent, upcoming/current segments to the neutral track unless color is supplied. Use a step/separator color to emphasize the active route.
- Animated solid regular lines pulse; patterned lines flow. Shared connector and checkmark motion respect reduced motion. Keep status text visible rather than relying on color or animation alone.

```tsx
<Stepper currentStep={1} orientation="horizontal" dir="rtl">
  <Stepper.Step color="secondary" size="lg">
    <Stepper.Indicator />
    <Stepper.Separator variant="dashed" />
    <Stepper.Content><Stepper.Title>Confirmed</Stepper.Title></Stepper.Content>
  </Stepper.Step>
  <Stepper.Step color="tertiary-container">
    <Stepper.Indicator foreground="on-tertiary-container" />
    <Stepper.Content><Stepper.Title>Preparing delivery</Stepper.Title></Stepper.Content>
  </Stepper.Step>
</Stepper>
```

The root exposes list semantics and the current step exposes `aria-current="step"`. Steps are not automatically buttons: add actual buttons or links for navigable steps and preserve the form's validation rules. Indicator content and connector appearance can be independently overridden with `className`/`style`.
