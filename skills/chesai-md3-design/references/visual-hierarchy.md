# Visual hierarchy and art direction

Use this when deciding how a screen should look, or why a competent implementation still feels generic. The numerical suggestions below are Chesai composition starting points, not universal Material requirements. Adjust them for actual content, task frequency, input, and accessibility.

## Contents

- Attention and composition
- Type scale and spacing
- Tonal hierarchy and contrast
- Shape, imagery, and motion
- Chesai implementation facts

## Attention: assign roles before assigning styles

Make an ordered inventory: **orientation → task/content → supporting evidence → action → incidental metadata**. The visual order can differ: a running timer should put time first; a permissions dialog should put the decision first. Explain that choice in the brief.

Think of emphasis as several independent controls: occupied area, position, whitespace, type size, weight, luminance contrast, saturation, imagery, and motion. Giving all of them to every component destroys hierarchy. A large area can be quiet; a small high-contrast action can be easy to find. Do not automatically make the action the largest object.

For each strong accent, identify its job. If it means selected, urgent, primary action, and decorative highlight on the same screen, redistribute emphasis. Reserve error treatment for an actual error or destructive consequence; normal metadata should not compete with it.

Useful composition decisions:

| Situation | Let this lead | Keep this subordinate |
| --- | --- | --- |
| Work queue | Subject/title and actionable status | Page greeting, row metadata, utility controls |
| Overview used to make a decision | Main trend or exception with timeframe | Secondary metrics, education, upgrade content |
| Timer or active session | Current value and current state | History, settings, navigation |
| Editor or photo viewer | The user's content | Toolbar and properties until needed |
| Settings | Section names, setting labels, current values | Descriptive help and decorative identity |
| Empty schedule | Selected date, absence of events, next action | Persistent product chrome |

### Compose in regions, then groups, then details

Sketch the silhouette with plain blocks before committing to component arrangement. Give the main task enough area to work; set the width of support from its content rather than dividing every screen into equal columns. Align page title, controls, and repeated content to a small set of shared edges. A visually centered heading above left-aligned dense data often breaks the reading path.

Within each region, group by relationship. The gap between groups should be visibly greater than the gap within one group. If you cannot tell what belongs together with the borders removed, revise the spacing or containment. Borders may still be the right final choice for tables and fields.

Use repeated geometry for repeated jobs. An asymmetric overview can give a trend more space than supporting metrics, but rows in a work queue should not have arbitrary widths, radii, and colors. Do not add whitespace uniformly: spend it around decisions, transitions, and content that needs attention; conserve it in repeated comparisons.

**Density is task-specific.** Aim for a comfortable amount of useful information visible at once. Too spacious forces unnecessary scrolling; too dense erases grouping and targets. Test with a realistic viewport height and data volume, not only an unusually wide screenshot. A large shell title should not consume half a compact working screen.

### Choose a recognizable character

Translate the desired feeling into coordinated choices. A precise daily work tool might use tight repeated rows, stable columns, quiet chrome, and immediate feedback. An occasional planning flow might use more generous section spacing, readable conversational headings, and grouped choices. A glanceable personal tool can use an oversized value, a distinctive silhouette, and responsive action feedback. These are directions to reason from, not three templates.

Carry the chosen character through several screens: heading cadence, row anatomy, control placement, and the same logic for emphasis. A new seed color should still leave the composition recognizable. Distinctiveness can come from a thoughtful timeline, a strong content crop, or an unusually clear comparison; it need not come from a decorative effect.

For data displays, write the question before choosing a chart. Keep units, timeframe, baseline, and comparison visible. Use aligned bars for magnitude or a line for a meaningful continuous trend when appropriate; a decorative sparkline cannot replace the actual value and context. Encode series with labels or patterns as well as hue, and offer an accessible data representation. Keep accent emphasis on the relevant exception or series instead of making every mark equally vivid.

## Typography: choose roles, then tune relationships

Material separates display, headline, title, body, and label roles. Its applying-type guidance also covers line-height, number alignment, and separate web versus Android typesetting. Use the semantic role first, then inspect the actual font's rendering. [Material: applying type](https://m3.material.io/styles/typography/applying-type)

These are **current local Chesai defaults**, verified in `src/lib/tailwind/typography.css`. They are CSS px values, not an instruction to copy native Android sp values. Theme overrides can change them.

