---
name: chesai-md3-design
description: Design and implement product-specific Material You app layouts and UX with chesai-ui. Use for React frontend screens, shells, and flows that should follow MD3 principles rather than look like a generic component demo.
---

# Chesai UI — Material You product design

Use this skill for product UI, not for a decorative reskin. The target is the *layout grammar* of a good Material You product: clear product chrome, navigation that matches the information architecture, calm working space, contextual actions, and states that help a user continue their task.

`chesai-ui` is MD3-inspired but has its own APIs and visual language. Keep the product's existing components, tokens, theme behaviour, and conventions authoritative. Do not copy Google branding, artwork, or screen layouts verbatim.

For a full app shell, responsive screen, or design audit, read [layout and UX reference](references/layout-and-ux.md) before writing JSX.

## Start with the screen architecture

Before composing components, write a short screen plan in the implementation notes or PR description:

1. **Job:** the one user task this screen makes easiest.
2. **Pattern:** feed, list–detail, supporting pane, settings hub, schedule/workspace, or a deliberately simpler single-task screen.
3. **Navigation:** product navigation, local/scope navigation, and the number of stable destinations in each. Do not confuse a two-item feature switcher with product-wide navigation.
4. **Responsive transformation:** what changes at compact, medium, and expanded widths. A reflow is not automatically a mobile design.
5. **States:** loading, empty, populated, error, and any permission/security or success state that changes the user's next action.

If a proposed screen starts as a hero, a grid of unrelated cards, three metrics, and an illustration, stop and identify the user workflow instead. That is a marketing/demo default, not a product layout.

## Build a shell, then the working region

Most desktop product screens have four independent regions:

```text
product bar        brand / global search / global actions / account
product navigation stable destinations and creation entry point
working context    page title, date/filter/breadcrumb, contextual actions
working canvas     the task, its data, and the current state
```

- Let the product bar handle product-level commands such as search, account, help, or an always-available creation action. Do not put every page action into it.
- Use `AppBar` when its behaviour fits; compose a custom bar only when the product needs richer global controls. Keep it visually quiet and structurally stable.
- Choose navigation by destination count and breakpoint. Use `BottomTabs` for 3–5 stable compact destinations, `NavigationRail` for a small persistent set on wider screens, and `Sidebar` for a grouped settings/product hierarchy with many destinations. For temporary or local scope choices, use the smallest suitable control rather than pretending it is global navigation.
- Establish the working context close to the canvas: a date navigator belongs with a schedule, a filter with a list, and a security notice with the area it affects.
- Give the working canvas room. Broad unbroken surface is intentional when the task is sparse; do not fill it with ornamental cards.

### Chesai app-shell contract

When an app bar or bottom navigation must remain visible during in-app scrolling, build a real app frame instead of relying on document flow:

```text
relative, overflow-hidden app frame
├─ AppBar with scrollContainerRef
├─ the one overflow-y-auto working scroll container (top padding accounts for the bar)
└─ BottomTabs in an absolute/sticky bottom layer outside that scroll container
```

- `AppBar` is positioned within its parent frame and tracks the supplied `scrollContainerRef`; it is not a replacement for an ordinary `<header>` in a document-scrolling page. Account for its MD3 height in the scroll content (`64px` small/center, `112px` medium, `152px` large) or use the app's existing shell helper.
- `BottomTabs` provides the navigator and active treatment; pin its wrapper to the app frame and reserve bottom space in the scroll content. Do not append it after page content and expect it to stay visible.
- Use raw semantic layout elements only to establish regions (`main`, `nav`, `section`, `article`) that Chesai does not own. Use Chesai components for interactive controls, navigation, rows, cards, app bars, fields, state feedback, and surfaces.
- A showcase must have one scroll owner. Make the preview root viewport-height and `overflow-hidden`, keep the rail and bars outside the content scroller, and give only the working canvas `overflow-y-auto`. Do not combine a fixed-height demo frame with a document-height page.

## Select a layout pattern deliberately

- **Schedule or operational workspace:** a compact contextual toolbar, optional state/notice region, then the day, timeline, or focused empty state. Put creation at the moment and scope where it is useful.
- **Settings hub:** persistent grouped navigation on expanded screens, a restrained identity/search or section context, and a narrow readable working region. Settings are not a KPI dashboard.
- **List–detail:** on medium and wider screens, keep selection and detail visible when that makes comparison faster. Build that desktop split with Chesai `Resizable`: give the non-flex list/supporting pane a useful `defaultWidth` and `minWidth`, use a restrained `Resizable.Handle`, and let the task pane flex. Inspect the local Gmail split-view showcase before composing it. On compact screens, show the list *or* detail as separate navigation states—never a vertically stacked fake split view or a squeezed desktop split.
- **Supporting pane:** reserve roughly two-thirds for the primary task and one-third for contextual tools, metadata, or related activity. Hide, sheet, or route the support content on compact widths.
- **Feed:** use for a browsable stream of independently actionable content. Preserve scan rhythm and filtering; do not turn it into a tiled card wall by default.

