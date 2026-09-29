# Actions and menus

[Selection guide](../component-registry.md) · [Machine-readable registry](registry.json)

Generated from the package-root exports and curated usage guidance. Import public names from `chesai-ui`. Own-prop lists are discovery hints, not complete signatures; inherited props, required fields, unions and callbacks must be checked in source/types. Compound members listed below may include helper data; consult the usage note before treating a value as JSX.

- [button](#button)
- [button-group](#button-group)
- [command](#command)
- [context-menu](#context-menu)
- [dropdown-menu](#dropdown-menu)
- [fab](#fab)
- [fab-menu](#fab-menu)
- [icon-button](#icon-button)
- [menubar](#menubar)
- [split-button](#split-button)
- [toolbar](#toolbar)

## button

Text actions and form submission. Use Button with children, optional startIcon/endIcon and isLoading; set type explicitly inside forms. asChild supports an appropriate link element.

**Availability:** package-root public API.

**Value exports:** `Button`, `buttonVariants`.

**Type-only exports:** `ButtonProps`. Use `import type`.

- `Button` own props: `asChild`, `endIcon`, `isActive`, `isLoading`, `shape`, `size`, `startIcon`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/button/index.tsx)

**Examples:** [Button.stories.tsx](../../../../src/lib/components/button/Button.stories.tsx)

## button-group

Visually related adjacent buttons. Compose Button children; grouping alone does not provide selection state or radio semantics.

**Availability:** package-root public API.

**Value exports:** `ButtonGroup`.

- `ButtonGroup` own props: `activeShape`, `children`, `gap`, `shape`.

**Source:** [index.tsx](../../../../src/lib/components/button-group/index.tsx)

**Examples:** [Button-group.stories.tsx](../../../../src/lib/components/button-group/Button-group.stories.tsx)

## command

Searchable command palette. Compose Input, List, Empty, Group and Item, optionally inside controlled CommandDialog. Connect item selection to real actions.

**Availability:** package-root public API.

**Value exports:** `Command`, `CommandDialog`, `CommandEmpty`, `CommandFooter`, `CommandGroup`, `CommandInput`, `CommandItem`, `CommandList`, `CommandSeparator`, `CommandShortcut`.

**Type-only exports:** `CommandProps`. Use `import type`.

- `Command` own props: `glass`.
- `CommandDialog` own props: `animation`, `children`, `glass`, `isLocked`, `onOpenChange`, `open`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/command/index.tsx)

**Examples:** [command.stories.tsx](../../../../src/lib/components/command/command.stories.tsx)

## context-menu

Secondary actions on a target through context interaction. Wrap the target in Trigger and supply Content; keep important actions reachable without right-click.

**Availability:** package-root public API.

**Value exports:** `ContextMenu`.

- `ContextMenu` members: `ContextMenu.CheckboxItem`, `ContextMenu.Content`, `ContextMenu.Group`, `ContextMenu.Item`, `ContextMenu.Label`, `ContextMenu.Portal`, `ContextMenu.RadioGroup`, `ContextMenu.RadioItem`, `ContextMenu.Separator`, `ContextMenu.Shortcut`, `ContextMenu.Sub`, `ContextMenu.SubContent`, `ContextMenu.SubTrigger`, `ContextMenu.Trigger`.
- `ContextMenu` own props: `bordered`, `glass`, `shape`, `size`.

**Source:** [index.tsx](../../../../src/lib/components/context-menu/index.tsx)

**Examples:** [context-menu.stories.tsx](../../../../src/lib/components/context-menu/context-menu.stories.tsx)

## dropdown-menu

An anchored list of actions. Compose Trigger, Content and Item with groups, checkbox/radio items or submenus as needed. Use Select for a form value.

**Availability:** package-root public API.

**Value exports:** `DropdownMenu`, `DropdownMenuCheckboxItem`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuPortal`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuTrigger`.

- `DropdownMenu` own props: `bordered`, `glass`, `shape`.
- `DropdownMenuItem` own props: `inset`.
- `DropdownMenuLabel` own props: `inset`.
- `DropdownMenuSubTrigger` own props: `inset`.

**Source:** [index.tsx](../../../../src/lib/components/dropdown-menu/index.tsx)

**Examples:** [DropdownMenu.stories.tsx](../../../../src/lib/components/dropdown-menu/DropdownMenu.stories.tsx)

## fab

Prominent screen-level creation/action. Supply icon and optional extended label. Do not add a floating action when an existing primary action already serves the task.

**Availability:** package-root public API.

**Value exports:** `FAB`.

**Type-only exports:** `FABProps`. Use `import type`.

- `FAB` own props: `children`, `icon`, `isExtended`, `shape`, `size`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/fab/index.tsx)

**Examples:** [FAB.stories.tsx](../../../../src/lib/components/fab/FAB.stories.tsx)

## fab-menu

A small set of related floating actions. Compose Trigger, List and Item; keep open/onOpenChange coherent and label every action.

**Availability:** package-root public API.

**Value exports:** `FABMenu`, `useFABMenu`.

**Type-only exports:** `FABMenuItemProps`, `FABMenuProps`. Use `import type`.

- `FABMenu` members: `FABMenu.Item`, `FABMenu.List`, `FABMenu.Trigger`.
- `FABMenu` own props: `align`, `direction`, `onOpenChange`, `open`, `overlay`.

**Source:** [index.tsx](../../../../src/lib/components/fab-menu/index.tsx)

**Examples:** [fab-menu.stories.tsx](../../../../src/lib/components/fab-menu/fab-menu.stories.tsx)

## icon-button

Compact icon actions. Supply an accessible name and an icon child; use Button when the action needs a visible label.

**Availability:** package-root public API.

**Value exports:** `IconButton`, `iconButtonVariants`.

**Type-only exports:** `IconButtonProps`. Use `import type`.

- `IconButton` own props: `containerShape`, `isLoading`, `shape`, `size`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/icon-button/index.tsx)

**Examples:** [Icon-button.stories.tsx](../../../../src/lib/components/icon-button/Icon-button.stories.tsx)

## menubar

Persistent application command menus. Compose Menu, Trigger and Content; reserve it for applications with menu-like command structures.

**Availability:** package-root public API.

**Value exports:** `Menubar`.

- `Menubar` members: `Menubar.CheckboxItem`, `Menubar.Content`, `Menubar.Item`, `Menubar.Label`, `Menubar.Menu`, `Menubar.Portal`, `Menubar.RadioGroup`, `Menubar.RadioItem`, `Menubar.Separator`, `Menubar.Shortcut`, `Menubar.Sub`, `Menubar.SubContent`, `Menubar.SubTrigger`, `Menubar.Trigger`.
- `Menubar` own props: `bordered`, `shape`.

**Source:** [index.tsx](../../../../src/lib/components/menubar/index.tsx)

**Examples:** [Menubar.stories.tsx](../../../../src/lib/components/menubar/Menubar.stories.tsx)

## split-button

Primary action with related alternatives. Compose the primary Button and menu trigger inside SplitButton; read its story for sizing and shared shape.

**Availability:** package-root public API.

**Value exports:** `SplitButton`.

- `SplitButton` own props: `children`, `shape`.

**Source:** [index.tsx](../../../../src/lib/components/split-button/index.tsx)

**Examples:** [Split-button.stories.tsx](../../../../src/lib/components/split-button/Split-button.stories.tsx)

## toolbar

Tools acting on the current selection or canvas. Compose Button, ToggleGroup/ToggleItem and Separator; use Toolbar.ItemTooltip for tool explanations.

**Availability:** package-root public API.

**Value exports:** `Toolbar`.

**Type-only exports:** `ToolbarButtonProps`, `ToolbarProps`, `ToolbarToggleItemProps`. Use `import type`.

- `Toolbar` members: `Toolbar.Button`, `Toolbar.ItemTooltip`, `Toolbar.Separator`, `Toolbar.ToggleGroup`, `Toolbar.ToggleItem`.
- `Toolbar` own props: `gap`, `orientation`, `padding`, `shadow`, `shape`, `size`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/toolbar/index.tsx)

**Examples:** [Toolbar.stories.tsx](../../../../src/lib/components/toolbar/Toolbar.stories.tsx)