| Role | Size / line height | Useful starting application |
| --- | --- | --- |
| `display-large` | 57 / 64 | Very short hero value when that value is the task |
| `display-medium` | 45 / 52 | Important total, time, or expressive opening |
| `display-small` | 36 / 44 | Main metric or spacious page title |
| `headline-large` | 32 / 40 | Page title with room to breathe |
| `headline-medium` | 28 / 36 | Compact page title or focal state |
| `headline-small` | 24 / 32 | Focused section, dialog, or state title |
| `title-large` | 22 / 28 | App bar or substantial section title |
| `title-medium`, `title-small` | 16 / 24, 14 / 20 | Group title or emphasized row text |
| `body-large`, `body-medium` | 16 / 24, 14 / 20 | Reading and ordinary product content |
| `body-small` | 12 / 16 | Short supplementary metadata |
| `label-large`, `label-medium`, `label-small` | 14 / 20, 12 / 16, 11 / 16 | Controls and compact annotations |

Choose a small working subset; a screen rarely needs every role. For example, a file screen can start with 28/36 for orientation, 16/24 for groups, 14/20 for rows, and 12/16 for secondary metadata. A timer may legitimately pair a 57/64 value with 16/24 supporting text. These are different designs using one type system.

Diagnose type problems by their cause:

- **Everything reads equally:** enlarge or isolate the meaningful anchor, reduce weight on support, and create group spacing. Do not bold every label.
- **A giant title competes with work:** reduce its role or let it collapse with the app bar. Keep expressive scale in the actual content if useful.
- **Tiny gray text looks refined only in a mockup:** enlarge it, improve contrast, shorten the copy, or disclose it later. Do not shrink necessary content to preserve a screenshot.
- **Long headings or translations break:** allow wrapping and flexible heights. Never depend on manual line breaks for every viewport.
- **Numbers wobble or comparisons are slow:** use tabular figures and consistent unit/decimal alignment. Separate units from values with typography, not illegibly faint color.
- **Body copy feels tiring:** constrain the reading width (roughly 45–75 Latin characters is a starting heuristic), inspect line-height, and break text by meaning. Test Arabic or other scripts in their actual font rather than applying a Latin measure blindly.

Choose `as="h1"`, `as="h2"`, `as="p"`, etc. for document semantics independently of visual size. Avoid `Typography muted` for required secondary text without measurement: it uses opacity, not a semantic foreground role. Prefer `text-on-surface-variant` on surface backgrounds and verify the resulting contrast.

Keep the product's brand/plain fonts. Adding a fashionable display face everywhere rarely repairs weak hierarchy. If changing fonts is in scope, test actual labels, numerals, punctuation, and supported scripts before selecting one. Expressive type belongs where short text can carry character without slowing reading.

## Spacing: encode relationships

Use the existing spacing system. A practical rhythm uses 4px increments with frequent 8, 16, 24, 32, and 48px steps. The point is predictable relationships, not making every distance divisible by eight.

Starting relationships:

- Icon to label or metadata within a row: about 4–8px.
- Related controls or text blocks: about 8–16px.
- A group's internal padding: often 16–24px.
- Separation between meaningful sections: often 24–40px.

Inspect optical alignment after applying tokens. Icon glyphs, text line boxes, and visible letterforms do not occupy the same rectangle. Use component sizing and baseline alignment; avoid accumulating arbitrary negative margins. For nested containers, coordinate inset and corner radius so the inner and outer edges feel related, without overriding every component's shape.

## Tonal hierarchy: choose a few surface relationships

