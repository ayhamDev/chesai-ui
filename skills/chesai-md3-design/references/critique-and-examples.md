# Critique and worked examples

Use this for a design audit, a substantial screen implementation, or a future behavioral evaluation of this skill. Review the actual artifact, not the eloquence of its design rationale. A correct component API is necessary but does not establish design quality.

## Review in order of impact

### 1. Can the user do the work?

Run a concrete scenario with realistic content. For example: find an overdue request, inspect it, change its owner, recover from a save failure, and return to the same filtered list. Observe control discoverability, state preservation, feedback, and the return path.

An unreachable action, unusable compact flow, lost input, misleading status, or missing keyboard path is a blocker. Do not polish shadows while these remain. If the work is a static concept, describe the intended behavior and label it unimplemented.

### 2. Does the composition direct attention?

Inspect the rendered screen at normal working size and as a small thumbnail. Identify what actually draws the eye first, second, and third, then compare that with the brief. A grayscale view can help distinguish luminance/scale from hue, but is not a substitute for contrast measurement.

Look for competing headlines, too many strongly filled controls, weak group separation, inconsistent edges, or decorative content occupying the primary working area. Repair the biggest competing region before tweaking individual icons.

### 3. Does the detail support sustained use?

Check row anatomy, type roles, line-height, numeric alignment, label clarity, wrapping, icon weight, target size, and the spacing within/between groups. Verify actual final foreground/background contrast. Do not use apparent readability in a downscaled screenshot as evidence.

Check focus-visible, selected + hover, disabled, pressed, loading, and error states where relevant. Selected and focused are different states and may appear together. Tooltips supplement labels; they should not be the only route to essential information.

### 4. Does the design survive a different context?

For a substantial screen, inspect a compact viewport (roughly 360–390px wide), a typical desktop viewport, and any intermediate width where the layout changes. Include realistic height. Inspect both light and dark themes when supported, then the preferences and unusual content most likely to stress this screen.

High-value stress cases include 200% zoom, long/translatable labels, empty and crowded content, expanded details, an open keyboard/sheet, a different theme seed or contrast level, and RTL when the product supports it. Test reduced motion for added animation. Prioritize applicable cases rather than multiplying every combination into an exhaustive matrix.

For a minor edit, inspect the affected region and relevant regression only. Reuse existing checks that already cover unchanged behavior.

## Record a finding with a repair

Use a concrete note:

> At 390px, the date toolbar wraps into three lines and pushes the first event below the fold. Keep the date and previous/next controls in one group; move view mode into a compact menu. Recheck a long month name and keyboard focus.

Avoid “make it more premium” or “add polish.” Specify **where → user effect → cause → proposed repair → verification**. If the cause is unclear, compare two small alternatives and inspect both with the same content.

| Dimension | Evidence of a good result | Warning sign |
| --- | --- | --- |
| Purpose | Main task and scope are immediately identifiable | Header says little; content is a component assortment |
| Hierarchy | Observed reading order matches the brief | Every panel and button has equal emphasis |
| Grouping | Spacing, alignment, and containment explain relationships | Many unrelated cards or excessive separators |
| Typography | Useful scale differences; readable metadata; sound semantics | All text is small gray or all headings are bold |
| Product character | A coherent expressive choice serves this product | Generic decoration or every surface shouting |
| Interaction | Real results, visible feedback, recovery, and back path | Happy-path screenshot with inert controls |
| Adaptation | Narrow mode preserves useful work | Desktop columns wrap into an incoherent stack |
| Accessibility | Contrast, targets, focus, labels, and zoom are checked | “The library is accessible” is the only evidence |

Do not average blockers away with a numeric beauty score. Finish when the important problems are resolved and the agreed scope is covered; report any unverified behavior precisely.

## Worked transformations

These are examples of decisions, not layouts to reuse indiscriminately. The same theme can support all of them.

### A. An operations overview that became a card collection

**Brief:** A coordinator needs to identify delayed deliveries and assign follow-up. A first draft has a large welcome heading, four equally colorful KPI cards, a decorative line chart, recent activity, and an upgrade panel.

**Diagnosis:** The screen organizes component types rather than the coordinator's decisions. Completed work and urgent exceptions look equally important.

**Revision:** Lead with the current operational scope and a concise exceptions summary. Give the actionable queue most of the area. Put a small trend with explicit timeframe and units beside it only if it helps predict workload. Use quiet rows for ordinary items and a labeled status treatment for delays. Put assignment in row/detail context. Move promotional content out of the working region unless it is part of the brief.

