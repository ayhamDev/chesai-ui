import './messenger.css'
import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion'
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BellOff,
  BookOpen,
  Bookmark,
  Camera,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileText,
  Heart,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pause,
  Pencil,
  Phone,
  PhoneOff,
  Pin,
  Play,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smile,
  Sparkles,
  Sun,
  Trash2,
  Users,
  Volume2,
  VolumeX,
  X,
  Mic,
  MicOff,
} from 'lucide-react'
import { Avatar } from '../../lib/components/avatar'
import { Badge } from '../../lib/components/badge'
import { BottomTabs } from '../../lib/components/bottom-tabs'
import { Button } from '../../lib/components/button'
import { Card } from '../../lib/components/card'
import { Chat } from '../../lib/components/chat'
import { Chip } from '../../lib/components/chip'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../lib/components/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../lib/components/dropdown-menu'
import { ElasticScrollArea } from '../../lib/components/elastic-scroll-area'
import { EmptyState } from '../../lib/components/empty-state'
import { IconButton } from '../../lib/components/icon-button'
import { Input } from '../../lib/components/input'
import { Flex } from '../../lib/components/layouts'
import { Popover } from '../../lib/components/popover'
import { Sheet } from '../../lib/components/sheet'
import { Switch } from '../../lib/components/switch'
import { Textarea } from '../../lib/components/textarea'
import { Typography } from '../../lib/components/typography'
import {
  filterConversations,
  initialConversations,
  stories,
  updateConversation,
  type Conversation,
  type Message,
} from './model'

const spring = { type: 'spring' as const, stiffness: 380, damping: 34 }
const mutedText = 'text-on-surface-variant'
const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
const avatarColors = [
  '[&>span]:bg-primary-container! [&>span]:text-on-primary-container!',
  '[&>span]:bg-tertiary-container! [&>span]:text-on-tertiary-container!',
  '[&>span]:bg-secondary-container! [&>span]:text-on-secondary-container!',
]

function PersonAvatar({ person, size = 'md' }: { person: Conversation; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <Avatar
      fallback={person.name}
      size={size}
      shapeStyle={person.category === 'Groups' ? 'clover4' : undefined}
      className={avatarColors[initialConversations.findIndex(c => c.id === person.id) % 3]}
    />
  )
}

function Attachment({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <Button
      variant="ghost"
      shape="minimal"
      className="messenger-row h-auto! p-3! justify-start! text-start bg-surface/50! text-on-surface! w-full"
      onClick={onOpen}
      aria-label={`Preview ${name}`}
    >
      <Flex disableAnimatePresence align="center" gap="sm" className="min-w-0">
        <Flex
          disableAnimatePresence
          align="center"
          justify="center"
          className="h-11 w-11 shrink-0 rounded-xl bg-primary-container text-on-primary-container"
        >
          <FileText size={23} />
        </Flex>
        <Flex disableAnimatePresence direction="column" gap="xs" className="min-w-0">
          <Typography variant="label-large" className="truncate">
            {name}
          </Typography>
          <Typography variant="body-small" className={mutedText}>
            PDF document · Preview
          </Typography>
        </Flex>
      </Flex>
    </Button>
  )
}

function StoryViewer({
  index,
  onIndex,
  onClose,
  onReply,
}: {
  index: number
  onIndex: (index: number) => void
  onClose: () => void
  onReply: (id: string) => void
}) {
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const reducedMotion = useReducedMotion()
  const story = stories[index]
  const person = initialConversations.find(c => c.id === story.person)!
  const advance = () => (index < stories.length - 1 ? onIndex(index + 1) : onClose())
  useEffect(() => {
    setProgress(0)
  }, [index])
  useEffect(() => {
    if (paused || reducedMotion) return
    const timer = window.setInterval(() => setProgress(p => Math.min(100, p + 2)), 120)
    return () => window.clearInterval(timer)
  }, [index, paused, reducedMotion])
  useEffect(() => {
    if (progress >= 100) advance()
  }, [progress])
  const Icon = story.icon === 'sun' ? Sun : story.icon === 'book' ? BookOpen : Camera
  return (
    <Flex
      disableAnimatePresence
      direction="column"
      gap="lg"
      className="min-h-[min(72dvh,620px)] p-1"
      onKeyDown={event => {
        if (event.key === 'ArrowRight') advance()
        if (event.key === 'ArrowLeft') onIndex(Math.max(0, index - 1))
      }}
    >
      <Flex disableAnimatePresence gap="xs" aria-label="Story progress">
        {stories.map((s, i) => (
          <Flex
            disableAnimatePresence
            key={s.person}
            className="h-1 flex-1 rounded-full bg-on-tertiary-container/15 overflow-hidden"
          >
            <Flex
              disableAnimatePresence
              className="h-full bg-on-tertiary-container"
              style={{ width: `${i < index ? 100 : i === index ? progress : 0}%` }}
            />
          </Flex>
        ))}
      </Flex>
      <Flex disableAnimatePresence align="center" gap="sm">
        <PersonAvatar person={person} size="sm" />
        <Flex disableAnimatePresence direction="column" gap="none" className="flex-1">
          <Typography variant="title-small">{person.name}</Typography>
          <Typography variant="body-small">Today · 12 min ago</Typography>
        </Flex>
        <IconButton
          variant="ghost"
          aria-label={paused ? 'Play story' : 'Pause story'}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play /> : <Pause />}
        </IconButton>
        <IconButton variant="ghost" aria-label="Close story" onClick={onClose}>
          <X />
        </IconButton>
      </Flex>
      <Flex
        disableAnimatePresence
        key={index}
        direction="column"
        align="center"
        justify="center"
        gap="lg"
        className="flex-1 text-center py-10"
        initial={{ y: reducedMotion ? 0 : 24 }}
        animate={{ y: 0 }}
        transition={spring}
      >
        <Flex
          disableAnimatePresence
          align="center"
          justify="center"
          className="h-36 w-36 rounded-[40%] bg-on-tertiary-container/10"
        >
          <Icon size={72} strokeWidth={1} />
        </Flex>
        <Typography variant="display-small" className="max-w-xs">
          {story.title}
        </Typography>
        <Typography variant="body-large" className="max-w-xs">
          {story.subtitle}
        </Typography>
        <Badge variant="outline" className="gap-2 py-2 px-3">
          <Sparkles size={14} />
          {story.location}
        </Badge>
      </Flex>
      <Flex disableAnimatePresence align="center" justify="between">
        <IconButton
          variant="ghost"
          aria-label="Previous story"
          disabled={index === 0}
          onClick={() => onIndex(index - 1)}
        >
          <ChevronLeft />
        </IconButton>
        <Button variant="secondary" startIcon={<MessageCircle size={18} />} onClick={() => onReply(person.id)}>
          Send a message
        </Button>
        <IconButton variant="ghost" aria-label="Next story" onClick={advance}>
          <ChevronRight />
        </IconButton>
      </Flex>
    </Flex>
  )
}

