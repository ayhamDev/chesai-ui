# Input hover behavior

Pass `disableHover` to turn off pointer hover styling. It defaults to `false`.

```tsx
<Input disableHover label="Name" />
<Textarea disableHover label="Notes" />
<Composer disableHover placeholder="Write a message..." />
<Select disableHover items={options} />
```

Supported by Input, Textarea, Composer, NumberInput, PhoneInput, DateInput,
TimeInput, DurationInput, DatePicker, TimePicker, ColorPicker, Select,
MultiSelect, Combobox, InputOTP, Checkbox, RadioGroup, RadioGroupItem,
Switch, Slider, Dropzone, LexicalEditor, and MediumTextEditor.

The setting applies to the field surface and controls inside it (including
clear and stepper buttons). OTP groups and slots inherit it from InputOTP.
Radio items inherit it from RadioGroup. It can be toggled at runtime.

Focus indicators, active/selected states, validation, typing, and drag/drop
feedback remain available. Menus and picker panels rendered in portals retain
their own option feedback. Custom JavaScript hover handlers remain app-owned.
The library stylesheet supplies the hover variant, including group hover.

Try the toggle in **Showcase / Input field fills / All Fields**.
