// src/lib/components/select/select-styles.ts
import { cva, type VariantProps } from 'class-variance-authority'

export const selectStyles = cva('group flex flex-col w-full relative', {
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
      'outside-left': 'flex-row items-center flex-wrap md:flex-nowrap gap-x-4',
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

export const selectContentVariants = cva(
  [
    'z-[1000] min-w-[var(--radix-select-trigger-width)] max-h-[calc(var(--radix-select-content-available-height)-10.5rem)] overflow-hidden',
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

  let rounding = 'rounded-2xl'
  if (shape === 'full') rounding = 'rounded-full'
  if (shape === 'sharp') rounding = 'rounded-none'

  const triggerClasses: string[] = [rounding]

  switch (variant) {
    case 'filled':
      triggerClasses.push(
        'bg-surface-container-highest/60 hover:bg-surface-container-highest data-[state=open]:bg-surface-container-highest',
      )
      break
    case 'filled-inverted':
      triggerClasses.push('bg-surface-container-low hover:bg-surface-container data-[state=open]:bg-surface-container')
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
    if (variant?.includes('filled')) {
      triggerClasses.push('bg-error-container/20 !text-error ring-inset ring-2 ring-error')
    } else {
      triggerClasses.push('!border-error text-error')
    }
  }

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

  let innerWrapperAlign = 'items-center'

  if (labelPlacement === 'inside') {
    if (hasLabel) {
      innerWrapperAlign = 'items-end'
      if (hasStartContent) {
        if (shape === 'full') labelClasses = size === 'sm' ? 'left-12' : 'left-14'
        else labelClasses = 'left-11'
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
    label: [isInvalid ? 'text-error' : 'group-focus-within:text-primary text-on-surface-variant/70', labelClasses].join(
      ' ',
    ),
    trigger: [triggerClasses.join(' '), height, py, px, paddingRight].join(' '),
    value: [valuePadding].join(' '),
    innerWrapper: innerWrapperAlign,
    selectorIcon: shape === 'full' ? 'right-5' : 'right-3',
  }
}
