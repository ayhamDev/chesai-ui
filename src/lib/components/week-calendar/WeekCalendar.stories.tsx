import type { Meta, StoryObj } from '@storybook/react'
import { format } from 'date-fns'
import { arSA, enGB } from 'date-fns/locale'
import { useState } from 'react'
import { DirectionProvider } from '../../context/direction'
import type { DateRange } from '../../hooks/use-calender'
import { WeekCalendar } from './index'
import { MeetingShowcase } from './MeetingShowcase'
import { weekCalendarColors } from './styles'

const initialDate = new Date(2026, 8, 23)

const meta = {
  title: 'Components/Forms & Inputs/WeekCalendar',
  component: WeekCalendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A continuous date strip using Chesai theme tokens. Week buttons carry the selected weekday forward or backward. Click a selected day again to clear it. Omit value/defaultValue for an initially unselected current week. Free scrolling and keyboard focus do not change selection. Supports ranges, restrictions, localization, RTL, forms, and custom content.',
      },
    },
  },
  decorators: [
    (Story, context) => (
      <div className={context.parameters.meetingShowcase ? 'w-full' : 'w-[min(640px,calc(100vw-2rem))]'}>
        <Story />
      </div>
    ),
  ],
  args: { defaultValue: initialDate },
  argTypes: {
    daysToShow: { control: { type: 'number', min: 1, max: 7, step: 1 } },
    variant: { control: 'select', options: ['embedded', 'default', 'outlined'] },
    color: { control: 'select', options: Object.keys(weekCalendarColors) },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['full', 'minimal', 'sharp'] },
    itemShape: { control: 'select', options: ['full', 'minimal', 'sharp'] },
    weekdayFormat: { control: 'select', options: ['narrow', 'short', 'long'] },
    weekStartsOn: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    showHeader: { control: 'boolean' },
    swipeable: { control: 'boolean' },
    swipeMode: { control: 'select', options: ['day', 'week'] },
    disableAnimation: { control: 'boolean' },
    selectionFollowsNavigation: { control: 'boolean' },
    value: { control: false },
    defaultValue: { control: false },
    locale: { control: false },
    visibleDate: { control: false },
    defaultVisibleDate: { control: false },
    eventDates: { control: false },
  },
} satisfies Meta<typeof WeekCalendar>
export default meta
type Story = StoryObj<typeof WeekCalendar>

export const Default: Story = {}

export const NoInitialSelection: Story = {
  args: { defaultValue: null },
  render: args => <WeekCalendar {...args} />,
}

export const NavigationOnly: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-on-surface-variant">
        Browse full weeks without selecting dates. Today keeps its outline.
      </p>
      <WeekCalendar mode="none" swipeMode="week" showHeader />
    </div>
  ),
}

export const WeekSwiping: Story = {
  args: { swipeMode: 'week', showHeader: true },
}

export const MeetingDashboard: Story = {
  name: 'Meeting dashboard showcase',
  parameters: { layout: 'fullscreen', meetingShowcase: true, controls: { disable: true } },
  render: () => <MeetingShowcase />,
}

export const SwipeNavigation: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-on-surface-variant">
        Freely drag or swipe the date strip. After scrolling stops, it aligns to the nearest day so both edges show
        complete dates. Hover or focus a date for its full date.
      </p>
      <WeekCalendar defaultValue={initialDate} showHeader color="primary-container" />
    </div>
  ),
}

export const ThemeColors: Story = {
  render: () => (
    <div className="space-y-6">
      {(Object.keys(weekCalendarColors) as Array<keyof typeof weekCalendarColors>).map(color => (
        <div key={color} className="space-y-2">
          <p className="text-sm text-on-surface-variant">{color}</p>
          <WeekCalendar defaultValue={initialDate} color={color} aria-label={`${color} calendar`} />
        </div>
      ))}
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(initialDate)
    return (
      <div className="space-y-4">
        <WeekCalendar value={date} onSelect={setDate} showHeader />
        <p className="text-sm text-on-surface-variant">Selected: {date ? format(date, 'PPPP') : 'None'}</p>
        <button type="button" className="text-sm text-primary underline" onClick={() => setDate(null)}>
          Clear selection
        </button>
      </div>
    )
  },
}

export const EventIndicators: Story = {
  args: {
    defaultVisibleDate: initialDate,
    eventDates: [new Date(2026, 8, 21), new Date(2026, 8, 23), new Date(2026, 8, 26)],
    showHeader: true,
  },
}

