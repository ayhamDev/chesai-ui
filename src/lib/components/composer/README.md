# Composer

A general-purpose, autosizing text surface with application-owned content and controls. It does not send messages, upload files, record audio, choose models, or intercept Enter. Use existing buttons, dropdowns, chips, and other components in its slots.

```tsx
const [text, setText] = useState('')

<Composer
  aria-label="Message"
  value={text}
  onValueChange={setText}
  placeholder="Write a message…"
  startContent={<MyContextControl />}
  endContent={<Button onClick={() => save(text)}>Save</Button>}
/>
```

- `startContent` and `endContent` sit beside a short editor and move below it when it becomes multiline. They keep their DOM identity, focus, and local state through layout changes.
- `topContent` and `bottomContent` accept arbitrary context previews, attachments, helper text, or extra controls. Empty slots add no extra rows.
- `layout`: `auto` (default), `inline`, or `stacked`. Auto also stacks when controls leave insufficient editing space.
- `expandOn`: `multiline` (default), `input`, or `focus`. Focus mode includes composed controls inside the surface.
- `minRows` / `maxRows`: default 1 / 6; overflow scrolls after the limit. Measurement also responds to width and control-size changes.
- `expanded` provides a taller editor using `expandedRows` (default 12). Supply your own expansion control and state; it is not a dialog or fullscreen takeover.
- `transitionDuration`: 320ms by default, with a fast start and gentle eased finish. Native CSS transitions animate height, editing width, and control positions without Framer Motion layout projection, scaling text, or fading. Interrupted transitions continue from their current position. Reduced-motion preference disables these transitions.
- `focusOutline`: defaults to `false`. Set it to `true` to show the surface's keyboard focus outline. Composed controls retain their own focus styling.
- `variant`: `filled`, `filled-inverted`, `outlined`, `ghost`. `shape`: `full`, `minimal`, `sharp`. All use the library theme.

The forwarded ref is the native textarea. Native textarea attributes and events (`name`, `form`, `required`, `maxLength`, `onPaste`, `onKeyDown`, etc.) go to the editor. `className` and `style` customize the surface; `classNames` targets individual slots. Use `aria-label` or an associated label, and `aria-describedby` for helper/error text. `isInvalid` exposes the error state. `disabled` and `readOnly` affect text editing; the app owns the enabled state of supplied controls.

Controlled (`value`) and uncontrolled (`defaultValue`) usage are supported. Enter remains a newline. If the app adds a submission shortcut, check `event.nativeEvent.isComposing` and keep a newline shortcut available. Text is not cleared automatically; the caller decides what happens after an action.

Storybook examples show a conversation and a focus-expanded workspace. Their example actions are local demo behavior, not Composer features. Telegram has not been migrated yet.


Use `disableHover` to suppress pointer hover styling (default `false`). Focus
outlining remains independently controlled by `focusOutline`.

The editor keeps its scrollbar hidden during content growth below `maxRows`
(or `expandedRows` when expanded). Once content exceeds that cap, it scrolls
normally; deleting text or expanding the cap hides the scrollbar again.
