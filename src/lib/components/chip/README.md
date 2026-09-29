# Chip and ChipGroup

General-purpose primitives for actions, toggles and composition. `Chip` supplies appearance, selection animation and button behavior. `ChipGroup` supplies shared appearance, joined/gapped shapes and optional selection management. Menus, option lists and application-specific reset behavior belong to the components you compose around them.

## Chip

- Use `onClick` for an ordinary action.
- Use `selected` / `onSelectedChange` for a controlled toggle, or `defaultSelected` for internal state.
- Use `behavior="action"` with `selected` to display an active appearance without toggling or adding `aria-pressed`; useful for composed triggers.
- Appearance: five `variant` choices, five `color` choices, three `size` and `shape` choices, optional `startIcon` / `endIcon` and `showCheck`.
- Forwards its button ref and native button/event/ARIA props. Its default `type="button"` avoids accidental form submission.

## ChipGroup

- `gap="none"` joins chips. `xs`, `sm`, `md`, `lg` add 1, 2, 4, 8px gaps with small inner corners.
- `shape="full" | "minimal" | "sharp"` controls shared end caps. `separated` keeps each chip fully shaped. `activeShape` optionally changes selected corners.
- Layout-only by default. Individual chips retain their own state and actions.
- Optional `type="single"` or `type="multiple"` manages chips with a string `value`. Both support `value` / `onValueChange` or `defaultValue`. Single selection can toggle off unless `allowDeselect={false}`.
- Supports vertical layout, RTL and disabling the whole group. Arrow keys/Home/End move focus without selecting; buttons remain reachable with Tab.

## Compose with DropdownMenu

```tsx
const [mode, setMode] = useState('Balanced')

<DropdownMenu>
  <ChipGroup gap="md" shape="full" variant="filled" aria-label="Mode actions">
    <DropdownMenuTrigger asChild>
      <Chip behavior="action" selected={mode !== 'Balanced'} endIcon={<ChevronDown />}>
        {mode}
      </Chip>
    </DropdownMenuTrigger>
    <Chip behavior="action" aria-label="Reset mode" onClick={() => setMode('Balanced')}>
      <RotateCcw aria-hidden="true" />
    </Chip>
  </ChipGroup>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => setMode('Fast')}>Fast</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => setMode('Precise')}>Precise</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Wrap only the main chip in `DropdownMenuTrigger asChild` so sibling actions do not open the menu. The same pattern works with `Popover.Trigger` and other components that accept a button via `asChild`. Use the library's `Flex` or `Grid` to arrange independent groups.

Chip stories use existing `Flex`, `Typography` and `DropdownMenu` components. There are no filter-specific chip components or built-in option/clear APIs.
