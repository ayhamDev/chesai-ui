# Editors, media and specialized tools

[Selection guide](../component-registry.md) · [Machine-readable registry](registry.json)

Generated from the package-root exports and curated usage guidance. Import public names from `chesai-ui`. Own-prop lists are discovery hints, not complete signatures; inherited props, required fields, unions and callbacks must be checked in source/types. Compound members listed below may include helper data; consult the usage note before treating a value as JSX.

- [chat](#chat)
- [code-editor](#code-editor)
- [device](#device)
- [full-calendar](#full-calendar)
- [image](#image)
- [install-command](#install-command)
- [lexical-editor](#lexical-editor)
- [location-picker](#location-picker)
- [map](#map)
- [material3-carousel](#material3-carousel)
- [medium-text-editor](#medium-text-editor)
- [playlist-studio](#playlist-studio)
- [qr-code](#qr-code)
- [shape](#shape)
- [theme-controls](#theme-controls)
- [video-player](#video-player)
- [website-studio](#website-studio)

## chat

Conversation viewport and scroll behavior. Compose Root/Viewport/Content/Messages/ScrollToBottom and provide item keys/rendering. This family does not supply message bubbles or a composer; build those from Item, Typography, InputGroup and actions.

**Availability:** package-root public API.

**Value exports:** `Chat`, `ChatContent`, `ChatMessages`, `ChatRoot`, `ChatScrollToBottom`, `ChatViewport`, `useChat`, `useChatAtBottom`.

**Type-only exports:** `ChatApi`, `ChatContentProps`, `ChatMessagesProps`, `ChatRootProps`, `ChatRootRef`, `ChatScrollBehavior`, `ChatScrollToBottomProps`, `ChatViewportProps`. Use `import type`.

- `Chat` members: `Chat.Content`, `Chat.Messages`, `Chat.Root`, `Chat.ScrollToBottom`, `Chat.Viewport`.
- `ChatContent` own props: `asChild`.
- `ChatMessages` own props: `children`, `getKey`, `items`.
- `ChatRoot` own props: `autoScrollThreshold`, `behavior`, `children`, `hasMore`, `isLoading`, `loadThreshold`, `onAtBottomChange`, `onLoadOlder`.
- `ChatScrollToBottom` own props: `asChild`, `behavior`.
- `ChatViewport` own props: `asChild`.

**Source:** [README.md](../../../../src/lib/components/chat/README.md), [context.ts](../../../../src/lib/components/chat/context.ts), [controller.ts](../../../../src/lib/components/chat/controller.ts), [index.tsx](../../../../src/lib/components/chat/index.tsx)

**Examples:** [chat.stories.tsx](../../../../src/lib/components/chat/chat.stories.tsx)

## code-editor

Source editing/viewing and diffs using Monaco. Supply language, value/onChange, optional original/isDiff and height; configure readOnly, toolbar and loading behavior for the task.

**Availability:** package-root public API.

**Value exports:** `CodeEditor`.

**Type-only exports:** `CodeEditorAction`, `CodeEditorProps`. Use `import type`.

- `CodeEditor` own props: `collapsible`, `customActions`, `defaultCollapsed`, `disableContextMenu`, `enableCopy`, `fileName`, `height`, `hideToolbar`, `isDiff`, `language`, `onChange`, `options`, `original`, `readOnly`, `shadow`, `shape`, `toolbarContent`, `toolbarSize`, `value`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/code-editor/index.tsx)

**Examples:** [CodeEditor.stories.tsx](../../../../src/lib/components/code-editor/CodeEditor.stories.tsx)

## device

Device framing for previews and demonstrations. Use DeviceFrame in showcases; it is not an application navigation shell.

**Availability:** package-root public API.

**Value exports:** `DeviceFrame`.

- `DeviceFrame` own props: `children`, `defaultType`.

**Source:** [index.tsx](../../../../src/lib/components/device/index.tsx)

**Examples:** No Storybook file in this folder; inspect the source contract.

## full-calendar

Event scheduling with multiple views and recurrence. Supply events and relevant create/update/delete callbacks; compose Toolbar/View or use the main component. Distinguish date navigation from event mutation and inspect event schema.

**Availability:** package-root public API.

**Value exports:** `FullCalendar`, `FullCalendarViewDispatcher`, `PrintHeader`, `PrintPagesLayout`, `RecurrenceDialog`, `RecurrenceSelect`.

**Type-only exports:** `CalendarEvent`, `CalendarVariant`, `CalendarView`, `EventType`, `FullCalendarProps`, `PrintSettings`, `RecurrenceDialogProps`, `RecurrenceException`, `RecurrenceOccurrence`, `RecurrenceRule`, `RecurrenceSelectProps`. Use `import type`.

- `FullCalendar` members: `FullCalendar.Toolbar`, `FullCalendar.View`.
- `FullCalendar` own props: `bordered`, `children`, `className`, `disableCreateOnGridClick`, `disableCreatePopover`, `disableDragAndDrop`, `disableEventClick`, `disableEventPopover`, `events`, `hidePopoverRecurrence`, `hidePopoverTime`, `hidePopoverTitle`, `initialDate`, `initialView`, `onDateClick`, `onDateRangeChange`, `onEventClick`, `onEventCreate`, `onEventDelete`, `onEventUpdate`, `onViewChange`, `renderEventContent`, `renderPopoverCustomFields`, `renderPopoverFooter`, `renderPopoverHeader`, `variant`.
- `PrintPagesLayout` own props: `isPreview`, `printHeight`, `printWidth`, `scale`.
- `RecurrenceDialog` own props: `isOpen`, `onChange`, `onClose`, `startDate`, `value`.
- `RecurrenceSelect` own props: `className`, `onChange`, `shape`, `size`, `startDate`, `value`, `variant`.

**Source:** [calendar-context.tsx](../../../../src/lib/components/full-calendar/calendar-context.tsx), [calendar-range.ts](../../../../src/lib/components/full-calendar/calendar-range.ts), [event-popover.tsx](../../../../src/lib/components/full-calendar/event-popover.tsx), [index.tsx](../../../../src/lib/components/full-calendar/index.tsx), [month-view.tsx](../../../../src/lib/components/full-calendar/month-view.tsx), [print-layout.ts](../../../../src/lib/components/full-calendar/print-layout.ts), [print-preview-dialog.tsx](../../../../src/lib/components/full-calendar/print-preview-dialog.tsx), [recurrence-dialog.tsx](../../../../src/lib/components/full-calendar/recurrence-dialog.tsx), [recurrence-scope-dialog.tsx](../../../../src/lib/components/full-calendar/recurrence-scope-dialog.tsx), [recurrence-select.tsx](../../../../src/lib/components/full-calendar/recurrence-select.tsx), [timeline-view.tsx](../../../../src/lib/components/full-calendar/timeline-view.tsx), [types.ts](../../../../src/lib/components/full-calendar/types.ts), [utils.ts](../../../../src/lib/components/full-calendar/utils.ts), [year-view.tsx](../../../../src/lib/components/full-calendar/year-view.tsx)

**Examples:** [FullCalendar.stories.tsx](../../../../src/lib/components/full-calendar/FullCalendar.stories.tsx)

## image

Images with placeholder, skeleton, shape and zoom effects. Supply src and meaningful alt; choose aspectRatio/crop intentionally and handle failures.

**Availability:** package-root public API.

**Value exports:** `Image`.

**Type-only exports:** `ImageEffect`, `ImageProps`. Use `import type`.

- `Image` own props: `alt`, `aspectRatio`, `effects`, `fallback`, `placeholderSrc`, `shape`, `showSkeleton`, `src`, `variant`, `zoomOnHover`.

**Source:** [index.tsx](../../../../src/lib/components/image/index.tsx)

**Examples:** [Image.stories.tsx](../../../../src/lib/components/image/Image.stories.tsx)

## install-command

Package installation command with package-manager presentation. Supply packageName and optional isDevDependency; useful in developer documentation.

**Availability:** package-root public API.

**Value exports:** `InstallCommand`.

**Type-only exports:** `InstallCommandProps`. Use `import type`.

- `InstallCommand` own props: `isDevDependency`, `packageName`, `shadow`, `shape`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/install-command/index.tsx)

**Examples:** [InstallCommand.stories.tsx](../../../../src/lib/components/install-command/InstallCommand.stories.tsx)

## lexical-editor

Rich text with a Markdown-oriented interface. Supply markdown/onChange and readOnly as needed; use Textarea for plain text and MediumTextEditor for Editor.js block data.

**Availability:** package-root public API.

**Value exports:** `LexicalEditor`.

**Type-only exports:** `LexicalEditorProps`. Use `import type`.

- `LexicalEditor` own props: `className`, `description`, `disabled`, `errorMessage`, `isInvalid`, `label`, `markdown`, `onChange`, `placeholder`, `readOnly`, `shadow`, `shape`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/lexical-editor/index.tsx), [CodeBlockNode.tsx](../../../../src/lib/components/lexical-editor/nodes/CodeBlockNode.tsx), [ToolbarPlugin.tsx](../../../../src/lib/components/lexical-editor/plugins/ToolbarPlugin.tsx), [theme.ts](../../../../src/lib/components/lexical-editor/theme.ts)

**Examples:** [LexicalEditor.stories.tsx](../../../../src/lib/components/lexical-editor/LexicalEditor.stories.tsx)

## location-picker

Choose a geographic location. Wire onSelect/onCancel and optional onSearch/onMapIdle; the application supplies search integration and persistence.

**Availability:** package-root public API.

**Value exports:** `LocationPicker`.

**Type-only exports:** `LocationPickerProps`, `SearchResult`. Use `import type`.

- `LocationPicker` own props: `bordered`, `cancelLabel`, `confirmLabel`, `defaultCoordinates`, `footer`, `onCancel`, `onMapIdle`, `onSearch`, `onSelect`, `placeholder`, `title`.

**Source:** [index.tsx](../../../../src/lib/components/location-picker/index.tsx)

**Examples:** [LocationPicker.stories.tsx](../../../../src/lib/components/location-picker/LocationPicker.stories.tsx)

## map

Geospatial presentation and interaction using MapLibre. Map/ChesaiMap offer Marker, Popup, Controls, Route, ClusterLayer, HeatmapLayer, Geofence and Draw. Supply map style/view state and read individual compound contracts.

**Availability:** package-root public API.

**Value exports:** `ChesaiMap`, `Map`, `useMap`.

- `ChesaiMap` members: `ChesaiMap.AnimatedMarker`, `ChesaiMap.ClusterLayer`, `ChesaiMap.Controls`, `ChesaiMap.Draw`, `ChesaiMap.Geofence`, `ChesaiMap.HeatmapLayer`, `ChesaiMap.Marker`, `ChesaiMap.MarkerContent`, `ChesaiMap.MarkerLabel`, `ChesaiMap.MarkerPopup`, `ChesaiMap.MarkerTooltip`, `ChesaiMap.Popup`, `ChesaiMap.Route`.
- `ChesaiMap` own props: `bordered`, `dragPan`, `elevation`, `initialViewState`, `latitude`, `longitude`, `mapStyle`, `onClick`, `onMove`, `onMoveEnd`, `projection`, `scrollZoom`, `shape`, `zoom`.
- `Map` members: `Map.AnimatedMarker`, `Map.ClusterLayer`, `Map.Controls`, `Map.Draw`, `Map.Geofence`, `Map.HeatmapLayer`, `Map.Marker`, `Map.MarkerContent`, `Map.MarkerLabel`, `Map.MarkerPopup`, `Map.MarkerTooltip`, `Map.Popup`, `Map.Route`.
- `Map` own props: `bordered`, `dragPan`, `elevation`, `initialViewState`, `latitude`, `longitude`, `mapStyle`, `onClick`, `onMove`, `onMoveEnd`, `projection`, `scrollZoom`, `shape`, `zoom`.

**Source:** [index.tsx](../../../../src/lib/components/map/index.tsx), [map-animated-marker.tsx](../../../../src/lib/components/map/map-animated-marker.tsx), [map-cluster.tsx](../../../../src/lib/components/map/map-cluster.tsx), [map-controls.tsx](../../../../src/lib/components/map/map-controls.tsx), [map-draw.tsx](../../../../src/lib/components/map/map-draw.tsx), [map-geofence.tsx](../../../../src/lib/components/map/map-geofence.tsx), [map-heatmap.tsx](../../../../src/lib/components/map/map-heatmap.tsx), [map-marker.tsx](../../../../src/lib/components/map/map-marker.tsx), [map-popup.tsx](../../../../src/lib/components/map/map-popup.tsx), [map-root.tsx](../../../../src/lib/components/map/map-root.tsx), [map-route.tsx](../../../../src/lib/components/map/map-route.tsx), [map-utils.ts](../../../../src/lib/components/map/map-utils.ts)

**Examples:** [map.stories.tsx](../../../../src/lib/components/map/map.stories.tsx)

## material3-carousel

Expressive browsing of image-led items. Compose CarouselItem with index/imageUrl inside Carousel; choose visible slides, height and optional autoplay carefully. A table/list is better for precise comparison.

**Availability:** package-root public API.

**Value exports:** `Carousel`, `CarouselItem`.

**Type-only exports:** `CarouselAutoplay`, `CarouselBreakpoint`, `CarouselItemProps`, `CarouselProps`. Use `import type`.

- `Carousel` own props: `autoplay`, `breakpoints`, `children`, `className`, `height`, `loop`, `orientation`, `slidesPerView`.
- `CarouselItem` own props: `gapRange`, `imageUrl`, `index`, `inputRange`, `onClick`, `orientation`, `progress`, `sizeRange`, `subtitle`, `title`.

**Source:** [Carousel.tsx](../../../../src/lib/components/material3-carousel/Carousel.tsx), [CarouselItem.tsx](../../../../src/lib/components/material3-carousel/CarouselItem.tsx), [index.ts](../../../../src/lib/components/material3-carousel/index.ts), [types.ts](../../../../src/lib/components/material3-carousel/types.ts)

**Examples:** [Carousel.stories.tsx](../../../../src/lib/components/material3-carousel/Carousel.stories.tsx)

## medium-text-editor

Block document editing backed by Editor.js. Persist its data/onChange output format; it is not interchangeable with Lexical Markdown or plain strings.

**Availability:** package-root public API.

**Value exports:** `MediumTextEditor`.

**Type-only exports:** `MediumTextEditorProps`. Use `import type`.

- `MediumTextEditor` own props: `className`, `data`, `minHeight`, `onChange`, `placeholder`, `readOnly`.

**Source:** [editor-styles.css](../../../../src/lib/components/medium-text-editor/editor-styles.css), [index.tsx](../../../../src/lib/components/medium-text-editor/index.tsx)

**Examples:** [MediumTextEditor.stories.tsx](../../../../src/lib/components/medium-text-editor/MediumTextEditor.stories.tsx)

## playlist-studio

Timeline-based media composition and playback. Use PlaylistPlayer/PlaylistStudio.Player with schema(s) and a component registry; individual media components require timing/playhead props. defaultPlaylistRegistry is a mapping, not JSX.

**Availability:** package-root public API.

**Value exports:** `defaultPlaylistRegistry`, `PlaylistAudio`, `PlaylistHtml`, `PlaylistImage`, `PlaylistPlayer`, `PlaylistStudio`, `PlaylistVideo`, `PreloadContext`, `usePlayhead`, `usePreload`.

**Type-only exports:** `PlaylistComponentProps`, `PlaylistComponentRegistry`, `PlaylistItem`, `PlaylistItemLayout`, `PlaylistLayer`, `PlaylistSchema`, `PlaylistSettings`, `TransitionConfig`, `TransitionType`. Use `import type`.

- `defaultPlaylistRegistry` members: `defaultPlaylistRegistry.Audio`, `defaultPlaylistRegistry.Html`, `defaultPlaylistRegistry.Image`, `defaultPlaylistRegistry.Video`.
- `PlaylistAudio` own props: `data`, `endTime`, `id`, `isActive`, `isSeeking`, `isTimelinePlaying`, `playhead`, `startTime`.
- `PlaylistHtml` own props: `data`, `endTime`, `id`, `isActive`, `isSeeking`, `isTimelinePlaying`, `playhead`, `startTime`.
- `PlaylistImage` own props: `data`, `endTime`, `id`, `isActive`, `isSeeking`, `isTimelinePlaying`, `playhead`, `startTime`.
- `PlaylistPlayer` own props: `className`, `components`, `externalPlayhead`, `onLoop`, `onTimeUpdate`, `outerBackgroundColor`, `playing`, `schema`, `schemas`, `showControls`.
- `PlaylistStudio` members: `PlaylistStudio.Player`.
- `PlaylistVideo` own props: `data`, `endTime`, `id`, `isActive`, `isSeeking`, `isTimelinePlaying`, `playhead`, `startTime`.

**Source:** [elements.tsx](../../../../src/lib/components/playlist-studio/elements.tsx), [index.ts](../../../../src/lib/components/playlist-studio/index.ts), [item-renderer.tsx](../../../../src/lib/components/playlist-studio/item-renderer.tsx), [player.tsx](../../../../src/lib/components/playlist-studio/player.tsx), [preload-context.tsx](../../../../src/lib/components/playlist-studio/preload-context.tsx), [types.ts](../../../../src/lib/components/playlist-studio/types.ts), [use-playhead.ts](../../../../src/lib/components/playlist-studio/use-playhead.ts)

**Examples:** [PlaylistStudio.Player.stories.tsx](../../../../src/lib/components/playlist-studio/PlaylistStudio.Player.stories.tsx)

## qr-code

Encode a real value as a QR image with optional toolbar. Supply value and readable contrast; Canvas/Content/Toolbar support composition. Verify scanning when altering shapes or adding logos.

**Availability:** package-root public API.

**Value exports:** `QRCode`, `QRCodeCanvas`, `QRCodeContent`, `QRCodeToolbar`.

**Type-only exports:** `CornerDotShape`, `CornerFrameShape`, `DotShape`, `QRCodeRootProps`. Use `import type`.

- `QRCode` members: `QRCode.Canvas`, `QRCode.Content`, `QRCode.Toolbar`.
- `QRCode` own props: `color`, `cornerColor`, `cornerDotShape`, `cornerFrameShape`, `cornerShape`, `dotShape`, `ecLevel`, `logo`, `logoBackgroundColor`, `logoSize`, `padding`, `shadow`, `showData`, `showToolbar`, `size`, `value`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/qr-code/index.tsx)

**Examples:** [QRCode.stories.tsx](../../../../src/lib/components/qr-code/QRCode.stories.tsx)

## shape

Expressive shaped surfaces, images, badges and actions. Use Shape or Shaped* with an actual shape key; preserve semantics and hit targets. SHAPE_PATHS is data, not a React component.

**Availability:** package-root public API.

**Value exports:** `Shape`, `SHAPE_PATHS`, `ShapedBadge`, `ShapedButton`, `ShapedContainer`, `ShapedIcon`, `ShapedIconButton`, `ShapedImage`.

**Type-only exports:** `ShapedBadgeProps`, `ShapedContainerProps`, `ShapedIconButtonProps`, `ShapedIconProps`, `ShapedImageProps`, `ShapeProps`, `ShapeType`. Use `import type`.

- `Shape` own props: `duration`, `ease`, `shape`.
- `ShapedBadge` own props: `shadow`, `shape`, `size`, `variant`.
- `ShapedButton` own props: `morphDuration`, `morphEase`, `shadow`, `shape`, `size`, `variant`.
- `ShapedContainer` own props: `containerClassName`, `duration`, `ease`, `shape`, `size`.
- `ShapedIcon` own props: `shape`, `size`.
- `ShapedIconButton` own props: `morphDuration`, `morphEase`, `shadow`, `shape`, `size`, `variant`.
- `ShapedImage` own props: `alt`, `aspectRatio`, `duration`, `ease`, `effects`, `fallback`, `placeholderSrc`, `shape`, `showSkeleton`, `size`, `src`, `variant`, `zoomOnHover`.

**Source:** [index.tsx](../../../../src/lib/components/shape/index.tsx), [paths.ts](../../../../src/lib/components/shape/paths.ts), [shaped-components.tsx](../../../../src/lib/components/shape/shaped-components.tsx)

**Examples:** [Shape.stories.tsx](../../../../src/lib/components/shape/Shape.stories.tsx), [ShapedComponents.stories.tsx](../../../../src/lib/components/shape/ShapedComponents.stories.tsx)

## theme-controls

Font preference UI. FontPicker changes theme typography through its context; use for deliberate user preferences, not incidental page styling.

**Availability:** package-root public API.

**Value exports:** `FontPicker`.


**Source:** [FontPicker.tsx](../../../../src/lib/components/theme-controls/FontPicker.tsx)

**Examples:** No Storybook file in this folder; inspect the source contract.

## video-player

Video playback controls and streaming support. Supply src and optional poster/title; decide autoplay/muted behavior and provide captions or equivalent access as required by the content.

**Availability:** package-root public API.

**Value exports:** `VideoPlayer`.

**Type-only exports:** `VideoPlayerProps`. Use `import type`.

- `VideoPlayer` own props: `autoPlay`, `bordered`, `className`, `loop`, `muted`, `objectFit`, `poster`, `shape`, `src`, `title`.

**Source:** [index.tsx](../../../../src/lib/components/video-player/index.tsx)

**Examples:** [Video-player.stories.tsx](../../../../src/lib/components/video-player/Video-player.stories.tsx)

## website-studio

Website editing/rendering studio. Choose Builder, Renderer or PreviewOverlay and inspect schemas/store/actions. ScriptAndStyleInjector consumes HTML; establish a trust/sanitization boundary before rendering external content.

**Availability:** package-root public API.

**Value exports:** `defaultActions`, `ScriptAndStyleInjector`, `useStudioStore`, `WebsiteStudio`.

**Type-only exports:** `ComponentControl`, `ComponentRegistry`, `ControlType`, `DesignSystemSchema`, `PageSchema`, `RegistryComponent`, `StudioEventAction`, `StudioNode`, `ThemeRegistry`, `WebsiteSchema`. Use `import type`.

- `ScriptAndStyleInjector` own props: `html`, `target`.
- `WebsiteStudio` members: `WebsiteStudio.Builder`, `WebsiteStudio.PreviewOverlay`, `WebsiteStudio.Renderer`, `WebsiteStudio.ScriptAndStyleInjector`.

**Source:** [BuilderContext.tsx](../../../../src/lib/components/website-studio/BuilderContext.tsx), [ScriptAndStyleInjector.tsx](../../../../src/lib/components/website-studio/ScriptAndStyleInjector.tsx), [ThemeInjector.tsx](../../../../src/lib/components/website-studio/ThemeInjector.tsx), [builder.tsx](../../../../src/lib/components/website-studio/builder.tsx), [ComponentPickerDialog.tsx](../../../../src/lib/components/website-studio/builder/ComponentPickerDialog.tsx), [ComponentsTab.tsx](../../../../src/lib/components/website-studio/builder/ComponentsTab.tsx), [InspectorPanel.tsx](../../../../src/lib/components/website-studio/builder/InspectorPanel.tsx), [LayersTab.tsx](../../../../src/lib/components/website-studio/builder/LayersTab.tsx), [PageDialogs.tsx](../../../../src/lib/components/website-studio/builder/PageDialogs.tsx), [PagesTab.tsx](../../../../src/lib/components/website-studio/builder/PagesTab.tsx), [PreviewOverlay.tsx](../../../../src/lib/components/website-studio/builder/PreviewOverlay.tsx), [helpers.tsx](../../../../src/lib/components/website-studio/builder/helpers.tsx), [types.ts](../../../../src/lib/components/website-studio/builder/types.ts), [ArtboardIframe.tsx](../../../../src/lib/components/website-studio/canvas/ArtboardIframe.tsx), [ArtboardNode.tsx](../../../../src/lib/components/website-studio/canvas/ArtboardNode.tsx), [CanvasOverlay.tsx](../../../../src/lib/components/website-studio/canvas/CanvasOverlay.tsx), [IframeWrappers.tsx](../../../../src/lib/components/website-studio/canvas/IframeWrappers.tsx), [StudioCanvas.tsx](../../../../src/lib/components/website-studio/canvas/StudioCanvas.tsx), [artboard-types.ts](../../../../src/lib/components/website-studio/canvas/artboard-types.ts), [artboard-utils.ts](../../../../src/lib/components/website-studio/canvas/artboard-utils.ts), [defaultActions.ts](../../../../src/lib/components/website-studio/defaultActions.ts), [index.ts](../../../../src/lib/components/website-studio/index.ts), [renderer.tsx](../../../../src/lib/components/website-studio/renderer.tsx), [store.ts](../../../../src/lib/components/website-studio/store.ts), [types.ts](../../../../src/lib/components/website-studio/types.ts)

**Examples:** [DigitalAgency.stories.tsx](../../../../src/lib/components/website-studio/DigitalAgency.stories.tsx), [WebsiteStudio.stories.tsx](../../../../src/lib/components/website-studio/WebsiteStudio.stories.tsx)

