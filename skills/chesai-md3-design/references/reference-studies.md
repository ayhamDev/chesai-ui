# Reference studies: learn the decisions

Research reviewed on **2026-09-29**. This is a reusable analysis of relationships and tradeoffs, not a gallery to imitate. The numbered attachments below refer to the original user-supplied image set; descriptions are self-contained so the skill does not depend on temporary image paths.

## Evidence and version boundaries

Google's Android 17 announcement is dated June 16, 2026. Its official interface demonstrations are relevant to adaptive contexts, but do not certify the exact version of every pictured Google app. Store screenshots are official promotional assets and may lag a shipped build. App releases, account rollouts, and OS releases have separate timelines. [Android 17 announcement](https://blog.google/products-and-platforms/platforms/android/android-17-features/)

The observations below come from official web imagery/demonstrations, documentation, current store listings, and the supplied screenshots. They are **not a hands-on audit of an Android 17 device**. Do not relabel older Material 3 Expressive material as an Android 17 redesign. When exact shipping behavior matters, verify the app version/device separately.

For each study, distinguish **observation** (visible or documented), **interpretation** (why it may help), and **application** (our design decision). An attractive screenshot alone does not establish usability, contrast compliance, or user preference.

## Google apps and Android

### Android 17: Messages in a floating window

