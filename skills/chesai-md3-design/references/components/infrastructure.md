# Providers, hooks and utilities

[Selection guide](../component-registry.md) · [Machine-readable registry](registry.json)

Generated from the package-root exports and curated usage guidance. Import public names from `chesai-ui`. Own-prop lists are discovery hints, not complete signatures; inherited props, required fields, unions and callbacks must be checked in source/types. Compound members listed below may include helper data; consult the usage note before treating a value as JSX.

- [context](#context)
- [hooks](#hooks)
- [utils](#utils)

## context

ChesaiProvider combines theme, layout, tooltip, action-sheet, dialog and toaster services. Reuse it at the app boundary. useTheme/useLayout manage preferences; useDialog/useActionSheet expose registered or imperative overlays. Inspect providers for exact registration and open/close contracts; DirectionProvider/useDirection are separate direction primitives.

**Availability:** package-root public API.

**Value exports:** `ActionSheetProvider`, `ChesaiProvider`, `DialogProvider`, `DirectionProvider`, `LayoutProvider`, `ThemeProvider`, `useActionSheet`, `useDialog`, `useDirection`, `useLayout`, `useTheme`, `useThemeTransition`.

**Type-only exports:** `ActionSheetConfig`, `ActionSheetItem`, `ActionSheetSection`, `ChesaiProviderProps`, `DialogConfig`, `Direction`, `FontSettings`, `ThemePalette`, `ThemeProviderProps`. Use `import type`.

- `ActionSheetProvider` own props: `children`.
- `ChesaiProvider` own props: `children`, `colorMatchStorageKey`, `defaultAnimationStyle`, `defaultColorMatch`, `defaultContrast`, `defaultFonts`, `defaultOverrides`, `defaultRippleSettings`, `defaultSeedColor`, `defaultTheme`, `initialDirection`, `layoutStorageKey`, `rippleStorageKey`, `themeStorageKey`, `toasterProps`.
- `DialogProvider` own props: `children`.
- `DirectionProvider` own props: `dir`.
- `LayoutProvider` own props: `children`, `initialDirection`, `storageKey`.
- `ThemeProvider` own props: `animationStorageKey`, `children`, `colorMatchStorageKey`, `contrastStorageKey`, `defaultAnimationStyle`, `defaultColorMatch`, `defaultContrast`, `defaultFonts`, `defaultOverrides`, `defaultRippleSettings`, `defaultSeedColor`, `defaultTheme`, `fontStorageKey`, `overridesStorageKey`, `rippleStorageKey`, `seedColorStorageKey`, `storageKey`.

**Source:** [ActionSheetProvider.tsx](../../../../src/lib/context/ActionSheetProvider.tsx), [ChesaiProvider.tsx](../../../../src/lib/context/ChesaiProvider.tsx), [DialogProvider.tsx](../../../../src/lib/context/DialogProvider.tsx), [ThemeProvider.tsx](../../../../src/lib/context/ThemeProvider.tsx), [direction.tsx](../../../../src/lib/context/direction.tsx), [heatmap-chart.tsx](../../../../src/lib/context/heatmap-chart.tsx), [index.ts](../../../../src/lib/context/index.ts), [layout-context.tsx](../../../../src/lib/context/layout-context.tsx), [ripple-context.ts](../../../../src/lib/context/ripple-context.ts)

**Examples:** [ThemeBuilder.stories.tsx](../../../../src/lib/context/ThemeBuilder.stories.tsx), [direction.stories.tsx](../../../../src/lib/context/direction.stories.tsx)

## hooks

Reusable behavior: useCalendar/useTimePicker for date/time state, useAppBar for header integration, useWindowSizeClass for adaptation, useCapacitorBackButton for native back, useFlubber for shape morphing and useRipple for press feedback. Read signatures before calling; hooks are not JSX components and must obey React hook rules.

**Availability:** package-root public API.

**Value exports:** `useAppBar`, `useCalendar`, `useCapacitorBackButton`, `useFlubber`, `useRipple`, `useTimePicker`, `useWindowSizeClass`.

**Type-only exports:** `CalendarMode`, `DateRange`, `UseAppBarOptions`, `UseRippleOptions`, `WindowSizeClass`. Use `import type`.


**Source:** [index.ts](../../../../src/lib/hooks/index.ts), [use-calender.ts](../../../../src/lib/hooks/use-calender.ts), [use-time-picker.ts](../../../../src/lib/hooks/use-time-picker.ts), [useAppBar.ts](../../../../src/lib/hooks/useAppBar.ts), [useCapacitorBackButton.tsx](../../../../src/lib/hooks/useCapacitorBackButton.tsx), [useFlubber.ts](../../../../src/lib/hooks/useFlubber.ts), [useRipple.ts](../../../../src/lib/hooks/useRipple.ts), [useShallowRouter.ts](../../../../src/lib/hooks/useShallowRouter.ts), [useWindowSizeClass.ts](../../../../src/lib/hooks/useWindowSizeClass.ts)

**Examples:** No Storybook file in this folder; inspect the source contract.

## utils

Theme and ripple configuration helpers/data, including palette generation application, font loading and presets. Use the existing provider for ordinary theming; CSS_MAPPING, chesaiColors and defaultRippleSettings are values, not components.

**Availability:** package-root public API.

**Value exports:** `applyThemeVariables`, `chesaiColors`, `clearThemeVariables`, `CSS_MAPPING`, `defaultRippleSettings`, `loadGoogleFont`, `PRESET_FONTS`.

**Type-only exports:** `FontConfig`, `RippleSettings`, `RippleStyle`, `ThemeColorKey`, `ThemeOverrides`. Use `import type`.


**Source:** [classic-ripple.ts](../../../../src/lib/utils/classic-ripple.ts), [font-loader.ts](../../../../src/lib/utils/font-loader.ts), [index.ts](../../../../src/lib/utils/index.ts), [liquid-ripple.ts](../../../../src/lib/utils/liquid-ripple.ts), [ripple-settings.ts](../../../../src/lib/utils/ripple-settings.ts), [tailwind-preset.ts](../../../../src/lib/utils/tailwind-preset.ts), [theme-generator.ts](../../../../src/lib/utils/theme-generator.ts)

**Examples:** No Storybook file in this folder; inspect the source contract.

