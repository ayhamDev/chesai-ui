# Layout and UX

Use this reference for application shells, responsive screens, navigation, multi-pane workflows, and state design. Compose around the work; do not begin by choosing a sidebar and filling a card grid.

## Choose the task model

| Work the user performs | Starting pattern | What earns its space |
| --- | --- | --- |
| Scan, triage, select, inspect | List–detail | Simultaneous context reduces back-and-forth |
| Create or edit with contextual tools | Primary canvas + supporting pane | Properties directly affect the selected subject |
| Browse independently actionable content | Feed or collection | Repetition makes discovery and comparison faster |
| Change preferences | Settings hub | Grouping reflects the user's mental model |
| Coordinate time | Schedule or timeline | Shared time axis helps decisions |
| Understand performance, then act | Overview + drill-down | Each metric answers a question with a timeframe |
| Complete a short focused task | Single-task screen or flow | Clear sequence, feedback, and recovery |

The first three correspond to Material's canonical layout families. Treat them as task models, not screenshots to reproduce. A two-thirds/one-third split can be a useful sketch, but actual pane minimums, readable width, and information needs determine the result. [Canonical layouts](https://m3.material.io/foundations/layout/canonical-examples/overview)

## Separate the scopes of control

A typical product shell has a product bar (global search/account), product navigation (destinations), working context (title/date/filter/selection), and a working canvas (task and data). A simple single-task screen may not need all four.

- Keep product-level search and account controls stable. Place page filters next to the content they filter.
- Count stable destinations before selecting a navigator. Compact `BottomTabs` suits roughly 3–5 peer destinations; a wider `NavigationRail` suits a small persistent set, often 3–7. Use `Sidebar` for grouped hierarchies and many destinations. These are starting ranges, not a law that requires inventing destinations.
- A two-item feature switch can be local tabs, a segmented control, or an established local navigator. Do not introduce global navigation just to make the screen look like Material.
- Give active location a persistent indicator and semantic state, distinct from temporary hover and keyboard focus. Keep destination labels unless the product has a justified, accessible compact alternative.
- Put creation where its scope is clear. A global “New” action and an empty-canvas creation action can coexist when they perform the same understandable job. Do not multiply competing primary actions merely to fill space.
- Selecting rows should reveal selection count and scoped batch actions without destroying orientation. Preserve filters and scroll when returning from detail.

Keep chrome visually calm. A rail ordinarily belongs to the shell, with little need for its own decorative card or shadow. A tonal change or restrained boundary may distinguish navigation when useful. A product bar can span the shell, while contextual tools belong to the active pane; do not force all products into one top-bar geometry.

## Adapt the task, not only the columns

Material's current guidance distinguishes adaptive layout from simple scaling: panes may be shown/hidden, reflowed, or presented as floating/docked surfaces; available space and input matter as well as device name. These are web-app design choices, not a reason to import native Android code. [Layout overview](https://m3.material.io/foundations/layout/understanding-layout/overview), [adaptive design](https://m3.material.io/foundations/layout/understanding-layout/adaptive-design)

Use the existing application's breakpoints. Material's familiar width bands can guide an initial sketch: compact below 600, medium 600–839, expanded 840–1199, large 1200–1599, and extra-large 1600+. Treat these as logical width guidance; native dp and CSS px are not universally interchangeable, and default Tailwind breakpoints do not match these bands. The component's actual available width determines when it stops working.

| Pattern | Compact behavior | Wider behavior |
| --- | --- | --- |
| List–detail | List **or** detail; back restores selection and scroll | Both panes when they have usable widths |
| Supporting pane | Main task; support moves to a route, sheet, or disclosure | Context beside the work, optionally resizable |
| Settings | Section index then focused settings | Grouped navigation + bounded reading width |
| Schedule | Day/agenda with visible date and relevant action | Larger time workspace or week view |
| Data overview | Key conclusion then evidence; accessible detail | Deliberate region sizes based on importance |
| Dense table | Keep essential comparison columns; disclose other fields | Full comparison; horizontal scrolling if the task requires it |

Do not vertically stack a list and its selected detail as a “mobile split view.” Do not turn a comparison table into cards if that removes necessary side-by-side comparison. Support keyboard, pointer, and touch; a narrow desktop window may still be keyboard-driven.

Start with margins near 16px on compact screens and 24px on wider screens, then tune gutters and readable widths to the composition. Avoid stretching a settings form across a large monitor or leaving a primary work area cramped beside oversized chrome. Specify reading order as well as visual order, and preserve meaningful state when crossing a breakpoint.

