import { cva, type VariantProps } from 'class-variance-authority'

export const dateInputStyles = cva('group flex flex-col data-[hidden=true]:hidden w-full', {
  variants: {
    variant: {
      flat: 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
      faded: 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
      bordered: 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
      underlined: 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
    },
    color: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      error: 'text-error',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
    shape: {
      full: '',
      minimal: '',
      sharp: '',
    },
    labelPlacement: {
      inside: '',
      outside: '',
      'outside-left': 'flex-row items-center flex-wrap md:flex-nowrap gap-x-4',
    },
    isInvalid: {
      true: '',
      false: '',
    },
    isDisabled: {
      true: 'opacity-disabled pointer-events-none',
    },
  },
  defaultVariants: {
    variant: 'flat',
    color: 'primary',
    size: 'md',
    shape: 'minimal',
    labelPlacement: 'inside',
  },
})

export const dateInputSlots = {
  base: 'group flex flex-col data-[hidden=true]:hidden w-full',
  label: [
    'absolute z-10 block subpixel-antialiased text-on-surface-variant/70 pointer-events-none',
    'origin-top-left transition-all duration-200 ease-out will-change-transform',
    'cursor-text group-data-[filled=true]:cursor-default',
  ],
  inputWrapper: [
    'relative w-full inline-flex tap-highlight-transparent flex-row items-center gap-1 px-3 transition-colors duration-200 ease-out overflow-hidden h-14 min-h-14',
  ],
  innerWrapper: 'flex h-full items-center w-full gap-0.5',
  segment: [
    'group/segment px-0.5 tabular-nums text-start transition-colors rounded-sm focus:outline-none',
    'text-on-surface',
    'data-[placeholder=true]:text-on-surface-variant/50',
    'focus:bg-primary focus:text-on-primary',
    'data-[invalid=true]:text-error',
  ],
  helperWrapper: 'p-1 relative flex flex-col gap-1.5',
  description: 'text-xs text-on-surface-variant',
  errorMessage: 'text-xs text-error',
}

export const getDateInputSlotClassNames = (
  props: VariantProps<typeof dateInputStyles> & {
    isInvalid?: boolean
    hasLabel?: boolean
    isFilled?: boolean
  },
) => {
  const { variant, shape, isInvalid, labelPlacement, size, hasLabel, isFilled } = props

  // --- SHAPE LOGIC ---
  let rounding = 'rounded-2xl'
  if (shape === 'full') rounding = 'rounded-full'
  if (shape === 'sharp') rounding = 'rounded-none'
  if (variant === 'underlined') rounding = 'rounded-none'

  // --- VARIANT STYLES ---
  const wrapperClasses: string[] = [rounding]

  if (variant === 'flat') {
    wrapperClasses.push(
      'bg-surface-container-low hover:bg-surface-container-highest',
      'focus-within:bg-surface-container-highest',
    )
  } else if (variant === 'faded') {
    wrapperClasses.push(
      'bg-surface-container/30 border-2 border-surface-container-highest/50',
      'hover:bg-surface-container/50',
      'focus-within:bg-surface-container/50',
      'focus-within:border-transparent',
      'transition-colors',
    )
  } else if (variant === 'bordered') {
    wrapperClasses.push(
      'bg-transparent border-2 border-outline-variant',
      'focus-within:border-primary',
      'hover:border-on-surface-variant',
    )
  } else if (variant === 'underlined') {
    wrapperClasses.push(
      'bg-transparent border-b-2 border-outline-variant px-0 shadow-none',
      'focus-within:border-primary',
      '!px-0',
    )
  }

  // --- INVALID STATE ---
  const labelColor = isInvalid ? 'text-error' : 'group-focus-within:text-primary text-on-surface-variant/70'

  if (isInvalid) {
    if (variant === 'flat') wrapperClasses.push('bg-error-container/20 !text-error')
    else wrapperClasses.push('!border-error text-error')
  }

  // --- SIZING & PADDING ---
  let paddingX = 'px-3'
  let inputPadding = ''

  if (shape === 'full') {
    paddingX = 'px-5'
  } else {
    paddingX = 'px-4'
  }

  // --- LABEL PLACEMENT ---
  let labelClasses = 'absolute font-normal'

  if (labelPlacement === 'inside') {
    if (shape === 'full') {
      labelClasses += ' left-5 top-1/2 -translate-y-1/2'
    } else {
      labelClasses += ' left-3 top-1/2 -translate-y-1/2'
    }

    // Floating Label Logic
    const filledLabelState = [
      'group-data-[filled=true]:-translate-y-[calc(50%_+_10px)]',
      'group-data-[filled=true]:scale-85',
      'group-data-[filled=true]:opacity-70',
    ].join(' ')

    labelClasses += ` ${filledLabelState}`

    // Push segments down when label floats
    if (hasLabel && isFilled) {
      if (size === 'sm') inputPadding = 'pt-3'
      else inputPadding = 'pt-4'
    }
  } else {
    // Outside label
    labelClasses = 'static mb-1.5 ml-1 text-sm font-medium pointer-events-auto scale-100 translate-y-0'
  }

  // Underlined specific adjustments
  if (variant === 'underlined') {
    paddingX = 'px-0'
    if (labelPlacement === 'inside') {
      labelClasses = labelClasses.replace(/left-\d+/, 'left-0')
    }
  }

  return {
    base: '',
    label: [labelColor, labelClasses].join(' '),
    inputWrapper: [wrapperClasses.join(' '), paddingX].join(' '),
    innerWrapper: [inputPadding].join(' '),
    segment: '',
    helperWrapper: '',
    description: '',
    errorMessage: '',
  }
}
