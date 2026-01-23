import { cva, type VariantProps } from 'class-variance-authority'

export const selectStyles = cva('group flex flex-col w-full relative', {
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

export const selectContentVariants = cva(
  [
    'z-50 min-w-[var(--radix-select-trigger-width)] max-h-[var(--radix-select-content-available-height)] overflow-hidden',
    // Match DropdownMenu style exactly
    'border border-outline-variant bg-surface-container text-on-surface p-1.5',
    'shadow-md',
    'data-[state=open]:animate-menu-enter data-[state=closed]:animate-menu-exit',
  ],
  {
    variants: {
      position: {
        popper: 'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
        'item-aligned': 'shadow-xl',
      },
      shape: {
        full: 'rounded-3xl',
        minimal: 'rounded-xl',
        sharp: 'rounded-none',
      },
    },
    defaultVariants: {
      position: 'popper',
      shape: 'minimal',
    },
  },
)

export const selectSlots = {
  base: 'group flex flex-col w-full relative',
  label: [
    'absolute z-10 block subpixel-antialiased text-on-surface-variant/70 pointer-events-none',
    'origin-top-left transition-all duration-200 ease-out will-change-transform',
    'cursor-text group-data-[filled=true]:cursor-default',
  ],
  trigger: [
    'relative w-full inline-flex tap-highlight-transparent flex-row items-center gap-3 transition-colors duration-200 ease-out overflow-hidden outline-none',
    'data-[placeholder]:text-on-surface-variant/50 text-on-surface',
  ],
  innerWrapper: 'inline-flex h-full w-full gap-2 box-border overflow-hidden',
  selectorIcon:
    'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant transition-transform duration-200 group-data-[open=true]:rotate-180',
  value: 'w-full h-full flex items-center text-left truncate font-normal bg-transparent',
  helperWrapper: 'p-1 relative flex flex-col gap-1.5',
  description: 'text-xs text-on-surface-variant',
  errorMessage: 'text-xs text-error',
}

export const getSelectSlotClassNames = (
  props: VariantProps<typeof selectStyles> & {
    isFilled?: boolean
    hasStartContent?: boolean
    hasLabel?: boolean
  },
) => {
  const { variant, size, labelPlacement, isInvalid, shape, hasStartContent, hasLabel } = props

  // --- 1. SHAPE LOGIC ---
  let rounding = 'rounded-2xl'
  if (shape === 'full') rounding = 'rounded-full'
  if (shape === 'sharp') rounding = 'rounded-none'
  if (variant === 'underlined') rounding = 'rounded-none'

  // --- 2. VARIANT STYLES ---
  const triggerClasses: string[] = [rounding]

  if (variant === 'flat') {
    triggerClasses.push(
      'bg-surface-container-low hover:bg-surface-container-highest',
      'data-[state=open]:bg-surface-container-highest',
      'focus:bg-surface-container-highest',
    )
  } else if (variant === 'faded') {
    triggerClasses.push(
      'bg-surface-container/30 border-2 border-surface-container-highest/50',
      'hover:bg-surface-container/50',
      'data-[state=open]:bg-surface-container/50 data-[state=open]:border-transparent',
      'focus:bg-surface-container/50 focus:border-transparent',
      'transition-colors',
    )
  } else if (variant === 'bordered') {
    triggerClasses.push(
      'bg-transparent border-2 border-outline-variant',
      'data-[state=open]:border-primary',
      'focus:border-primary',
      'hover:border-on-surface-variant',
    )
  } else if (variant === 'underlined') {
    triggerClasses.push(
      'bg-transparent border-b-2 border-outline-variant px-0 shadow-none',
      'data-[state=open]:border-primary',
      'focus:border-primary',
      '!px-0',
    )
  }

  // --- 3. INVALID STATE ---
  const labelColor = isInvalid ? 'text-error' : 'group-focus-within:text-primary text-on-surface-variant/70'

  const inputColor = isInvalid ? 'text-error placeholder:text-error/50' : 'text-on-surface'

  if (isInvalid) {
    if (variant === 'flat') triggerClasses.push('bg-error-container/20 !text-error')
    else triggerClasses.push('!border-error text-error')
  }

  // --- 4. SIZING & PADDING ---
  let height = 'h-14'
  let py = 'py-2'
  let px = 'px-3'
  let labelClasses = 'left-3'
  let valuePadding = ''

  const paddingRight = 'pr-8'

  if (shape === 'full') {
    px = 'px-6'
    labelClasses = 'left-6'
  } else {
    px = 'px-4'
    labelClasses = 'left-4'
  }

  if (size === 'sm') {
    height = 'h-12'
    py = 'py-1.5'
  } else if (size === 'md') {
    height = 'h-14'
    py = 'py-2'
  } else if (size === 'lg') {
    height = 'h-16'
    py = 'py-2.5'
  }

  // --- 5. LABEL PLACEMENT & ALIGNMENT ---
  let innerWrapperAlign = 'items-center'

  if (labelPlacement === 'inside') {
    if (hasLabel) {
      innerWrapperAlign = 'items-end'

      if (hasStartContent) {
        if (shape === 'full') {
          labelClasses = size === 'sm' ? 'left-12' : 'left-14'
        } else {
          labelClasses = 'left-11'
        }
      }

      labelClasses += ' absolute top-1/2 -translate-y-1/2 font-normal'

      const filledLabelState = [
        'group-data-[filled=true]:-translate-y-[calc(50%_+_12px)]',
        'group-data-[filled=true]:scale-85',
        'group-data-[filled=true]:opacity-70',
      ].join(' ')

      labelClasses += ` ${filledLabelState}`

      if (props.isFilled) {
        if (size === 'sm') valuePadding = 'pt-3.5'
        else valuePadding = 'pt-5'
      }
    }
  } else {
    height = size === 'sm' ? 'h-10' : size === 'lg' ? 'h-14' : 'h-12'
    labelClasses = 'static mb-1.5 ml-1 text-sm font-medium pointer-events-auto scale-100 translate-y-0'
  }

  if (variant === 'underlined') {
    px = 'px-0'
    labelClasses = labelClasses.replace(/left-\d+/, 'left-0')
  }

  return {
    base: '',
    label: [labelColor, labelClasses].join(' '),
    trigger: [triggerClasses.join(' '), height, py, px, paddingRight].join(' '),
    value: [valuePadding].join(' '),
    innerWrapper: innerWrapperAlign,
    selectorIcon: shape === 'full' ? 'right-5' : 'right-3',
  }
}