**Type and tone:** A 28/36 page title can orient; row subjects can use 16/24; timestamps can use readable 12/16 metadata. Give one consequential summary a larger role if it helps. Preserve the theme; the improvement comes from priority, area, and grouping.

**Compact:** Summary then queue; selecting an item opens detail with a return path. Do not stack the desktop detail under the entire queue.

**Verify:** Can someone identify an exception and assign it without scrolling past unrelated content? Are “all clear,” filtered-empty, partial-load, and save-failure states distinct?

### B. An expressive session timer

**Brief:** A person starts a focus session, monitors remaining time, and pauses or ends it. A first draft puts time, history, statistics, and settings into equal cards.

**Diagnosis:** Equal region sizes imply equal importance. The thing being monitored is no easier to read than historical metadata.

**Revision:** Give the live time a display role and a generous uninterrupted area. Put the session label and state nearby. Group Pause/Resume and a less prominent End action; disclose end confirmation only if losing work warrants it. Place history below or in supporting context. A restrained shape change on the active control can add character if its label and state stay clear.

**Compact:** The timer remains the main task. Controls stay reachable, including at enlarged text; history becomes optional context.

**Verify:** Values do not shift width, pause feedback is immediate, background/resume state is accurate, and reduced motion still communicates the transition. Large type is useful here; it is not a reason for giant numerals on every dashboard.

### C. A settings page styled like a dashboard

**Brief:** An account owner changes notification preferences. A first draft uses separate floating cards with an icon, headline, and button for every setting.

**Diagnosis:** Repeated page-like cards inflate simple controls and hide relationships. The page looks rich but makes comparison slow.

**Revision:** Group related settings into a readable column with section titles. Use consistent rows: label and short explanation at the start, current control/value at the end. Give account identity little space unless needed to avoid editing the wrong account. Use shared containment or a few separators, not a nested card per field. Explain dependent settings and save behavior locally.

**Compact:** Index then section when navigation is extensive; controls can move beneath long text. Preserve touch targets and visible labels.

**Verify:** A user knows which account is affected, whether changes save immediately, why a control is unavailable, and how to recover from failure. A restrained screen can still be distinctive through type, alignment, and carefully chosen grouping.

### D. An empty schedule that was filled with decoration

**Brief:** Show the selected day's meetings. There are none. A first draft adds statistics, productivity tips, several suggested actions, and a generic celebratory illustration.

**Diagnosis:** The design obscures a simple, meaningful state.

**Revision:** Keep the date and date navigation. State that no meetings are scheduled for that date, and offer the relevant creation action. Leave the canvas spacious. Include an illustration only when it adds suitable tone. Retain notices only if they communicate real information affecting this task.

**Verify:** Change the day, create a meeting, and return. The empty and populated layouts should feel like states of the same product. Whitespace is justified by the state rather than by an arbitrary minimalism rule.

## Evaluation prompts for future skill revisions

These are reusable evaluation cases, **not a record of tests already run**. Give the skill and a brief to an evaluator when evaluation is in scope; inspect the output before adding more instructions. A model following a checklist is not proof of usability.

| Brief | Observable behavior to inspect |
| --- | --- |
| “Create a modern support queue for daily triage with 200 tickets.” | Content-led rows and usable density; scoped filtering/assignment; no fabricated KPI hero; preserved selection/back path |
| “Create an expressive focus timer with session history.” | Distinctive focal time and complete controls; supporting history; no suppression of all expression in the name of restraint |
| “Design a file browser for desktop and narrow windows.” | Appropriate comparison model; long-name handling; deliberate compact selection/detail behavior; clear scroll ownership |
| “Improve this settings screen; keep our brand and functionality.” | Grouping/type/spacing improve without replacing the palette or expanding scope; coherent form and error behavior |
| “Use the attached neon dashboard as inspiration for a calm appointment app.” | Relationships transfer; palette and exact arrangement do not; schedule-specific hierarchy and states |
| “Make a small label-spacing correction in an existing screen.” | Local correction; no forced research, new shell, extra theme, or wholesale redesign |
| “Build the same task for Arabic, large text, and dark mode.” | Appropriate reading order, logical spacing, usable wrapping, measured contrast, visible focus, and reachable actions |

For an implementation evaluation, retain the brief, viewport/state captures, actual task result, and the most significant finding. Attribute failures to the missing design decision, not automatically to a missing universal prohibition.
