import { cva, type VariantProps } from 'class-variance-authority'

export const inputStyles = cva('group flex flex-col data-[hidden=true]:hidden w-full', {
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

export const inputSlots = {
  base: 'group flex flex-col data-[hidden=true]:hidden w-full',
  label: [
    'absolute z-10 block subpixel-antialiased text-on-surface-variant/70 pointer-events-none',
    'origin-top-left transition-all duration-200 ease-out will-change-transform',
    'cursor-text group-data-[filled=true]:cursor-default',
  ],
  mainWrapper: 'h-full flex flex-col',
  inputWrapper: [
    'relative w-full inline-flex tap-highlight-transparent flex-row items-center gap-3 transition-colors duration-200 ease-out overflow-hidden',
  ],
  innerWrapper: 'inline-flex h-full items-center w-full gap-1.5 box-border',
  input: [
    'w-full h-full font-normal !bg-transparent outline-none placeholder:text-on-surface-variant/50 text-on-surface bg-clip-text',
    'file:bg-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  ],
  clearButton: [
    'p-2 -m-2 z-10 hidden group-data-[filled-within=true]:block select-none transition-opacity',
    'text-on-surface-variant hover:text-on-surface cursor-pointer active:opacity-70 rounded-full',
  ],
  helperWrapper: 'p-1 relative flex flex-col gap-1.5',
  description: 'text-xs text-on-surface-variant',
  errorMessage: 'text-xs text-error',
}

export const getInputSlotClassNames = (
  props: VariantProps<typeof inputStyles> & {
    isFilled?: boolean
    hasStartContent?: boolean
    hasLabel?: boolean // Added this prop
  },
) => {
  const { variant, size, labelPlacement, isInvalid, shape, hasStartContent, hasLabel } = props

  let rounding = 'rounded-2xl'
  if (shape === 'full') rounding = 'rounded-full'
  if (shape === 'sharp') rounding = 'rounded-none'
  if (variant === 'underlined') rounding = 'rounded-none'

  const wrapperClasses: string[] = [rounding]

  if (variant === 'flat') {
    wrapperClasses.push(
      'bg-surface-container-low hover:bg-surface-container-highest',
      'group-data-[focus=true]:bg-surface-container-highest',
    )
  } else if (variant === 'faded') {
    wrapperClasses.push(
      'bg-surface-container/30',
      'hover:bg-surface-container/50',
      'group-data-[focus=true]:bg-surface-container/50',
      'group-data-[focus=true]:border-transparent',
      'transition-colors',
    )
  } else if (variant === 'bordered') {
    wrapperClasses.push(
      'bg-transparent border-2 border-outline-variant',
      'group-data-[focus=true]:border-primary',
      'hover:border-on-surface-variant',
    )
  } else if (variant === 'underlined') {
    wrapperClasses.push(
      'bg-transparent border-b-2 border-outline-variant px-0 shadow-none',
      'group-data-[focus=true]:border-primary',
      '!px-0',
    )
  }

  const labelColor = isInvalid ? 'text-error' : 'group-data-[focus=true]:text-primary text-on-surface-variant/70'

  const inputColor = isInvalid ? 'text-error placeholder:text-error/50' : 'text-on-surface'

  if (isInvalid) {
    if (variant === 'flat') wrapperClasses.push('bg-error-container/20 !text-error')
    else wrapperClasses.push('!border-error text-error')
  }

  let height = 'h-14'
  let py = 'py-2'
  let px = 'px-3'
  let labelClasses = 'left-3'
  let inputPadding = ''

  if (shape === 'full') {
    px = 'px-5'
    labelClasses = 'left-5'
  } else {
    px = 'px-4'
    labelClasses = 'left-4'
  }

  if (labelPlacement === 'inside') {
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

    if (hasStartContent) {
      if (shape === 'full') {
        labelClasses = size === 'sm' ? 'left-10' : size === 'lg' ? 'left-14' : 'left-12'
      } else {
        labelClasses = size === 'sm' ? 'left-9' : size === 'lg' ? 'left-12' : 'left-11'
      }
    }

    labelClasses += ' absolute top-1/2 -translate-y-1/2 font-normal'

    const filledLabelState = [
      'group-data-[filled=true]:-translate-y-[calc(50%_+_10px)]',
      'group-data-[filled=true]:scale-85',
      'group-data-[filled=true]:opacity-70',
    ].join(' ')

    labelClasses += ` ${filledLabelState}`

    // FIX: Only apply padding shift if there is actually a label to move out of the way
    if (props.isFilled && hasLabel) {
      if (size === 'sm') inputPadding = 'pt-3'
      else inputPadding = 'pt-4'
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
    inputWrapper: [wrapperClasses.join(' '), height, py, px].join(' '),
    input: [inputColor, inputPadding].join(' '),
  }
}

// ... inputWrapperVariants remains the same ...
export const inputWrapperVariants = cva(
  'relative w-full inline-flex tap-highlight-transparent flex-row items-center gap-3 transition-colors duration-200 ease-out overflow-hidden outline-none text-left',
  {
    variants: {
      variant: {
        flat: 'bg-surface-container-low hover:bg-surface-container-highest',
        faded: 'bg-surface-container/30 border-2 border-surface-container-highest/50 hover:bg-surface-container/50',
        bordered: 'bg-transparent border-2 border-outline-variant hover:border-on-surface-variant',
        underlined: 'bg-transparent border-b-2 border-outline-variant px-0 shadow-none',
      },
      size: {
        sm: 'h-12 py-1.5 px-3',
        md: 'h-14 py-2 px-3',
        lg: 'h-16 py-2.5 px-3',
      },
      shape: {
        full: 'rounded-full px-5',
        minimal: 'rounded-2xl px-3',
        sharp: 'rounded-none px-3',
      },
      isErrored: {
        true: '',
        false: '',
      },
      isFocused: {
        true: '',
        false: '',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none cursor-not-allowed',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'flat', isFocused: true, className: 'bg-surface-container-highest' },
      { variant: 'faded', isFocused: true, className: 'bg-surface-container/50 border-transparent' },
      { variant: 'bordered', isFocused: true, className: 'border-primary' },
      { variant: 'underlined', isFocused: true, className: 'border-primary' },
      { variant: 'flat', isErrored: true, className: 'bg-error-container/20 !text-error' },
      { variant: 'bordered', isErrored: true, className: '!border-error text-error' },
      { variant: 'underlined', isErrored: true, className: '!border-error text-error' },
      { variant: 'faded', isErrored: true, className: '!border-error text-error' },
      { variant: 'underlined', shape: 'full', className: 'rounded-none px-0' },
      { variant: 'underlined', shape: 'minimal', className: 'rounded-none px-0' },
      { variant: 'underlined', shape: 'sharp', className: 'rounded-none px-0' },
    ],
    defaultVariants: {
      variant: 'flat',
      size: 'md',
      shape: 'minimal',
    },
  },
)
