// Editorial guidance. Export names, compound parts and source links are generated.
// Format: folder | category | purpose and usage (not an API specification).
export const categories: Record<string, string> = {
  actions: 'Actions and menus', forms: 'Forms and selection', navigation: 'Navigation and shells',
  content: 'Content and data', feedback: 'Feedback and overlays', layout: 'Layout and scrolling',
  advanced: 'Editors, media and specialized tools', infrastructure: 'Providers, hooks and utilities',
  internal: 'Internal and unavailable folders',
}

export const guidance = `
button|actions|Text actions and form submission. Use Button with children, optional startIcon/endIcon and isLoading; set type explicitly inside forms. asChild supports an appropriate link element.
icon-button|actions|Compact icon actions. Supply an accessible name and an icon child; use Button when the action needs a visible label.
button-group|actions|Visually related adjacent buttons. Compose Button children. Expressive presses expand the active button and compress immediate neighbors while preserving total width; expressive=false opts out and expansion tunes the amount. Supports keyboard release, RTL and reduced motion. Grouping alone does not provide selection state or radio semantics.
split-button|actions|Primary action with related alternatives. Compose the primary Button and menu trigger inside SplitButton; read its story for sizing and shared shape.
fab|actions|Prominent screen-level creation/action. Supply icon and optional extended label. Do not add a floating action when an existing primary action already serves the task.
fab-menu|actions|A small set of related floating actions. Compose Trigger, List and Item; keep open/onOpenChange coherent and label every action.
toolbar|actions|Tools acting on the current selection or canvas. Compose Button, ToggleGroup/ToggleItem and Separator; use Toolbar.ItemTooltip for tool explanations.
dropdown-menu|actions|An anchored list of actions. Compose Trigger, Content and Item with groups, checkbox/radio items or submenus as needed. Use Select for a form value.
context-menu|actions|Secondary actions on a target through context interaction. Wrap the target in Trigger and supply Content; keep important actions reachable without right-click.
menubar|actions|Persistent application command menus. Compose Menu, Trigger and Content; reserve it for applications with menu-like command structures.
command|actions|Searchable command palette. Compose Input, List, Empty, Group and Item, optionally inside controlled CommandDialog. Connect item selection to real actions.
input|forms|Single-line text fields. Use label, value and onValueChange (or native onChange) plus description/errorMessage. Prefer specialized inputs for constrained data.
search-view|forms|Search that expands into a results surface. Supply value/onChange, optional onSubmit and result children; configure open/onOpenChange when controlled. Use Input for a simple inline filter and Command for command execution.
textarea|forms|Multiline plain text. Use label and validation props; minRows/maxRows control autosizing. Rich document editing belongs in an editor.
input-group|forms|A field with attached prefix, suffix or actions. Compose InputGroupInput/Textarea and Addon/Text; avoid nested competing labels and duplicate field chrome.
field|forms|Form structure and validation messages. Compose FieldGroup, Field, FieldLabel, FieldDescription and FieldError around controls; wire IDs, validation and submission in the application. See TanStack form stories.
number-input|forms|Numeric entry with stepping and bounds. Use numeric value/onValueChange, min/max/step; onValueChange is not an input event.
phone-input|forms|Phone entry with country selection. Use value/onValueChange with international (+country-code) saved numbers: the country is inferred initially and when value changes. defaultCountry is a fallback; explicit country overrides inference. Clearing retains the selection. onCountryChange reports picker choices, not inferred values. National-only or ambiguous numbers require country context; consult types for validation.
otp-field|forms|One-time code entry. Provide InputOTP maxLength, value/onChange, Group and indexed Slot children. Slots are visual parts of one input, not independent inputs.
checkbox|forms|Independent binary or multi-selection choice. Use checked/onCheckedChange and label; account for an indeterminate state where applicable.
switch|forms|An immediately applied on/off setting. Use checked/onCheckedChange with label and optional description. Use Checkbox for selection submitted as part of a form.
radio-group|forms|One visible choice among a small set. Use value/onValueChange, named options and RadioGroupItem (or Radio.Item); keep the group labelled.
select|forms|Choose one value from a known list. Select accepts items or SelectItem children, value/onValueChange and label. It owns its trigger: do not invent SelectTrigger or SelectContent imports.
combobox|forms|Searchable single selection, including asynchronous option loading. Supply options, value/onValueChange; use searchValue/onSearchChange and shouldFilter for remote filtering. Preserve selectedOption when it is outside the loaded page.
multi-select|forms|Select multiple values from options. Use value/onValueChange and options; maxCount controls visible selection presentation. Use checkboxes when all few choices should remain visible.
chip|forms|Compact filter/category choice or attribute. Use selected for a selectable chip, with text and optional icons; do not imply interactivity for plain metadata.
slider|forms|Approximate numeric adjustment. Slider uses value/onValueChange; inspect array semantics and bounds. BarLineSlider is the alternative visual treatment. Provide an accessible label and a precise input when exact values matter.
color-picker|forms|Choosing an actual color value. Wire value/onChange and optional swatches; do not use it to represent unrelated status choices.
date-input|forms|Keyboard-friendly segmented date, time and duration entry. DateInput/TimeInput use React Aria date types; DurationInput has its own contract. Group/Field/Segment parts and hooks support custom composition. Do not assume all values are JS Date.
date-picker|forms|Date selection from a popup or calendar. DatePicker uses value/onChange; Calendar and InfiniteCalendar use onSelect/onRangeSelect. Inspect mode and range value types before wiring state.
time-picker|forms|Time selection in a picker. Wire value/onChange and inputVariant separately from surface variant; inspect the time value format rather than borrowing DatePicker assumptions.
week-calendar|forms|Compact browsable day/week strip. Configure selection mode, visibleDate and selection callbacks; navigation and keyboard focus need not change selection. Use FullCalendar for scheduled events.
dropzone|forms|File picking and drag/drop. Dropzone takes onDrop and optional controlled files/onRemove; VirtualDropzone overlays an existing region via onDropFiles. Application code owns upload, progress and failures.
appbar|navigation|Page title, contextual actions and optional collapsing header. Supply title/leadingIcon/trailingIcons; attach scrollContainerRef for a custom scroll region and follow the layout reference.
bottom-tabs|navigation|Primary compact destinations. Compose BottomTabs.Navigator and Screen with the actual route/content contract; use Tabs for sections inside one destination.
navigation-rail|navigation|Primary destinations in a rail with responsive expansion. Compose Navigator/Screen plus Header, Label and FAB where useful; inspect routing and content placement in stories.
sidebar|navigation|Persistent or collapsible app navigation. Use SidebarProvider and Sidebar Header/Content/Footer/Item/Group; configure mobileLayout and collapse behavior deliberately.
navigation-menu|navigation|Website-style navigation links and grouped dropdown content. Compose List/Item/Trigger/Content/Link; use DropdownMenu for commands, not destinations.
breadcrumb|navigation|Hierarchical location and parent links. Use Dynamic data API or List/Item/Link/Page composition; mark current location and avoid duplicating a flat tab bar.
tabs|navigation|Sections within a context. Compose Tabs with defaultValue, List/Trigger and Content/Panel; verify routingMode and param names because this library can synchronize URL state.
shallow-router|navigation|Lightweight route/page switching and optional query/path synchronization. Compose ShallowRouter, Route/Page/Switch; preserve the existing application router rather than installing another unnecessarily.
stack-router|navigation|Push/pop screen flows. Use createStackNavigator or ControlledStackNavigator with external state; adapters support router integration. Read transition, back and state contracts before composing screens.
layout-router|navigation|Shared-element list-to-detail transitions and dismissible screens. Compose List/Link/Screen/SharedElement under LayoutRouter; use stable shared identities and verify back behavior.
view-transition|navigation|View-transition helpers for navigation. TransitionLink requires onNavigate; hooks integrate explicit or global transitions. Respect reduced motion and existing router behavior.
taskbar|navigation|Desktop application titlebar/window controls. Bind onMinimize/onMaximize/onClose to the host application; the component does not automatically control OS windows.
layout-toggle|navigation|A control for layout direction. Use LayoutDirectionToggle with existing layout context; do not change product direction merely for decoration.
typography|content|Consistent text roles. Choose variant for visual scale and as for document semantics; heading appearance is independent of heading level. Use muted/highlighted intentionally.
card|content|A bounded related content unit. Compose children and choose variant/padding; CardGroup groups related cards. Avoid wrapping every section in a card.
item|content|Structured list/settings/resource rows. Compose Media, Content, Title, Description and Actions; ItemGroup handles grouping. Expansion and swipe actions belong to the row API, not improvised div behavior.
avatar|content|Person or entity identity. Use src/fallback with size/shape, and AvatarGroup for capped sets. Keep names available outside the image.
badge|content|Small status or count labels. Use explicit status text and semantic meaning; do not make every label visually prominent.
accordion|content|Optional details disclosed in place. Compose Item/Trigger/Content with the required single/multiple mode. Keep essential instructions visible.
table|content|Lower-level TanStack table rendering. Table requires a TanStack table instance; it is not a generic HTML-table wrapper. Compose Row/Head/Cell only according to its API. Prefer DataTable for standard data browsing.
data-table|content|Data browsing with sorting, filtering, selection, pagination or infinite loading. Supply data and columns; use controlled state callbacks for server data. Helpers cover headers, faceted filters, export and URL state; inspect types for modes and manual operation.
data-display|content|Switchable table and card/list presentation of one dataset. Supply data, columns and renderItem, then select layout; preserve filter/sort/selection meaning between views.
charts|content|Quantitative comparison and trends. Area/Bar/Line use data, categories and index; Pie uses category/index; Heatmap uses data and x/y labels. Supply units and meaningful formatting; never fabricate decorative metrics.
timeline|content|Ordered events, logistics and delivery/order history. Compose Item, Separator, Connector, Dot and Content. Root orientation supports vertical/horizontal; dir inherits or can be explicit, including RTL flow. Root/Item color sets defaults; Dot color/foreground and Connector color support every exported timelineColors Material system role. Optional Item status completed/current/pending/error supplies visual defaults and aria-current for the current step. Connector supports solid/dashed/dotted variant, regular/wavy shape, size/waveSize/color and opt-in animated flow with duration/flowDirection. Built-in motion respects reduced motion. Keep visible status text, use real timestamps and omit the final connector; see delivery and connector playground stories.
stepper|content|Progress through a staged task. Provide zero-based currentStep and direct Step children; compose Indicator/Separator/Content/Title/Description. Supports horizontal/vertical orientation and inherited/explicit RTL. Root/Step/Indicator/Separator color accepts all stepperColors theme roles; Indicator supports foreground, shape, size and completedIcon. Step status can override progress for exceptions. Separator shares Timeline solid/dashed/dotted, wavy, animated duration/direction controls and reduced motion. Application code owns navigation and validation.
kanban|content|Work items grouped into movable workflow columns. Supply columns, onChange and renderCard; persist moves and provide an alternative to dragging when needed.
kbd|content|Presentation of keyboard shortcuts. Render the actual supported keys; it does not register keyboard handlers.
divider|content|Visual separation with optional label or expressive line. Configure orientation and variant only when grouping needs a boundary.
separator|content|Simple semantic separator primitive. Use for plain boundaries; use Divider when its extra visual or labelled treatment is needed.
alert|feedback|Persistent inline information, warning or error. Compose Icon, Content, Title, Description and Action. Use FieldError for field-local validation and toast for transient confirmation.
empty-state|feedback|No data or no results. Supply title and meaningful description/action, optional icon/visual; distinguish initial creation from a filtered empty result.
skeleton|feedback|Temporary placeholders that preserve content geometry while loading. Match the expected layout; do not retain indefinitely after an error.
loadingIndicator|feedback|Indeterminate activity indicator with shape animation. Pair with a textual status where the task is otherwise unclear.
progress|feedback|Task progress. LinearProgress/CircularProgress accept value/max or indeterminate; show actual progress when known and label the operation.
toast|feedback|Transient confirmation and undo feedback. Chesai exports Toaster; send notifications through toast from sonner. ChesaiProvider already mounts Toaster, so avoid duplicating it.
tooltip|feedback|Short supplementary explanation for a trigger. Use TooltipProvider and TooltipTrigger/Tooltip according to stories; give icon actions their own accessible names and keep essential instructions visible.
popover|feedback|Anchored contextual content. Compose Trigger and Content (optional Anchor/Close/Arrow); prefer a menu for a pure action list and Dialog for blocking decisions.
dialog|feedback|Focused modal decisions or editing. Dialog requires open/onOpenChange and children; compose Title, Description, Body/Footer and Close. Preserve accessible naming and return focus.
sheet|feedback|Supplementary workflows adapted to bottom or side placement. Compose Trigger/Content/Title/Description with mode/side/snap behavior; do not hide the only way to perform a task behind an unexplained gesture.
floating-panel|feedback|A trigger that transforms into a contextual panel. Compose Trigger/Content/CloseButton; dimensions and positioning are explicit. Use standard Popover when transformation adds no task value.
layouts|layout|Flex/Grid/Masonry arrangement, plus virtual variants for large datasets. Use Item spans or renderItem contracts as appropriate; semantic main/section/form elements and CSS remain appropriate around these primitives.
resizable|layout|User-adjustable panes. Compose Pane and Handle under Resizable, with defaultSizes and optional storageKey; ensure bounded dimensions and sensible compact adaptation.
elastic-scroll-area|layout|A bounded scroll viewport with elastic behavior and optional refresh. Set a usable height/width; configure orientation and scrollbar visibility, and attach the real viewport where needed.
infinite-scroll|layout|Load more content near the end of a list. Supply onLoadMore, hasMore and isLoading; prevent duplicate requests and preserve an error/retry route.
reverse-infinite-scroll|layout|Load older content above a conversation while preserving position. Supply onLoadOlder, hasMore and isLoading; use Chat when you also need bottom tracking and scroll-to-bottom composition.
virtual-list|layout|Render only visible rows/items for a large collection. Supply data and renderItem with stable getItemKey; estimate/measure sizes and bound the viewport. Do not virtualize a short list without reason.
pull-to-refresh|layout|Refresh a touch scroll region. Provide asynchronous onRefresh and a bounded container; retain an accessible explicit refresh action when needed.
sortable-list|layout|Reordering items with drag handles. Supply items/onReorder and compose Item/DragHandle; persist the result and provide accessible alternatives where the library interaction is insufficient.
swipeable|layout|Reveal or invoke contextual row actions by swipe. Compose Content/Action and configure thresholds/callbacks; keep destructive actions deliberate and available without gestures.
bouncy-box|layout|Expressive container motion. Use only where it communicates interaction or product character; it is not a replacement for a button or layout structure.
chat|advanced|Conversation viewport and scroll behavior. Compose Root/Viewport/Content/Messages/ScrollToBottom and provide item keys/rendering. This family does not supply message bubbles or a composer; build those from Item, Typography, InputGroup and actions.
code-editor|advanced|Source editing/viewing and diffs using Monaco. Supply language, value/onChange, optional original/isDiff and height; configure readOnly, toolbar and loading behavior for the task.
lexical-editor|advanced|Rich text with a Markdown-oriented interface. Supply markdown/onChange and readOnly as needed; use Textarea for plain text and MediumTextEditor for Editor.js block data.
medium-text-editor|advanced|Block document editing backed by Editor.js. Persist its data/onChange output format; it is not interchangeable with Lexical Markdown or plain strings.
image|advanced|Images with placeholder, skeleton, shape and zoom effects. Supply src and meaningful alt; choose aspectRatio/crop intentionally and handle failures.
video-player|advanced|Video playback controls and streaming support. Supply src and optional poster/title; decide autoplay/muted behavior and provide captions or equivalent access as required by the content.
material3-carousel|advanced|Expressive browsing of image-led items. Compose CarouselItem with index/imageUrl inside Carousel; choose visible slides, height and optional autoplay carefully. A table/list is better for precise comparison.
map|advanced|Geospatial presentation and interaction using MapLibre. Map/ChesaiMap offer Marker, Popup, Controls, Route, ClusterLayer, HeatmapLayer, Geofence and Draw. Supply map style/view state and read individual compound contracts.
location-picker|advanced|Choose a geographic location. Wire onSelect/onCancel and optional onSearch/onMapIdle; the application supplies search integration and persistence.
full-calendar|advanced|Event scheduling with multiple views and recurrence. Supply events and relevant create/update/delete callbacks; compose Toolbar/View or use the main component. Distinguish date navigation from event mutation and inspect event schema.
qr-code|advanced|Encode a real value as a QR image with optional toolbar. Supply value and readable contrast; Canvas/Content/Toolbar support composition. Verify scanning when altering shapes or adding logos.
shape|advanced|Expressive shaped surfaces, images, badges and actions. Use Shape or Shaped* with an actual shape key; preserve semantics and hit targets. SHAPE_PATHS is data, not a React component.
device|advanced|Device framing for previews and demonstrations. Use DeviceFrame in showcases; it is not an application navigation shell.
install-command|advanced|Package installation command with package-manager presentation. Supply packageName and optional isDevDependency; useful in developer documentation.
theme-controls|advanced|Font preference UI. FontPicker changes theme typography through its context; use for deliberate user preferences, not incidental page styling.
website-studio|advanced|Website editing/rendering studio. Choose Builder, Renderer or PreviewOverlay and inspect schemas/store/actions. ScriptAndStyleInjector consumes HTML; establish a trust/sanitization boundary before rendering external content.
playlist-studio|advanced|Timeline-based media composition and playback. Use PlaylistPlayer/PlaylistStudio.Player with schema(s) and a component registry; individual media components require timing/playhead props. defaultPlaylistRegistry is a mapping, not JSX.
context|infrastructure|ChesaiProvider combines theme, layout, tooltip, action-sheet, dialog and toaster services. Reuse it at the app boundary. useTheme/useLayout manage preferences; useDialog/useActionSheet expose registered or imperative overlays. Inspect providers for exact registration and open/close contracts; DirectionProvider/useDirection are separate direction primitives.
hooks|infrastructure|Reusable behavior: useCalendar/useTimePicker for date/time state, useAppBar for header integration, useWindowSizeClass for adaptation, useCapacitorBackButton for native back, useFlubber for shape morphing and useRipple for press feedback. Read signatures before calling; hooks are not JSX components and must obey React hook rules.
utils|infrastructure|Theme and ripple configuration helpers/data, including palette generation application, font loading and presets. Use the existing provider for ordinary theming; CSS_MAPPING, chesaiColors and defaultRippleSettings are values, not components.
action-sheet|internal|Story examples for ActionSheetProvider/useActionSheet. No ActionSheet component is exported from the package root; use the public context API.
adaptive-grid|internal|Adaptive/resizable grid implementation exists locally but is not exported from the package root. Use public Grid/Masonry/Resizable when suitable; do not invent an AdaptiveGrid package import.
tree-view|internal|Tree view implementation exists locally but is not exported from the package root. A product needing a real tree requires an explicit supported implementation decision, not an invented import or a disguised list.
blocks|internal|Reserved or internal folder; no package-root export. Do not infer a public Blocks component from the folder name.
carousel|internal|No package-root exports from this folder. The public Carousel/CarouselItem come from material3-carousel.
list|internal|No public List export from this folder. Use Item/ItemGroup, VirtualList or the appropriate scrolling family.
shaped-button|internal|No package-root export from this folder. Public ShapedButton comes from shape.
showcase|internal|Showcase/internal folder without a package-root component export. Consult public components for product UI.
ThemeSwitch|internal|No package-root ThemeSwitch export. Compose Switch with useTheme if a theme preference control is required.
`.trim().split('\n').map(line => {
  const [folder, category, usage] = line.split('|')
  return { folder, category, usage }
})
