import { cva, type VariantProps } from 'class-variance-authority'

export const multiSelectStyles = cva('group flex flex-col w-full relative', {
  variants: {
    variant: {
      flat: '',
      faded: '',
      bordered: '',
      underlined: '',
    },
    color: {
      primary: '',
      secondary: '',
      error: '',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
    shape: {
      full: '',
      minimal: '',
      sharp: '',
    },
    labelPlacement: {
      inside: '',
      outside: '',
      'outside-left': 'flex-row items-start flex-wrap md:flex-nowrap gap-x-4',
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

export const multiSelectSlots = {
  base: 'group flex flex-col w-full relative',
  label: [
    'absolute z-10 block subpixel-antialiased text-on-surface-variant/70 pointer-events-none',
    'origin-top-left transition-all duration-200 ease-out will-change-transform',
    'cursor-text group-data-[filled=true]:cursor-default',
  ],
  trigger: [
    'relative w-full inline-flex tap-highlight-transparent flex-row items-center flex-wrap gap-2 transition-colors duration-200 ease-out overflow-hidden outline-none',
    'min-h-14 pr-10', // Default height and right padding for icon
  ],
  value: 'text-left font-normal bg-transparent text-on-surface select-none',
  placeholder: 'text-on-surface-variant/50 font-normal select-none',
  selectorIcon:
    'absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-on-surface-variant/50 pointer-events-none',
  chip: 'text-xs',
  helperWrapper: 'p-1 relative flex flex-col gap-1.5',
  description: 'text-xs text-on-surface-variant',
  errorMessage: 'text-xs text-error',
}

export const getMultiSelectSlotClassNames = (
  props: VariantProps<typeof multiSelectStyles> & {
    isFilled?: boolean
    hasLabel?: boolean
  },
) => {
  const { variant, size, labelPlacement, isInvalid, shape, hasLabel, isFilled } = props

  // --- 1. SHAPE LOGIC ---
  let rounding = 'rounded-2xl'
  if (shape === 'full') rounding = 'rounded-3xl'
  if (shape === 'sharp') rounding = 'rounded-none'
  if (variant === 'underlined') rounding = 'rounded-none'

  // --- 2. VARIANT STYLES ---
  const triggerClasses: string[] = [rounding]

  if (variant === 'flat') {
    triggerClasses.push(
      'bg-surface-container-low hover:bg-surface-container-highest',
      'data-[state=open]:bg-surface-container-highest',
    )
  } else if (variant === 'faded') {
    triggerClasses.push(
      'bg-surface-container/30 border-2 border-surface-container-highest/50',
      'hover:bg-surface-container/50',
      'data-[state=open]:bg-surface-container/50 data-[state=open]:border-transparent',
      'transition-colors',
    )
  } else if (variant === 'bordered') {
    triggerClasses.push(
      'bg-transparent border-2 border-outline-variant',
      'data-[state=open]:border-primary',
      'hover:border-on-surface-variant',
    )
  } else if (variant === 'underlined') {
    triggerClasses.push(
      'bg-transparent border-b-2 border-outline-variant px-0 shadow-none',
      'data-[state=open]:border-primary',
      '!px-0',
    )
  }

  // --- 3. INVALID STATE ---
  const labelColor = isInvalid ? 'text-error' : 'group-focus-within:text-primary text-on-surface-variant/70'

  if (isInvalid) {
    if (variant === 'flat') triggerClasses.push('bg-error-container/20 !text-error')
    else triggerClasses.push('!border-error text-error')
  }

  // --- 4. SIZING & PADDING ---
  let px = 'px-3'
  let labelClasses = 'left-3'
  let triggerPadding = 'py-3' // Default padding

  if (shape === 'full') {
    px = 'px-5'
    labelClasses = 'left-5'
  } else {
    px = 'px-4'
    labelClasses = 'left-4'
  }

  // --- 5. LABEL PLACEMENT & ALIGNMENT ---
  if (labelPlacement === 'inside') {
    if (hasLabel) {
      labelClasses += ' absolute top-1/2 -translate-y-1/2 font-normal'

      const filledLabelState = [
        'group-data-[filled=true]:top-3 group-data-[filled=true]:-translate-y-0',
        'group-data-[filled=true]:scale-85',
        'group-data-[filled=true]:opacity-70',
      ].join(' ')

      labelClasses += ` ${filledLabelState}`

      // Push content down when label is floating to prevent overlap
      if (isFilled) {
        if (size === 'sm') triggerPadding = 'pt-5 pb-1'
        else triggerPadding = 'pt-6 pb-2'
      } else {
        triggerPadding = 'py-3'
      }
    } else {
      triggerPadding = 'py-3'
    }
  } else {
    // Outside label
    labelClasses = 'static mb-1.5 ml-1 text-sm font-medium pointer-events-auto scale-100 translate-y-0'
    triggerPadding = 'py-2'
  }

  if (variant === 'underlined') {
    px = 'px-0'
    labelClasses = labelClasses.replace(/left-\d+/, 'left-0')
  }

  return {
    base: '',
    label: [labelColor, labelClasses].join(' '),
    trigger: [triggerClasses.join(' '), px, triggerPadding].join(' '),
  }
}