**Evidence:** The June 2026 announcement visually shows a conversation in a bounded floating window over video content. The conversation retains its identity/header and composer, while the underlying activity remains recognizable. Google documents resizing/maximizing bubbles on large screens. [Official demonstration](https://blog.google/products-and-platforms/platforms/android/android-17-features/)

**Interpretation:** A reduced window still needs a complete local task, not a shrunken version of all desktop chrome.

**Application:** Test a Chesai pane at its actual minimum usable width. Keep identity, content, and the next action intact; move support out of the way. Use an appropriate sheet or pane when the workflow calls for it.

**Limit:** OS-level floating windows are not a reason to float arbitrary panels over every web app.

### Google Clock: glanceability through scale

**Evidence:** Google LLC's Clock listing, inspected September 29, 2026, reports a September update and Material 3 Expressive. The World Clock image gives the current time much more visual area than the location/date context; city-time pairs align in repeated tonal rows. The alarm editor groups schedule and settings below the chosen time and separates Save from Delete. [Official Clock listing and screenshots](https://play.google.com/store/apps/details?id=com.google.android.deskclock&hl=en_GB)

**Interpretation:** The large numeral is useful content. Repeated row alignment supports comparison; subordinate configuration does not compete with the value being edited.

**Application:** For time, session, or status tools, use a strong numeric anchor with readable units and tabular figures. Place secondary controls in a quieter repeated structure. Make save/delete consequences visually distinguishable.

**Limit:** Do not apply the same display-size values to every metric on an operational dashboard. The listing is not proof of identical rendering on every Android 17 device.

### Gmail: information hierarchy inside a row

**Evidence:** The official listing's inbox image combines a persistent search area, category summaries, sender identity, message text, timestamps, and star actions. Typographic emphasis and alignment distinguish the row's parts without giving every message its own detached card. [Official Gmail screenshots](https://play.google.com/store/apps/details?id=com.google.android.gm&hl=en)

**Interpretation:** Much of the design work happens inside repeated content, not only in page-level headings. The user can identify a sender and scan a preview on the same path.

**Application:** For Chesai queues, design a stable row anatomy: identification, title, preview, state, and trailing utility. Keep required information readable and make selected/unread states distinguishable through more than hue.

**Limit:** Do not copy Gmail's category system or navigation unless the product's information architecture supports it. Promotional screenshot chrome and large marketing text do not belong in the implementation.

### Phone: personality around a decisive action

**Evidence:** Google's September 29, 2025 Pixel article shows an incoming-call identity/photo above a compact action area. It documents alternative answering interactions and bringing Favorites into Home. This is an older Expressive example, not a newly verified Android 17 UI. [Official Phone design example](https://blog.google/products-and-platforms/devices/pixel/calling-updates-pixel-10/)

**Interpretation:** Identity can be expressive while the decision remains recognizable. Reducing navigation steps can matter more than changing component appearance.

**Application:** In an invitation or request screen, lead with who/what the decision concerns; group the few consequential actions; keep less-used tools secondary. Offer an understandable input method and clear labels.

**Limit:** A photographic calling card is not a generic template for settings, forms, or data screens. Do not depend on an unfamiliar gesture alone.

### Messages + Keep: preserve context while composing

**Evidence:** Google's September 1, 2026 Android Drop demonstrates creating a Keep list from a Messages conversation. A sheet contains the editable title and checkbox rows; composition controls and the send action remain above the keyboard, with the conversation behind it. [Official Messages/Keep demonstration](https://blog.google/products-and-platforms/platforms/android/android-drop-september-2026/)

**Interpretation:** The temporary task has a clear boundary and return context. Whitespace is available editing space, not an invitation to add widgets.

**Application:** Use a focused sheet for a short contextual creation flow; make keyboard appearance, overflow, cancel, and return focus part of its design. Use a full route for a longer editing task when the sheet becomes cramped.

**Limit:** The same announcement distinguishes features for different Android versions. Do not claim that every demonstrated app feature requires Android 17.

### What Material 3 Expressive research actually supports

Google's research describes purposeful combinations of size, color, shape, motion, and containment, with measured outcomes in its studied designs. It supports testing attention and grouping, not applying a visual skin and inheriting the reported results. [Google Design research](https://design.google/library/expressive-material-design-google-research)

The May 2025 Android/Wear announcement includes a collage of varied expressive concepts and describes future work across apps. Treat that collage as art-direction evidence, not a catalog of shipped stock-app screens. [Official Expressive announcement](https://blog.google/products-and-platforms/platforms/android/material-3-expressive-android-wearos-launch/)

## The supplied references

These visual critiques are our analysis. Unknown authorship and implementation mean concept images cannot establish interaction behavior or accessibility. Images 2, 3, and 4 repeat the same composition and count as one reference, not three independent examples.

| Reference | Relationship worth learning | Transfer to a new product | Question before adopting |
| --- | --- | --- | --- |
| **1: team/workflow overview** | A narrow navigation strip anchors a much broader workspace. Large values, one accent block, and a broad chart create unequal visual weight. | Make overview regions different sizes according to their decision value; keep controls aligned within regions. | Does the large greeting or upgrade artwork steal attention from operations? Are chart units, labels, and comparisons understandable? |
| **2–4: income/project overview** | A dominant income region balances a narrower project list. The expanded project reveals details in place; smaller summaries sit below. | Use asymmetric area allocation and progressive disclosure to support the main decision. | Would the lollipop chart be clear with real data and axes? Are pale captions legible at working size? Does the upgrade block deserve its area? |
| **5: Material-style Telegram concept** | Search and scope chips precede repeated conversations; navigation and composing occupy stable positions. | Separate finding a conversation from switching product areas; preserve a regular row rhythm. | This is a third-party concept, not official Telegram or Google behavior. Would the keyboard obscure the composer? Are labels/targets large enough? |
| **6–7: Snaplist task concepts** | Grouped tasks, a persistent new-task input, and a separate team index reflect different levels of work. A small number of accents distinguish actions from rows. | Put task creation near the list; keep team navigation distinct from task actions; use shared grouping rather than decoration on every row. | Does the greeting displace useful content? Do truncation, flags, disabled items, and priority labels remain understandable without color? |
| **8: collaboration workspace** | Navigation, conversation, and contextual information occupy distinct columns; the message stream remains the central working region. | Use a supporting pane for information about the selected object, with shared alignment and restrained separators. | Is metadata needed continuously? On compact screens, can it become a sheet/route while keeping the conversation usable? |
| **9: profile/support flow** | A larger question introduces each focused screen; support options are grouped rows, FAQs disclose details, and reporting uses a sheet. | Give a support flow explicit steps and clear entry/exit points; reserve prominent headings for the decision being made. | Can the form explain errors, preserve text, and show completion? Does the keyboard leave the submission action reachable? |
| **10: Google Drive, dark web screenshot** | Strong file-name alignment and consistent columns support scanning. Suggested folders are a different content type above the table; selection is localized. | Let the content model choose list/table versus card. Reserve enough width for names and useful comparison columns. | Can long names be identified and reached by keyboard? Do darker surfaces and separators remain distinguishable? |
| **11: Google Meet, light web screenshot** | Date context, week navigation, a scoped notice, and the empty day remain distinct. Open space leads to an understandable state and one central creation action. | Let a genuinely empty workspace stay quiet; keep navigation/date context so the state has meaning. | The notice and illustration need a real purpose. Do not add either by default. A two-mode rail here does not mandate two-item global rails everywhere. |

Across these images, the transferable quality is **relationship**: large against small, dense against open, repeating against exceptional, stable against contextual. The lime, pink, blue, dark-gray, and other palettes are incidental to that lesson. Screens with different jobs should not all converge on the same “premium dashboard” arrangement.

## Independent inspiration: dense work can still feel composed

### Linear's 2026 interface refresh

The official before/after sidebar and article emphasize quieter inactive navigation, smaller/refined icons, adjusted spacing, and fewer competing separators. The team also identifies unpredictable placement of page actions as a source of accumulated design problems. [Linear's March 12, 2026 study](https://linear.app/now/behind-the-latest-design-refresh)

**Our transfer:** Keep familiar controls in stable locations and spend visual emphasis in the working region. Refine baseline alignment and group spacing before adding new surfaces. An established dense tool need not become sparse to feel better.

**Limit:** Quiet does not mean unreadable. Do not copy low contrast, icon-only navigation, or Linear's colors into Chesai without checking labels, targets, and the user's task.

Linear's earlier account describes testing the environment, themes, and hierarchy during redesign. This is useful process evidence for checking the same composition in multiple contexts, not a mandate to imitate its aesthetic. [Linear's 2024 design study](https://linear.app/now/how-we-redesigned-the-linear-ui)

## Material reading map

The official [Styles](https://m3.material.io/styles) and [Foundations](https://m3.material.io/foundations) indexes were inspected in a rendered browser; text-only retrieval of many M3 pages returns only a JavaScript shell. Follow the actual chapter before treating an index as substantive research.

| Topic | Primary source | What to inspect |
| --- | --- | --- |
| Color | [Roles](https://m3.material.io/styles/color/roles) | Foreground/background pairing, region consistency, outline distinction |
| Type | [Applying type](https://m3.material.io/styles/typography/applying-type) | Role, line-height, web typesetting, numerals |
| Shape | [Principles](https://m3.material.io/styles/shape/overview-principles) | Deliberate contrast, restraint, interaction-related morphing |
| Elevation | [Overview](https://m3.material.io/styles/elevation/overview) | Spatial relationship and when shadows help |
| Motion | [Physics system](https://m3.material.io/styles/motion/overview/how-it-works) | Spatial versus effects behavior, scheme consistency |
| Layout | [Overview](https://m3.material.io/foundations/layout/understanding-layout/overview) and [adaptation](https://m3.material.io/foundations/layout/understanding-layout/adaptive-design) | Pane relationships and task-preserving transformations |
| Interaction | [States](https://m3.material.io/foundations/interaction/states/overview) | Combined states, feedback, multiple visual cues |
| Access | [Accessibility principles](https://m3.material.io/foundations/overview/principles) | Preferences and varied user needs before implementation |
| Content | [Content design](https://m3.material.io/foundations/content-design/overview) | Understandable UI language and information design |

The implementation guidance and examples in this skill are a Chesai synthesis. They are not an official Google specification or evidence of measured user outcomes.
