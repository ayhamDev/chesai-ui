# Dropdown menu overlay

Use `overlay` on the root to dim the page behind an open dropdown:

```tsx
<DropdownMenu overlay overlayBlur="md">
  <DropdownMenuTrigger asChild>
    <Button>Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={createItem}>Create item</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

The backdrop does not change menu placement, sizing, item behavior or submenu positioning. It is off by default. The default appearance is black at 35% opacity with a 2px background blur; `overlayClassName` can replace those styles:

The original trigger stays visible, unblurred, and clickable while the overlay is open. A backdrop cutout follows its bounds and CSS corner radii through scrolling, resizing, and layout animations, including inside scaled or isolated containers. Rounded triggers do not expose rectangular patches of the page behind them. Clicking the trigger again closes the menu without moving or duplicating the trigger.

```tsx
<DropdownMenu overlay overlayClassName="bg-black/50 backdrop-blur-none">
  {/* trigger and content */}
</DropdownMenu>
```

Controlled `open` / `onOpenChange` and uncontrolled `defaultOpen` are supported. Clicking the backdrop follows the menu's existing outside-interaction dismissal handlers; calling `preventDefault()` in `onPointerDownOutside` or `onInteractOutside` still prevents dismissal. Escape and item selection retain their normal behavior. The backdrop blocks clicks from reaching covered page controls, and the existing `modal` setting continues to govern focus and scroll locking. Submenus share the root backdrop.

`overlayBlur` accepts `none`, `xs`, `sm`, `md`, `lg`, or `xl` (0, 2, 4, 8, 16, or 24px). It defaults to `xs` for DropdownMenu and has no effect while `overlay` is disabled. Explicit blur classes in `overlayClassName` take precedence.

Menu item outlines follow keyboard navigation, including arrow keys and typeahead. Pointer hover and touch retain the normal item highlight without the keyboard outline, even after switching from the keyboard.

See [shared overlay options](../../utils/overlay.md) for the same prop on other components.
