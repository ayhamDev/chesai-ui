import { format } from 'date-fns'
import { CalendarDays, CircleHelp, Keyboard, Mic, Phone, ShieldCheck, Video, VideoIcon } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '../alert'
import { Avatar } from '../avatar'
import { Button } from '../button'
import { Card } from '../card'
import { DatePicker } from '../date-picker/date-picker'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../dialog'
import { EmptyState } from '../empty-state'
import { IconButton } from '../icon-button'
import { Input } from '../input'
import { NavigationRail } from '../navigation-rail'
import { Textarea } from '../textarea'
import { Tooltip, TooltipProvider, TooltipTrigger } from '../tooltip'
import { Typography } from '../typography'
import { WeekCalendar } from './index'

const initialDate = new Date(2026, 8, 23)
type Meeting = { id: number; date: string; title: string; time: string }
type Panel = 'new' | 'notes' | 'safety' | 'join' | 'date' | 'help' | null

/** Story-only example: all controls and surfaces are composed from Chesai UI. */
export function MeetingShowcase() {
  const [selected, setSelected] = useState<Date | null>(initialDate)
  const [tab, setTab] = useState('meetings')
  const [panel, setPanel] = useState<Panel>(null)
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('16:00')
  const [notes, setNotes] = useState('')
  const [savedNotes, setSavedNotes] = useState('')
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([
    { id: 1, date: '2026-09-23', title: 'Supy × كرسبي رول', time: '16:00' },
    { id: 2, date: '2026-09-24', title: 'Design team catch-up', time: '10:00' },
    { id: 3, date: '2026-09-25', title: 'A look at what’s next', time: '14:30' },
  ])
  const dateKey = selected ? format(selected, 'yyyy-MM-dd') : ''
  const scheduled = meetings.filter(meeting => meeting.date === dateKey).sort((a, b) => a.time.localeCompare(b.time))
  const timeLabel = (value: string) => {
    const [hour, minute] = value.split(':').map(Number)
    return `${format(new Date(2026, 8, 23, hour, minute), 'h:mm a')} – ${format(new Date(2026, 8, 23, hour + 1, minute), 'h:mm a')}`
  }
  const openNotes = () => {
    setNotes(savedNotes)
    setPanel('notes')
  }
  const panelTitle = {
    new: 'Schedule a meeting',
    notes: 'In-person notes',
    safety: 'Your meeting is safe',
    join: 'Ready to join?',
    date: 'Choose a date',
    help: 'Make room for a conversation',
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:gap-8">
        <div className="flex items-center gap-3 lg:w-56">
          <Card variant="tertiary" padding="sm" shape="minimal">
            <Video className="size-7" aria-hidden="true" />
          </Card>
          <Typography as="span" variant="headline-small">
            Chesai Meet
          </Typography>
        </div>
        <div className="order-3 flex w-full flex-wrap items-center gap-2 lg:order-none lg:w-auto lg:flex-1 lg:justify-center">
          <form
            className="min-w-0 basis-full sm:basis-auto sm:flex-1 sm:min-w-64 sm:max-w-96"
            onSubmit={event => {
              event.preventDefault()
              if (code.trim()) setPanel('join')
            }}
          >
            <Input
              aria-label="Meeting code or link"
              placeholder="Enter a code or link"
              shape="full"
              value={code}
              onValueChange={setCode}
              startContent={<Keyboard className="size-5 shrink-0" aria-hidden="true" />}
              endContent={
                <Button type="submit" size="sm" variant="secondary" disabled={!code.trim()}>
                  Join
                </Button>
              }
            />
          </form>
          <Button
            disabled={!selected}
            variant="tertiary"
            startIcon={<VideoIcon className="size-5" />}
            onClick={() => setPanel('new')}
          >
            New
          </Button>
          <Button variant="secondary" startIcon={<Mic className="size-5" />} onClick={openNotes}>
            In-person notes
          </Button>
        </div>
        <div className="ms-auto flex items-center gap-3 lg:ms-0">
          <TooltipProvider>
            <TooltipTrigger asChild>
              <IconButton variant="ghost" aria-label="Help" onClick={() => setPanel('help')}>
                <CircleHelp />
              </IconButton>
            </TooltipTrigger>
            <Tooltip>Help</Tooltip>
          </TooltipProvider>
          <Avatar fallback="Alex Morgan" size="sm" aria-label="Alex Morgan" />
        </div>
      </header>

      <div className="flex">
        <aside className="hidden shrink-0 pt-6 md:block">
          <NavigationRail.Navigator
            activeTab={tab}
            onTabPress={setTab}
            variant="ghost"
            bordered={false}
            itemLayout="stacked"
            pillStyle="icon"
            hideMenuButton
            expandable={false}
            width="7rem"
          >
            <NavigationRail.Screen name="meetings" label="Meetings" icon={() => <CalendarDays />} />
            <NavigationRail.Screen name="calls" label="Calls" icon={() => <Phone />} />
          </NavigationRail.Navigator>
        </aside>
        <main className="mx-auto w-full min-w-0 max-w-[1400px] px-4 pb-16 pt-4 sm:px-8 lg:px-16 lg:pt-8">
          <nav aria-label="Meeting navigation" className="mb-6 flex gap-2 md:hidden">
            <Button
              size="sm"
              variant={tab === 'meetings' ? 'secondary' : 'ghost'}
              aria-pressed={tab === 'meetings'}
              startIcon={<CalendarDays className="size-4" />}
              onClick={() => setTab('meetings')}
            >
              Meetings
            </Button>
            <Button
              size="sm"
              variant={tab === 'calls' ? 'secondary' : 'ghost'}
              aria-pressed={tab === 'calls'}
              startIcon={<Phone className="size-4" />}
              onClick={() => setTab('calls')}
            >
              Calls
            </Button>
          </nav>
          {tab === 'meetings' ? (
            <>
              <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex shrink-0 items-center gap-2">
                  <Typography as="h1" variant="headline-small">
                    {selected ? format(selected, 'EEE, MMM d') : 'Choose a day'}
                  </Typography>
                  <TooltipProvider>
                    <TooltipTrigger asChild>
                      <IconButton variant="ghost" aria-label="Choose a date" onClick={() => setPanel('date')}>
                        <CalendarDays />
                      </IconButton>
                    </TooltipTrigger>
                    <Tooltip>Choose a date</Tooltip>
                  </TooltipProvider>
                </div>
                <div className="w-full xl:max-w-[640px]">
                  <WeekCalendar
                    value={selected}
                    onSelect={setSelected}
                    color="primary-container"
                    aria-label="Meeting dates"
                    classNames={{ navigation: 'w-8! sm:w-14!', day: 'px-0! sm:px-1!' }}
                  />
                </div>
              </div>
              <Alert variant="primary" shape="full" role="note" className="items-center flex-wrap gap-y-4">
                <AlertIcon>
                  <ShieldCheck />
                </AlertIcon>
                <AlertContent className="min-w-40">
                  <AlertTitle>Your meeting is safe</AlertTitle>
                  <AlertDescription>No one can join a meeting unless invited or admitted by the host.</AlertDescription>
                </AlertContent>
                <Button variant="outline" size="sm" onClick={() => setPanel('safety')}>
                  Learn more
                </Button>
              </Alert>
              <section
                className="mt-8 space-y-4"
                aria-label={`Meetings for ${selected ? format(selected, 'PPPP') : 'No date selected'}`}
              >
                <Typography as="h2" variant="title-small" className="text-on-surface-variant">
                  Scheduled
                </Typography>
                {scheduled.length ? (
                  scheduled.map(meeting => (
                    <Card
                      key={meeting.id}
                      variant="surface-container-low"
                      shape="full"
                      padding="lg"
                      className="flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="min-w-0 space-y-2">
                        <Typography variant="label-large" className="text-on-surface-variant">
                          {timeLabel(meeting.time)}
                        </Typography>
                        <Typography as="h3" variant="headline-small" className="break-words">
                          <bdi>{meeting.title}</bdi>
                        </Typography>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setActiveMeeting(meeting)}>
                        View meeting
                      </Button>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon={<CalendarDays />}
                    title={selected ? 'A little room in your day' : 'Choose a day to see your meetings'}
                    description={
                      selected
                        ? 'No meetings scheduled for this date. Choose another day or plan something new.'
                        : 'Select a date in the calendar to view or schedule a meeting.'
                    }
                    action={
                      <Button variant="secondary" onClick={() => setPanel(selected ? 'new' : 'date')}>
                        {selected ? 'Schedule a meeting' : 'Choose a date'}
                      </Button>
                    }
                  />
                )}
              </section>
            </>
          ) : (
            <EmptyState
              icon={<Phone />}
              title="Your conversations start here"
              description="No recent calls. Enter a meeting code above to preview joining a call."
              action={
                <Button variant="secondary" onClick={() => setTab('meetings')}>
                  Back to meetings
                </Button>
              }
            />
          )}
        </main>
      </div>

      <Dialog
        open={panel !== null}
        onOpenChange={open => {
          if (!open) setPanel(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{panel ? panelTitle[panel] : ''}</DialogTitle>
            <DialogDescription>
              {panel === 'new'
                ? `Plan a one-hour meeting on ${format(selected ?? initialDate, 'PP')}.`
                : 'Chesai Meet · interactive component showcase'}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {panel === 'new' && (
              <form
                id="showcase-new-meeting"
                className="space-y-4"
                onSubmit={event => {
                  event.preventDefault()
                  if (!selected || !title.trim() || !time) return
                  setMeetings(previous => [...previous, { id: Date.now(), title: title.trim(), time, date: dateKey }])
                  setTitle('')
                  setPanel(null)
                  setTab('meetings')
                }}
              >
                <Input
                  label="Meeting title"
                  aria-label="Meeting title"
                  value={title}
                  onValueChange={setTitle}
                  required
                  autoFocus
                />
                <Input
                  label="Start time"
                  aria-label="Start time"
                  type="time"
                  value={time}
                  onValueChange={setTime}
                  required
                />
              </form>
            )}
            {panel === 'notes' && (
              <Textarea
                label="Meeting notes"
                aria-label="Meeting notes"
                placeholder="Ideas, decisions, and next steps…"
                value={notes}
                onChange={event => setNotes(event.target.value)}
                minRows={7}
              />
            )}
            {panel === 'date' && (
              <DatePicker
                label="Meeting date"
                value={selected ?? undefined}
                onChange={date => {
                  if (date) {
                    setSelected(date)
                    setPanel(null)
                  }
                }}
              />
            )}
            {panel === 'safety' && (
              <Typography>
                Meeting hosts decide who can join and when to admit guests. This showcase uses sample meetings only and
                does not connect to a calling service.
              </Typography>
            )}
            {panel === 'help' && (
              <Typography>
                Swipe through the calendar or use the arrows to browse. Select a day to see its meetings, create a new
                meeting, or keep notes. Sample changes last for this preview session.
              </Typography>
            )}
            {panel === 'join' && (
              <>
                <Typography variant="title-medium" className="break-all">
                  {code.trim()}
                </Typography>
                <Typography>
                  This is a local meeting preview. No camera, microphone, or external calling service is connected.
                </Typography>
              </>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPanel(null)}>
              {panel === 'new' || panel === 'notes' ? 'Cancel' : 'Close'}
            </Button>
            {panel === 'new' && (
              <Button type="submit" form="showcase-new-meeting" disabled={!title.trim() || !time}>
                Create meeting
              </Button>
            )}
            {panel === 'notes' && (
              <Button
                onClick={() => {
                  setSavedNotes(notes)
                  setPanel(null)
                }}
              >
                Save notes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!activeMeeting}
        onOpenChange={open => {
          if (!open) setActiveMeeting(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeMeeting?.title}</DialogTitle>
            <DialogDescription>
              {activeMeeting
                ? `${selected ? format(selected, 'PPPP') : 'No date selected'} · ${timeLabel(activeMeeting.time)}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Typography>
              Your meeting is scheduled. This showcase previews meeting details without connecting to a live call.
            </Typography>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActiveMeeting(null)}>
              Close
            </Button>
            <Button
              startIcon={<Mic className="size-4" />}
              onClick={() => {
                setActiveMeeting(null)
                openNotes()
              }}
            >
              Take notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
