export type Category = 'Personal' | 'Groups' | 'Channels'
export type Message = {
  id: string
  text: string
  own: boolean
  time: string
  reply?: string
  attachment?: string
  reaction?: boolean
  saved?: boolean
  source?: string
}
export type Conversation = {
  updatedAt?: number
  id: string
  name: string
  category: Category
  initials: string
  about: string
  online?: boolean
  unread: number
  pinned?: boolean
  muted?: boolean
  time: string
  messages: Message[]
}

const message = (id: string, text: string, own = false, time = '10:24'): Message => ({ id, text, own, time })
export const initialConversations: Conversation[] = [
  {
    id: 'jenny',
    name: 'Jenny Wilson',
    initials: 'JW',
    category: 'Personal',
    online: true,
    unread: 2,
    pinned: true,
    time: '10:42',
    about: 'Collecting little moments. Designer, coffee enthusiast, and your next hiking buddy.',
    messages: [
      message('j1', 'Hey! A little inspiration for our weekend plans ☀️', false, '10:24'),
      {
        ...message('j2', 'Found this little place by the coast. Thoughts?', false, '10:25'),
        attachment: 'Weekend field notes.pdf',
      },
      message(
        'j3',
        'This is exactly what I needed. A slow morning, good coffee, and absolutely no notifications.',
        true,
        '10:28',
      ),
      message('j4', 'You had me at good coffee ☕', false, '10:30'),
      message('j5', 'Saturday? We could take the scenic route.', true, '10:32'),
      message('j6', 'Saturday it is! I’ll put together a playlist for the drive.', false, '10:41'),
      message('j7', 'And yes, I’m bringing the camera 📷', false, '10:42'),
    ],
  },
  {
    id: 'studio',
    name: 'Design collective',
    initials: 'DC',
    category: 'Groups',
    unread: 5,
    pinned: true,
    time: '10:38',
    about: 'A small space for big ideas. 12 members · 4 online.',
    messages: [
      message('d1', 'Maya: The new components are looking so good!'),
      message('d2', 'Alex: Sharing the notes from our design review.', false, '10:38'),
    ],
  },
  {
    id: 'bessie',
    name: 'Bessie Cooper',
    initials: 'BC',
    category: 'Personal',
    online: true,
    unread: 1,
    time: '10:16',
    about: 'Usually exploring a bookshop somewhere.',
    messages: [message('b1', 'Interested in this little bookshop I found?', false, '10:16')],
  },
  {
    id: 'notes',
    name: 'Saved messages',
    initials: 'SM',
    category: 'Personal',
    unread: 0,
    time: 'Yesterday',
    about: 'Your personal space for links, reminders, and messages worth keeping.',
    messages: [message('n1', 'A reminder: make time for the things that make you feel like you.', true, 'Yesterday')],
  },
  {
    id: 'material',
    name: 'Material dispatch',
    initials: 'MD',
    category: 'Channels',
    unread: 3,
    muted: true,
    time: '09:51',
    about: 'Thoughtful interfaces, delightful details. 2.4k subscribers.',
    messages: [message('m1', 'This week: finding the right rhythm in motion design.', false, '09:51')],
  },
  {
    id: 'dianne',
    name: 'Dianne Russell',
    initials: 'DR',
    category: 'Personal',
    unread: 0,
    time: '09:30',
    about: 'Photographer. Finding beauty in ordinary days.',
    messages: [message('dr1', 'It’s really nice working with you.', false, '09:30')],
  },
  {
    id: 'weekend',
    name: 'Weekend people',
    initials: 'WP',
    category: 'Groups',
    unread: 0,
    time: 'Yesterday',
    about: 'For plans that actually leave the group chat. 8 members.',
    messages: [message('w1', 'Robert: Who’s up for a morning hike?', false, 'Yesterday')],
  },
  {
    id: 'annette',
    name: 'Annette Black',
    initials: 'AB',
    category: 'Personal',
    unread: 0,
    time: 'Yesterday',
    about: 'Making things, one day at a time.',
    messages: [message('a1', 'The final files are ready whenever you are.', false, 'Yesterday')],
  },
  {
    id: 'robert',
    name: 'Robert Fox',
    initials: 'RF',
    category: 'Personal',
    unread: 0,
    time: 'Mon',
    about: 'Out of office, into the outdoors.',
    messages: [message('r1', 'See you there! 🙌', false, 'Mon')],
  },
]

export const stories = [
  {
    person: 'jenny',
    title: 'Taking the long way home.',
    subtitle: 'A little less rush. A little more sky.',
    location: 'Somewhere by the coast',
    icon: 'sun',
  },
  {
    person: 'bessie',
    title: 'One more chapter.',
    subtitle: 'Found my new favorite corner of the city.',
    location: 'Sunday book club',
    icon: 'book',
  },
  {
    person: 'dianne',
    title: 'Light changes everything.',
    subtitle: 'An ordinary afternoon, through a different lens.',
    location: 'From the camera roll',
    icon: 'camera',
  },
]

export function filterConversations(items: Conversation[], query: string, category: string, unreadOnly: boolean) {
  const search = query.trim().toLocaleLowerCase()
  return items
    .filter(
      c =>
        (category === 'All' || c.category === category) &&
        (!unreadOnly || c.unread > 0) &&
        (!search || `${c.name} ${c.messages.map(m => m.text).join(' ')}`.toLocaleLowerCase().includes(search)),
    )
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
}

export function updateConversation(items: Conversation[], id: string, update: (item: Conversation) => Conversation) {
  return items.map(c => (c.id === id ? update(c) : c))
}
