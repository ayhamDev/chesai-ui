import { cva } from 'class-variance-authority'

export const weekCalendarVariants = cva('w-full min-w-0 text-on-surface', {
  variants: {
    variant: {
      default: 'bg-surface-container p-3',
      outlined: 'border border-outline-variant p-3',
      embedded: 'bg-transparent',
    },
    shape: {
      full: 'rounded-[28px]',
      minimal: 'rounded-xl',
      sharp: 'rounded-none',
    },
  },
  defaultVariants: { variant: 'embedded', shape: 'full' },
})

export const weekCalendarDayVariants = cva(
  'relative isolate flex w-full min-w-0 select-none flex-col items-center justify-center gap-1 overflow-hidden font-button transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface aria-disabled:cursor-not-allowed aria-disabled:opacity-40 motion-reduce:transition-none ' +
    'after:pointer-events-none after:absolute after:inset-0 after:z-[-1] after:rounded-[inherit] after:bg-primary/20 after:opacity-0 after:scale-50 after:origin-center after:transition-all after:duration-300 after:ease-out hover:after:opacity-100 hover:after:scale-100 data-selected:after:hidden aria-disabled:after:opacity-0 motion-reduce:after:transition-none',
  {
    variants: {
      size: {
        xs: 'min-h-11 max-w-10 px-0.5 py-1 text-sm',
        sm: 'min-h-14 max-w-12 px-1 py-2 text-base',
        md: 'min-h-16 max-w-14 px-1 py-2.5 text-lg',
        lg: 'min-h-20 max-w-16 px-1.5 py-3 text-xl',
        xl: 'min-h-24 max-w-20 px-2 py-4 text-2xl',
      },
      shape: { full: 'rounded-full', minimal: 'rounded-xl', sharp: 'rounded-none' },
    },
    defaultVariants: { size: 'md', shape: 'full' },
  },
)

// Match the day pill's dimensions exactly while preserving IconButton's ghost bloom.
export const weekCalendarNavigationSizes = {
  xs: 'h-11! w-10!',
  sm: 'h-14! w-12!',
  md: 'h-16! w-14!',
  lg: 'h-20! w-16!',
  xl: 'h-24! w-20!',
}

export const weekCalendarRowHeights = { xs: 52, sm: 64, md: 72, lg: 88, xl: 104 }

export const weekCalendarColors = {
  primary: { selected: 'bg-primary text-on-primary', range: 'bg-primary-container text-on-primary-container' },
  secondary: {
    selected: 'bg-secondary text-on-secondary',
    range: 'bg-secondary-container text-on-secondary-container',
  },
  tertiary: { selected: 'bg-tertiary text-on-tertiary', range: 'bg-tertiary-container text-on-tertiary-container' },
  error: { selected: 'bg-error text-on-error', range: 'bg-error-container text-on-error-container' },
  'primary-container': {
    selected: 'bg-primary-container text-on-primary-container',
    range: 'bg-primary-container/50 text-on-surface',
  },
  'secondary-container': {
    selected: 'bg-secondary-container text-on-secondary-container',
    range: 'bg-secondary-container/50 text-on-surface',
  },
  'tertiary-container': {
    selected: 'bg-tertiary-container text-on-tertiary-container',
    range: 'bg-tertiary-container/50 text-on-surface',
  },
  'error-container': {
    selected: 'bg-error-container text-on-error-container',
    range: 'bg-error-container/50 text-on-surface',
  },
  surface: {
    selected: 'bg-surface-container-highest text-on-surface',
    range: 'bg-surface-container-high text-on-surface',
  },
  inverse: {
    selected: 'bg-inverse-surface text-inverse-on-surface',
    range: 'bg-surface-container-highest text-on-surface',
  },
}
