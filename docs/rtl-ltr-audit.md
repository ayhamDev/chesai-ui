# RTL/LTR component audit

> This is the pre-fix audit snapshot. The subsequent implementation and verification are described in [RTL/LTR support](rtl-ltr.md). Findings below are retained as the original evidence, not a list of currently unresolved defects.

Date: 2026-09-20. This is a source audit of the current working tree, including existing uncommitted changes. No component implementation was changed for this audit.

## Scope and confidence

Scanned **107 component directories**, of which **101 contain implementation files**, covering **239 production TS/TSX/CSS files (60,409 lines)** under src/lib/components. Stories, tests and declarations were excluded from the counts. Also inspected the shared layout/provider direction wiring and installed Radix direction implementation.

Every directory appears in the inventory below. This is **not a full browser certification of every component, variant or dependency**: concrete styling rules and direction calculations were inspected, while complex gesture/virtualization outcomes are marked as risks requiring runtime reproduction. “No specific gap identified” means no concrete issue was found in the source scan, not guaranteed support. Directory counts do not equal individual exported component counts. Context-owned components such as ActionSheet need additional coverage.

## Main findings

1. **High: shared direction does not reach Radix direction context.** [LayoutProvider](../src/lib/context/layout-context.tsx) updates the HTML dir/style/classes, while [ChesaiProvider](../src/lib/context/ChesaiProvider.tsx) does not install a Radix DirectionProvider. Installed Radix useDirection resolves local prop, then Radix context, then ltr; it does not read HTML direction. Toolbar, NavigationMenu, menus, horizontal Accordion and Slider therefore need direction integration. Passing explicit dir can already address individual primitive behavior, but cannot fix custom surrounding styles.
2. **High: horizontal motion and scroll calculations assume LTR.** [Tabs](../src/lib/components/tabs/index.tsx) checks scrollLeft against positive bounds and translates panels by -activeIndex * width. [Slider](../src/lib/components/slider/index.tsx) positions custom ticks and segments from the left. [VirtualList](../src/lib/components/virtual-list/index.tsx), [virtual layouts](../src/lib/components/layouts) and [Material3Carousel](../src/lib/components/material3-carousel) need RTL geometry/gesture verification. These can affect functionality, not only appearance.
3. **Medium: form controls are inconsistent.** Input has logical start/end styles, but Select, NumberInput, Textarea, DateInput, InputGroup, ComboBox, MultiSelect and TimePicker retain physical label, icon or stepper placement.
4. **Medium: grouped shapes, alignment and directional icons need migration.** Checkbox/RadioGroup labels, Chip icons, AvatarGroup overlaps, SplitButton/Card/Item corners, Table headings, DataTable arrows, Breadcrumb separators and TreeView indentation have physical-side assumptions.
5. **Medium: some existing RTL support uses global or stale direction.** Switch, Sidebar and NavigationRail use shared global context; Resizable/Stepper read the document; DatePicker caches document direction on mount. A local dir override or runtime toggle is not consistently handled. ElasticScrollArea's gesture hook handles RTL offsets, but its shadow detection still uses LTR bounds.

## Recommended fix order

1. Define one effective-direction contract: explicit component direction, nearest direction scope, then application default. Bridge that direction to Radix and preserve it across portals. Decide how locale is provided independently for date/number formatting.
2. Migrate logical UI spacing/alignment: ms/me, ps/pe, start/end, text-start/end, border-s/e and rounded-s/e. Mirror navigation icons only where their meaning is logical previous/next or expand/collapse.
3. Normalize horizontal offsets and coordinate transforms for tabs, carousels, sliders and virtualization. Preserve intentionally physical map/canvas coordinates and explicit side=left/right APIs.
4. Verify global LTR/RTL, runtime switching and opposite-direction nested scopes. Include portalled menus, arrow-key navigation, touch dragging, both horizontal edges, grouped shapes and Arabic/Latin mixed content.

## Component inventory