export function Messenger() {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState('jenny')
  const [mobileChat, setMobileChat] = useState(false)
  const [tab, setTab] = useState('chats')
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [replies, setReplies] = useState<Record<string, string>>({})
  const [chatSearch, setChatSearch] = useState<string | null>(null)
  const [panel, setPanel] = useState<'settings' | 'profile' | 'new' | 'about' | null>(null)
  const [contactQuery, setContactQuery] = useState('')
  const [documentName, setDocumentName] = useState<string | null>(null)
  const [deleteMessage, setDeleteMessage] = useState<Message | null>(null)
  const [storyIndex, setStoryIndex] = useState<number | null>(null)
  const [viewedStories, setViewedStories] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const [compact, setCompact] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [wallpaper, setWallpaper] = useState(true)
  const [accountName, setAccountName] = useState('Alex Morgan')
  const [call, setCall] = useState<Conversation | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [micMuted, setMicMuted] = useState(false)
  const [speaker, setSpeaker] = useState(true)
  const [calls, setCalls] = useState([
    { id: 'dianne', time: 'Today, 09:12', outgoing: false, length: '04:28' },
    { id: 'jenny', time: 'Yesterday, 18:45', outgoing: true, length: '12:06' },
    { id: 'robert', time: 'Yesterday, 12:30', outgoing: false, length: 'Missed' },
  ])
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const returnToComposer = useRef(false)
  const restoreComposer = (event: Event) => {
    if (returnToComposer.current) {
      event.preventDefault()
      returnToComposer.current = false
      composerRef.current?.focus()
    }
  }
  const reducedMotion = useReducedMotion()
  const active = conversations.find(c => c.id === activeId)!
  const visible = filterConversations(conversations, query, category, unreadOnly)
  const draft = drafts[activeId] ?? ''
  const reply = replies[activeId]
  const contacts = conversations.filter(c => c.category === 'Personal' && c.id !== 'notes')
  const unreadCount = conversations.reduce((total, c) => total + c.unread, 0)
  const messages = active.messages.filter(
    m => !chatSearch || `${m.text} ${m.attachment ?? ''}`.toLowerCase().includes(chatSearch.toLowerCase()),
  )

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    const markVisibleRead = () => {
      if (desktop.matches)
        setConversations(items => updateConversation(items, activeId, c => (c.unread ? { ...c, unread: 0 } : c)))
    }
    markVisibleRead()
    desktop.addEventListener('change', markVisibleRead)
    return () => desktop.removeEventListener('change', markVisibleRead)
  }, [activeId])
  useEffect(() => {
    if (!call) return
    const started = Date.now()
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => window.clearInterval(timer)
  }, [call])
  useEffect(() => {
    if (storyIndex !== null) setViewedStories(ids => [...new Set([...ids, stories[storyIndex].person])])
  }, [storyIndex])

  const update = (id: string, fn: (c: Conversation) => Conversation) =>
    setConversations(items => updateConversation(items, id, fn))
  const openChat = (id: string) => {
    setActiveId(id)
    setMobileChat(true)
    setTab('chats')
    setChatSearch(null)
    setPanel(null)
    update(id, c => ({ ...c, unread: 0 }))
  }
  const send = (attachment?: string) => {
    const text = draft.trim()
    if ((!text && !attachment) || active.category === 'Channels') return
    const item: Message = {
      id: crypto.randomUUID(),
      text: text || 'Shared a document',
      own: true,
      time: timeNow(),
      reply,
      attachment,
    }
    update(activeId, c => ({
      ...c,
      messages: [...c.messages, item],
      time: item.time,
      unread: 0,
      updatedAt: Date.now(),
    }))
    setDrafts(values => ({ ...values, [activeId]: '' }))
    setReplies(values => ({ ...values, [activeId]: '' }))
    setChatSearch(null)
    composerRef.current?.focus()
  }
  const save = (message: Message) => {
    if (message.saved) {
      openChat('notes')
      return
    }
    setConversations(items =>
      items.map(c =>
        c.id === 'notes'
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  ...message,
                  id: crypto.randomUUID(),
                  own: true,
                  saved: false,
                  reply: undefined,
                  reaction: false,
                  source: active.name,
                  time: timeNow(),
                },
              ],
              time: timeNow(),
              updatedAt: Date.now(),
            }
          : c.id === activeId
            ? { ...c, messages: c.messages.map(m => (m.id === message.id ? { ...m, saved: true } : m)) }
            : c,
      ),
    )
    setNotice('Message added to Saved messages')
  }
  const startCall = (person: Conversation) => {
    setSeconds(0)
    setMicMuted(false)
    setSpeaker(true)
    setCall(person)
  }
  const endCall = () => {
    if (call)
      setCalls(items => [{ id: call.id, time: 'Just now', outgoing: true, length: duration(seconds) }, ...items])
    setCall(null)
    setNotice('Demo call ended')
  }
  const toggleMute = () => update(activeId, c => ({ ...c, muted: !c.muted }))

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <Flex
        disableAnimatePresence
        direction="column"
        gap="none"
        className="h-dvh min-h-0 bg-surface-container text-on-surface p-0 md:p-4 lg:p-6"
        role="main"
        aria-label="Telegram messenger showcase"
      >
        <Flex disableAnimatePresence align="center" justify="between" className="hidden! md:flex! shrink-0 pb-3 px-2">
          <Flex disableAnimatePresence gap="sm" align="center">
            <Send size={15} className="text-primary" />
            <Typography variant="label-large">CHESAI APPS</Typography>
            <Typography variant="body-small" className={mutedText}>
              / Telegram
            </Typography>
          </Flex>
          <Typography variant="label-small" className={mutedText}>
            A little more personal.
          </Typography>
        </Flex>
        <Flex
          disableAnimatePresence
          gap="none"
          className="flex-1 min-h-0 w-full max-w-[1500px] mx-auto overflow-hidden bg-surface md:rounded-[28px] md:border md:border-outline-variant/50"
        >
          <Flex
            disableAnimatePresence
            direction="column"
            gap="none"
            className={`${mobileChat ? 'hidden! md:flex!' : 'messenger-list-visible flex!'} w-full md:w-[350px] lg:w-[390px] shrink-0 min-h-0 md:border-e border-outline-variant/50 bg-surface`}
          >
            <Flex disableAnimatePresence direction="column" gap="md" className="px-5 pt-6 pb-3 shrink-0">
              <Flex disableAnimatePresence align="center" justify="between">
                <Flex disableAnimatePresence align="center" gap="sm">
                  <DropdownMenu overlay overlayBlur="sm">
                    <DropdownMenuTrigger asChild>
                      <IconButton variant="ghost" size="sm" aria-label="Account menu">
                        <Menu size={21} />
                      </IconButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      <DropdownMenuItem
                        onSelect={() => {
                          setContactQuery('')
                          setPanel('new')
                        }}
                      >
                        <Pencil />
                        New message
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => openChat('notes')}>
                        <Bookmark />
                        Saved messages
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setTab('contacts')
                          setMobileChat(false)
                        }}
                      >
                        <Users />
                        Contacts
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => setPanel('settings')}>
                        <Settings />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setPanel('about')}>
                        <CircleHelp />
                        About this app
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Typography variant="headline-medium">
                    {tab === 'chats'
                      ? 'Telegram'
                      : tab === 'calls'
                        ? 'Calls'
                        : tab === 'contacts'
                          ? 'Contacts'
                          : 'Stories'}
                  </Typography>
                </Flex>
                <Button
                  variant="ghost"
                  className="p-0! h-auto! rounded-full"
                  aria-label="Your profile and settings"
                  onClick={() => setPanel('settings')}
                >
                  <Avatar fallback={accountName} size="sm" />
                </Button>
              </Flex>
              {tab === 'chats' && (
                <Input
                  aria-label="Search messages"
                  placeholder="Search messages"
                  shape="full"
                  size="sm"
                  value={query}
                  onValueChange={setQuery}
                  isClearable
                  startContent={<Search size={18} />}
                />
              )}
              {tab === 'chats' && (
                <Flex
                  disableAnimatePresence
                  align="center"
                  gap="xs"
                  className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {['All', 'Personal', 'Groups', 'Channels'].map(value => (
                    <Chip
                      key={value}
                      size="sm"
                      variant="tonal"
                      showCheck={false}
                      selected={category === value}
                      onClick={() => setCategory(value)}
                      className="shrink-0"
                    >
                      {value}
                    </Chip>
                  ))}
                </Flex>
              )}
            </Flex>

            <ElasticScrollArea
              className="flex-1 min-h-0"
              viewportClassName="[&>div]:block!"
              hideScrollbarOnMobile
              elasticity={false}
            >
              <AnimatePresence mode="wait" initial={false}>
                <Flex
                  disableAnimatePresence
                  key={tab}
                  direction="column"
                  gap="none"
                  className="px-3 pb-24"
                  initial={{ y: reducedMotion ? 0 : 10, opacity: reducedMotion ? 1 : 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: reducedMotion ? 1 : 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.16 }}
                >
                  {tab === 'chats' && (
                    <>
                      <Flex disableAnimatePresence align="center" justify="between" className="px-3 pt-1 pb-2">
                        <Typography variant="label-medium" className={mutedText}>
                          {query ? `${visible.length} results` : 'YOUR CONVERSATIONS'}
                        </Typography>
                        <Chip
                          size="sm"
                          variant="ghost"
                          selected={unreadOnly}
                          onSelectedChange={setUnreadOnly}
                          showCheck={false}
                        >
                          Unread {unreadCount || ''}
                        </Chip>
                      </Flex>
                      {visible.map(person => (
                        <Button
                          key={person.id}
                          variant="ghost"
                          shape="minimal"
                          aria-label={`Open ${person.name}`}
                          aria-current={activeId === person.id ? 'true' : undefined}
                          className={`messenger-row w-full h-auto! px-3! ${compact ? 'py-2!' : 'py-3.5!'} justify-start! text-start text-on-surface! ${activeId === person.id ? 'md:bg-secondary-container/60!' : ''}`}
                          onClick={() => openChat(person.id)}
                        >
                          <Flex disableAnimatePresence align="center" gap="sm" className="w-full min-w-0">
                            <Flex disableAnimatePresence className="shrink-0">
                              <PersonAvatar person={person} />
                              {person.online && (
                                <Flex
                                  disableAnimatePresence
                                  aria-label="Online"
                                  className="absolute! bottom-0 right-0 w-3 h-3 bg-primary border-2 border-surface rounded-full"
                                />
                              )}
                            </Flex>
                            <Flex disableAnimatePresence direction="column" gap="xs" className="flex-1 min-w-0">
                              <Flex disableAnimatePresence align="center" justify="between" gap="xs">
                                <Typography variant="title-small" className="truncate">
                                  {person.name}
                                </Typography>
                                <Typography
                                  variant="label-small"
                                  className={`shrink-0 ${person.unread ? 'text-primary' : mutedText}`}
                                >
                                  {person.time}
                                </Typography>
                              </Flex>
                              <Flex disableAnimatePresence align="center" gap="xs">
                                <Typography variant="body-small" className={`${mutedText} truncate flex-1`}>
                                  {drafts[person.id]
                                    ? `Draft: ${drafts[person.id]}`
                                    : (person.messages.at(-1)?.text ?? 'Start a conversation')}
                                </Typography>
                                {person.muted && <BellOff size={13} className="shrink-0 text-on-surface-variant" />}
                                {person.pinned && <Pin size={12} className="shrink-0 text-on-surface-variant" />}
                                {notifications && person.unread > 0 && (
                                  <Badge className="py-0! px-1.5! min-w-5 justify-center border-0!">
                                    {person.unread}
                                  </Badge>
                                )}
                              </Flex>
                            </Flex>
                          </Flex>
                        </Button>
                      ))}
                      {!visible.length && (
                        <EmptyState
                          icon={<Search />}
                          title="No conversations found"
                          description="Try a different name or message, or clear your filters."
                          action={
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setQuery('')
                                setCategory('All')
                                setUnreadOnly(false)
                              }}
                            >
                              Clear search and filters
                            </Button>
                          }
                        />
                      )}
                    </>
                  )}
                  {tab === 'calls' && (
                    <>
                      <Card variant="secondary" padding="md" className="mx-2 mb-5">
                        <Flex disableAnimatePresence direction="column" gap="sm">
                          <ShieldCheck size={24} className="text-primary" />
                          <Typography variant="title-medium">A familiar voice.</Typography>
                          <Typography variant="body-small" className={mutedText}>
                            Your people, just a tap away. Try a call to explore the experience.
                          </Typography>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="self-start"
                            onClick={() => {
                              setContactQuery('')
                              setPanel('new')
                            }}
                          >
                            Choose a contact
                            <ChevronRight size={16} />
                          </Button>
                        </Flex>
                      </Card>
                      <Typography variant="label-medium" className={`px-3 pb-2 ${mutedText}`}>
                        RECENT CALLS
                      </Typography>
                      {calls.map((entry, i) => {
                        const person = conversations.find(c => c.id === entry.id)!
                        return (
                          <Flex
                            disableAnimatePresence
                            key={`${entry.id}-${i}`}
                            align="center"
                            gap="sm"
                            className="px-3 py-3"
                          >
                            <PersonAvatar person={person} />
                            <Flex disableAnimatePresence direction="column" gap="xs" className="flex-1">
                              <Typography variant="title-small">{person.name}</Typography>
                              <Flex
                                disableAnimatePresence
                                align="center"
                                gap="xs"
                                className={entry.length === 'Missed' ? 'text-error' : mutedText}
                              >
                                {entry.outgoing ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                <Typography variant="body-small">
                                  {entry.time} · {entry.length}
                                </Typography>
                              </Flex>
                            </Flex>
                            <IconButton
                              variant="ghost"
                              size="sm"
                              aria-label={`Call ${person.name}`}
                              onClick={() => startCall(person)}
                            >
                              <Phone size={19} />
                            </IconButton>
                          </Flex>
                        )
                      })}
                    </>
                  )}
                  {tab === 'contacts' && (
                    <>
                      <Typography variant="body-medium" className={`px-3 pb-4 ${mutedText}`}>
                        Good conversations start here.
                      </Typography>
                      {contacts.map(person => (
                        <Button
                          key={person.id}
                          variant="ghost"
                          className="messenger-row h-auto! p-3! justify-start! text-on-surface!"
                          onClick={() => openChat(person.id)}
                        >
                          <PersonAvatar person={person} />
                          <Flex disableAnimatePresence direction="column" gap="xs" className="text-start">
                            <Typography variant="title-small">{person.name}</Typography>
                            <Typography variant="body-small" className={person.online ? 'text-primary' : mutedText}>
                              {person.online ? 'Online' : 'Last seen recently'}
                            </Typography>
                          </Flex>
                        </Button>
                      ))}
                    </>
                  )}
                  {tab === 'stories' && (
                    <>
                      <Typography variant="body-medium" className={`px-3 pb-5 ${mutedText}`}>
                        Little moments from your people.
                      </Typography>
                      {stories.map((story, index) => {
                        const person = conversations.find(c => c.id === story.person)!
                        return (
                          <Button
                            key={person.id}
                            variant="ghost"
                            shape="minimal"
                            className="messenger-row h-auto! p-4! mb-2 text-start justify-start! text-on-surface! bg-surface-container-low!"
                            onClick={() => setStoryIndex(index)}
                          >
                            <Flex
                              disableAnimatePresence
                              className={`p-1 rounded-full border-2 ${viewedStories.includes(person.id) ? 'border-outline-variant' : 'border-primary'}`}
                            >
                              <PersonAvatar person={person} />
                            </Flex>
                            <Flex disableAnimatePresence direction="column" gap="xs">
                              <Typography variant="title-small">{person.name}</Typography>
                              <Typography variant="body-small" className={mutedText}>
                                {story.title}
                              </Typography>
                              <Typography variant="label-small" className="text-primary">
                                {viewedStories.includes(person.id) ? 'View again' : 'New story'}
                              </Typography>
                            </Flex>
                          </Button>
                        )
                      })}
                    </>
                  )}
                </Flex>
              </AnimatePresence>
            </ElasticScrollArea>
            <Flex disableAnimatePresence justify="end" className="absolute! bottom-24 right-5 pointer-events-none">
              <Button
                aria-label="New message"
                startIcon={<Pencil size={20} />}
                shape="minimal"
                className="pointer-events-auto shadow-lg"
                onClick={() => {
                  setContactQuery('')
                  setPanel('new')
                }}
              >
                Compose
              </Button>
            </Flex>
            <BottomTabs.Navigator
              activeTab={tab}
              onTabPress={setTab}
              size="sm"
              variant="surface"
              pillStyle="icon"
              className="shrink-0 border-t border-outline-variant/30 pb-[env(safe-area-inset-bottom)]"
            >
              <BottomTabs.Screen name="chats" label="Chats" icon={({ size }) => <MessageCircle size={size} />} />
              <BottomTabs.Screen name="calls" label="Calls" icon={({ size }) => <Phone size={size} />} />
              <BottomTabs.Screen name="contacts" label="Contacts" icon={({ size }) => <Users size={size} />} />
              <BottomTabs.Screen name="stories" label="Stories" icon={({ size }) => <Camera size={size} />} />
            </BottomTabs.Navigator>
          </Flex>

          <Flex
            disableAnimatePresence
            direction="column"
            gap="none"
            className={`${mobileChat ? 'messenger-chat-visible flex!' : 'hidden! md:flex!'} flex-1 min-w-0 min-h-0 bg-surface-container-lowest`}
          >
            <Flex
              disableAnimatePresence
              align="center"
              gap="sm"
              className="shrink-0 px-3 md:px-6 py-3 bg-surface border-b border-outline-variant/30"
            >
              <IconButton
                variant="ghost"
                size="sm"
                className="md:hidden!"
                aria-label="Back to chats"
                onClick={() => setMobileChat(false)}
              >
                <ArrowLeft />
              </IconButton>
              <Button
                variant="ghost"
                className="messenger-row p-0! h-auto! text-on-surface! min-w-0 text-start justify-start!"
                aria-label={`View ${active.name} profile`}
                onClick={() => setPanel('profile')}
              >
                <PersonAvatar person={active} size="sm" />
                <Flex disableAnimatePresence direction="column" gap="none" className="min-w-0">
                  <Typography variant="title-medium" className="truncate">
                    {active.name}
                  </Typography>
                  <Typography variant="body-small" className={`truncate ${active.online ? 'text-primary' : mutedText}`}>
                    {active.id === 'notes'
                      ? 'Only you can see this space'
                      : active.category === 'Groups'
                        ? '12 members · 4 online'
                        : active.category === 'Channels'
                          ? '2.4k subscribers'
                          : active.online
                            ? 'Online'
                            : 'Last seen recently'}
                  </Typography>
                </Flex>
              </Button>
              <Flex disableAnimatePresence gap="xs" className="ms-auto shrink-0">
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="Search this conversation"
                  onClick={() => setChatSearch(chatSearch === null ? '' : null)}
                >
                  <Search size={20} />
                </IconButton>
                {active.category === 'Personal' && active.id !== 'notes' && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label={`Call ${active.name}`}
                    onClick={() => startCall(active)}
                  >
                    <Phone size={19} />
                  </IconButton>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconButton variant="ghost" size="sm" aria-label="Conversation options">
                      <MoreHorizontal />
                    </IconButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setPanel('profile')}>
                      <Users />
                      View profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => update(activeId, c => ({ ...c, pinned: !c.pinned }))}>
                      <Pin />
                      {active.pinned ? 'Unpin conversation' : 'Pin conversation'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={toggleMute}>
                      {active.muted ? <Bell /> : <BellOff />}
                      {active.muted ? 'Unmute notifications' : 'Mute notifications'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => openChat('notes')}>
                      <Bookmark />
                      Saved messages
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Flex>
            </Flex>
            {chatSearch !== null && (
              <Flex
                disableAnimatePresence
                align="center"
                gap="sm"
                className="p-3 border-b border-outline-variant/30 bg-surface"
              >
                <Input
                  autoFocus
                  aria-label="Search in conversation"
                  placeholder="Find a message…"
                  size="sm"
                  value={chatSearch}
                  onValueChange={setChatSearch}
                  startContent={<Search size={16} />}
                  className="flex-1"
                />
                <Typography variant="label-small" className="shrink-0">
                  {messages.length} found
                </Typography>
                <IconButton
                  aria-label="Close conversation search"
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatSearch(null)}
                >
                  <X />
                </IconButton>
              </Flex>
            )}
            <Flex
              disableAnimatePresence
              key={activeId}
              direction="column"
              gap="none"
              className="flex-1 min-h-0 overflow-hidden"
              initial={{ x: reducedMotion ? 0 : 20 }}
              animate={{ x: 0 }}
              transition={spring}
            >
              {wallpaper && (
                <Flex
                  disableAnimatePresence
                  aria-hidden="true"
                  wrap="wrap"
                  align="center"
                  justify="center"
                  gap="xl"
                  className="absolute! inset-0 opacity-[0.035] text-primary overflow-hidden pointer-events-none p-10"
                >
                  {Array.from({ length: 32 }, (_, i) => {
                    const Icon = [Sun, Send, Heart, Camera, Sparkles, MessageCircle, BookOpen, Smile][i % 8]
                    return <Icon key={i} size={52} strokeWidth={1} className={i % 2 ? 'rotate-12' : '-rotate-12'} />
                  })}
                </Flex>
              )}
              <Chat.Root behavior={reducedMotion ? 'instant' : 'smooth'}>
                <Chat.Viewport
                  className="flex-1 min-h-0 [scrollbar-width:thin]"
                  aria-label={`Messages with ${active.name}`}
                >
                  <Chat.Content className="max-w-[860px] mx-auto px-4 md:px-8 pt-6 pb-5">
                    <Flex disableAnimatePresence justify="center" className="mb-6">
                      <Badge variant="secondary" className="font-normal! px-4! bg-surface-container!">
                        {active.id === 'notes'
                          ? 'Saved notes'
                          : active.messages[0]?.time === 'Yesterday'
                            ? 'Yesterday'
                            : active.messages[0]?.time === 'Mon'
                              ? 'Monday'
                              : 'Today'}
                      </Badge>
                    </Flex>
                    <Flex disableAnimatePresence justify="center" className="mb-7">
                      <Typography
                        variant="label-small"
                        className={`${mutedText} text-center flex items-center gap-1.5`}
                      >
                        <ShieldCheck size={13} />A local showcase. Make yourself at home.
                      </Typography>
                    </Flex>
                    <AnimatePresence initial={false}>
                      {messages.map(message => (
                        <Flex
                          disableAnimatePresence
                          key={message.id}
                          direction="column"
                          gap="xs"
                          align={message.own ? 'end' : 'start'}
                          className="mb-3"
                          initial={{ y: reducedMotion ? 0 : 14, scale: reducedMotion ? 1 : 0.97 }}
                          animate={{ y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.97 }}
                          transition={spring}
                        >
                          <Flex
                            disableAnimatePresence
                            align="end"
                            gap="xs"
                            className={`max-w-[92%] md:max-w-[78%] ${message.own ? 'flex-row-reverse' : ''}`}
                          >
                            <Card
                              padding="none"
                              variant={message.own ? 'secondary' : 'surface-container'}
                              className={`min-w-0 px-4 py-3 shadow-none! rounded-[22px]! ${message.own ? 'rounded-br-md!' : 'rounded-bl-md!'} ${message.own ? 'bg-primary-container! text-on-primary-container!' : ''}`}
                            >
                              <Flex disableAnimatePresence direction="column" gap="sm">
                                {message.source && (
                                  <Typography variant="label-medium" className="text-primary">
                                    Saved from {message.source}
                                  </Typography>
                                )}
                                {message.reply && (
                                  <Flex
                                    disableAnimatePresence
                                    direction="column"
                                    gap="xs"
                                    className="border-s-2 border-primary ps-3 py-1"
                                  >
                                    <Typography variant="label-medium" className="text-primary">
                                      Reply
                                    </Typography>
                                    <Typography variant="body-small" className="line-clamp-2">
                                      {message.reply}
                                    </Typography>
                                  </Flex>
                                )}
                                {message.attachment && (
                                  <Attachment
                                    name={message.attachment}
                                    onOpen={() => setDocumentName(message.attachment!)}
                                  />
                                )}
                                <Typography
                                  variant="body-medium"
                                  className="whitespace-pre-wrap break-words leading-relaxed"
                                >
                                  {message.text}
                                </Typography>
                                <Flex disableAnimatePresence justify="end" align="center" gap="xs">
                                  <Typography variant="label-small" className="opacity-65">
                                    {message.time}
                                  </Typography>
                                  {message.saved && <Bookmark size={12} aria-label="Saved" />}
                                  {message.own && (
                                    <CheckCheck size={15} className="text-primary" aria-label="Sent locally" />
                                  )}
                                </Flex>
                              </Flex>
                            </Card>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <IconButton
                                  variant="ghost"
                                  size="xs"
                                  aria-label={`Message options: ${message.text.slice(0, 35)}`}
                                  className="shrink-0 opacity-65 hover:opacity-100"
                                >
                                  <MoreHorizontal size={16} />
                                </IconButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align={message.own ? 'end' : 'start'}
                                onCloseAutoFocus={restoreComposer}
                              >
                                {active.category !== 'Channels' && (
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      setReplies(values => ({ ...values, [activeId]: message.text }))
                                      returnToComposer.current = true
                                    }}
                                  >
                                    <MessageCircle />
                                    Reply
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onSelect={() =>
                                    update(activeId, c => ({
                                      ...c,
                                      messages: c.messages.map(m =>
                                        m.id === message.id ? { ...m, reaction: !m.reaction } : m,
                                      ),
                                    }))
                                  }
                                >
                                  <Heart />
                                  {message.reaction ? 'Remove reaction' : 'React with a heart'}
                                </DropdownMenuItem>
                                {active.id !== 'notes' && (
                                  <DropdownMenuItem onSelect={() => save(message)}>
                                    <Bookmark />
                                    {message.saved ? 'View saved message' : 'Save message'}
                                  </DropdownMenuItem>
                                )}
                                {message.own && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-error" onSelect={() => setDeleteMessage(message)}>
                                      <Trash2 />
                                      Delete message
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </Flex>
                          {message.reaction && (
                            <Chip
                              size="sm"
                              variant="tonal"
                              selected
                              startIcon={<Heart size={13} fill="currentColor" />}
                              showCheck={false}
                              aria-label="Remove heart reaction"
                              onClick={() =>
                                update(activeId, c => ({
                                  ...c,
                                  messages: c.messages.map(m => (m.id === message.id ? { ...m, reaction: false } : m)),
                                }))
                              }
                            >
                              1
                            </Chip>
                          )}
                        </Flex>
                      ))}
                    </AnimatePresence>
                    {!messages.length && (
                      <EmptyState
                        icon={<MessageCircle />}
                        title={chatSearch ? 'No matching messages' : 'A fresh conversation'}
                        description={
                          chatSearch
                            ? 'Try another word or close search to see every message.'
                            : 'Say hello. This space is yours.'
                        }
                      />
                    )}
                  </Chat.Content>
                </Chat.Viewport>
                <Chat.ScrollToBottom asChild>
                  <IconButton
                    variant="secondary"
                    aria-label="Jump to latest message"
                    className="absolute! bottom-4 right-5 shadow-md data-[state=hidden]:hidden!"
                  >
                    <ArrowDown size={19} />
                  </IconButton>
                </Chat.ScrollToBottom>
              </Chat.Root>
            </Flex>
            <Flex
              disableAnimatePresence
              direction="column"
              gap="sm"
              className="shrink-0 border-t border-outline-variant/30 bg-surface p-2 md:px-4 pb-[max(8px,env(safe-area-inset-bottom))]"
            >
              {reply && (
                <Flex disableAnimatePresence gap="sm" align="center" className="border-s-2 border-primary ps-3">
                  <Flex disableAnimatePresence direction="column" gap="none" className="flex-1 min-w-0">
                    <Typography variant="label-medium" className="text-primary">
                      Replying to message
                    </Typography>
                    <Typography variant="body-small" className="truncate">
                      {reply}
                    </Typography>
                  </Flex>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="Cancel reply"
                    onClick={() => setReplies(values => ({ ...values, [activeId]: '' }))}
                  >
                    <X size={18} />
                  </IconButton>
                </Flex>
              )}
              {active.category === 'Channels' ? (
                <Button variant="secondary" onClick={toggleMute} startIcon={active.muted ? <Bell /> : <BellOff />}>
                  {active.muted ? 'Enable channel notifications' : 'Mute channel notifications'}
                </Button>
              ) : (
                <Flex disableAnimatePresence align="end" gap="xs" className="rounded-3xl bg-surface-container-lowest p-1">
                  <Popover>
                    <Popover.Trigger asChild>
                      <IconButton variant="ghost" size="sm" aria-label="Add emoji">
                        <Smile size={22} />
                      </IconButton>
                    </Popover.Trigger>
                    <Popover.Content className="w-64" onCloseAutoFocus={restoreComposer}>
                      <Flex disableAnimatePresence wrap="wrap" gap="xs">
                        {['😊', '❤️', '🙌', '☀️', '☕', '🎉', '👍', '✨', '📷', '🌿'].map(emoji => (
                          <Popover.Close key={emoji} asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Insert ${emoji}`}
                              className="text-xl! px-3!"
                              onClick={() => {
                                setDrafts(values => ({ ...values, [activeId]: (values[activeId] ?? '') + emoji }))
                                returnToComposer.current = true
                              }}
                            >
                              {emoji}
                            </Button>
                          </Popover.Close>
                        ))}
                      </Flex>
                    </Popover.Content>
                  </Popover>
                  <Textarea
                    ref={composerRef}
                    aria-label="Message"
                    placeholder={active.id === 'notes' ? 'Save a note…' : 'Write a message…'}
                    variant="ghost"
                    shape="full"
                    size="sm"
                    minRows={1}
                    maxRows={4}
                    className="flex-1 min-w-0"
                    classNames={{ inputWrapper: 'px-1! bg-transparent! border-0! py-2!', input: 'text-base' }}
                    value={draft}
                    onValueChange={value => setDrafts(values => ({ ...values, [activeId]: value }))}
                    onKeyDown={event => {
                      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault()
                        send()
                      }
                    }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <IconButton variant="ghost" size="sm" aria-label="Attach a document">
                        <Paperclip size={21} />
                      </IconButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onCloseAutoFocus={restoreComposer}>
                      <DropdownMenuItem
                        onSelect={() => {
                          returnToComposer.current = true
                          send('Weekend field notes.pdf')
                        }}
                      >
                        <FileText />
                        Weekend field notes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          returnToComposer.current = true
                          send('Design review.pdf')
                        }}
                      >
                        <FileText />
                        Design review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <IconButton aria-label="Send message" disabled={!draft.trim()} onClick={() => send()} size="sm">
                    <Send size={21} />
                  </IconButton>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Flex>
        <AnimatePresence>
          {notice && (
            <Flex
              disableAnimatePresence
              role="status"
              key={notice}
              align="center"
              gap="sm"
              className="fixed! z-[100] bottom-6 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface shadow-lg rounded-full py-3 px-5 max-w-[90vw]"
              initial={{ y: 24 }}
              animate={{ y: 0 }}
              exit={{ y: 24, opacity: 0 }}
            >
              <CheckCheck size={18} />
              <Typography variant="body-small">{notice}</Typography>
              <IconButton
                variant="ghost"
                size="xs"
                className="text-inverse-on-surface!"
                aria-label="Dismiss notification"
                onClick={() => setNotice('')}
              >
                <X size={15} />
              </IconButton>
            </Flex>
          )}
        </AnimatePresence>

        <Sheet
          open={panel !== null}
          onOpenChange={open => {
            if (!open) setPanel(null)
          }}
          overlayBlur="sm"
          width="md"
        >
          <Sheet.Content className="flex flex-col max-h-[90dvh] md:max-h-none p-0!">
            <Flex disableAnimatePresence align="center" justify="between" className="px-6 pt-6 pb-4">
              <Sheet.Title>
                {panel === 'settings'
                  ? 'Make it yours'
                  : panel === 'profile'
                    ? 'Contact info'
                    : panel === 'new'
                      ? 'New conversation'
                      : 'Made with Chesai'}
              </Sheet.Title>
              <Sheet.Close asChild>
                <IconButton variant="ghost" size="sm" aria-label="Close panel">
                  <X />
                </IconButton>
              </Sheet.Close>
            </Flex>
            <Sheet.Description className="px-6 pb-4">
              {panel === 'new'
                ? 'Choose someone to say hello to.'
                : panel === 'settings'
                  ? 'Small details. A space that feels like you.'
                  : panel === 'profile'
                    ? active.name
                    : 'A messenger, reimagined with your component library.'}
            </Sheet.Description>
            <ElasticScrollArea className="min-h-0 flex-1 px-6 pb-6" hideScrollbarOnMobile>
              {panel === 'settings' && (
                <Flex disableAnimatePresence direction="column" gap="lg">
                  <Flex disableAnimatePresence align="center" gap="md">
                    <Avatar fallback={accountName} size="lg" />
                    <Flex disableAnimatePresence direction="column" gap="xs">
                      <Typography variant="title-large">{accountName || 'Your profile'}</Typography>
                      <Typography variant="body-small" className={mutedText}>
                        @alexmorgan · demo account
                      </Typography>
                    </Flex>
                  </Flex>
                  <Input
                    aria-label="Display name"
                    label="Display name"
                    value={accountName}
                    maxLength={40}
                    onValueChange={setAccountName}
                  />
                  <Card variant="surface-container-low">
                    <Flex disableAnimatePresence direction="column" gap="lg">
                      <Switch
                        aria-label="Notifications"
                        label="Notifications"
                        description="Show unread message badges."
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                      <Switch
                        aria-label="Compact conversations"
                        label="Compact conversations"
                        description="A little more room in your chat list."
                        checked={compact}
                        onCheckedChange={setCompact}
                      />
                      <Switch
                        aria-label="Chat wallpaper"
                        label="Chat wallpaper"
                        description="A quiet pattern behind your conversations."
                        checked={wallpaper}
                        onCheckedChange={setWallpaper}
                      />
                    </Flex>
                  </Card>
                  <Typography variant="body-small" className={mutedText}>
                    Colors and type follow your Chesai theme. Preferences and messages stay in this demo until the page
                    is reloaded.
                  </Typography>
                  <Button
                    onClick={() => {
                      setPanel(null)
                      setNotice('Preferences updated')
                    }}
                  >
                    Done
                  </Button>
                </Flex>
              )}
              {panel === 'profile' && (
                <Flex disableAnimatePresence direction="column" gap="lg">
                  <Flex disableAnimatePresence direction="column" align="center" gap="md" className="py-3">
                    <PersonAvatar person={active} size="xl" />
                    <Typography variant="headline-small">{active.name}</Typography>
                    <Badge variant="secondary">
                      {active.category === 'Personal'
                        ? active.online
                          ? 'Online'
                          : 'Last seen recently'
                        : active.category}
                    </Badge>
                  </Flex>
                  <Card variant="surface-container-low">
                    <Flex disableAnimatePresence direction="column" gap="sm">
                      <Typography variant="label-large" className="text-primary">
                        ABOUT
                      </Typography>
                      <Typography variant="body-medium">{active.about}</Typography>
                    </Flex>
                  </Card>
                  <Switch
                    aria-label="Mute conversation"
                    label="Mute conversation"
                    checked={!!active.muted}
                    onCheckedChange={checked => update(activeId, c => ({ ...c, muted: checked }))}
                  />
                  <Button variant="secondary" startIcon={<MessageCircle />} onClick={() => setPanel(null)}>
                    Message
                  </Button>
                  {active.category === 'Personal' && active.id !== 'notes' && (
                    <Button
                      variant="outline"
                      startIcon={<Phone />}
                      onClick={() => {
                        setPanel(null)
                        startCall(active)
                      }}
                    >
                      Try a call
                    </Button>
                  )}
                  <Typography variant="label-large">SHARED DOCUMENTS</Typography>
                  {active.messages.filter(m => m.attachment).length ? (
                    active.messages
                      .filter(m => m.attachment)
                      .map(m => (
                        <Attachment key={m.id} name={m.attachment!} onOpen={() => setDocumentName(m.attachment!)} />
                      ))
                  ) : (
                    <Typography variant="body-small" className={mutedText}>
                      Documents shared here will appear in this space.
                    </Typography>
                  )}
                </Flex>
              )}
              {panel === 'new' && (
                <Flex disableAnimatePresence direction="column" gap="sm">
                  <Input
                    aria-label="Find a contact"
                    placeholder="Find a contact"
                    value={contactQuery}
                    onValueChange={setContactQuery}
                    startContent={<Search size={18} />}
                  />
                  {contacts
                    .filter(c => c.name.toLowerCase().includes(contactQuery.toLowerCase()))
                    .map(person => (
                      <Button
                        key={person.id}
                        variant="ghost"
                        className="messenger-row h-auto! p-3! justify-start! text-on-surface!"
                        onClick={() => openChat(person.id)}
                      >
                        <PersonAvatar person={person} />
                        <Typography variant="title-small">{person.name}</Typography>
                        <ChevronRight className="ms-auto" size={18} />
                      </Button>
                    ))}
                  {!contacts.some(c => c.name.toLowerCase().includes(contactQuery.toLowerCase())) && (
                    <EmptyState
                      icon={<Search />}
                      title="No contacts found"
                      description="Try Jenny, Bessie, or Dianne."
                    />
                  )}
                </Flex>
              )}
              {panel === 'about' && (
                <Flex disableAnimatePresence direction="column" gap="lg">
                  <Flex
                    disableAnimatePresence
                    className="p-6 self-start rounded-[28px] bg-primary-container text-on-primary-container"
                  >
                    <Send size={48} />
                  </Flex>
                  <Typography variant="headline-medium">Familiar. More personal.</Typography>
                  <Typography variant="body-large">
                    An interactive app built from Chesai UI components, inspired by Telegram and Material You.
                  </Typography>
                  <Typography variant="body-medium" className={mutedText}>
                    Try searching a conversation, sending a message, adding a reaction, or saving a note. Browse stories
                    and explore the call experience.
                  </Typography>
                  <Card variant="secondary">
                    <Typography variant="body-small">
                      Everything is local demo data. Messages are not sent to anyone, calls are simulated, and reloading
                      resets the app.
                    </Typography>
                  </Card>
                </Flex>
              )}
            </ElasticScrollArea>
          </Sheet.Content>
        </Sheet>

        <Dialog
          open={!!documentName}
          onOpenChange={open => {
            if (!open) setDocumentName(null)
          }}
          overlayBlur="md"
        >
          <DialogContent className="max-w-md">
            <Flex disableAnimatePresence direction="column" gap="lg">
              <Flex disableAnimatePresence align="center" justify="between">
                <FileText size={28} className="text-primary" />
                <IconButton
                  aria-label="Close document preview"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDocumentName(null)}
                >
                  <X />
                </IconButton>
              </Flex>
              <DialogTitle>{documentName}</DialogTitle>
              <DialogDescription>Sample document preview</DialogDescription>
              <Card variant="surface" bordered>
                <Flex disableAnimatePresence direction="column" gap="md">
                  <Typography variant="headline-small">
                    {documentName === 'Design review.pdf'
                      ? 'Thoughtful details make a difference.'
                      : 'The best plans leave room for a little discovery.'}
                  </Typography>
                  <Typography variant="body-medium">
                    {documentName === 'Design review.pdf'
                      ? '01 / Keep the important actions within reach'
                      : '01 / Take the scenic route'}
                  </Typography>
                  <Typography variant="body-medium">
                    {documentName === 'Design review.pdf'
                      ? '02 / Give every interaction a clear response'
                      : '02 / Find a good coffee spot'}
                  </Typography>
                  <Typography variant="body-medium">
                    {documentName === 'Design review.pdf'
                      ? '03 / Make room for accessibility and motion preferences'
                      : '03 / Bring a camera and an open mind'}
                  </Typography>
                </Flex>
              </Card>
              <Typography variant="body-small" className={mutedText}>
                This is a sample document included in the showcase.
              </Typography>
              <Button onClick={() => setDocumentName(null)}>Done</Button>
            </Flex>
          </DialogContent>
        </Dialog>
        <Dialog
          open={!!deleteMessage}
          onOpenChange={open => {
            if (!open) setDeleteMessage(null)
          }}
          overlayBlur="sm"
        >
          <DialogContent className="max-w-sm">
            <Flex disableAnimatePresence direction="column" gap="lg">
              <DialogTitle>Delete this message?</DialogTitle>
              <DialogDescription>This removes the message from this local conversation.</DialogDescription>
              <Flex disableAnimatePresence justify="end" gap="sm">
                <Button variant="ghost" onClick={() => setDeleteMessage(null)}>
                  Keep message
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    update(activeId, c => ({ ...c, messages: c.messages.filter(m => m.id !== deleteMessage?.id) }))
                    setDeleteMessage(null)
                    setNotice('Message deleted')
                  }}
                >
                  Delete
                </Button>
              </Flex>
            </Flex>
          </DialogContent>
        </Dialog>
        <Dialog
          open={!!call}
          onOpenChange={open => {
            if (!open) endCall()
          }}
          overlayBlur="lg"
        >
          <DialogContent className="max-w-sm">
            <Flex disableAnimatePresence direction="column" align="center" gap="lg" className="py-6 text-center">
              <Badge variant="tertiary">DEMO CALL</Badge>
              {call && <PersonAvatar person={call} size="xl" />}
              <DialogTitle>{call?.name}</DialogTitle>
              <DialogDescription>No real call is placed. Explore the call controls below.</DialogDescription>
              <Typography variant="headline-medium" className="tabular-nums">
                {duration(seconds)}
              </Typography>
              <Flex disableAnimatePresence gap="md">
                <IconButton
                  variant={micMuted ? 'secondary' : 'outline'}
                  aria-label={micMuted ? 'Unmute microphone' : 'Mute microphone'}
                  aria-pressed={micMuted}
                  onClick={() => setMicMuted(!micMuted)}
                >
                  {micMuted ? <MicOff /> : <Mic />}
                </IconButton>
                <IconButton
                  variant={speaker ? 'secondary' : 'outline'}
                  aria-label="Toggle speaker"
                  aria-pressed={speaker}
                  onClick={() => setSpeaker(!speaker)}
                >
                  {speaker ? <Volume2 /> : <VolumeX />}
                </IconButton>
                <IconButton variant="destructive" aria-label="End call" onClick={endCall}>
                  <PhoneOff />
                </IconButton>
              </Flex>
            </Flex>
          </DialogContent>
        </Dialog>
        <Dialog
          open={storyIndex !== null}
          onOpenChange={open => {
            if (!open) setStoryIndex(null)
          }}
          overlayBlur="lg"
        >
          <DialogContent className="max-w-md bg-tertiary-container! text-on-tertiary-container! p-5!">
            <DialogTitle className="sr-only">Friends’ stories</DialogTitle>
            <DialogDescription className="sr-only">
              Use previous and next to navigate. Pause to read at your own pace.
            </DialogDescription>
            {storyIndex !== null && (
              <StoryViewer
                index={storyIndex}
                onIndex={setStoryIndex}
                onClose={() => setStoryIndex(null)}
                onReply={id => {
                  setStoryIndex(null)
                  openChat(id)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Flex>
    </MotionConfig>
  )
}
