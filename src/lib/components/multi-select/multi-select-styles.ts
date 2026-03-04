import { cva, type VariantProps } from 'class-variance-authority'

export const multiSelectStyles = cva('group flex flex-col w-full relative', {
  variants: {
    variant: {
      filled: '',
      'filled-inverted': '',
      outlined: '',
      'outlined-inverted': '',
      underlined: '',
      'underlined-inverted': '',
      ghost: '',
      'ghost-inverted': '',
    },
    color: { primary: '', secondary: '', error: '' },
    size: { sm: '', md: '', lg: '' },
    shape: { full: '', minimal: '', sharp: '' },
    labelPlacement: {
      inside: '',
      outside: '',
      'outside-left': 'flex-row items-start flex-wrap md:flex-nowrap gap-x-4',
    },
    isInvalid: { true: '', false: '' },
    isDisabled: { true: 'opacity-disabled pointer-events-none' },
  },
  defaultVariants: {
    variant: 'filled',
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
    'min-h-14 pr-10',
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

  let rounding = 'rounded-2xl'
  if (shape === 'full') rounding = 'rounded-3xl'
  if (shape === 'sharp') rounding = 'rounded-none'

  const triggerClasses: string[] = [rounding]

  // --- FIX: Replaced border-b-2 with ring-inset for filled variants ---
  switch (variant) {
    case 'filled':
      triggerClasses.push(
        'bg-surface-container-highest/60 hover:bg-surface-container-highest',
        'data-[state=open]:bg-surface-container-highest',
      )
      break
    case 'filled-inverted':
      triggerClasses.push(
        'bg-surface-container-low hover:bg-surface-container',
        'data-[state=open]:bg-surface-container',
      )
      break
    case 'outlined':
      triggerClasses.push(
        'bg-transparent border-2 border-outline-variant hover:border-on-surface-variant data-[state=open]:border-primary',
      )
      break
    case 'outlined-inverted':
      triggerClasses.push(
        'bg-transparent border-2 border-primary/50 hover:border-primary data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/20',
      )
      break
    case 'underlined':
      triggerClasses.push(
        'bg-transparent border-b-2 border-outline-variant rounded-none! px-0 data-[state=open]:border-primary',
      )
      break
    case 'underlined-inverted':
      triggerClasses.push(
        'bg-surface-container-highest/30 border-b-2 border-primary/50 hover:bg-surface-container-highest/50 rounded-t-lg rounded-b-none data-[state=open]:border-primary',
      )
      break
    case 'ghost':
      triggerClasses.push(
        'bg-transparent hover:bg-surface-container-highest/30 data-[state=open]:bg-surface-container-highest/50',
      )
      break
    case 'ghost-inverted':
      triggerClasses.push('bg-transparent hover:bg-primary/10 data-[state=open]:bg-primary/10 text-primary')
      break
  }

  if (isInvalid) {
    // If filled, use ring for error too
    if (variant?.includes('filled'))
      triggerClasses.push('bg-error-container/20 !text-error ring-inset ring-2 ring-error')
    else triggerClasses.push('!border-error text-error')
  }

  let px = 'px-3'
  let labelClasses = 'left-3'
  let triggerPadding = 'py-3'

  if (shape === 'full') {
    px = 'px-5'
    labelClasses = 'left-5'
  } else {
    px = 'px-4'
    labelClasses = 'left-4'
  }

  if (labelPlacement === 'inside') {
    if (hasLabel) {
      labelClasses += ' absolute top-1/2 -translate-y-1/2 font-normal'
      const filledLabelState = [
        'group-data-[filled=true]:top-1.5 group-data-[filled=true]:-translate-y-0',
        'group-data-[filled=true]:scale-85',
        'group-data-[filled=true]:opacity-70',
      ].join(' ')
      labelClasses += ` ${filledLabelState}`
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
    labelClasses = 'static mb-1.5 ml-1 text-sm font-medium pointer-events-auto scale-100 translate-y-0'
    triggerPadding = 'py-2'
  }

  if (variant === 'underlined') {
    px = 'px-0'
    labelClasses = labelClasses.replace(/left-\d+/, 'left-0')
  }

  return {
    base: '',
    label: [isInvalid ? 'text-error' : 'group-focus-within:text-primary text-on-surface-variant/70', labelClasses].join(
      ' ',
    ),
    trigger: [triggerClasses.join(' '), px, triggerPadding].join(' '),
  }
}