| Directory | Assessment | Evidence / follow-up |
|---|---|---|
| [accordion](../src/lib/components/accordion) | Direction integration gap | Radix direction is not connected to LayoutProvider; horizontal keyboard behavior needs effective dir forwarding. |
| [action-sheet](../src/lib/components/action-sheet) | No implementation here | Directory contains stories; implementation lives in context/ActionSheetProvider and needs separate behavioral coverage. |
| [adaptive-grid](../src/lib/components/adaptive-grid) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [alert](../src/lib/components/alert) | Styling gap | Action uses ml-auto rather than logical start margin. |
| [appbar](../src/lib/components/appbar) | Styling gap | Leading/action slots use -ml-2, pl-2, ml-auto and -mr-2. |
| [avatar](../src/lib/components/avatar) | Styling gap | AvatarGroup overlap uses marginLeft. |
| [badge](../src/lib/components/badge) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [blocks](../src/lib/components/blocks) | No implementation here | No production TS/TSX/CSS file in this directory. |
| [bottom-tabs](../src/lib/components/bottom-tabs) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [bouncy-box](../src/lib/components/bouncy-box) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [breadcrumb](../src/lib/components/breadcrumb) | Styling gap | Default ChevronRight separator does not mirror. |
| [button](../src/lib/components/button) | Mostly inherited | Normal flex/gap layout inherits direction; loading-icon animation uses physical margins and merits a transition check. Centered spinner positioning is valid. |
| [button-group](../src/lib/components/button-group) | Logical styling present | Grouped borders/corners use logical start/end utilities. |
| [card](../src/lib/components/card) | Styling gap | Horizontal grouped corners use physical rounded-l/rounded-r. |
| [carousel](../src/lib/components/carousel) | No implementation here | No production TS/TSX/CSS file in this directory. |
| [charts](../src/lib/components/charts) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [chat](../src/lib/components/chat) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [checkbox](../src/lib/components/checkbox) | Styling gap | Label spacing uses ml-3. |
| [chip](../src/lib/components/chip) | Styling gap | Start/end icon margins use mr-2/ml-2. |
| [code-editor](../src/lib/components/code-editor) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [color-picker](../src/lib/components/color-picker) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [combobox](../src/lib/components/combobox) | Styling gap | Physical selection/icon margins and padding remain. |
| [command](../src/lib/components/command) | Styling gap | Search icon uses mr-3; shortcuts use ml-auto. |
| [context-menu](../src/lib/components/context-menu) | Direction + styling gaps | Radix direction bridge is missing; physical item padding, submenu indicators or shortcut alignment also need review. |
| [data-display](../src/lib/components/data-display) | Styling gap | Suffix spacing uses ml-2. |
| [data-table](../src/lib/components/data-table) | Partial support | Sticky scrolling has RTL handling, but pagination arrows and toolbar/header spacing still need mirroring/logical styles; also inherits Table header alignment gap. |
| [date-input](../src/lib/components/date-input) | Styling gap | Floating labels use left-* and ml-1. Segment order follows React Aria locale, which is a separate setting from page direction. |
| [date-picker](../src/lib/components/date-picker) | Partial support | Calendar caches document direction on mount; dynamic toggles and nested dir can disagree with rtl: icon styles. Additional physical padding remains. |
| [device](../src/lib/components/device) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [dialog](../src/lib/components/dialog) | Styling gap | Basic header forces text-left; centered drag handle is valid. |
| [divider](../src/lib/components/divider) | No specific gap identified | Physical line/centering/floating-position coordinates are not by themselves RTL defects. Check scoped direction and portals where applicable. |
| [dropdown-menu](../src/lib/components/dropdown-menu) | Direction + styling gaps | Radix direction bridge is missing; physical item padding, submenu indicators or shortcut alignment also need review. |
| [dropzone](../src/lib/components/dropzone) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [elastic-scroll-area](../src/lib/components/elastic-scroll-area) | Partial support | Elastic gesture hook handles negative RTL scroll offsets, but shadow detection still assumes positive scrollLeft. |
| [empty-state](../src/lib/components/empty-state) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [fab](../src/lib/components/fab) | Styling gap | Extended label animation uses marginLeft. |
| [fab-menu](../src/lib/components/fab-menu) | Styling gap | Logical align=start/end maps to physical left/right. Explicit left/right expansion options are a separate physical API. |
| [field](../src/lib/components/field) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [floating-panel](../src/lib/components/floating-panel) | Review by variant | Explicit physical side placement can be intentional; define whether logical start/end placement is needed. |
| [full-calendar](../src/lib/components/full-calendar) | Partial support | Uses direction context and flips navigation; physical event/popover spacing and side-panel borders remain. Drag geometry needs runtime verification. |
| [icon-button](../src/lib/components/icon-button) | No specific gap identified | Physical line/centering/floating-position coordinates are not by themselves RTL defects. Check scoped direction and portals where applicable. |
| [image](../src/lib/components/image) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [infinite-scroll](../src/lib/components/infinite-scroll) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [input](../src/lib/components/input) | Logical styling present | Floating labels and alignment already use start/ms/text-start; left/right matches in scan are migration comments. |
| [input-group](../src/lib/components/input-group) | Styling gap | Slots named start/end are implemented using left-3/right-3. |
| [install-command](../src/lib/components/install-command) | Styling review | Physical copy/action placement; keep command text LTR while checking surrounding UI alignment. |
| [item](../src/lib/components/item) | Styling gap | Horizontal grouped corners and some content spacing use physical sides. |
| [kanban](../src/lib/components/kanban) | Behavioral review needed | No direct directional styling defect identified; verify drag order and keyboard movement in RTL. |
| [kbd](../src/lib/components/kbd) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [layout-router](../src/lib/components/layout-router) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [layout-toggle](../src/lib/components/layout-toggle) | Direction support present | Uses shared direction context. |
| [layouts](../src/lib/components/layouts) | Behavioral review needed | VirtualFlex/Grid/Masonry place cells using physical left coordinates; horizontal virtualization needs explicit direction policy and tests. |
| [lexical-editor](../src/lib/components/lexical-editor) | Partial support | Text theme has ltr/rtl classes, but list indentation and surrounding controls include physical styling. |
| [list](../src/lib/components/list) | No implementation here | No production TS/TSX/CSS file in this directory. |
| [loadingIndicator](../src/lib/components/loadingIndicator) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [location-picker](../src/lib/components/location-picker) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [map](../src/lib/components/map) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [material3-carousel](../src/lib/components/material3-carousel) | Behavioral risk | Horizontal drag delta/index calculation is LTR-based, and items use marginRight; verify gestures against RTL flex order. |
| [medium-text-editor](../src/lib/components/medium-text-editor) | Styling gap | List indentation uses padding-left. |
| [menubar](../src/lib/components/menubar) | Direction + styling gaps | Radix direction bridge is missing; physical item padding, submenu indicators or shortcut alignment also need review. |
| [multi-select](../src/lib/components/multi-select) | Styling gap | Badges, selection indicators and icons use physical spacing. |
| [navigation-menu](../src/lib/components/navigation-menu) | Direction + styling gaps | Radix direction bridge is missing; physical item padding, submenu indicators or shortcut alignment also need review. |
| [navigation-rail](../src/lib/components/navigation-rail) | Partial support | Uses global layout context; nested direction overrides and remaining physical styles need verification. |
| [number-input](../src/lib/components/number-input) | Styling gap | Stepper is fixed right with rounded-r corners; labels and padding are physical. |
| [otp-field](../src/lib/components/otp-field) | Logical styling present | Uses logical spacing; verify intended numeric input order separately from surrounding direction. |
| [phone-input](../src/lib/components/phone-input) | Partial support | Number area intentionally isolates LTR; country selection UI still has physical alignment/spacing. |
| [playlist-studio](../src/lib/components/playlist-studio) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [popover](../src/lib/components/popover) | No specific gap identified | Physical line/centering/floating-position coordinates are not by themselves RTL defects. Check scoped direction and portals where applicable. |
| [progress](../src/lib/components/progress) | Styling gap | Linear determinate gap uses marginRight; indeterminate origin/motion remains left-based. Circular progress is direction-neutral. |
| [pull-to-refresh](../src/lib/components/pull-to-refresh) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [qr-code](../src/lib/components/qr-code) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [radio-group](../src/lib/components/radio-group) | Styling gap | Label spacing uses ml-3. |
| [resizable](../src/lib/components/resizable) | Partial support | Reads document direction on drag start; does not resolve nearest local dir override. |
| [reverse-infinite-scroll](../src/lib/components/reverse-infinite-scroll) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [search-view](../src/lib/components/search-view) | Styling gap | Back arrow and search/action positions use physical directions. |
| [select](../src/lib/components/select) | Styling gap | Floating label uses left-*; selector icon uses right-* and padding uses pr-*. |
| [separator](../src/lib/components/separator) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [shallow-router](../src/lib/components/shallow-router) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [shape](../src/lib/components/shape) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [shaped-button](../src/lib/components/shaped-button) | No implementation here | No production TS/TSX/CSS file in this directory. |
| [sheet](../src/lib/components/sheet) | Styling gap | Header forces sm:text-left. Explicit side=left/right and corresponding corners are valid physical placement, not automatic bugs. |
| [sidebar](../src/lib/components/sidebar) | Partial support | Uses global direction context and RTL utilities; local overrides and residual physical styles need checking. |
| [skeleton](../src/lib/components/skeleton) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [slider](../src/lib/components/slider) | Direction + geometry gaps | Radix direction is not bridged; custom horizontal ticks/segments/end caps use physical left/right even when explicit dir reaches Radix. |
| [sortable-list](../src/lib/components/sortable-list) | Behavioral review needed | No direct directional styling defect identified; verify drag order and keyboard movement in RTL. |
| [split-button](../src/lib/components/split-button) | Styling gap | Joined button corners are physical left/right. |
| [stack-router](../src/lib/components/stack-router) | Styling review | Back icon is ArrowLeft; verify direction policy for route transitions. |
| [stepper](../src/lib/components/stepper) | Partial support | RTL utilities exist but JS reads document direction rather than scoped reactive direction. |
| [swipeable](../src/lib/components/swipeable) | Review by variant | leftAction/rightAction are explicit physical gestures; add logical semantics only if product API requires them. |
| [switch](../src/lib/components/switch) | Partial support | Uses global context/document fallback for thumb direction; local dir override can disagree with inherited layout. |
| [table](../src/lib/components/table) | Partial support | Sticky header supports direction-aware scroll, but header cells force text-left and checkbox padding is physical. |
| [tabs](../src/lib/components/tabs) | Behavioral risk | Overflow edges assume positive scrollLeft; slide panels always translate by negative index and use LTR drag thresholds. |
| [taskbar](../src/lib/components/taskbar) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [textarea](../src/lib/components/textarea) | Styling gap | Floating labels and clear control use left/right rules. |
| [theme-controls](../src/lib/components/theme-controls) | Styling gap | FontPicker checks and nested groups use ml/pl/border-l. |
| [ThemeSwitch](../src/lib/components/ThemeSwitch) | No implementation here | No production TS/TSX/CSS file in this directory. |
| [time-picker](../src/lib/components/time-picker) | Styling gap | Trigger text-left, icon mr-2 and control/label ml-* remain. |
| [timeline](../src/lib/components/timeline) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [toast](../src/lib/components/toast) | Styling gap | Action alignment uses ml-auto. Sonner direction behavior must be checked separately; no claim that all toast placement should mirror. |
| [toolbar](../src/lib/components/toolbar) | Direction integration gap | Radix direction is not connected to LayoutProvider; horizontal keyboard behavior needs effective dir forwarding. |
| [tooltip](../src/lib/components/tooltip) | No specific gap identified | Physical line/centering/floating-position coordinates are not by themselves RTL defects. Check scoped direction and portals where applicable. |
| [tree-view](../src/lib/components/tree-view) | Styling + geometry gaps | Depth indentation, guide lines/drop indicators and text alignment are left-based; collapsed ChevronRight does not mirror. |
| [typography](../src/lib/components/typography) | Styling gap | Blockquote uses border-l/pl rather than border-start/padding-start. |
| [video-player](../src/lib/components/video-player) | Review by variant | Physical coordinates, media timelines, code or device geometry can be intentional. Verify surrounding labels/actions separately; do not blindly mirror coordinates. |
| [view-transition](../src/lib/components/view-transition) | No specific gap identified | Source scan found no concrete directional defect; inherited layout still needs visual verification. |
| [virtual-list](../src/lib/components/virtual-list) | Behavioral risk | Horizontal positioning/offset handling lacks automatic effective RTL integration; horizontal-reverse is an explicit axis mode, not language detection. |
| [website-studio](../src/lib/components/website-studio) | Styling gaps; geometry review | Builder lists/actions use text-left and physical icon margins/borders. Canvas/client coordinates should remain physical unless a separate mirroring policy is intended. |

