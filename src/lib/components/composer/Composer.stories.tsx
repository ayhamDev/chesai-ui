import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ArrowUp, ChevronDown, Maximize2, Minimize2, Paperclip, Plus, Smile, X } from 'lucide-react'
import { Composer } from './index'
import { Button } from '../button'
import { IconButton } from '../icon-button'
import { Chip } from '../chip'
import { Flex } from '../layouts'
import { Typography } from '../typography'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../dropdown-menu'

const meta: Meta<typeof Composer> = {
  title: 'Components/Forms & Inputs/Composer', component: Composer, tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [Story => <Flex disableAnimatePresence style={{ width: 'min(880px, calc(100vw - 40px))' }}><Story /></Flex>],
  args: { 'aria-label': 'Compose text', placeholder: 'Write something…', variant: 'filled', layout: 'auto', expandOn: 'multiline', minRows: 1, maxRows: 6, transitionDuration: 320, focusOutline: false, disableHover: false },
  argTypes: {
    disableHover: { control: 'boolean' },
    focusOutline: { control: 'boolean' },
    layout: { control: 'select', options: ['auto', 'inline', 'stacked'] },
    expandOn: { control: 'select', options: ['multiline', 'input', 'focus'] },
    shape: { control: 'select', options: ['full', 'minimal', 'sharp'] },
    variant: { control: 'select', options: ['filled', 'filled-inverted', 'outlined', 'ghost'] },
    startContent: { control: false }, endContent: { control: false }, topContent: { control: false }, bottomContent: { control: false },
  },
}
export default meta
type Story = StoryObj<typeof Composer>
export const Playground: Story = {}

function ComposedExample({ work = false }: { work?: boolean }) {
  const [text, setText] = React.useState('')
  const [expanded, setExpanded] = React.useState(false)
  const [context, setContext] = React.useState(false)
  const [mode, setMode] = React.useState('Balanced')
  const [submitted, setSubmitted] = React.useState('')
  const [engaged, setEngaged] = React.useState(false)
  const input = React.useRef<HTMLTextAreaElement>(null)
  const submit = () => { if (text.trim()) { setSubmitted(text); setText(''); input.current?.focus() } }
  return <Flex disableAnimatePresence direction="column" gap="lg" className="w-full">
    <Typography variant="headline-small">{work ? 'Space to think and create' : 'A conversation starts here'}</Typography>
    <Typography variant="body-medium" className="text-on-surface-variant">
      {work ? 'Focus to open the workspace. Controls are composed from the library.' : 'Type or paste a few lines. The controls move below your text as it grows.'}
    </Typography>
    <Composer ref={input} aria-label="Message" placeholder={work ? 'What would you like to work on?' : 'Write a message…'}
      value={text} onValueChange={setText} expandOn={work ? 'focus' : 'multiline'} expanded={expanded} expandedRows={10}
      variant="filled-inverted"
      onFocus={() => setEngaged(true)}
      onKeyDown={event => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
          event.preventDefault(); submit()
        }
      }}
      topContent={context && <Chip behavior="action" aria-label="Remove example context" endIcon={<X size={14} />} onClick={() => setContext(false)}>Project notes · Example context</Chip>}
      startContent={<>
        <IconButton size="sm" variant="ghost" aria-label="Toggle example context" aria-pressed={context} onClick={() => setContext(!context)}><Plus size={20} /></IconButton>
        {!work && <IconButton size="sm" variant="ghost" aria-label="Insert smile" onClick={() => { setText(value => value + ' 😊'); input.current?.focus() }}><Smile size={20} /></IconButton>}
      </>}
      endContent={<>
        {work && <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm" variant="ghost" endIcon={<ChevronDown size={14} />}>{mode}</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">{['Quick', 'Balanced', 'Thorough'].map(option => <DropdownMenuItem key={option} onSelect={() => setMode(option)}>{option}</DropdownMenuItem>)}</DropdownMenuContent>
        </DropdownMenu>}
        <IconButton size="sm" variant="ghost" aria-label={expanded ? 'Collapse editor' : 'Expand editor'} aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</IconButton>
        <IconButton size="sm" aria-label="Submit example" disabled={!text.trim()} onClick={submit}><ArrowUp size={20} /></IconButton>
      </>}
      bottomContent={work && engaged && <Flex disableAnimatePresence wrap="wrap" gap="xs" className="border-t border-outline-variant/40 pt-2">
        <Button size="xs" variant="ghost" startIcon={<Paperclip size={14} />} onClick={() => setContext(!context)}>Example context</Button>
        <Button size="xs" variant="ghost" onClick={() => setText('Summarize the notes and suggest the next steps.\n\nKeep the summary concise.')}>Insert a prompt</Button>
      </Flex>}
    />
    <Typography variant="body-small" className="text-on-surface-variant">Enter adds a line. Ctrl/⌘ + Enter submits this local example.</Typography>
    {submitted && <Flex disableAnimatePresence direction="column" gap="xs" role="status" className="rounded-2xl bg-surface-container p-4">
      <Typography variant="label-medium">Submitted locally</Typography>
      <Typography variant="body-medium" className="whitespace-pre-wrap break-words">{submitted}</Typography>
      <Button size="xs" variant="ghost" onClick={() => setSubmitted('')} startIcon={<X size={14} />}>Dismiss</Button>
    </Flex>}
  </Flex>
}
export const Conversation: Story = { render: () => <ComposedExample /> }
export const Workspace: Story = { render: () => <ComposedExample work /> }
export const SurfacesAndShapes: Story = {
  render: () => <Flex disableAnimatePresence direction="column" gap="lg" className="w-full">
    {(['filled', 'filled-inverted', 'outlined', 'ghost'] as const).map(variant => <Composer key={variant} aria-label={`${variant} composer`} placeholder={variant} variant={variant} />)}
    {(['full', 'minimal', 'sharp'] as const).map(shape => <Composer key={shape} aria-label={`${shape} composer`} placeholder={shape} shape={shape} layout="stacked" defaultValue="A reusable editing surface." />)}
    <Composer aria-label="Read-only composer" readOnly defaultValue="Read-only text can still be selected and copied." />
    <Composer aria-label="Disabled composer" disabled defaultValue="Disabled editor" />
  </Flex>,
}
