# Timeline

Compose `Timeline.Item`, `Separator`, `Dot`, `Connector` and `Content` under `Timeline` for history, logistics milestones and order tracking. Existing compositions remain valid. The root remains a semantic list; items do not become clickable unless you place a real action in their content.

```tsx
<Timeline aria-label="Delivery progress">
  <Timeline.Item status="current">
    <Timeline.Separator>
      <Timeline.Dot />
      <Timeline.Connector variant="dashed" shape="wavy" animated />
    </Timeline.Separator>
    <Timeline.Content>Out for delivery — current stage</Timeline.Content>
  </Timeline.Item>
  <Timeline.Item status="pending">
    <Timeline.Separator><Timeline.Dot /></Timeline.Separator>
    <Timeline.Content>Delivered — pending</Timeline.Content>
  </Timeline.Item>
</Timeline>
```

## Orientation, direction and per-step color

The **Layouts and Colors / Order Journey** Storybook controls expose `step1` through `step4` independently. Expand each object to edit `color`, `indicator` (color, foreground, shape, size) and `connector` (color, variant, shape, size, waveSize, animated, duration, flowDirection). These are story configuration objects mapped to the compound components, not additional root props. The final milestone has no outgoing connector. Clear a local color to inherit its step/root color.

Set `Timeline orientation="horizontal"` for a horizontal journey (vertical is the default). Items keep their DOM/chronological order. Horizontal items have a minimum width and the root scrolls on small screens; content uses logical padding. `dir="rtl"` reverses the visual horizontal progression and forward connector animation. Vertical RTL puts the markers on the right while progression remains downward. Direction also inherits from an ancestor `dir`, CSS direction or the library direction scope; explicit `dir` wins.

`Timeline color` sets a shared default. `Timeline.Item color` overrides it per milestone. `Timeline.Dot color` and `Timeline.Connector color` override the step independently. All accept every Material system role exposed in `timelineColors`, including containers, fixed colors, surfaces, outlines and on-colors. Values reference live `--md-sys-color-*` variables, so theme/seed changes update without rebuilding the component.

Dots automatically pair standard fills with their on-color. `foreground` explicitly selects the icon/text role; `style` can override any final color. Outline and ghost dots use the color as their foreground; outline dots also use it for the border. Low-contrast roles such as surface, shadow or scrim are available deliberately, but require checking the chosen background and foreground. Color is visual treatment, not status semantics.

```tsx
<Timeline orientation="horizontal" dir="rtl" color="primary">
  <Timeline.Item status="current" color="tertiary-container">
    <Timeline.Separator>
      <Timeline.Dot foreground="on-tertiary-container" />
      <Timeline.Connector color="tertiary" shape="wavy" animated />
    </Timeline.Separator>
    <Timeline.Content>الشحنة في الطريق</Timeline.Content>
  </Timeline.Item>
</Timeline>
```

## Connector appearance

| Prop | Values | Default |
| --- | --- | --- |
| `variant` | `solid`, `dashed`, `dotted` | `solid` |
| `shape` | `regular`, `wavy` | `regular` |
| `size` | `sm`, `md`, `lg` (1/2/4px stroke) | `md` |
| `waveSize` | `sm`, `md`, `lg` (12/20/32px wavelength) | `md` |
| `color` | `default` or any role in `timelineColors` | Step/root color, then item status, otherwise neutral |
| `animated` | boolean | `false` |
| `duration` | Positive seconds per cycle | `1.2` |
| `flowDirection` | `forward`, `reverse` | `forward` (downward vertically; inline-end horizontally) |

Wavy lines support every variant. Patterned connectors flow; straight solid connectors pulse because translating a solid line would be invisible. The SVG pattern repeats at a fixed wavelength as content height changes, without stretching the wave. `className`, `style`, ref and existing Framer Motion props remain available. Use `color` or a text-color class to color the SVG line.

## Milestone state

Optional `Timeline.Item status` accepts `completed`, `current`, `pending` or `error`. It supplies defaults to its dot and outgoing connector. Explicit dot `variant` controls its treatment; color props override its palette, with component color taking precedence over step/root color and status defaults. `current` supplies `aria-current="step"` unless explicitly overridden. Render visible status text/icons as well: color alone must not communicate completion or failure. The application owns the status and event ordering; keep only one current milestone per journey.

Choose the outgoing connector based on the meaning of that segment. For example: completed segments solid, an active route animated, planned segments dotted. These choices are not forced by status. Omit the connector after the last event. Use content padding for spacing, rather than gaps between list items that break the visual route. Content may include timestamps, carrier/location details and real action controls.

Built-in entrance and continuous animations respect `prefers-reduced-motion`. Only animate a meaningful active segment; stop animation when progress completes or stalls. Consumer-supplied motion props remain the consumer's responsibility.