## Representative source evidence

Line numbers reflect the audited working tree and may move after edits. These excerpts identify concrete rules; physical coordinates alone are not sufficient to classify a bug.

- select: [src/lib/components/select/select-styles.ts:147](../src/lib/components/select/select-styles.ts) — `let labelClasses = 'left-3'`

- select: [src/lib/components/select/select-styles.ts:153](../src/lib/components/select/select-styles.ts) — `labelClasses = 'left-6'`

- number-input: [src/lib/components/number-input/number-input-styles.ts:62](../src/lib/components/number-input/number-input-styles.ts) — `stepperWrapper: 'flex flex-col h-full right-0 absolute divide-y divide-outline-variant/20 overflow-hidden',`

- number-input: [src/lib/components/number-input/number-input-styles.ts:155](../src/lib/components/number-input/number-input-styles.ts) — `let labelClasses = 'left-3'`

- textarea: [src/lib/components/textarea/textarea-styles.ts:56](../src/lib/components/textarea/textarea-styles.ts) — `'absolute right-2 top-2',`

- textarea: [src/lib/components/textarea/textarea-styles.ts:125](../src/lib/components/textarea/textarea-styles.ts) — `let labelClasses = 'left-3'`

- input-group: [src/lib/components/input-group/index.tsx:26](../src/lib/components/input-group/index.tsx) — `start: "left-3 top-1/2 -translate-y-1/2",`