Do not use a split view merely because there is room. It earns its space only when keeping both contexts visible improves a real decision.

## Material You visual hierarchy

- Use the library's semantic color roles and tonal surface containers. Build elevation through `surface-container-*` before adding shadows; reserve shadows for floating/transient layers.
- Let one or two things carry emphasis: the primary action, active navigation indicator, a system state, or a consequential selection. `primary-container`, `secondary-container`, and `tertiary-container` communicate roles; they are not alternating row colors.
- Use `Typography` for a restrained scale: a title for the working context, titles for groups, body for explanations, labels for controls and metadata. A large headline is for a true page transition or human moment, not routine CRUD.
- Use shape as a repeated grammar. `minimal` is usually the default; `full` works for active indicators and inviting actions. Avoid applying large rounded rectangles to every region.
- Keep copy specific to the task: “No meetings scheduled today” and a relevant next action are stronger than motivational headline copy.

### Borders are opt-in

Do **not** add a border to cards, sections, navigation, or every repeated row by default. Establish grouping first with spacing, tonal surface roles, and shared containment. Use a hairline `outline-variant` boundary only when it communicates a real division: a resizable/split pane, a dense table relationship, a field outline, or a persistent navigation separation that would otherwise be ambiguous. `Card` should normally be used without `bordered`; a feed item does not need a box around it merely because it is clickable.

Use only role-based theme utilities such as `bg-surface`, `bg-surface-container-low`, `text-on-surface-variant`, and `border-outline-variant` unless a fixed brand color is explicitly required. Pair each background role with its appropriate `on-*` foreground role.

## Design states as part of the flow

- An **empty state** belongs in the real working canvas, after the navigation and contextual controls that orient the user. Explain what is absent and offer one appropriate next action. Use `EmptyState` with `variant="default"` for a quiet canvas; do not wrap an empty state in a card unless it is one item among peers.
- A **notice** should be scoped, actionable, and visually quieter than the task. Use a tonal container for informative/security context, not a warning-colored banner by default.
- A **loading state** should retain the final layout's information hierarchy. A lone center spinner erases orientation.
- An **error state** should preserve recoverable work, name the failed action, and offer a retry or next step.
- Treat selected, disabled, focus-visible, hover, keyboard, long-label, RTL, and narrow-width states as design states too.

## Use Chesai components for behaviour, not decoration

- Use `Button`, `IconButton`, `Input`, `Select`, `Combobox`, and `Textarea` for accessible controls; `Item` for repeated rows; `EmptyState`, `Skeleton`, `Progress`, and `LoadingIndicator` for state feedback.
- Use `Sidebar`, `NavigationRail`, `BottomTabs`, and `AppBar` according to the architecture above. Do not include each merely to demonstrate the library.
- Inspect the local component story/source or deployed docs before relying on a prop. APIs and variants in chesai-ui take precedence over examples from Material Design, Material Web, Compose, or another component system.
- Reuse the theme provider, seed colour, contrast, font, direction, and motion controls already used by the app. Do not introduce raw Tailwind palette colors, random gradients, glass effects, or arbitrary shadows to manufacture hierarchy.

## Responsive and interaction rules

- Use the 8-point spacing rhythm (4, 8, 16, 24, 32, 48) and intentional page margins. Use the exact breakpoints and layout transformations in the reference when a full shell is involved.
- On compact widths, prioritize one task and one reading path. Move supporting content behind a route, sheet, or progressive disclosure instead of merely wrapping columns.
- Animate spatial changes and clear cause/effect: a selection indicator moves, a pane opens from its trigger, a state changes. Avoid perpetual decoration and respect reduced motion.
- Maintain semantic HTML, explicit labels, keyboard access, visible focus, logical tab order, touch targets, contrast across themes, and accessible names for icon-only controls.

## Final product-layout review

Before delivery, verify:

- A user can name the screen's job, active location, and next meaningful action within a few seconds.
- Global chrome, navigation, context controls, and task canvas are visually and semantically distinct.
- The chosen pattern matches the workflow; any rail, drawer, pane, or card has a reason to exist.
- Compact and expanded modes are intentionally different where the task needs them.
- Empty/loading/error/security states preserve orientation and offer an appropriate recovery or next action.
- Tonal hierarchy, type, shape, and motion are restrained and coherent, using chesai-ui's tokens and components.

## Sources

- [Material Design 3](https://m3.material.io/)
- [Canonical layouts overview](https://m3.material.io/foundations/layout/canonical-examples/overview)
- [Material expressive design research](https://design.google/library/expressive-material-design-google-research)
- [Google Workspace](https://workspace.google.com/)
