# RTL and LTR

## Application direction

`ChesaiProvider` / `LayoutProvider` keeps the document direction, Chesai direction context and Radix direction context in sync. The existing `useLayout().setDirection()` and `toggleDirection()` APIs continue to work. A stored direction takes precedence over `initialDirection`.

```tsx
<ChesaiProvider initialDirection="rtl">
  <App />
</ChesaiProvider>
```

## Mixed-direction regions

Use `DirectionProvider` for a region that differs from the application direction. It renders a div, accepts normal div props, and preserves the scope for interactive components and portalled popup content. It does not change the document or persist a preference.

```tsx
import { DirectionProvider, Slider, Select } from "chesai-ui";

<DirectionProvider dir="rtl" className="space-y-4">
  <Slider defaultValue={[30]} />
  <Select items={[{ value: "active", label: "نشط" }]} />
</DirectionProvider>
```

Native `dir` inheritance works for logical CSS. For a mixed-direction subtree containing JavaScript interactions or portals, use `DirectionProvider` rather than relying only on `<div dir="rtl">`. Individual primitive `dir` props remain available where already supported. Date/number locale and text direction are separate concerns; this change does not select a formatting locale.

## Component changes

- Form labels, selection indicators, clear controls, steppers, icon spacing, toolbar actions and table headings use logical alignment and spacing. Floating labels scale from the correct edge.
- Joined buttons/cards/items and overlapping avatars follow inline direction. Navigation chevrons, tree indentation and tree drop guides mirror.
- Tabs normalize horizontal scroll edges, mirror slide/drag direction and cancel obsolete slide animations. Their transition modes can change without changing hook order.
- Slider custom segments and ticks follow the same direction/inversion as the Radix thumb. Carousel horizontal gestures follow RTL ordering.
- VirtualList handles horizontal RTL and reversed RTL offsets, including programmatic scrolling. VirtualFlex and VirtualMasonry mirror horizontal placement. VirtualGrid already uses inherited CSS grid order.
- ElasticScrollArea edge shadows understand negative RTL scroll offsets. Calendar and other direction-aware controls respond to the shared direction scope; Switch and Calendar also observe their local DOM direction.
- Popover, Dialog, Sheet and Tooltip content receive the direction scope across portals. Menu/toolbar/navigation/accordion/select roots explicitly forward effective direction to their primitives.
- Phone-number input remains LTR, Lexical retains paragraph-specific LTR/RTL alignment, and physical map/canvas geometry and explicit sheet sides retain their meaning.

## Verification

`Showcase / RTL and LTR / Side By Side` compares forms, switches, sliders, toolbar keyboard navigation, tab panels and virtual scrolling with independent live direction switches.

Automated regression coverage includes application direction changes, RTL toolbar arrow keys, nested popover direction, local DOM direction changes, slider inversion/keyboard movement, and virtual-list reverse offsets. Browser checks cover mirrored form layouts, RTL Select portal direction, toolbar navigation, selected tab panel placement and first/last virtual items in normal/reverse RTL modes.

This is not certification of every combination of third-party editors, maps, drag-and-drop tools and canvas variants. Those components retain their domain-specific coordinate systems; consumer-provided CSS and content must also respect direction.