- input-group: [src/lib/components/input-group/index.tsx:27](../src/lib/components/input-group/index.tsx) — `end: "right-3 top-1/2 -translate-y-1/2",`

- checkbox: [src/lib/components/checkbox/index.tsx:79](../src/lib/components/checkbox/index.tsx) — `"ml-3 text-sm font-medium select-none transition-colors",`

- chip: [src/lib/components/chip/index.tsx:60](../src/lib/components/chip/index.tsx) — `<span className="mr-2 flex items-center">{startIcon}</span>`

- chip: [src/lib/components/chip/index.tsx:63](../src/lib/components/chip/index.tsx) — `{endIcon && <span className="ml-2 flex items-center">{endIcon}</span>}`

- table: [src/lib/components/table/index.tsx:63](../src/lib/components/table/index.tsx) — `"h-12 px-4 text-left align-middle font-semibold [&:has([role=checkbox])]:pr-0 transition-colors",`

- tree-view: [src/lib/components/tree-view/index.tsx:282](../src/lib/components/tree-view/index.tsx) — `paddingLeft: 'calc(0.25rem + ${depth * context.indentSize}px)',`

- tabs: [src/lib/components/tabs/index.tsx:227](../src/lib/components/tabs/index.tsx) — `const isAtStart = el.scrollLeft <= 1;`

