# chesai-ui

`chesai-ui` is a modern, accessible, and highly customizable React component library. It is built on a foundation of industry-standard tools including Radix UI for accessibility, Framer Motion for fluid animations, and Tailwind CSS with CVA for flexible styling.

---

## Features

- **Accessible by Default**: Leverages Radix UI primitives to ensure components are accessible out-of-the-box, following WAI-ARIA standards.
- **Beautifully Animated**: Utilizes Framer Motion to provide smooth, physics-based animations that enhance user experience.
- **Highly Customizable**: Built with Tailwind CSS and Class Variance Authority (CVA), allowing for deep customization and easy integration with your existing design system.
- **Comprehensive Component Set**: Includes a wide range of components, from basic buttons and inputs to complex, responsive navigation elements like `Sidebar` and `AppBar`.
- **TypeScript Support**: Fully typed to provide a great developer experience with autocompletion and type safety.
- **Developer-Friendly**: Components are designed to be composable and easy to use, with a consistent and predictable API.

## Live Demo

[Chesai UI Demo](https://chesai-ui.pages.dev/)

### Liquid ripple settings

All ripple-enabled components share a configurable classic or liquid renderer. Configure it
through `ThemeProvider` or `ChesaiProvider`:

```tsx
<ChesaiProvider
  defaultRippleSettings={{ style: "liquid", waveAmp: 0.04, expandMs: 520, fadeMs: 340, sparkle: true, drift: true }}
  rippleStorageKey="my-app-ripple"
>
  {children}
</ChesaiProvider>
```

`useTheme()` exposes `rippleSettings`, `setRippleSettings(partialSettings)`, and
`resetRippleSettings()`. Settings persist in local storage; saved values take
precedence over defaults. Reset restores the provider defaults. Wave amplitude is
a fraction (`0.04` means 4%); durations are milliseconds. `timeScale: 0.25` enables
quarter-speed playback. Additional settings are `waveFreq`, `waveSpeed`,
`opacityInMs`, `minPressMs`, and `driftAmount`.

The Material Theme Builder includes live ripple controls, a press-and-hold preview,
reset, and configuration export. Reduced-motion preferences disable waviness,
shimmer, and center drift. Component disabled/loading states still suppress ripples.

Switch effects at runtime with `useTheme().setRippleSettings({ style: 'classic' })`
or `{ style: 'liquid' }`. Both providers accept
`defaultRippleSettings={{ style: 'classic' }}`; liquid remains the default.
Switching removes active ripples and preserves the liquid physics settings.

### Separated OTP slots

Use `separated` to add gaps between digits without separator glyphs. Each filled
or outlined slot follows `shape="full" | "minimal" | "sharp"`. Existing color,
size, focus, disabled, and error styles are retained.

```tsx
<InputOTP maxLength={5} separated shape="minimal" variant="filled">
  <InputOTPGroup>
    {[0, 1, 2, 3, 4].map(index => <InputOTPSlot key={index} index={index} />)}
  </InputOTPGroup>
</InputOTP>
```

### Popup borders

Popup surfaces are borderless by default. Set `bordered` on the owning component
to enable the outer outline:

```tsx
<Select bordered items={items} />
<Combobox bordered options={options} />
<Popover bordered>...</Popover>
<DropdownMenu bordered shape="full">...</DropdownMenu>
```

The same opt-in is available on MultiSelect, ContextMenu, Menubar, NavigationMenu,
ColorPicker, DatePicker, TimePicker, PhoneInput, FullCalendar (event popup),
LocationPicker (docked search), MapPopup, MarkerPopup, ChartTooltip, and VideoPlayer
(settings menu). Menu submenus inherit the setting. This controls popup surfaces;
input variants and internal dividers retain their own styles.

Dropdown menu items, checkbox/radio items, and submenu triggers use inset corner
radii derived from the parent `shape`, including their hover, focus, and ripple
layers.
