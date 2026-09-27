# Layout and UX reference

Read this reference when designing a full application shell, a responsive multi-region screen, or reviewing an existing screen for generic component-library patterns.

## What to take from Material You

Material You is not a checklist of rounded cards and pastel surfaces. Its product quality comes from an interface that makes hierarchy and context easy to read:

- stable product chrome lets a user recognize where they are;
- navigation reflects the product's actual information architecture;
- a contextual row or pane keeps the current task oriented;
- tonal roles distinguish emphasis without visual noise;
- empty, loading, and error states preserve the structure of the working area.

The official [Material canonical layouts](https://m3.material.io/foundations/layout/canonical-examples/overview) identify feed, list–detail, and supporting pane as starting patterns. Treat them as task models, not templates to copy.

## Responsive scaffold

Use these thresholds as a design starting point. The exact CSS implementation may use the project's existing responsive utilities.

| Window class | Width | Default frame |
| --- | ---: | --- |
| Compact | under 600 | One focused working route; bottom navigation for 3–5 stable product destinations |
| Medium | 600–839 | More page margin; consider a rail or two regions only when both aid the task |
| Expanded | 840–1199 | Persistent rail/drawer and a canonical multi-region layout are practical |
| Large | 1200–1599 | More breathing room; do not widen reading lines indefinitely |
| Extra-large | 1600+ | Preserve readable content widths and use extra space for useful support, not empty decoration |

Starting page margins / gutters: compact `16 / 8`, medium `24 / 16`, expanded `24 / 16`, large and extra-large `24 / 24` (margin / gutter). Use the 8-point spacing rhythm: 4, 8, 16, 24, 32, and 48.

### Pattern transformations

| Pattern | Compact | Medium and expanded |
| --- | --- | --- |
| Feed | One column with concise filters | Wider reading area or purposeful multi-column grouping |
| List–detail | List **or** detail; back navigation switches state | List about one-third, detail about two-thirds when simultaneous context aids work |
| Supporting pane | Primary task; support is a route, sheet, or disclosure | Primary task about two-thirds, supporting pane about one-third |
| Settings hub | Section list then a focused section route | Grouped persistent drawer plus readable section content |
| Schedule workspace | Date/context controls plus one day/state | Same controls with more horizontal workspace, not more cards |

Never vertically stack a desktop list and its detail view just because a CSS grid collapsed. That changes a selection workflow into an exhausting scroll.

### Chesai implementation for adjustable panes

An expanded list–detail or primary/supporting-pane screen must use the local `Resizable` component rather than a fixed CSS grid. Start from the working composition in `src/lib/components/resizable/Resizable.stories.tsx` (the Gmail split-view showcase): a fixed-width `Resizable.Pane`, a `Resizable.Handle`, and a `flex` task pane. Set a realistic `defaultWidth` and `minWidth` for the non-flex pane so a user cannot reduce an inbox, outline, or contextual list below a usable scan width. Keep the handle quiet (`variant="pill"` is appropriate for a clean product surface) and use a plain surface division rather than a card-like bordered column.

Use the resizable composition only where both panes are concurrently useful and the window is wide enough. Below that threshold, replace it with the focused compact state described above; do not leave a tiny resizable list beside a clipped detail pane. The app shell still has one vertical scroll owner: resizing changes width, not scrolling ownership.

## Navigation is hierarchy, not decoration

First count *stable product destinations*. Then choose the navigator:

| Situation | Preferred pattern |
| --- | --- |
| 3–5 top-level destinations on compact | `BottomTabs`, always labelled |
| 3–7 stable destinations on wider screens | `NavigationRail` with an active tonal indicator |
| Many destinations, categories, or settings sections | `Sidebar` / drawer grouped with labels and dividers |
| 1–2 choices inside one feature | Contextual tabs, segmented control, or local rail—not product navigation |

An active state should be clear through a tonal indicator, text weight, and location—not color alone. Product navigation, local scope navigation, and a filter should not compete for the same visual weight.

### Default rail and bar treatment

Navigation belongs to the application surface; it is not a sidebar card. A default desktop rail should sit flush against the same `surface` as the app, with no border, shadow, rounded rail container, or custom decoration. Its only strong visual treatment is the active destination indicator. Use a rail only for 3–7 app-wide destinations on larger windows. For 3–5 equivalent destinations on compact windows, use the labelled bottom navigation bar; it becomes the rail as space grows.

Top app bars span the application shell, including the space above the rail. The rail begins below the bar. Keep product chrome, rail, and pinned bottom navigation outside the working scroller. The working canvas owns the one vertical scrollbar; it reserves the bar/tab space with padding instead of nesting another scrolling frame.

```text
viewport-height app shell, overflow hidden
├─ top app bar (full width)
└─ body below the bar
   ├─ rail (wide only; same surface, fixed)
   └─ one scrolling working canvas
      └─ compact bottom navigation is pinned at the shell edge
```

## Product-screen observations from the supplied references

These are layout observations from the user's Google product screenshots. They are evidence of product grammar, not assets or layouts to reproduce.

### Operational schedule / Meet-like empty state

```text
top product bar: brand | global join/search field | global actions | account
left local rail: two feature destinations with labels
working context: date title + compact date navigator
state notice: one wide, low-emphasis safety/information band
working canvas: generous quiet space + centered illustration/status + one creation action
```

Useful decisions:

- The empty canvas is not “unfinished”; it makes the absence of scheduled work legible.
- The date, navigation, notice, empty state, and “New” action all speak to the same scheduling task.
- The strong action is repeated only where it is contextually useful, not scattered through a card grid.
- The rail is a small *local* mode switch. It does not mean every app needs a rail for two global destinations.

### Account / settings-hub home

```text
top product bar: product title | utility actions | account
left permanent drawer: many grouped settings categories with clear active state
centered subject area: identity/context
working tools: a search field and a few related shortcuts
quiet lower canvas: privacy/trust note constrained to readable width
```

Useful decisions:

- A settings hub with many categories earns a drawer; a rail or bottom bar would conceal the hierarchy.
- The page has a large quiet canvas because the main job is orientation and search, not simultaneous data scanning.
- Coloured category markers differentiate areas sparingly. In chesai-ui, use semantic roles and icons unless the product has an accessible established category-color system.
- The screen is centered around the user's relationship to the product, not a generic dashboard summary.

## Anti-pattern diagnostic

Flag a design for revision when several of these are true:

- It begins with a marketing slogan rather than the task or context.
- It uses a card as every section boundary, producing a floating tile wall.
- The same primary color fills actions, badges, navigation, and multiple cards.
- Desktop regions simply wrap on mobile instead of becoming routes, sheets, or a focused flow.
- Navigation is chosen because it looks “MD3,” not because destination count and hierarchy support it.
- Empty space is filled with fake statistics, placeholder charts, avatars, or decorative copy.
- Actions have no scope: creation, filter, account, and page actions appear together without a hierarchy.

Correct the information architecture first. Changing radius, color, or shadows cannot fix a screen with no task model.

## Sources

- [Material Design canonical layouts](https://m3.material.io/foundations/layout/canonical-examples/overview)
- [Material Design](https://m3.material.io/)
- [Google Workspace](https://workspace.google.com/)
- [Material 3 skill repository used only as a structural reference](https://github.com/hamen/material-3-skill)