- tabs: [src/lib/components/tabs/index.tsx:228](../src/lib/components/tabs/index.tsx) — `const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;`

- slider: [src/lib/components/slider/index.tsx:246](../src/lib/components/slider/index.tsx) — `? { left: '${percentage}%' }`

- slider: [src/lib/components/slider/index.tsx:441](../src/lib/components/slider/index.tsx) — `left: 'min(100%, max(0px, ${posStr}))',`

- elastic-scroll-area: [src/lib/components/elastic-scroll-area/index.tsx:133](../src/lib/components/elastic-scroll-area/index.tsx) — `left: hasScrollX && scrollLeft > 4,`

- elastic-scroll-area: [src/lib/components/elastic-scroll-area/index.tsx:134](../src/lib/components/elastic-scroll-area/index.tsx) — `right: hasScrollX && scrollLeft < scrollWidth - clientWidth - 4,`

- split-button: [src/lib/components/split-button/index.tsx:37](../src/lib/components/split-button/index.tsx) — `? "!rounded-l-[40px]"`

- split-button: [src/lib/components/split-button/index.tsx:39](../src/lib/components/split-button/index.tsx) — `? "!rounded-l-lg"`

- typography: [src/lib/components/typography/index.tsx:29](../src/lib/components/typography/index.tsx) — `"body-large border-l-4 border-primary pl-4 italic my-4 opacity-80",`

