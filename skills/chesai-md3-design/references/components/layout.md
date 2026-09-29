# Layout and scrolling

[Selection guide](../component-registry.md) · [Machine-readable registry](registry.json)

Generated from the package-root exports and curated usage guidance. Import public names from `chesai-ui`. Own-prop lists are discovery hints, not complete signatures; inherited props, required fields, unions and callbacks must be checked in source/types. Compound members listed below may include helper data; consult the usage note before treating a value as JSX.

- [bouncy-box](#bouncy-box)
- [elastic-scroll-area](#elastic-scroll-area)
- [infinite-scroll](#infinite-scroll)
- [layouts](#layouts)
- [pull-to-refresh](#pull-to-refresh)
- [resizable](#resizable)
- [reverse-infinite-scroll](#reverse-infinite-scroll)
- [sortable-list](#sortable-list)
- [swipeable](#swipeable)
- [virtual-list](#virtual-list)

## bouncy-box

Expressive container motion. Use only where it communicates interaction or product character; it is not a replacement for a button or layout structure.

**Availability:** package-root public API.

**Value exports:** `BouncyBox`.

**Type-only exports:** `BouncyBoxProps`. Use `import type`.

- `BouncyBox` own props: `scaleAmount`.

**Source:** [index.tsx](../../../../src/lib/components/bouncy-box/index.tsx)

**Examples:** [bouncy-box.stories.tsx](../../../../src/lib/components/bouncy-box/bouncy-box.stories.tsx)

## elastic-scroll-area

A bounded scroll viewport with elastic behavior and optional refresh. Set a usable height/width; configure orientation and scrollbar visibility, and attach the real viewport where needed.

**Availability:** package-root public API.

**Value exports:** `ElasticScrollArea`.

**Type-only exports:** `ElasticScrollAreaProps`. Use `import type`.

- `ElasticScrollArea` members: `ElasticScrollArea.ScrollBar`.
- `ElasticScrollArea` own props: `RefreshIndicatorComponent`, `dampingFactor`, `dimmingEdges`, `elasticity`, `onRefresh`, `onRefreshError`, `onScrollDown`, `onScrollUp`, `orientation`, `pullThreshold`, `pullToRefresh`, `renderViewport`, `scrollbarVisibility`, `viewportClassName`.

**Source:** [README.md](../../../../src/lib/components/elastic-scroll-area/README.md), [index.tsx](../../../../src/lib/components/elastic-scroll-area/index.tsx), [use-elastic-scroll.ts](../../../../src/lib/components/elastic-scroll-area/use-elastic-scroll.ts)

**Examples:** [elastic-scroll-area.stories.tsx](../../../../src/lib/components/elastic-scroll-area/elastic-scroll-area.stories.tsx)

## infinite-scroll

Load more content near the end of a list. Supply onLoadMore, hasMore and isLoading; prevent duplicate requests and preserve an error/retry route.

**Availability:** package-root public API.

**Value exports:** `InfiniteScroll`.

**Type-only exports:** `InfiniteScrollProps`. Use `import type`.

- `InfiniteScroll` own props: `children`, `className`, `endMessage`, `hasMore`, `isLoading`, `loader`, `onLoadMore`, `root`, `rootMargin`.

**Source:** [index.tsx](../../../../src/lib/components/infinite-scroll/index.tsx)

**Examples:** [InfiniteScroll.stories.tsx](../../../../src/lib/components/infinite-scroll/InfiniteScroll.stories.tsx)

## layouts

Flex/Grid/Masonry arrangement, plus virtual variants for large datasets. Use Item spans or renderItem contracts as appropriate; semantic main/section/form elements and CSS remain appropriate around these primitives.

**Availability:** package-root public API.

**Value exports:** `Flex`, `FlexItem`, `Grid`, `GridItem`, `Masonry`, `VirtualFlex`, `VirtualGrid`, `VirtualMasonry`.

**Type-only exports:** `FlexItemProps`, `FlexProps`, `GridItemProps`, `GridProps`, `MasonryProps`, `VirtualFlexProps`, `VirtualGridProps`, `VirtualMasonryProps`. Use `import type`.

- `Flex` own props: `align`, `asChild`, `direction`, `disableAnimatePresence`, `gap`, `justify`, `wrap`.
- `FlexItem` own props: `basis`, `grow`, `shrink`.
- `Grid` own props: `children`, `columns`, `disableAnimatePresence`, `gap`.
- `GridItem` own props: `colSpan`, `rowSpan`.
- `Masonry` own props: `children`, `columns`, `gap`.
- `VirtualFlex` own props: `className`, `data`, `direction`, `estimateSize`, `gap`, `padding`, `renderItem`.
- `VirtualGrid` own props: `className`, `columns`, `data`, `gap`, `itemHeight`, `overscan`, `padding`, `renderItem`.
- `VirtualMasonry` own props: `animate`, `className`, `columns`, `data`, `estimateHeight`, `gap`, `overscan`, `padding`, `renderItem`.

**Source:** [flex.tsx](../../../../src/lib/components/layouts/flex.tsx), [grid.tsx](../../../../src/lib/components/layouts/grid.tsx), [index.ts](../../../../src/lib/components/layouts/index.ts), [masonry.tsx](../../../../src/lib/components/layouts/masonry.tsx), [virtual-flex.tsx](../../../../src/lib/components/layouts/virtual-flex.tsx), [virtual-grid.tsx](../../../../src/lib/components/layouts/virtual-grid.tsx), [virtual-masonry.tsx](../../../../src/lib/components/layouts/virtual-masonry.tsx)

**Examples:** [Flex.stories.tsx](../../../../src/lib/components/layouts/Flex.stories.tsx), [Grid.stories.tsx](../../../../src/lib/components/layouts/Grid.stories.tsx), [LayoutStress.stories.tsx](../../../../src/lib/components/layouts/LayoutStress.stories.tsx), [Masonry.stories.tsx](../../../../src/lib/components/layouts/Masonry.stories.tsx), [VirtualFlex.stories.tsx](../../../../src/lib/components/layouts/VirtualFlex.stories.tsx), [VirtualGrid.stories.tsx](../../../../src/lib/components/layouts/VirtualGrid.stories.tsx), [VirtualMasonry.stories.tsx](../../../../src/lib/components/layouts/VirtualMasonry.stories.tsx)

## pull-to-refresh

Refresh a touch scroll region. Provide asynchronous onRefresh and a bounded container; retain an accessible explicit refresh action when needed.

**Availability:** package-root public API.

**Value exports:** `PullToRefresh`.

**Type-only exports:** `PullToRefreshProps`. Use `import type`.

- `PullToRefresh` own props: `IndicatorComponent`, `children`, `className`, `onRefresh`, `pullThreshold`.

**Source:** [index.tsx](../../../../src/lib/components/pull-to-refresh/index.tsx)

**Examples:** [pull-to-refresh.stories.tsx](../../../../src/lib/components/pull-to-refresh/pull-to-refresh.stories.tsx)

## resizable

User-adjustable panes. Compose Pane and Handle under Resizable, with defaultSizes and optional storageKey; ensure bounded dimensions and sensible compact adaptation.

**Availability:** package-root public API.

**Value exports:** `Resizable`, `useResizableState`.

- `Resizable` members: `Resizable.Handle`, `Resizable.Pane`.
- `Resizable` own props: `defaultSizes`, `gap`, `storageKey`.

**Source:** [index.tsx](../../../../src/lib/components/resizable/index.tsx)

**Examples:** [Resizable.Features.stories.tsx](../../../../src/lib/components/resizable/Resizable.Features.stories.tsx), [Resizable.stories.tsx](../../../../src/lib/components/resizable/Resizable.stories.tsx)

## reverse-infinite-scroll

Load older content above a conversation while preserving position. Supply onLoadOlder, hasMore and isLoading; use Chat when you also need bottom tracking and scroll-to-bottom composition.

**Availability:** package-root public API.

**Value exports:** `ReverseInfiniteScroll`.

**Type-only exports:** `ReverseInfiniteScrollProps`, `ReverseInfiniteScrollRef`. Use `import type`.

- `ReverseInfiniteScroll` own props: `autoScrollThreshold`, `behavior`, `children`, `hasMore`, `isLoading`, `loadThreshold`, `loader`, `onAtBottomChange`, `onLoadOlder`, `viewportClassName`.

**Source:** [index.tsx](../../../../src/lib/components/reverse-infinite-scroll/index.tsx)

**Examples:** [ReverseInfiniteScroll.stories.tsx](../../../../src/lib/components/reverse-infinite-scroll/ReverseInfiniteScroll.stories.tsx)

## sortable-list

Reordering items with drag handles. Supply items/onReorder and compose Item/DragHandle; persist the result and provide accessible alternatives where the library interaction is insufficient.

**Availability:** package-root public API.

**Value exports:** `SortableList`, `SortableListRoot`, `useSortableItem`.

**Type-only exports:** `SortableDragHandleProps`, `SortableItemProps`, `SortableListProps`. Use `import type`.

- `SortableList` members: `SortableList.DragHandle`, `SortableList.Item`.
- `SortableList` own props: `asChild`, `children`, `items`, `onReorder`, `ref`, `renderOverlay`, `strategy`.
- `SortableListRoot` own props: `asChild`, `children`, `items`, `onReorder`, `ref`, `renderOverlay`, `strategy`.

**Source:** [index.tsx](../../../../src/lib/components/sortable-list/index.tsx)

**Examples:** [SortableList.stories.tsx](../../../../src/lib/components/sortable-list/SortableList.stories.tsx)

## swipeable

Reveal or invoke contextual row actions by swipe. Compose Content/Action and configure thresholds/callbacks; keep destructive actions deliberate and available without gestures.

**Availability:** package-root public API.

**Value exports:** `Swipeable`, `useSwipeable`.

**Type-only exports:** `SwipeableActionProps`, `SwipeableContentProps`, `SwipeableProps`, `SwipeAction`, `SwipeType`. Use `import type`.

- `Swipeable` members: `Swipeable.Action`, `Swipeable.Content`.
- `Swipeable` own props: `children`, `disabled`, `leftAction`, `leftOffset`, `onSwipeLeft`, `onSwipeRight`, `rightAction`, `rightOffset`, `threshold`, `type`.

**Source:** [index.tsx](../../../../src/lib/components/swipeable/index.tsx)

**Examples:** [Swipeable.stories.tsx](../../../../src/lib/components/swipeable/Swipeable.stories.tsx)

## virtual-list

Render only visible rows/items for a large collection. Supply data and renderItem with stable getItemKey; estimate/measure sizes and bound the viewport. Do not virtualize a short list without reason.

**Availability:** package-root public API.

**Value exports:** `VirtualList`.

**Type-only exports:** `VirtualListProps`. Use `import type`.

- `VirtualList` own props: `as`, `containerProps`, `contentAs`, `contentProps`, `data`, `direction`, `estimateSize`, `gap`, `getItemKey`, `itemsWrapper`, `measureItems`, `overscan`, `ref`, `renderItem`, `virtualOptions`, `virtualizerRef`.

**Source:** [index.tsx](../../../../src/lib/components/virtual-list/index.tsx)

**Examples:** [VirtualList.stories.tsx](../../../../src/lib/components/virtual-list/VirtualList.stories.tsx)