## Chesai shell contract

Inspect `src/lib/components/appbar/index.tsx`, `bottom-tabs/index.tsx`, and the app's existing shell before composing one.

For persistent in-app navigation, use a bounded, relative, overflow-hidden frame. `AppBar` is absolutely positioned inside its parent and observes `scrollContainerRef`. Supply the intended content scroller and reserve the bar's space in that content. Base heights are 64px for small/center, 112px medium, and 152px large; custom content and configured heights can change them. Do not hardcode these as universally sufficient, especially with bottom content or large text.

Place the pinned `BottomTabs` wrapper outside the working scroller and reserve its height plus applicable safe-area space. Appending it after a long list does not pin it. In flex layouts, `min-h-0` and `min-w-0` are often necessary for intended overflow and truncation.

**Assign scroll ownership deliberately.** A simple screen or showcase should have one working vertical scroller with bars outside it; avoid both document scrolling and an accidentally nested fixed-height demo. A true mail/editor workspace can legitimately have independently scrolling list and detail panes. Give each a bounded height and accessible focus path, retain pane scroll positions, and bind the app bar to the intended owner. Do not force independent panes into one giant scrolling page.

For an expanded adjustable list–detail or supporting-pane screen, use Chesai `Resizable`. Read `src/lib/components/resizable/Resizable.stories.tsx`, including its Gmail composition. Set a useful `defaultWidth` and `minWidth` on the non-flex pane, use a restrained `Resizable.Handle`, and let the task pane flex. The local handle's `pill` variant is available. Switch to focused compact navigation when both panes no longer fit. A simple static content grid does not need resizers.

For a document-scrolling page, semantic header/main flow is usually appropriate. Do not impose an app frame solely to use an animated app bar.

## Match the state to the user's next step

| State | Preserve | Provide |
| --- | --- | --- |
| Initial loading | Shell, context, approximate content structure | `Skeleton` or progress suited to the operation |
| Background refresh | Existing usable data | Modest progress indication, no blanking of the canvas |
| First-use empty | Location and purpose | One relevant creation/import action |
| No results | Query and filters | Clear/reset filters or revise query |
| Nothing scheduled today | Selected date and date navigation | Quiet `EmptyState`, optional creation |
| Partial failure | Successful content and unsaved input | Scoped explanation and retry |
| Blocking failure | Enough context to understand the failure | Recovery or route back |
| Permission-limited | Clear explanation of unavailable work | Appropriate next step, no inert mystery controls |
| Save or completion | The user's place in the workflow | Persistent resulting state and proportionate feedback |

Use `EmptyState variant="default"` directly in a quiet canvas; a surrounding card only makes sense if this is one peer region. State illustrations are optional. Notices should explain something consequential and remain at the affected scope. Do not add a generic security banner to every page.

For forms, keep labels visible, put errors by the relevant field, and preserve input after failure. Reserve dialogs for decisions that need interruption; use inline disclosure for ordinary help. Sheets/dialogs need appropriate focus entry, escape/cancel behavior, and focus restoration. Check those behaviors in the assembled flow, even when the underlying primitives implement them.

## Accessibility belongs in the geometry

Make targets large enough for the input. A practical touch goal is approximately 48 CSS px in this web library, with adequate separation; this is a design target, not a statement that WCAG mandates 48px. WCAG 2.2 AA's minimum target criterion is 24×24 CSS px with specified exceptions, including spacing. Do not shrink a critical action to its icon glyph. [WCAG target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

Check visible focus, logical keyboard order, text zoom, reachable sticky controls, and readable long labels. Use logical start/end spacing for RTL. Directional navigation may mirror; numbers, media playback, and data plots need deliberate treatment rather than mechanically flipping everything. Prioritize DOM order and semantics before visual repositioning.

## Quick architecture diagnosis

If a screen feels generic, identify the structural cause before changing decoration:

- Unrelated cards imply a dashboard where the task is actually triage.
- A hero headline delays access to daily work.
- A sidebar encodes implementation modules rather than user destinations.
- A chart lacks units, timeframe, comparison, or a decision it supports.
- Mobile hides primary capabilities or leaves three tiny desktop panes.
- Every section has its own border, radius, and background without a distinct role.
- An empty state explains nothing, or offers an action unrelated to the selected scope.

Use the worked examples and review prompts in [Critique and examples](critique-and-examples.md) to choose a concrete repair.
