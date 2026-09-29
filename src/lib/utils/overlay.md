# Overlay blur

Pass `overlayBlur="none" | "xs" | "sm" | "md" | "lg" | "xl"` to a component that renders a backdrop. The shared `OverlayBlur` type is exported from the library.

| Value | Blur |
| --- | --- |
| `none` | 0px |
| `xs` | 2px |
| `sm` | 4px |
| `md` | 8px |
| `lg` | 16px |
| `xl` | 24px |

Supported on `DropdownMenu`, `Dialog` (including expandable sheets), `Sheet`, `Sidebar`, `NavigationRail.Navigator`, `SearchView`, `Image`, `ShapedImage`, `LayoutRouter.Screen`, `FullCalendar`, `RecurrenceSelect`, `RecurrenceDialog`, and `PlaylistPlayer`.

Wrappers also forward the option: `CommandDialog` accepts it directly, imperative dialogs accept it in their configuration, and adaptive `Resizable.Panel` accepts it through `dialogProps` / `sheetProps`.

```tsx
<DropdownMenu overlay overlayBlur="md">...</DropdownMenu>
<Dialog overlayBlur="lg">...</Dialog>
<Sheet overlayBlur="sm">...</Sheet>
<SearchView overlayBlur="xl" {...searchProps} />
<Image effects={["zoom"]} overlayBlur="none" src={photo} alt="Mountain landscape" />
```

The option affects the backdrop only and does not enable an otherwise disabled overlay. Placement, dismissal and modal behavior remain governed by their existing props. A menu's `glass` option styles the menu surface separately.

Existing defaults are preserved: dropdown backdrops use `xs`; image zoom and playlist loading overlays use `md`; sidebar desktop overlays use `sm` and mobile push backdrops retain their 1px blur. Other backdrops remain unblurred unless configured. Playlist sheets and sidebar mobile sheets default to no blur.


Backdrop transitions animate opacity only; blur sizes remain fixed. Avoid
animating `filter` / `backdrop-filter` or adding blur to motion variants.
Dropdown scrims fade in and out over 220ms and stop intercepting input on exit.

Modal primitives must share one `@radix-ui/react-dismissable-layer` instance.
The package overrides keep menus, dialogs and Vaul sheets on the same version
and also unify `@radix-ui/react-focus-scope` to prevent competing focus traps;
separate copies maintain separate body pointer-lock registries and can restore
`pointer-events: none` after a menu-to-dialog handoff.
