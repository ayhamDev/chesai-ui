# WeekCalendar

A continuous date strip showing approximately seven days, with previous/next week controls. It uses Chesai semantic color tokens, typography, shapes, ripple feedback, and `IconButton`. It inherits light/dark themes and direction from the application. No additional dependencies are required.

```tsx
import { WeekCalendar } from 'chesai-ui'

const [date, setDate] = useState<Date | null>(null)

<WeekCalendar value={date} onSelect={setDate} />
```

For a calendar that only browses weeks and never selects dates:

```tsx
<WeekCalendar mode="none" swipeMode="week" showHeader />
```

This opens the current week, keeps today's outline, and lets users browse with arrows, keyboard focus, or swipes. `mode="none"` accepts no selection values or selection callbacks and submits no form value. To allow selection but start empty, use `<WeekCalendar />` or a controlled `value={null}` instead.

Omit `value` and use `defaultValue` for internal state. Use `null` to clear a controlled selection. Values are **local Gregorian calendar dates** using the existing library's `Date` / `DateRange` types; time components are ignored. Use `new Date(year, monthIndex, day)` for date-only inputs rather than UTC date strings.

## Selection and navigation

- `swipeMode="day"` (default) settles free scrolling on the nearest day. `swipeMode="week"` settles on the nearest full calendar week after release and momentum, respecting `weekStartsOn`, locale, RTL, and date bounds. It works with mouse, touch, pen, and trackpad scrolling in all selection modes. Swiping changes the visible interval, not selection.
- `mode="none"`: navigation only; dates remain available for keyboard focus and tooltips, but cannot be selected.
- `mode="single"` (default): `Date | null` values and `onSelect(dateOrNull)`. Clicking the selected day again clears it and emits `null`. Omit `value` and `defaultValue` (or set `defaultValue={null}`) to open the current week with no selection; today retains its separate outline.
- Previous/next week buttons land on complete calendar weeks (Sunday–Saturday by default, or the configured locale/weekStartsOn) even after free scrolling, and carry a selected weekday into that week. With no selection, navigation leaves it empty. Unavailable destination dates and read-only mode preserve the existing selection. Set `selectionFollowsNavigation={false}` to browse without changing selection. Free scrolling and keyboard focus do not change selection; range mode retains its range behavior.
- `mode="range"`: `{ from?: Date; to?: Date }` values and `onRangeSelect(range)`. A second click completes the range in chronological order; a third starts a new range. Ranges can span weeks. Attempting to cross an unavailable date starts a new range at the clicked date.
- `visibleDate`, `defaultVisibleDate`, `onVisibleDateChange`: the initial view aligns to the locale's week. Subsequent `visibleDate` changes scroll to that date; native scrolling reports the leading visible date, which can be any weekday. Echoing this callback into `visibleDate` preserves partial-day offsets. For controlled arrow navigation, update `visibleDate` in the callback. Changing selection externally reveals its date unless `visibleDate` is controlled. Free scrolling and selecting a visible date do not realign the strip to a week boundary; the week buttons do.
- `minDate` / `maxDate`: inclusive day bounds; `isDateDisabled(date)` adds arbitrary restrictions. Weeks with unavailable dates can still be browsed within the bounds.
- `disabled` blocks interaction. `readOnly` allows browsing and focus but blocks selection. `isInvalid` provides error styling and ARIA state; use `aria-describedby` to link an external error message.

## Appearance and customization

| Prop | Values |
| --- | --- |
| `variant` | `embedded` (default), `default` (surface container), `outlined` |
| `color` | `primary` (default), `secondary`, `tertiary`, `error`, `primary-container`, `secondary-container`, `tertiary-container`, `error-container`, `surface`, `inverse` |
| `size` | `xs`, `sm`, `md` (default), `lg`, `xl` |
| `shape`, `itemShape` | `full`, `minimal`, `sharp`; item shape inherits root shape by default |
| `showHeader` | Display the localized full week interval, otherwise announced to screen readers |
| `weekdayFormat` | `narrow`, `short` (default), `long` |

The component fills its container. Use `size="sm"` and `weekdayFormat="narrow"` for compact mobile layouts. `className` styles the root; `classNames` provides `header`, `navigation`, `grid`, `day`, `weekday`, and `dayNumber` overrides. Exported CVA functions are available for styling integrations.

Unselected days and navigation controls use the same expanding bloom color, opacity, scale, and timing. Selected days have no hover bloom. Navigation hover areas match the day pills' size and shape. Every color comes from the existing semantic theme, including the softer container tones and neutral surface/inverse options.

`renderDay(date, state)` replaces a day's **non-interactive** contents (for example appointment dots). `getDayLabel(date, state)` customizes its full accessible label. State includes `isSelected`, `isToday`, `isDisabled`, `isRangeStart`, `isRangeEnd`, and `isInRange`. Buttons expose corresponding `data-*` attributes. Standard root HTML attributes and refs are forwarded.

## Localization, accessibility, and forms

- `locale` accepts a date-fns locale (default `enUS`). `weekStartsOn` overrides the locale's first weekday (`0` Sunday through `6` Saturday). Dates remain Gregorian; locale controls labels and week conventions.
- Supply translated `labels={{ calendar, previousWeek, nextWeek }}`. Direction inherits `DirectionProvider` or DOM direction; `dir` overrides it.
- One day is in the Tab sequence. Left/right move spatially, up/down and Page Up/Down move one week, Home/End move to week boundaries, and Enter/Space select. Unavailable days remain keyboard discoverable and are announced as disabled.
- With the default `swipeMode="day"`, freely scroll through consecutive dates, then gently align to the nearest **day** after scrolling and momentum stop, so both edge dates are fully visible. Day-mode alignment never jumps to a week boundary; use `swipeMode="week"` for whole-week alignment. Touch and trackpad gestures use native browser scrolling, including mobile momentum, vertical page scrolling, and pinch zoom. Mouse/pen dragging changes the same scroll offset without selecting a date or changing the cursor. Dates ahead and behind the viewport are virtualized, keeping the strip filled during long drags. Gestures respect RTL and date bounds. Set `swipeable={false}` to disable direct scrolling. Previous/next week buttons smoothly scroll to the start of the adjacent calendar week, including repeated clicks. A new gesture interrupts navigation. Reduced-motion preferences and `disableAnimation` make navigation and final alignment immediate; `disableAnimation` also removes day transitions/ripples.
- Library tooltips label the navigation arrows and show each day's compact localized date without a weekday (for example `Sep 23, 2026`) on hover or keyboard focus.
- `name` adds hidden form inputs with local `yyyy-MM-dd` values. Range inputs use `name.from` and `name.to`. `form` supports an external form ID. Disabled values are omitted. Calendar controls never submit the form. For controlled forms, reset the value in your form's reset handler.

See **Components → Forms & Inputs → WeekCalendar** in Storybook for interactive examples covering appearance, modes, restrictions, mobile layout, RTL, custom content, and form submission.

**Meeting dashboard showcase** composes Chesai UI controls into a responsive meeting dashboard. Selecting a date filters the schedule; New adds a sample meeting to that date, and notes remain available during the preview session. The join flow is a local demonstration, with no calling service or device access. All colors follow the active library theme.
