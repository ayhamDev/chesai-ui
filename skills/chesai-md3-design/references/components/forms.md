# Forms and selection

[Selection guide](../component-registry.md) · [Machine-readable registry](registry.json)

Generated from the package-root exports and curated usage guidance. Import public names from `chesai-ui`. Own-prop lists are discovery hints, not complete signatures; inherited props, required fields, unions and callbacks must be checked in source/types. Compound members listed below may include helper data; consult the usage note before treating a value as JSX.

- [checkbox](#checkbox)
- [chip](#chip)
- [color-picker](#color-picker)
- [combobox](#combobox)
- [date-input](#date-input)
- [date-picker](#date-picker)
- [dropzone](#dropzone)
- [field](#field)
- [input](#input)
- [input-group](#input-group)
- [multi-select](#multi-select)
- [number-input](#number-input)
- [otp-field](#otp-field)
- [phone-input](#phone-input)
- [radio-group](#radio-group)
- [search-view](#search-view)
- [select](#select)
- [slider](#slider)
- [switch](#switch)
- [textarea](#textarea)
- [time-picker](#time-picker)
- [week-calendar](#week-calendar)

## checkbox

Independent binary or multi-selection choice. Use checked/onCheckedChange and label; account for an indeterminate state where applicable.

**Availability:** package-root public API.

**Value exports:** `Checkbox`.

**Type-only exports:** `CheckboxProps`. Use `import type`.

- `Checkbox` own props: `label`.

**Source:** [index.tsx](../../../../src/lib/components/checkbox/index.tsx)

**Examples:** [Checkbox.stories.tsx](../../../../src/lib/components/checkbox/Checkbox.stories.tsx)

## chip

Compact filter/category choice or attribute. Use selected for a selectable chip, with text and optional icons; do not imply interactivity for plain metadata.

**Availability:** package-root public API.

**Value exports:** `Chip`.

**Type-only exports:** `ChipProps`. Use `import type`.

- `Chip` own props: `endIcon`, `selected`, `startIcon`.

**Source:** [index.tsx](../../../../src/lib/components/chip/index.tsx)

**Examples:** [chip.stories.tsx](../../../../src/lib/components/chip/chip.stories.tsx)

## color-picker

Choosing an actual color value. Wire value/onChange and optional swatches; do not use it to represent unrelated status choices.

**Availability:** package-root public API.

**Value exports:** `ColorPicker`.

**Type-only exports:** `ColorPickerProps`. Use `import type`.

- `ColorPicker` own props: `bordered`, `className`, `description`, `disabled`, `errorMessage`, `isInvalid`, `label`, `labelPlacement`, `onChange`, `shape`, `size`, `swatches`, `value`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/color-picker/index.tsx)

**Examples:** No Storybook file in this folder; inspect the source contract.

## combobox

Searchable single selection, including asynchronous option loading. Supply options, value/onValueChange; use searchValue/onSearchChange and shouldFilter for remote filtering. Preserve selectedOption when it is outside the loaded page.

**Availability:** package-root public API.

**Value exports:** `Combobox`.

**Type-only exports:** `ComboboxOption`, `ComboboxProps`. Use `import type`.

- `Combobox` own props: `bordered`, `className`, `classNames`, `defaultValue`, `description`, `disabled`, `emptyMessage`, `errorMessage`, `forceMobileLayout`, `hasMore`, `isClearable`, `isInvalid`, `isLoading`, `label`, `labelPlacement`, `loadingMessage`, `mobileLayout`, `name`, `onLoadMore`, `onSearchChange`, `onValueChange`, `options`, `placeholder`, `searchPlaceholder`, `searchValue`, `selectedOption`, `shape`, `sheetProps`, `shouldFilter`, `size`, `startContent`, `value`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/combobox/index.tsx)

**Examples:** [Combobox.stories.tsx](../../../../src/lib/components/combobox/Combobox.stories.tsx), [scrolling.stories.tsx](../../../../src/lib/components/combobox/scrolling.stories.tsx)

## date-input

Keyboard-friendly segmented date, time and duration entry. DateInput/TimeInput use React Aria date types; DurationInput has its own contract. Group/Field/Segment parts and hooks support custom composition. Do not assume all values are JS Date.

**Availability:** package-root public API.

**Value exports:** `DateInput`, `DateInputField`, `DateInputGroup`, `DateInputSegment`, `dateInputSlots`, `dateInputStyles`, `DurationInput`, `DurationInputField`, `DurationInputSegment`, `formatDuration`, `getDateInputSlotClassNames`, `parseDuration`, `TimeInput`, `useDateInput`, `useDurationInput`, `useTimeInput`.

**Type-only exports:** `DateInputFieldProps`, `DateInputGroupProps`, `DateInputProps`, `DateInputSegmentProps`, `DurationFieldState`, `DurationInputFieldProps`, `DurationInputProps`, `DurationInputSegmentProps`, `DurationSegment`, `DurationValue`, `TimeInputProps`, `UseDateInputProps`, `UseDurationInputProps`, `UseTimeInputProps`. Use `import type`.

- `DateInput` own props: `className`, `classNames`, `color`, `endContent`, `isDisabled`, `isInvalid`, `labelPlacement`, `placeholder`, `ref`, `shape`, `size`, `startContent`, `variant`.
- `DateInputField` own props: `inputProps`, `state`.
- `DateInputGroup` own props: `description`, `descriptionProps`, `endContent`, `errorMessage`, `errorMessageProps`, `helperWrapperProps`, `innerWrapperProps`, `isInvalid`, `label`, `labelProps`, `shouldLabelBeOutside`, `startContent`, `wrapperProps`.
- `DateInputSegment` own props: `className`, `segment`, `state`.
- `DurationInput` own props: `className`, `classNames`, `color`, `defaultValue`, `description`, `endContent`, `errorMessage`, `isDisabled`, `isInvalid`, `isRequired`, `label`, `labelPlacement`, `name`, `onChange`, `shape`, `size`, `startContent`, `value`, `variant`.
- `DurationInputField` own props: `inputProps`, `state`.
- `DurationInputSegment` own props: `className`, `segment`, `state`.
- `TimeInput` own props: `className`, `classNames`, `color`, `endContent`, `isDisabled`, `isInvalid`, `labelPlacement`, `ref`, `shape`, `size`, `startContent`, `variant`.

**Source:** [date-input-field.tsx](../../../../src/lib/components/date-input/date-input-field.tsx), [date-input-group.tsx](../../../../src/lib/components/date-input/date-input-group.tsx), [date-input-segment.tsx](../../../../src/lib/components/date-input/date-input-segment.tsx), [date-input-styles.ts](../../../../src/lib/components/date-input/date-input-styles.ts), [date-input.tsx](../../../../src/lib/components/date-input/date-input.tsx), [duration-input-field.tsx](../../../../src/lib/components/date-input/duration-input-field.tsx), [duration-input-segment.tsx](../../../../src/lib/components/date-input/duration-input-segment.tsx), [duration-input.tsx](../../../../src/lib/components/date-input/duration-input.tsx), [index.tsx](../../../../src/lib/components/date-input/index.tsx), [time-input.tsx](../../../../src/lib/components/date-input/time-input.tsx), [use-date-input.ts](../../../../src/lib/components/date-input/use-date-input.ts), [use-duration-input.ts](../../../../src/lib/components/date-input/use-duration-input.ts), [use-time-input.ts](../../../../src/lib/components/date-input/use-time-input.ts)

**Examples:** [DateInput.stories.tsx](../../../../src/lib/components/date-input/DateInput.stories.tsx), [DurationInput.stories.tsx](../../../../src/lib/components/date-input/DurationInput.stories.tsx), [TimeInput.stories.tsx](../../../../src/lib/components/date-input/TimeInput.stories.tsx)

## date-picker

Date selection from a popup or calendar. DatePicker uses value/onChange; Calendar and InfiniteCalendar use onSelect/onRangeSelect. Inspect mode and range value types before wiring state.

**Availability:** package-root public API.

**Value exports:** `Calendar`, `DatePicker`, `InfiniteCalendar`.

**Type-only exports:** `CalendarProps`, `DatePickerInputVariant`, `DatePickerProps`. Use `import type`.

- `Calendar` own props: `itemShape`, `mode`, `onRangeSelect`, `onSelect`, `shape`, `value`, `variant`.
- `DatePicker` own props: `bordered`, `className`, `classNames`, `color`, `disabled`, `inputVariant`, `isInvalid`, `itemShape`, `label`, `onChange`, `placeholder`, `shape`, `size`, `value`, `variant`.
- `InfiniteCalendar` own props: `maxDate`, `minDate`, `mode`, `onRangeSelect`, `onSelect`, `value`.

**Source:** [calendar.tsx](../../../../src/lib/components/date-picker/calendar.tsx), [date-picker.tsx](../../../../src/lib/components/date-picker/date-picker.tsx), [infinite-calendar.tsx](../../../../src/lib/components/date-picker/infinite-calendar.tsx), [styles.ts](../../../../src/lib/components/date-picker/styles.ts)

**Examples:** [DatePicker.stories.tsx](../../../../src/lib/components/date-picker/DatePicker.stories.tsx)

## dropzone

File picking and drag/drop. Dropzone takes onDrop and optional controlled files/onRemove; VirtualDropzone overlays an existing region via onDropFiles. Application code owns upload, progress and failures.

**Availability:** package-root public API.

**Value exports:** `Dropzone`, `VirtualDropzone`.

**Type-only exports:** `DropzoneFileItem`, `DropzoneProps`, `VirtualDropzoneProps`. Use `import type`.

- `Dropzone` own props: `accept`, `description`, `disabled`, `files`, `label`, `maxSize`, `multiple`, `onDrop`, `onRemove`.
- `VirtualDropzone` own props: `disabled`, `onDropFiles`, `overlayIcon`, `overlayLabel`.

**Source:** [index.tsx](../../../../src/lib/components/dropzone/index.tsx)

**Examples:** [Dropzone.stories.tsx](../../../../src/lib/components/dropzone/Dropzone.stories.tsx)

## field

Form structure and validation messages. Compose FieldGroup, Field, FieldLabel, FieldDescription and FieldError around controls; wire IDs, validation and submission in the application. See TanStack form stories.

**Availability:** package-root public API.

**Value exports:** `Field`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLabel`, `useField`.

**Type-only exports:** `FieldErrorProps`, `FieldProps`. Use `import type`.

- `Field` own props: `data-invalid`, `isInvalid`, `orientation`.

**Source:** [index.tsx](../../../../src/lib/components/field/index.tsx)

**Examples:** [Field.stories.tsx](../../../../src/lib/components/field/Field.stories.tsx), [FullFormExample.stories.tsx](../../../../src/lib/components/field/FullFormExample.stories.tsx)

## input

Single-line text fields. Use label, value and onValueChange (or native onChange) plus description/errorMessage. Prefer specialized inputs for constrained data.

**Availability:** package-root public API.

**Value exports:** `Input`, `inputWrapperVariants`.

**Type-only exports:** `InputProps`. Use `import type`.

- `Input` own props: `as`, `classNames`, `color`, `description`, `endContent`, `errorMessage`, `isClearable`, `isInvalid`, `label`, `labelPlacement`, `onClear`, `onValueChange`, `placeholder`, `shape`, `size`, `startContent`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/input/index.tsx), [input-styles.ts](../../../../src/lib/components/input/input-styles.ts), [use-input.ts](../../../../src/lib/components/input/use-input.ts)

**Examples:** [Input.stories.tsx](../../../../src/lib/components/input/Input.stories.tsx)

## input-group

A field with attached prefix, suffix or actions. Compose InputGroupInput/Textarea and Addon/Text; avoid nested competing labels and duplicate field chrome.

**Availability:** package-root public API.

**Value exports:** `InputGroup`, `InputGroupAddon`, `InputGroupInput`, `InputGroupText`, `InputGroupTextarea`.

**Type-only exports:** `InputGroupAddonProps`. Use `import type`.

- `InputGroupAddon` own props: `align`.
- `InputGroupInput` own props: `as`, `classNames`, `color`, `description`, `endContent`, `errorMessage`, `isClearable`, `isInvalid`, `label`, `labelPlacement`, `onClear`, `onValueChange`, `placeholder`, `shape`, `size`, `startContent`, `variant`.
- `InputGroupTextarea` own props: `as`, `classNames`, `color`, `description`, `disableAutosize`, `endContent`, `errorMessage`, `isClearable`, `isInvalid`, `label`, `labelPlacement`, `maxRows`, `minRows`, `onBlur`, `onChange`, `onClear`, `onFocus`, `onValueChange`, `placeholder`, `shape`, `size`, `startContent`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/input-group/index.tsx)

**Examples:** No Storybook file in this folder; inspect the source contract.

## multi-select

Select multiple values from options. Use value/onValueChange and options; maxCount controls visible selection presentation. Use checkboxes when all few choices should remain visible.

**Availability:** package-root public API.

**Value exports:** `MultiSelect`.

**Type-only exports:** `MultiSelectOption`, `MultiSelectProps`. Use `import type`.

- `MultiSelect` own props: `bordered`, `className`, `classNames`, `defaultValue`, `description`, `disabled`, `emptyMessage`, `errorMessage`, `isInvalid`, `label`, `labelPlacement`, `maxCount`, `mobileLayout`, `onValueChange`, `options`, `placeholder`, `portal`, `searchPlaceholder`, `shape`, `size`, `value`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/multi-select/index.tsx), [multi-select-styles.ts](../../../../src/lib/components/multi-select/multi-select-styles.ts)

**Examples:** [MultiSelect.stories.tsx](../../../../src/lib/components/multi-select/MultiSelect.stories.tsx)

## number-input

Numeric entry with stepping and bounds. Use numeric value/onValueChange, min/max/step; onValueChange is not an input event.

**Availability:** package-root public API.

**Value exports:** `NumberInput`.

**Type-only exports:** `NumberInputProps`. Use `import type`.

- `NumberInput` own props: `allowFloat`, `as`, `classNames`, `color`, `defaultValue`, `description`, `endContent`, `errorMessage`, `hideStepper`, `isClearable`, `isInvalid`, `label`, `labelPlacement`, `max`, `min`, `onClear`, `onValueChange`, `placeholder`, `shape`, `size`, `startContent`, `step`, `value`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/number-input/index.tsx), [number-input-stepper.tsx](../../../../src/lib/components/number-input/number-input-stepper.tsx), [number-input-styles.ts](../../../../src/lib/components/number-input/number-input-styles.ts), [use-number-input.ts](../../../../src/lib/components/number-input/use-number-input.ts)

**Examples:** [NumberInput.stories.tsx](../../../../src/lib/components/number-input/NumberInput.stories.tsx)

## otp-field

One-time code entry. Provide InputOTP maxLength, value/onChange, Group and indexed Slot children. Slots are visual parts of one input, not independent inputs.

**Availability:** package-root public API.

**Value exports:** `InputOTP`, `InputOTPGroup`, `InputOTPSeparator`, `InputOTPSlot`.

**Type-only exports:** `InputOTPProps`. Use `import type`.

- `InputOTP` own props: `containerClassName`, `isInvalid`, `separated`, `shape`, `size`, `variant`.
- `InputOTPSlot` own props: `index`.

**Source:** [index.tsx](../../../../src/lib/components/otp-field/index.tsx)

**Examples:** [otp-field.stories.tsx](../../../../src/lib/components/otp-field/otp-field.stories.tsx)

## phone-input

Phone entry with country selection. Use value/onValueChange with international (+country-code) saved numbers: the country is inferred initially and when value changes. defaultCountry is a fallback; explicit country overrides inference. Clearing retains the selection. onCountryChange reports picker choices, not inferred values. National-only or ambiguous numbers require country context; consult types for validation.

**Availability:** package-root public API.

**Value exports:** `getFlagEmoji`, `isPossiblePhoneNumber`, `isValidPhoneNumber`, `PhoneInput`, `phoneLocaleAr`, `phoneLocaleDe`, `phoneLocaleEn`, `phoneLocaleEs`, `phoneLocaleFr`, `phoneLocaleIt`, `phoneLocaleJa`, `phoneLocaleKo`, `phoneLocalePt`, `phoneLocaleRu`, `phoneLocaleTr`, `phoneLocaleZh`.

**Type-only exports:** `PhoneInputProps`. Use `import type`.

- `PhoneInput` own props: `as`, `bordered`, `classNames`, `color`, `country`, `defaultCountry`, `description`, `endContent`, `errorMessage`, `isClearable`, `isInvalid`, `label`, `labelPlacement`, `labels`, `onClear`, `onCountryChange`, `onValueChange`, `placeholder`, `shape`, `size`, `startContent`, `value`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/phone-input/index.tsx)

**Examples:** [PhoneInput.stories.tsx](../../../../src/lib/components/phone-input/PhoneInput.stories.tsx)

## radio-group

One visible choice among a small set. Use value/onValueChange, named options and RadioGroupItem (or Radio.Item); keep the group labelled.

**Availability:** package-root public API.

**Value exports:** `Radio`, `RadioGroup`, `RadioGroupItem`.

**Type-only exports:** `RadioGroupItemProps`. Use `import type`.

- `Radio` members: `Radio.Item`.
- `Radio` own props: `disabled`, `label`, `name`, `onValueChange`, `value`.
- `RadioGroup` own props: `disabled`, `label`, `name`, `onValueChange`, `value`.
- `RadioGroupItem` own props: `label`, `value`.

**Source:** [index.tsx](../../../../src/lib/components/radio-group/index.tsx)

**Examples:** [Radio-group.stories.tsx](../../../../src/lib/components/radio-group/Radio-group.stories.tsx)

## search-view

Search that expands into a results surface. Supply value/onChange, optional onSubmit and result children; configure open/onOpenChange when controlled. Use Input for a simple inline filter and Command for command execution.

**Availability:** package-root public API.

**Value exports:** `SearchView`.

**Type-only exports:** `SearchViewProps`, `SearchViewShape`. Use `import type`.

- `SearchView` own props: `children`, `className`, `color`, `desktopRadius`, `dockedLeadingIcon`, `dockedTrailingIcon`, `duration`, `easing`, `expandedHeight`, `expandedMaxHeight`, `expandedMinHeight`, `onChange`, `onClear`, `onOpenChange`, `onSubmit`, `open`, `placeholder`, `shape`, `showOverlay`, `triggerVariant`, `value`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/search-view/index.tsx)

**Examples:** [SearchView.stories.tsx](../../../../src/lib/components/search-view/SearchView.stories.tsx)

## select

Choose one value from a known list. Select accepts items or SelectItem children, value/onValueChange and label. It owns its trigger: do not invent SelectTrigger or SelectContent imports.

**Availability:** package-root public API.

**Value exports:** `Select`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectSeparator`, `useSelectContext`.

**Type-only exports:** `SelectProps`. Use `import type`.

- `Select` own props: `bordered`, `children`, `className`, `classNames`, `color`, `description`, `errorMessage`, `forceMobileLayout`, `isInvalid`, `items`, `label`, `labelPlacement`, `mobileLayout`, `placeholder`, `position`, `shape`, `sheetProps`, `size`, `startContent`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/select/index.tsx), [select-styles.ts](../../../../src/lib/components/select/select-styles.ts), [select-subcomponents.tsx](../../../../src/lib/components/select/select-subcomponents.tsx)

**Examples:** [Select.stories.tsx](../../../../src/lib/components/select/Select.stories.tsx)

## slider

Approximate numeric adjustment. Slider uses value/onValueChange; inspect array semantics and bounds. BarLineSlider is the alternative visual treatment. Provide an accessible label and a precise input when exact values matter.

**Availability:** package-root public API.

**Value exports:** `BarLineSlider`, `Slider`.

**Type-only exports:** `BarLineSliderProps`, `SliderProps`. Use `import type`.

- `BarLineSlider` own props: `activeColor`, `barHeight`, `defaultValue`, `icon`, `inactiveColor`, `lineHeight`, `lineSize`, `onValueChange`, `shape`, `thickness`, `value`.
- `Slider` own props: `color`, `defaultValue`, `endIcon`, `gap`, `onValueChange`, `orientation`, `shape`, `size`, `startIcon`, `thumbHeight`, `thumbRingColor`, `thumbWidth`, `value`, `variant`, `visual`, `withLabel`, `withTicks`.

**Source:** [bar-line-slider.tsx](../../../../src/lib/components/slider/bar-line-slider.tsx), [index.tsx](../../../../src/lib/components/slider/index.tsx)

**Examples:** [BarLineSlider.stories.tsx](../../../../src/lib/components/slider/BarLineSlider.stories.tsx), [Slider.stories.tsx](../../../../src/lib/components/slider/Slider.stories.tsx)

## switch

An immediately applied on/off setting. Use checked/onCheckedChange with label and optional description. Use Checkbox for selection submitted as part of a form.

**Availability:** package-root public API.

**Value exports:** `Switch`.

**Type-only exports:** `SwitchProps`. Use `import type`.

- `Switch` own props: `checked`, `description`, `label`, `onCheckedChange`, `showUncheckedIcon`, `size`, `withIcons`.

**Source:** [index.tsx](../../../../src/lib/components/switch/index.tsx)

**Examples:** [Switch.stories.tsx](../../../../src/lib/components/switch/Switch.stories.tsx)

## textarea

Multiline plain text. Use label and validation props; minRows/maxRows control autosizing. Rich document editing belongs in an editor.

**Availability:** package-root public API.

**Value exports:** `Textarea`.

**Type-only exports:** `TextareaProps`. Use `import type`.

- `Textarea` own props: `as`, `classNames`, `color`, `description`, `disableAutosize`, `endContent`, `errorMessage`, `isClearable`, `isInvalid`, `label`, `labelPlacement`, `maxRows`, `minRows`, `onBlur`, `onChange`, `onClear`, `onFocus`, `onValueChange`, `placeholder`, `shape`, `size`, `startContent`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/textarea/index.tsx), [textarea-styles.ts](../../../../src/lib/components/textarea/textarea-styles.ts), [use-textarea.ts](../../../../src/lib/components/textarea/use-textarea.ts)

**Examples:** [Textarea.stories.tsx](../../../../src/lib/components/textarea/Textarea.stories.tsx)

## time-picker

Time selection in a picker. Wire value/onChange and inputVariant separately from surface variant; inspect the time value format rather than borrowing DatePicker assumptions.

**Availability:** package-root public API.

**Value exports:** `TimePicker`.

- `TimePicker` own props: `bordered`, `error`, `inputVariant`, `label`, `onChange`, `placeholder`, `shape`, `size`, `value`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/time-picker/index.tsx)

**Examples:** [Timer-picker.stories.tsx](../../../../src/lib/components/time-picker/Timer-picker.stories.tsx)

## week-calendar

Compact browsable day/week strip. Configure selection mode, visibleDate and selection callbacks; navigation and keyboard focus need not change selection. Use FullCalendar for scheduled events.

**Availability:** package-root public API.

**Value exports:** `WeekCalendar`, `weekCalendarDayVariants`, `weekCalendarVariants`.

**Type-only exports:** `WeekCalendarDayState`, `WeekCalendarLabels`, `WeekCalendarProps`, `WeekCalendarSlot`. Use `import type`.

- `WeekCalendar` own props: `classNames`, `color`, `daysToShow`, `defaultValue`, `defaultVisibleDate`, `disableAnimation`, `disabled`, `eventDates`, `form`, `getDayLabel`, `isDateDisabled`, `isInvalid`, `itemShape`, `labels`, `locale`, `maxDate`, `minDate`, `mode`, `name`, `onRangeSelect`, `onSelect`, `onVisibleDateChange`, `readOnly`, `renderDay`, `selectionFollowsNavigation`, `shape`, `showHeader`, `size`, `swipeMode`, `swipeable`, `value`, `variant`, `visibleDate`, `weekStartsOn`, `weekdayFormat`.

**Source:** [MeetingShowcase.tsx](../../../../src/lib/components/week-calendar/MeetingShowcase.tsx), [README.md](../../../../src/lib/components/week-calendar/README.md), [index.tsx](../../../../src/lib/components/week-calendar/index.tsx), [styles.ts](../../../../src/lib/components/week-calendar/styles.ts), [use-date-strip.ts](../../../../src/lib/components/week-calendar/use-date-strip.ts)

**Examples:** [WeekCalendar.stories.tsx](../../../../src/lib/components/week-calendar/WeekCalendar.stories.tsx)