export const Range: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange>({ from: new Date(2026, 8, 22), to: new Date(2026, 8, 25) })
    return (
      <div className="space-y-4">
        <WeekCalendar
          mode="range"
          value={range}
          onRangeSelect={setRange}
          showHeader
          variant="default"
          color="secondary"
        />
        <p className="text-sm text-on-surface-variant">
          {range.from ? format(range.from, 'PP') : 'Start'} — {range.to ? format(range.to, 'PP') : 'Choose an end date'}
        </p>
      </div>
    )
  },
}

export const VariantsAndColors: Story = {
  render: () => (
    <div className="space-y-6">
      <WeekCalendar defaultValue={initialDate} variant="embedded" color="primary" aria-label="Primary calendar" />
      <WeekCalendar defaultValue={initialDate} variant="default" color="secondary" aria-label="Secondary calendar" />
      <WeekCalendar defaultValue={initialDate} variant="outlined" color="tertiary" aria-label="Tertiary calendar" />
      <WeekCalendar
        defaultValue={initialDate}
        variant="outlined"
        color="error"
        isInvalid
        aria-label="Invalid calendar"
      />
    </div>
  ),
}

export const SizesAndShapes: Story = {
  render: () => (
    <div className="space-y-6">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
        <WeekCalendar key={size} defaultValue={initialDate} size={size} aria-label={`${size} calendar`} />
      ))}
      <WeekCalendar defaultValue={initialDate} variant="default" shape="minimal" aria-label="Minimal shape calendar" />
      <WeekCalendar defaultValue={initialDate} variant="outlined" shape="sharp" aria-label="Sharp shape calendar" />
    </div>
  ),
}

export const RestrictedDates: Story = {
  args: {
    showHeader: true,
    minDate: new Date(2026, 8, 21),
    maxDate: new Date(2026, 9, 9),
    isDateDisabled: date => date.getDay() === 0 || date.getDay() === 6,
  },
}

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <WeekCalendar defaultVisibleDate={initialDate} aria-label="Empty selection" />
      <WeekCalendar defaultValue={initialDate} disabled aria-label="Disabled calendar" />
      <WeekCalendar defaultValue={initialDate} readOnly aria-label="Read only calendar" />
    </div>
  ),
}

export const LocalizationAndRTL: Story = {
  render: () => (
    <div className="space-y-6">
      <WeekCalendar defaultValue={initialDate} locale={enGB} showHeader aria-label="Monday first calendar" />
      <DirectionProvider dir="rtl">
        <WeekCalendar
          defaultValue={initialDate}
          locale={arSA}
          weekStartsOn={6}
          showHeader
          labels={{ calendar: 'اختر تاريخًا', previousWeek: 'الأسبوع السابق', nextWeek: 'الأسبوع التالي' }}
        />
      </DirectionProvider>
    </div>
  ),
}

export const CustomDayContent: Story = {
  args: {
    getDayLabel: date => `${format(date, 'PPPP')}${date.getDate() % 3 === 0 ? ', appointments available' : ''}`,
    size: 'lg',
    variant: 'default',
    renderDay: (date, state) => (
      <>
        <span className="text-xs uppercase">{format(date, 'EEE')}</span>
        <span className="font-semibold">{format(date, 'd')}</span>
        <span
          aria-hidden="true"
          className={`size-1 rounded-full ${date.getDate() % 3 === 0 ? 'bg-current' : 'invisible'}`}
        />
        {date.getDate() % 3 === 0 && (
          <span className="sr-only">Appointments available{state.isSelected ? ', selected' : ''}</span>
        )}
      </>
    ),
  },
}

export const CompactMobile: Story = {
  args: { daysToShow: 3, size: 'md', showHeader: true, swipeMode: 'week' },
  render: args => (
    <div className="w-[min(320px,100%)]">
      <WeekCalendar {...args} defaultValue={initialDate} />
    </div>
  ),
}

export const FormValue: Story = {
  render: () => {
    const [submitted, setSubmitted] = useState('')
    return (
      <form
        className="space-y-4"
        onSubmit={event => {
          event.preventDefault()
          setSubmitted(String(new FormData(event.currentTarget).get('appointment')))
        }}
      >
        <WeekCalendar name="appointment" defaultValue={initialDate} />
        <button type="submit" className="rounded-full bg-primary px-4 py-2 text-on-primary">
          Submit date
        </button>
        <output className="block text-sm text-on-surface-variant">{submitted}</output>
      </form>
    )
  },
}
