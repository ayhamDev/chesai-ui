# Choose and use Chesai components

Use this reference before implementing controls or choosing imports. The design references decide hierarchy and composition; this registry maps those decisions to the actual library. Read only the relevant category and its source/story links.

## Find the capability

| Need | Catalog | Useful starting points |
| --- | --- | --- |
| Actions and commands | [Actions](components/actions.md) | Button, IconButton, FAB, Toolbar, DropdownMenu, Command |
| Enter, validate, filter or select | [Forms](components/forms.md) | Input, Field, Select, Combobox, MultiSelect, SearchView, date/time inputs |
| Move between destinations or screens | [Navigation](components/navigation.md) | AppBar, Sidebar, NavigationRail, BottomTabs, Tabs, routers |
| Present records, status and quantitative information | [Content](components/content.md) | Typography, Item, Card, DataTable, DataDisplay, Charts, Kanban |
| Loading, errors, confirmations and contextual surfaces | [Feedback](components/feedback.md) | EmptyState, Alert, Progress, Dialog, Sheet, Popover |
| Arrange, scroll, resize or reorder | [Layout](components/layout.md) | Flex/Grid/Masonry, Resizable, VirtualList, Swipeable |
| Rich editing, conversations, maps or media | [Specialized tools](components/advanced.md) | Chat, editors, Map, FullCalendar, VideoPlayer, studios |
| App setup and shared behavior | [Infrastructure](components/infrastructure.md) | ChesaiProvider, useTheme, useLayout, useRipple |
| Folder exists but import does not | [Unavailable/internal](components/internal.md) | AdaptiveGrid, TreeView, ActionSheet and reserved folders |

For exact symbol lookup, search [registry.json](components/registry.json). It distinguishes runtime values, type-only exports, compound members, own-prop hints, source files and stories. Paths in JSON explicitly distinguish repository sources from deployed documentation assets. The registry describes this checkout; an installed package version may differ. Its installed declarations are authoritative.

## Choose before writing JSX

1. Identify the interaction: selection, navigation, command, editing, display or feedback. Pick the closest existing capability from the table.
2. Read that family's usage note, availability and actual exported names. Read the linked source and one relevant story to confirm required props, value types, children and state ownership. Stories can import local/internal code; adapt imports to the public names listed here.
3. Reuse existing app providers and conventions. For a fresh app, import `chesai-ui/styles.css` and wrap the app in `ChesaiProvider`; preserve the project's Tailwind/token setup. This provider includes tooltip, dialog, action-sheet and toaster services. Do not wrap every component in another provider.
4. Map real data, callbacks, accessible labels, loading/error state and compact behavior. Select visual props only after the interaction works; identical prop names can have different meanings across families.
5. Type-check against the installed library and exercise the task. Resolve API mismatches by reading the implementation, not by replacing the component with a styled native control.

Prefer Chesai controls over raw `<button>`, `<input>`, `<select>`, `<textarea>` or homemade modal/menu/tab implementations when a matching capability exists. Keep semantic `<main>`, `<section>`, `<nav>`, `<form>`, lists, links and layout wrappers where they express document structure. Native elements used through a documented `asChild` contract are appropriate. A component catalog is not a requirement to wrap everything in Card or Flex.

When the library genuinely lacks a capability, compose public primitives first. If a custom or native implementation remains necessary, record the missing capability and reason in working notes and preserve semantic/accessibility behavior. Do not silently invent an import or deep-import an internal folder. This is an implementation decision, not an automatic approval gate.

## Common decisions and traps

