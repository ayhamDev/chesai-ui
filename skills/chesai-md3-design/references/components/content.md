# Content and data

[Selection guide](../component-registry.md) · [Machine-readable registry](registry.json)

Generated from the package-root exports and curated usage guidance. Import public names from `chesai-ui`. Own-prop lists are discovery hints, not complete signatures; inherited props, required fields, unions and callbacks must be checked in source/types. Compound members listed below may include helper data; consult the usage note before treating a value as JSX.

- [accordion](#accordion)
- [avatar](#avatar)
- [badge](#badge)
- [card](#card)
- [charts](#charts)
- [data-display](#data-display)
- [data-table](#data-table)
- [divider](#divider)
- [item](#item)
- [kanban](#kanban)
- [kbd](#kbd)
- [separator](#separator)
- [stepper](#stepper)
- [table](#table)
- [timeline](#timeline)
- [typography](#typography)

## accordion

Optional details disclosed in place. Compose Item/Trigger/Content with the required single/multiple mode. Keep essential instructions visible.

**Availability:** package-root public API.

**Value exports:** `Accordion`.

**Type-only exports:** `AccordionVariant`. Use `import type`.

- `Accordion` members: `Accordion.Content`, `Accordion.Item`, `Accordion.Trigger`.
- `Accordion` own props: `gap`, `layout`, `shape`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/accordion/index.tsx)

**Examples:** [Accordion.stories.tsx](../../../../src/lib/components/accordion/Accordion.stories.tsx)

## avatar

Person or entity identity. Use src/fallback with size/shape, and AvatarGroup for capped sets. Keep names available outside the image.

**Availability:** package-root public API.

**Value exports:** `Avatar`, `AvatarGroup`.

**Type-only exports:** `AvatarGroupProps`, `AvatarProps`. Use `import type`.

- `Avatar` own props: `fallback`, `morphDuration`, `morphEase`, `shape`, `shapeStyle`, `size`, `src`, `variant`.
- `AvatarGroup` own props: `children`, `max`.

**Source:** [AvatarGroup.tsx](../../../../src/lib/components/avatar/AvatarGroup.tsx), [index.tsx](../../../../src/lib/components/avatar/index.tsx)

**Examples:** [Avatar.stories.tsx](../../../../src/lib/components/avatar/Avatar.stories.tsx)

## badge

Small status or count labels. Use explicit status text and semantic meaning; do not make every label visually prominent.

**Availability:** package-root public API.

**Value exports:** `Badge`.

**Type-only exports:** `BadgeProps`. Use `import type`.

- `Badge` own props: `shape`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/badge/index.tsx)

**Examples:** [Badge.stories.tsx](../../../../src/lib/components/badge/Badge.stories.tsx)

## card

A bounded related content unit. Compose children and choose variant/padding; CardGroup groups related cards. Avoid wrapping every section in a card.

**Availability:** package-root public API.

**Value exports:** `Card`, `CardGroup`, `cardVariants`.

**Type-only exports:** `CardGroupDirection`, `CardGroupGap`, `CardGroupProps`, `CardGroupShape`, `CardProps`. Use `import type`.

- `Card` own props: `animatedGradientBorder`, `bordered`, `elevation`, `enableRipple`, `glass`, `gradientColors`, `gradientWidth`, `hoverEffect`, `padding`, `shape`, `variant`.
- `CardGroup` own props: `direction`, `gap`, `shape`.

**Source:** [index.tsx](../../../../src/lib/components/card/index.tsx)

**Examples:** [Card.stories.tsx](../../../../src/lib/components/card/Card.stories.tsx)

## charts

Quantitative comparison and trends. Area/Bar/Line use data, categories and index; Pie uses category/index; Heatmap uses data and x/y labels. Supply units and meaningful formatting; never fabricate decorative metrics.

**Availability:** package-root public API.

**Value exports:** `AreaChart`, `BarChart`, `HeatmapChart`, `LineChart`, `PieChart`.

**Type-only exports:** `BarChartProps`, `ChartProps`, `HeatmapChartProps`, `HeatmapDataPoint`, `PieChartProps`. Use `import type`.

- `AreaChart` own props: `categories`, `className`, `colors`, `data`, `height`, `index`, `minWidth`, `scrollable`, `shape`, `valueFormatter`, `variant`.
- `BarChart` own props: `categories`, `className`, `colors`, `data`, `height`, `highlightColor`, `highlightIcon`, `highlightKey`, `highlightShape`, `index`, `minWidth`, `scrollable`, `shape`, `showBaseline`, `valueFormatter`, `variant`.
- `HeatmapChart` own props: `className`, `colorScale`, `data`, `height`, `shape`, `showLabels`, `valueFormatter`, `variant`, `xLabels`, `yLabels`.
- `LineChart` own props: `categories`, `className`, `colors`, `data`, `height`, `index`, `minWidth`, `scrollable`, `shape`, `valueFormatter`, `variant`.
- `PieChart` own props: `category`, `className`, `colors`, `cornerRadius`, `data`, `donut`, `height`, `index`, `paddingAngle`, `shape`, `variant`.

**Source:** [area-chart.tsx](../../../../src/lib/components/charts/area-chart.tsx), [bar-chart.tsx](../../../../src/lib/components/charts/bar-chart.tsx), [chart-tooltip.tsx](../../../../src/lib/components/charts/chart-tooltip.tsx), [chart-utils.ts](../../../../src/lib/components/charts/chart-utils.ts), [heatmap-chart.tsx](../../../../src/lib/components/charts/heatmap-chart.tsx), [index.ts](../../../../src/lib/components/charts/index.ts), [line-chart.tsx](../../../../src/lib/components/charts/line-chart.tsx), [pie-chart.tsx](../../../../src/lib/components/charts/pie-chart.tsx)

**Examples:** [Charts.stories.tsx](../../../../src/lib/components/charts/Charts.stories.tsx)

## data-display

Switchable table and card/list presentation of one dataset. Supply data, columns and renderItem, then select layout; preserve filter/sort/selection meaning between views.

**Availability:** package-root public API.

**Value exports:** `DataDisplay`.

**Type-only exports:** `DataDisplayLayout`, `DataDisplayProps`. Use `import type`.

- `DataDisplay` own props: `bulkActions`, `columnFilters`, `columns`, `data`, `emptyAction`, `emptyDescription`, `emptyIcon`, `emptyTitle`, `enableSortControl`, `globalFilter`, `gridProps`, `hideToolbar`, `isLoading`, `itemContainerClassName`, `layout`, `masonryProps`, `onColumnFiltersChange`, `onGlobalFilterChange`, `onPaginationChange`, `onSortingChange`, `pageCount`, `pagination`, `renderEmptyState`, `renderItem`, `searchInputProps`, `sorting`, `toolbarChildren`.

**Source:** [index.tsx](../../../../src/lib/components/data-display/index.tsx)

**Examples:** [DataDisplay.stories.tsx](../../../../src/lib/components/data-display/DataDisplay.stories.tsx)

## data-table

Data browsing with sorting, filtering, selection, pagination or infinite loading. Supply data and columns; use controlled state callbacks for server data. Helpers cover headers, faceted filters, export and URL state; inspect types for modes and manual operation.

**Availability:** package-root public API.

**Value exports:** `advancedFilterFn`, `advancedGlobalFilterFn`, `createDataTableUrlCodec`, `DataTable`, `DataTableColumnHeader`, `DataTableContext`, `DataTableExportButton`, `DataTableExportError`, `DataTableFacetedFilter`, `DataTablePagination`, `DataTableToolbar`, `downloadDataTableExport`, `exportDataTable`, `numericFilterFn`, `sanitizeDataTableSheetName`.

**Type-only exports:** `AdvancedFilterValue`, `DataTableColumnExportConfig`, `DataTableColumnFilterConfig`, `DataTableCursorPagination`, `DataTableExportButtonProps`, `DataTableExportConfig`, `DataTableExportErrorCode`, `DataTableExportFetcher`, `DataTableExportFetchRequest`, `DataTableExportFetchResult`, `DataTableExportFileNameContext`, `DataTableExportFormat`, `DataTableExportProgress`, `DataTableExportResult`, `DataTableExportScope`, `DataTableExportValue`, `DataTableExportValueContext`, `DataTableFilterEditorProps`, `DataTableFilterInput`, `DataTableFilterOption`, `DataTableFilterVariant`, `DataTableInfiniteScroll`, `DataTableMode`, `DataTableProps`, `DataTableSearchInputProps`, `DataTableState`, `DataTableUrlState`, `DataTableVisibility`, `ExportDataTableOptions`, `FilterOperator`. Use `import type`.

- `DataTable` own props: `bulkActions`, `columnFilters`, `columnVisibility`, `columns`, `cursorPagination`, `data`, `defaultMode`, `density`, `expanded`, `exportOptions`, `getRowId`, `globalFilter`, `hideToolbar`, `infiniteScroll`, `initialState`, `isLoading`, `mode`, `onColumnFiltersChange`, `onColumnVisibilityChange`, `onEndReached`, `onExpandedChange`, `onGlobalFilterChange`, `onModeChange`, `onPaginationChange`, `onRowSelectionChange`, `onSortingChange`, `onStateChange`, `pageCount`, `pagination`, `renderContextMenu`, `renderExpandedRow`, `rowCount`, `rowSelection`, `searchDebounceMs`, `searchInputProps`, `serverSide`, `showModeSwitch`, `skeletonCount`, `sorting`, `state`, `stickyFooter`, `stickyFooterOffset`, `stickyHeader`, `stickyHeaderOffset`, `stickyScrollbar`, `stickyScrollbarOffset`, `toolbarChildren`, `variant`, `virtualization`, `visibility`.
- `DataTableColumnHeader` own props: `column`, `title`.
- `DataTableExportButton` own props: `className`, `label`.
- `DataTableFacetedFilter` own props: `column`, `options`, `title`.
- `DataTableToolbar` own props: `bulkActions`, `children`.

**Source:** [README.md](../../../../src/lib/components/data-table/README.md), [advanced-filter.tsx](../../../../src/lib/components/data-table/advanced-filter.tsx), [column-filter-dialog.tsx](../../../../src/lib/components/data-table/column-filter-dialog.tsx), [column-header.tsx](../../../../src/lib/components/data-table/column-header.tsx), [context.ts](../../../../src/lib/components/data-table/context.ts), [export-button.tsx](../../../../src/lib/components/data-table/export-button.tsx), [export.ts](../../../../src/lib/components/data-table/export.ts), [faceted-filter.tsx](../../../../src/lib/components/data-table/faceted-filter.tsx), [filter-editor.tsx](../../../../src/lib/components/data-table/filter-editor.tsx), [filter-utils.ts](../../../../src/lib/components/data-table/filter-utils.ts), [index.tsx](../../../../src/lib/components/data-table/index.tsx), [numeric-filter.tsx](../../../../src/lib/components/data-table/numeric-filter.tsx), [pagination.tsx](../../../../src/lib/components/data-table/pagination.tsx), [sticky-footer.tsx](../../../../src/lib/components/data-table/sticky-footer.tsx), [toolbar.tsx](../../../../src/lib/components/data-table/toolbar.tsx), [types.ts](../../../../src/lib/components/data-table/types.ts), [url-codec.ts](../../../../src/lib/components/data-table/url-codec.ts), [use-infinite-loading.ts](../../../../src/lib/components/data-table/use-infinite-loading.ts), [view-options.tsx](../../../../src/lib/components/data-table/view-options.tsx)

**Examples:** [data-table.stories.tsx](../../../../src/lib/components/data-table/data-table.stories.tsx), [scrolling.stories.tsx](../../../../src/lib/components/data-table/scrolling.stories.tsx)

## divider

Visual separation with optional label or expressive line. Configure orientation and variant only when grouping needs a boundary.

**Availability:** package-root public API.

**Value exports:** `Divider`.

**Type-only exports:** `DividerProps`. Use `import type`.

- `Divider` own props: `color`, `orientation`, `shape`, `size`, `textAlign`, `variant`, `waveSize`.

**Source:** [index.tsx](../../../../src/lib/components/divider/index.tsx)

**Examples:** [Divider.stories.tsx](../../../../src/lib/components/divider/Divider.stories.tsx)

## item

Structured list/settings/resource rows. Compose Media, Content, Title, Description and Actions; ItemGroup handles grouping. Expansion and swipe actions belong to the row API, not improvised div behavior.

**Availability:** package-root public API.

**Value exports:** `Item`, `ItemActions`, `ItemContent`, `ItemDescription`, `ItemExpandedContent`, `ItemFooter`, `ItemGroup`, `ItemHeader`, `ItemMedia`, `ItemSeparator`, `ItemTitle`, `useItem`.

**Type-only exports:** `ItemDescriptionProps`, `ItemGroupDirection`, `ItemGroupGap`, `ItemGroupProps`, `ItemGroupShape`, `ItemProps`, `SwipeActionConfig`. Use `import type`.

- `Item` own props: `asChild`, `bordered`, `defaultExpanded`, `direction`, `disableRipple`, `disabled`, `elevation`, `expandable`, `expanded`, `onExpandedChange`, `onLongPress`, `onSwipeLeft`, `onSwipeRight`, `padding`, `shape`, `size`, `swipeLeftAction`, `swipeLeftOffset`, `swipeRightAction`, `swipeRightOffset`, `swipeThreshold`, `swipeType`, `variant`.
- `ItemDescription` own props: `collapsedLines`.
- `ItemGroup` own props: `direction`, `gap`, `shape`.
- `ItemMedia` own props: `shape`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/item/index.tsx)

**Examples:** [Item.stories.tsx](../../../../src/lib/components/item/Item.stories.tsx), [ItemGroup.stories.tsx](../../../../src/lib/components/item/ItemGroup.stories.tsx), [ItemSwipe.stories.tsx](../../../../src/lib/components/item/ItemSwipe.stories.tsx)

## kanban

Work items grouped into movable workflow columns. Supply columns, onChange and renderCard; persist moves and provide an alternative to dragging when needed.

**Availability:** package-root public API.

**Value exports:** `Kanban`, `KanbanBoard`.

**Type-only exports:** `KanbanBoardProps`, `KanbanColumnData`, `KanbanItemData`. Use `import type`.

- `Kanban` members: `Kanban.Board`.
- `Kanban` own props: `boardTrailingContent`, `bordered`, `className`, `columnWidth`, `columns`, `elevation`, `glass`, `onCardClick`, `onChange`, `onDragEnd`, `onDragOver`, `onDragStart`, `renderCard`, `renderColumnFooter`, `renderColumnHeader`, `shape`, `variant`.
- `KanbanBoard` own props: `boardTrailingContent`, `bordered`, `className`, `columnWidth`, `columns`, `elevation`, `glass`, `onCardClick`, `onChange`, `onDragEnd`, `onDragOver`, `onDragStart`, `renderCard`, `renderColumnFooter`, `renderColumnHeader`, `shape`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/kanban/index.tsx)

**Examples:** [Kanban.stories.tsx](../../../../src/lib/components/kanban/Kanban.stories.tsx)

## kbd

Presentation of keyboard shortcuts. Render the actual supported keys; it does not register keyboard handlers.

**Availability:** package-root public API.

**Value exports:** `Kbd`.

**Type-only exports:** `KbdProps`. Use `import type`.

- `Kbd` own props: `shape`, `size`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/kbd/index.tsx)

**Examples:** [Kbd.stories.tsx](../../../../src/lib/components/kbd/Kbd.stories.tsx)

## separator

Simple semantic separator primitive. Use for plain boundaries; use Divider when its extra visual or labelled treatment is needed.

**Availability:** package-root public API.

**Value exports:** `Separator`.


**Source:** [index.tsx](../../../../src/lib/components/separator/index.tsx)

**Examples:** No Storybook file in this folder; inspect the source contract.

## stepper

Progress through a staged task. Provide zero-based currentStep and direct Step children; compose Indicator/Separator/Content/Title/Description. Supports horizontal/vertical orientation and inherited/explicit RTL. Root/Step/Indicator/Separator color accepts all stepperColors theme roles; Indicator supports foreground, shape, size and completedIcon. Step status can override progress for exceptions. Separator shares Timeline solid/dashed/dotted, wavy, animated duration/direction controls and reduced motion. Application code owns navigation and validation.

**Availability:** package-root public API.

**Value exports:** `Stepper`.

**Type-only exports:** `StepperColor`, `StepperIndicatorProps`, `StepperProps`, `StepperSeparatorProps`, `StepperStatus`, `StepperStepProps`. Use `import type`.

- `Stepper` members: `Stepper.Content`, `Stepper.Description`, `Stepper.Indicator`, `Stepper.Separator`, `Stepper.Step`, `Stepper.Title`.
- `Stepper` own props: `color`, `currentStep`, `orientation`, `variant`.

**Source:** [README.md](../../../../src/lib/components/stepper/README.md), [index.tsx](../../../../src/lib/components/stepper/index.tsx)

**Examples:** [Stepper.stories.tsx](../../../../src/lib/components/stepper/Stepper.stories.tsx), [StepperAdvanced.stories.tsx](../../../../src/lib/components/stepper/StepperAdvanced.stories.tsx)

## table

Lower-level TanStack table rendering. Table requires a TanStack table instance; it is not a generic HTML-table wrapper. Compose Row/Head/Cell only according to its API. Prefer DataTable for standard data browsing.

**Availability:** package-root public API.

**Value exports:** `Table`, `TableCell`, `tableContainerVariants`, `TableHead`, `TableRoot`, `TableRow`, `tableVariants`, `tdVariants`, `thVariants`, `trVariants`, `useTableContext`.

**Type-only exports:** `TableContextProps`, `TableRootProps`, `TableVirtualizationOptions`. Use `import type`.

- `Table` members: `Table.Cell`, `Table.Head`, `Table.Row`.
- `Table` own props: `density`, `isLoading`, `onEndReached`, `renderContextMenu`, `renderExpandedRow`, `scrollContainerRef`, `skeletonCount`, `stickyHeader`, `stickyHeaderOffset`, `table`, `variant`, `virtualization`.
- `TableRoot` own props: `density`, `isLoading`, `onEndReached`, `renderContextMenu`, `renderExpandedRow`, `scrollContainerRef`, `skeletonCount`, `stickyHeader`, `stickyHeaderOffset`, `table`, `variant`, `virtualization`.
- `TableRow` own props: `row`.

**Source:** [index.tsx](../../../../src/lib/components/table/index.tsx), [use-sticky-header.ts](../../../../src/lib/components/table/use-sticky-header.ts), [virtual-body.tsx](../../../../src/lib/components/table/virtual-body.tsx)

**Examples:** [Table.stories.tsx](../../../../src/lib/components/table/Table.stories.tsx)

## timeline

Ordered events, logistics and delivery/order history. Compose Item, Separator, Connector, Dot and Content. Root orientation supports vertical/horizontal; dir inherits or can be explicit, including RTL flow. Root/Item color sets defaults; Dot color/foreground and Connector color support every exported timelineColors Material system role. Optional Item status completed/current/pending/error supplies visual defaults and aria-current for the current step. Connector supports solid/dashed/dotted variant, regular/wavy shape, size/waveSize/color and opt-in animated flow with duration/flowDirection. Built-in motion respects reduced motion. Keep visible status text, use real timestamps and omit the final connector; see delivery and connector playground stories.

**Availability:** package-root public API.

**Value exports:** `stepperColors`, `Timeline`, `timelineColors`.

**Type-only exports:** `TimelineColor`, `TimelineConnectorProps`, `TimelineDotProps`, `TimelineItemProps`, `TimelineProps`, `TimelineStatus`. Use `import type`.

- `Timeline` members: `Timeline.Connector`, `Timeline.Content`, `Timeline.Dot`, `Timeline.Item`, `Timeline.Separator`.
- `Timeline` own props: `color`, `orientation`.

**Source:** [README.md](../../../../src/lib/components/timeline/README.md), [index.tsx](../../../../src/lib/components/timeline/index.tsx), [primitives.ts](../../../../src/lib/components/timeline/primitives.ts)

**Examples:** [Timeline.stories.tsx](../../../../src/lib/components/timeline/Timeline.stories.tsx), [TimelineConnectors.stories.tsx](../../../../src/lib/components/timeline/TimelineConnectors.stories.tsx), [TimelineLayouts.stories.tsx](../../../../src/lib/components/timeline/TimelineLayouts.stories.tsx)

## typography

Consistent text roles. Choose variant for visual scale and as for document semantics; heading appearance is independent of heading level. Use muted/highlighted intentionally.

**Availability:** package-root public API.

**Value exports:** `Typography`.

- `Typography` own props: `as`, `bold`, `className`, `highlighted`, `highlightedShape`, `highlightedVariant`, `muted`, `ref`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/typography/index.tsx)

**Examples:** [Typography.stories.tsx](../../../../src/lib/components/typography/Typography.stories.tsx)

