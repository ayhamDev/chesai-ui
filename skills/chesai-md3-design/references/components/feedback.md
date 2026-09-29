# Feedback and overlays

[Selection guide](../component-registry.md) · [Machine-readable registry](registry.json)

Generated from the package-root exports and curated usage guidance. Import public names from `chesai-ui`. Own-prop lists are discovery hints, not complete signatures; inherited props, required fields, unions and callbacks must be checked in source/types. Compound members listed below may include helper data; consult the usage note before treating a value as JSX.

- [alert](#alert)
- [dialog](#dialog)
- [empty-state](#empty-state)
- [floating-panel](#floating-panel)
- [loadingIndicator](#loadingindicator)
- [popover](#popover)
- [progress](#progress)
- [sheet](#sheet)
- [skeleton](#skeleton)
- [toast](#toast)
- [tooltip](#tooltip)

## alert

Persistent inline information, warning or error. Compose Icon, Content, Title, Description and Action. Use FieldError for field-local validation and toast for transient confirmation.

**Availability:** package-root public API.

**Value exports:** `Alert`, `AlertAction`, `AlertContent`, `AlertDescription`, `AlertIcon`, `AlertTitle`.

**Type-only exports:** `AlertProps`. Use `import type`.

- `Alert` own props: `shape`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/alert/index.tsx)

**Examples:** [Alert.stories.tsx](../../../../src/lib/components/alert/Alert.stories.tsx)

## dialog

Focused modal decisions or editing. Dialog requires open/onOpenChange and children; compose Title, Description, Body/Footer and Close. Preserve accessible naming and return focus.

**Availability:** package-root public API.

**Value exports:** `Dialog`, `DialogBody`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogTitle`, `DialogTrigger`.

**Type-only exports:** `DialogBodyProps`, `DialogContentProps`, `DialogProps`. Use `import type`.

- `Dialog` own props: `animation`, `children`, `glass`, `isLocked`, `onOpenChange`, `open`, `variant`.
- `DialogBody` own props: `RefreshIndicatorComponent`, `dampingFactor`, `dimmingEdges`, `elasticity`, `onRefresh`, `onRefreshError`, `onScrollDown`, `onScrollUp`, `orientation`, `pullThreshold`, `pullToRefresh`, `renderViewport`, `scrollbarVisibility`, `viewportClassName`.
- `DialogClose` own props: `asChild`.
- `DialogContent` own props: `glass`, `layout`, `padding`, `shape`, `variant`.
- `DialogTrigger` own props: `asChild`.

**Source:** [index.tsx](../../../../src/lib/components/dialog/index.tsx)

**Examples:** [Dialog.API.stories.tsx](../../../../src/lib/components/dialog/Dialog.API.stories.tsx), [Dialog.Registry.stories.tsx](../../../../src/lib/components/dialog/Dialog.Registry.stories.tsx), [Dialog.stories.tsx](../../../../src/lib/components/dialog/Dialog.stories.tsx)

## empty-state

No data or no results. Supply title and meaningful description/action, optional icon/visual; distinguish initial creation from a filtered empty result.

**Availability:** package-root public API.

**Value exports:** `EmptyState`.

**Type-only exports:** `EmptyStateProps`. Use `import type`.

- `EmptyState` own props: `action`, `classNames`, `description`, `icon`, `title`, `variant`, `visual`.

**Source:** [index.tsx](../../../../src/lib/components/empty-state/index.tsx)

**Examples:** [EmptyState.stories.tsx](../../../../src/lib/components/empty-state/EmptyState.stories.tsx)

## floating-panel

A trigger that transforms into a contextual panel. Compose Trigger/Content/CloseButton; dimensions and positioning are explicit. Use standard Popover when transformation adds no task value.

**Availability:** package-root public API.

**Value exports:** `FloatingPanel`, `useFloatingPanel`.

**Type-only exports:** `FloatingPanelPosition`, `FloatingPanelProps`, `FloatingPanelVariant`. Use `import type`.

- `FloatingPanel` members: `FloatingPanel.CloseButton`, `FloatingPanel.Content`, `FloatingPanel.Trigger`.
- `FloatingPanel` own props: `children`, `offset`, `onOpenChange`, `open`, `panelHeight`, `panelRadius`, `panelVariant`, `panelWidth`, `position`, `triggerHeight`, `triggerRadius`, `triggerVariant`, `triggerWidth`.

**Source:** [index.tsx](../../../../src/lib/components/floating-panel/index.tsx)

**Examples:** [FloatingPanel.stories.tsx](../../../../src/lib/components/floating-panel/FloatingPanel.stories.tsx)

## loadingIndicator

Indeterminate activity indicator with shape animation. Pair with a textual status where the task is otherwise unclear.

**Availability:** package-root public API.

**Value exports:** `LoadingIndicator`.

**Type-only exports:** `LoadingIndicatorProps`. Use `import type`.

- `LoadingIndicator` own props: `isPlaying`, `startingShape`, `variant`.

**Source:** [MaterialMorph.tsx](../../../../src/lib/components/loadingIndicator/MaterialMorph.tsx), [index.tsx](../../../../src/lib/components/loadingIndicator/index.tsx)

**Examples:** [LoadingIndicator.stories.tsx](../../../../src/lib/components/loadingIndicator/LoadingIndicator.stories.tsx)

## popover

Anchored contextual content. Compose Trigger and Content (optional Anchor/Close/Arrow); prefer a menu for a pure action list and Dialog for blocking decisions.

**Availability:** package-root public API.

**Value exports:** `Popover`, `PopoverAnchor`, `PopoverArrow`, `PopoverClose`, `PopoverContent`, `PopoverPortal`, `PopoverTrigger`.

**Type-only exports:** `PopoverAnchorProps`, `PopoverArrowProps`, `PopoverCloseProps`, `PopoverContentProps`, `PopoverPortalProps`, `PopoverProps`, `PopoverTriggerProps`. Use `import type`.

- `Popover` members: `Popover.Anchor`, `Popover.Arrow`, `Popover.Close`, `Popover.Content`, `Popover.Portal`, `Popover.Trigger`.
- `Popover` own props: `bordered`, `glass`, `shape`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/popover/index.tsx)

**Examples:** [Popover.stories.tsx](../../../../src/lib/components/popover/Popover.stories.tsx)

## progress

Task progress. LinearProgress/CircularProgress accept value/max or indeterminate; show actual progress when known and label the operation.

**Availability:** package-root public API.

**Value exports:** `CircularProgress`, `LinearProgress`.

**Type-only exports:** `CircularProgressProps`, `LinearProgressProps`. Use `import type`.

- `CircularProgress` own props: `amplitude`, `frequency`, `gap`, `indeterminate`, `max`, `size`, `thickness`, `value`, `variant`.
- `LinearProgress` own props: `amplitude`, `frequency`, `gap`, `indeterminate`, `max`, `value`, `variant`.

**Source:** [circular-progress.tsx](../../../../src/lib/components/progress/circular-progress.tsx), [index.ts](../../../../src/lib/components/progress/index.ts), [linear-progress.tsx](../../../../src/lib/components/progress/linear-progress.tsx)

**Examples:** [circular-progress.stories.tsx](../../../../src/lib/components/progress/circular-progress.stories.tsx), [linear-Progress.stories.tsx](../../../../src/lib/components/progress/linear-Progress.stories.tsx)

## sheet

Supplementary workflows adapted to bottom or side placement. Compose Trigger/Content/Title/Description with mode/side/snap behavior; do not hide the only way to perform a task behind an unexplained gesture.

**Availability:** package-root public API.

**Value exports:** `Sheet`, `SheetClose`, `SheetContent`, `SheetDescription`, `SheetFooter`, `SheetGrabber`, `SheetHeader`, `SheetTitle`, `SheetTrigger`.

**Type-only exports:** `SheetCloseProps`, `SheetContentProps`, `SheetDescriptionProps`, `SheetProps`, `SheetTitleProps`, `SheetTriggerProps`. Use `import type`.

- `Sheet` members: `Sheet.Close`, `Sheet.Content`, `Sheet.Description`, `Sheet.Footer`, `Sheet.Grabber`, `Sheet.Header`, `Sheet.Title`, `Sheet.Trigger`.
- `Sheet` own props: `fadeFromIndex`, `forceBottomSheet`, `forceSideSheet`, `glass`, `isLocked`, `mode`, `shape`, `side`, `snapPoints`, `variant`, `width`.
- `SheetContent` own props: `glass`, `height`, `mode`, `shape`, `side`, `variant`, `width`.

**Source:** [index.tsx](../../../../src/lib/components/sheet/index.tsx)

**Examples:** [sheet.stories.tsx](../../../../src/lib/components/sheet/sheet.stories.tsx)

## skeleton

Temporary placeholders that preserve content geometry while loading. Match the expected layout; do not retain indefinitely after an error.

**Availability:** package-root public API.

**Value exports:** `Skeleton`.


**Source:** [index.tsx](../../../../src/lib/components/skeleton/index.tsx)

**Examples:** No Storybook file in this folder; inspect the source contract.

## toast

Transient confirmation and undo feedback. Chesai exports Toaster; send notifications through toast from sonner. ChesaiProvider already mounts Toaster, so avoid duplicating it.

**Availability:** package-root public API.

**Value exports:** `toast`, `Toaster`.

- `Toaster` own props: `shadow`, `shape`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/toast/index.tsx)

**Examples:** [Toaster.stories.tsx](../../../../src/lib/components/toast/Toaster.stories.tsx)

## tooltip

Short supplementary explanation for a trigger. Use TooltipProvider and TooltipTrigger/Tooltip according to stories; give icon actions their own accessible names and keep essential instructions visible.

**Availability:** package-root public API.

**Value exports:** `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `useTooltip`.

**Type-only exports:** `TooltipProps`. Use `import type`.

- `Tooltip` own props: `shape`, `size`, `variant`.
- `TooltipProvider` own props: `children`, `placement`.
- `TooltipTrigger` own props: `asChild`.

**Source:** [index.tsx](../../../../src/lib/components/tooltip/index.tsx)

**Examples:** [Tooltip.stories.tsx](../../../../src/lib/components/tooltip/Tooltip.stories.tsx)