| Situation | Choose | Important distinction |
| --- | --- | --- |
| Known single value / searchable value / multiple values | Select / Combobox / MultiSelect | Different data and callback contracts; Select owns its trigger. |
| Inline filtering / expanded search / commands | Input / SearchView / Command | Search results are not automatically command actions. |
| Binary selection / immediate setting / exclusive options | Checkbox / Switch / RadioGroup | Preserve the expected interaction semantics. |
| Plain text / rich Markdown / structured blocks / code | Textarea / LexicalEditor / MediumTextEditor / CodeEditor | Their persisted values are not interchangeable. |
| Browse a dataset / custom table renderer / alternate card layout | DataTable / Table / DataDisplay | Table needs a TanStack instance, not arbitrary table children. |
| Small collection / large virtual collection / fetching pages | ItemGroup / VirtualList / InfiniteScroll | Virtualization and pagination solve different problems and may be combined. |
| Modal decision / supplementary workflow / anchored details | Dialog / Sheet / Popover | Choose by focus and task scope, not desired corner radius. |
| Action list / form choice / navigation | DropdownMenu / Select / NavigationMenu | Similar popup appearance does not mean identical semantics. |
| Compact primary destinations / in-page sections | BottomTabs / Tabs | Both have compound APIs; do not invent a generic items prop. |
| Day selection / event scheduling | DatePicker or WeekCalendar / FullCalendar | Date values and event schemas require separate state. |
| Persistent error / field error / transient confirmation | Alert / FieldError / sonner toast | Toaster is exported; toast is imported from sonner. |
| Conversation scrolling / message presentation | Chat / composed Item, Typography and controls | Chat has no exported Message or Composer member. |

Other common mistakes: `Dialog` needs `open` and `onOpenChange`; `InputOTP` needs `maxLength` and indexed slots; `Checkbox`/`Switch` use `onCheckedChange`, not a text-field callback; `DateInput` uses date-library values rather than an assumed JS Date; `Tabs` requires `defaultValue`. Read the current source before relying on these hints.

## Small composition examples

These demonstrate API choices, not a screen template. Use the existing provider and application state. The native form and section are intentional semantic containers.

```tsx
import { useState } from 'react'
import { Button, Input, Select, Switch, Typography } from 'chesai-ui'

export function ProjectPreferences({ onSave }: {
  onSave: (value: { name: string; visibility: string; notifications: boolean }) => void
}) {
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState('team')
  const [notifications, setNotifications] = useState(true)
  return (
    <form className="grid gap-4" onSubmit={event => {
      event.preventDefault()
      onSave({ name, visibility, notifications })
    }}>
      <Typography as="h2" variant="title-large">Project preferences</Typography>
      <Input label="Project name" value={name} onValueChange={setName} required />
      <Select label="Visibility" value={visibility} onValueChange={setVisibility}
        items={[{ value: 'team', label: 'Team' }, { value: 'private', label: 'Private' }]} />
      <Switch label="Notifications" checked={notifications} onCheckedChange={setNotifications} />
      <Button type="submit">Save preferences</Button>
    </form>
  )
}
```

```tsx
import { Button, Dialog, DialogContent, DialogTitle, DialogDescription,
  DialogFooter } from 'chesai-ui'

export function ConfirmArchive({ open, onOpenChange, onArchive }: {
  open: boolean; onOpenChange: (open: boolean) => void; onArchive: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Archive this project?</DialogTitle>
        <DialogDescription>You can restore it from archived projects.</DialogDescription>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={onArchive}>Archive project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

The archive callback owns persistence, pending/error feedback and closing after success. Do not close optimistically unless that is the application's intended behavior.

## Maintaining this registry

The category catalogs and JSON are generated; do not hand-edit them. Maintain the usage notes in `scripts/component-registry.data.ts`, then run `npm run registry:generate`. `npm run registry:check` checks coverage of every component folder, resolved public exports and stale output. Adding an export to an internal family requires reviewing its guidance. `npm run build:docs` regenerates and publishes the catalog beside the skill, rewriting source/story links to deployed assets.

Own-prop lists are intentionally incomplete discovery hints, not copied API documentation. Read types for inherited props, required fields, overloads, unions and compound-part contracts. A successful registry check proves inventory consistency, not runtime behavior or accessibility.