Material surface containers express emphasis, not a mandatory numeric elevation ladder. Assign a consistent region map and keep it stable across breakpoints. Pair accent fills with their matching `on-*` roles; use `on-surface` or `on-surface-variant` for surface families. `outline` can define an essential boundary; `outline-variant` is a quieter separator and may be insufficient as the only cue for a target. [Material color roles](https://m3.material.io/styles/color/roles), [color system](https://m3.material.io/styles/color/system/overview)

An illustrative Chesai map:

| Region | Possible role | Reason |
| --- | --- | --- |
| Product shell | `surface` | Stable, low-distraction environment |
| Working area | `surface` or `surface-container-lowest` | Clear content plane, selected in context |
| Related settings or support group | `surface-container-low` | Shared containment without many outlines |
| Temporary layer | Component's sheet/dialog surface | Separate interaction context |
| Selected destination | Navigator's built-in active treatment | Find location quickly |
| Strong action | `Button` primary treatment | Discoverable next step |

This is a candidate map, not a required stack. If adjacent regions remain clear without a fill, keep the space open. Avoid using all five containers just because they exist. Do not assign a higher tone to every nesting level or add shadows to prove that a surface is elevated. Use shadows where overlap or a floating layer needs explanation.

Distinguish **salience** from **legibility**. A primary action can attract more attention than metadata while both remain readable. Dark mode needs its own visual inspection; simply making a screenshot darker or lowering all text opacity does not preserve the same hierarchy. Check selected, hover, disabled, and focus states in the actual generated theme, including a different seed and increased contrast when relevant.

For web text, WCAG AA requires at least 4.5:1 for ordinary text, or 3:1 for large text (at least 18pt, or 14pt bold; approximately 24px or 18.7px). Necessary non-text controls and state indicators have a 3:1 requirement against adjacent colors, subject to the criterion's exceptions. Measure the final composited colors; a token name alone is not a pass. [Text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

Do not use low-opacity text, translucent fills, or fixed literal colors to bypass semantic roles. If the product needs stable category colors or data series, use a deliberate theme-aware mapping with textual labels and accessible alternatives.

## Shape and imagery: give the product character deliberately

Material's expressive shape guidance encourages contrast between shapes and purposeful morphing, but does not give an abstract shape a universal semantic meaning. A starburst does not inherently mean success; labels and interaction still carry meaning. Use abstract shapes sparingly and coordinate them with type. [Material shape principles](https://m3.material.io/styles/shape/overview-principles)

Within a product, keep shape use consistent enough to aid recognition. Rounded actions can contrast with a quieter rectangular working canvas. A photo crop, a large numeral, or a single unusual silhouette can make a screen memorable. Applying the same oversized radius to the shell, every card, row, chip, and field removes that contrast.

Use real content imagery when it helps identify or understand the subject. An empty-state illustration should explain context or provide warmth while remaining subordinate to the state and next action. Decorative artwork, gradients, and glass can be valid in a brief that calls for them; they should not mask a weak layout or reduce readability. Do not import marketing mockup backgrounds, phone frames, and presentation shadows into the product itself.

Keep icons in a consistent family with compatible weight and optical size. Match them to nearby text without making the glyph itself the whole target. Use filled/outlined changes only as a consistent state convention, with semantics and labels. An icon tile before every heading can add noise without improving recognition; include it when it helps identify the object or action.

## Motion: communicate what changed

Material distinguishes spatial movement from effects such as opacity and color; effects should not overshoot. Its standard and expressive schemes serve different interaction moods. Preserve that distinction when using Chesai's existing motion rather than inventing unrelated springs per element. [Material motion physics](https://m3.material.io/styles/motion/overview/how-it-works)

Make transitions answer a question: where did the detail come from, what became selected, did the save finish, where did the deleted item go? Keep frequent interactions immediate. Repeated entrance choreography, bouncing table rows, and animated decoration make work harder to scan. A reduced-motion mode must still communicate state; `standard` animation is not the same as no motion. Avoid hover-only information and preserve logical focus during animated transitions.

## Local implementation facts

Verified against this repository on 2026-09-29; recheck source when the library version changes:

- `src/lib/components/typography/index.tsx`: `variant`, `as`, `bold`, `muted`; `muted` adds `opacity-60`. Default heading tags vary by visual role.
- `src/lib/components/button/index.tsx`: `primary`, `secondary`, `tertiary`, `outline`, `ghost`, `link`, `destructive`; default `md` is 48px high and `full` is pill-shaped. A small variant may need a larger target for touch.
- `src/lib/components/card/index.tsx`: `primary` maps to `surface-container-low`; `full` is a 24px radius, not a pill. Borders are opt-in. Choose a surface variant explicitly when it clarifies intent.
- `src/lib/components/item/index.tsx`: repeated rows and their states; `primary` is also a quiet surface. Use it for an actual repeated item, not as a container around unrelated sections.
- `src/lib/context/ChesaiProvider.tsx` and `ThemeProvider.tsx`: seed, brand/plain fonts, light/dark/system, standard/medium/high contrast, and standard/expressive animation. Direction is supplied through the layout provider. Do not add a competing theme system.

These are repository paths for inspection, not portable Markdown links: published consumers should use their installed source or the generated component docs.
