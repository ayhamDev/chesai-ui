import { cva, type VariantProps } from 'class-variance-authority'

export const inputStyles = cva('group flex flex-col data-[hidden=true]:hidden w-full', {
  variants: {
    variant: {
      filled: 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
      'filled-inverted': 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
      outlined: 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
      'outlined-inverted': 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
      underlined: 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
      'underlined-inverted': 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
      ghost: 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
      'ghost-inverted': 'data-[has-label=true]:mt-[calc(theme(fontSize.small)_+_10px)]',
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
    variant: 'filled',
    color: 'primary',
    size: 'md',
    shape: 'minimal',
    labelPlacement: 'inside',
  },
})

export const inputWrapperVariants = cva(
  'relative w-full inline-flex tap-highlight-transparent flex-row items-center gap-3 transition-colors duration-200 ease-out overflow-hidden outline-none text-left',
  {
    variants: {
      variant: {
        filled: 'bg-surface-container-highest/60 hover:bg-surface-container-highest border-b-2 border-transparent',
        'filled-inverted': 'bg-surface-container-low hover:bg-surface-container border-b-2 border-transparent',
        outlined: 'bg-transparent border-2 border-outline-variant hover:border-on-surface-variant',
        'outlined-inverted': 'bg-transparent border-2 border-primary/50 hover:border-primary',
        underlined: 'bg-transparent border-b-2 border-outline-variant px-0 shadow-none rounded-none!',
        'underlined-inverted':
          'bg-surface-container-highest/30 border-b-2 border-primary/50 hover:border-primary hover:bg-surface-container-highest/50 px-3 rounded-t-lg rounded-b-none',
        ghost: 'bg-transparent border-2 border-transparent hover:bg-surface-container-highest/30',
        'ghost-inverted': 'bg-transparent border-2 border-transparent hover:bg-primary/10 text-primary',
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
      isErrored: { true: '', false: '' },
      isFocused: { true: '', false: '' },
      disabled: {
        true: 'opacity-50 pointer-events-none cursor-not-allowed',
        false: '',
      },
    },
    compoundVariants: [
      // Focus States
      { variant: 'filled', isFocused: true, className: 'bg-surface-container-highest border-primary' },
      { variant: 'filled-inverted', isFocused: true, className: 'bg-surface-container border-primary' },
      { variant: 'outlined', isFocused: true, className: 'border-primary ring-1 ring-primary' },
      { variant: 'outlined-inverted', isFocused: true, className: 'border-primary ring-2 ring-primary bg-primary/5' },
      { variant: 'underlined', isFocused: true, className: 'border-primary' },
      { variant: 'underlined-inverted', isFocused: true, className: 'border-primary bg-surface-container-highest/50' },
      { variant: 'ghost', isFocused: true, className: 'bg-surface-container-highest/50' },
      { variant: 'ghost-inverted', isFocused: true, className: 'bg-primary/10' },

      // Error States - UPDATED to match MultiSelect Ring Style
      {
        variant: ['filled', 'filled-inverted'],
        isErrored: true,
        className: 'bg-error-container/20 !text-error ring-inset ring-2 ring-error', // <--- CHANGED
      },
      {
        variant: ['outlined', 'outlined-inverted', 'ghost', 'ghost-inverted'],
        isErrored: true,
        className: '!border-error text-error',
      },
      { variant: ['underlined', 'underlined-inverted'], isErrored: true, className: '!border-error text-error' },

      // Shape overrides for Underlined
      { variant: 'underlined', shape: ['full', 'minimal', 'sharp'], className: 'rounded-none px-0' },
    ],
    defaultVariants: {
      variant: 'filled',
      size: 'md',
      shape: 'minimal',
    },
  },
)

export const inputSlots = {
  base: 'group flex flex-col data-[hidden=true]:hidden w-full',
  label: [
    'absolute z-10 block subpixel-antialiased text-on-surface-variant/70 pointer-events-none',
    'origin-top-left transition-all duration-200 ease-out will-change-transform',
    'cursor-text group-data-[filled=true]:cursor-default',
  ],
  mainWrapper: 'h-full flex flex-col',
  inputWrapper: [],
  innerWrapper: 'inline-flex h-full items-center w-full gap-1.5 box-border',
  input: [
    'w-full h-full font-normal !bg-transparent outline-none placeholder:text-on-surface-variant/50 text-on-surface bg-clip-text',
    'file:bg-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
    'border-none focus:ring-0 shadow-none',
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
    hasLabel?: boolean
  },
) => {
  const { variant, size, labelPlacement, isInvalid, shape, hasStartContent, hasLabel } = props

  let rounding = 'rounded-2xl'
  if (shape === 'full') rounding = 'rounded-full'
  if (shape === 'sharp') rounding = 'rounded-none'

  if (variant?.includes('underlined') && variant !== 'underlined-inverted') rounding = 'rounded-none'

  const wrapperClasses = [inputWrapperVariants({ variant, size, shape, isErrored: isInvalid })]
  if (!variant?.includes('underlined')) wrapperClasses.push(rounding)

  const labelColor = isInvalid
    ? 'text-error border-error border-2'
    : 'group-focus-within:text-primary text-on-surface-variant/70 '
  const inputColor = isInvalid ? 'text-error placeholder:text-error/50' : 'text-on-surface'

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
