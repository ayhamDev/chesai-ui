import { cva, type VariantProps } from 'class-variance-authority'

export const textareaStyles = cva('group flex flex-col data-[hidden=true]:hidden w-full', {
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
    color: { primary: 'text-primary', secondary: 'text-secondary', error: 'text-error' },
    size: { sm: 'text-sm', md: 'text-base', lg: 'text-lg' },
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

export const textareaSlots = {
  base: 'group flex flex-col data-[hidden=true]:hidden w-full',
  label: [
    'absolute z-10 block subpixel-antialiased text-on-surface-variant/70 pointer-events-none',
    'origin-top-left transition-all duration-200 ease-out will-change-transform',
    'cursor-text group-data-[filled=true]:cursor-default',
  ],
  mainWrapper: 'h-full flex flex-col',
  inputWrapper: [
    'relative w-full inline-flex tap-highlight-transparent flex-row items-start gap-3 transition-colors duration-200 ease-out overflow-hidden',
  ],
  innerWrapper: 'inline-flex flex-col items-start w-full gap-1.5 box-border h-full',
  input: [
    'w-full h-full font-normal !bg-transparent outline-none placeholder:text-on-surface-variant/50 text-on-surface bg-clip-text resize-none',
    'file:bg-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'border-none focus:ring-0 shadow-none appearance-none',
  ],
  clearButton: [
    'p-2 -m-2 z-10 hidden group-data-[filled-within=true]:block select-none transition-opacity',
    'text-on-surface-variant hover:text-on-surface cursor-pointer active:opacity-70 rounded-full',
    'absolute right-2 top-2',
  ],
  helperWrapper: 'p-1 relative flex flex-col gap-1.5',
  description: 'text-xs text-on-surface-variant',
  errorMessage: 'text-xs text-error',
}

export const getTextareaSlotClassNames = (props: VariantProps<typeof textareaStyles> & { isFilled?: boolean }) => {
  const { variant, size, labelPlacement, isInvalid, shape } = props

  let rounding = 'rounded-2xl'
  if (shape === 'full') rounding = 'rounded-3xl'
  if (shape === 'sharp') rounding = 'rounded-none'

  const wrapperClasses: string[] = [rounding]

  switch (variant) {
    case 'filled':
      wrapperClasses.push('bg-surface-container-highest/60 hover:bg-surface-container-highest')
      break
    case 'filled-inverted':
      wrapperClasses.push('bg-surface-container-low hover:bg-surface-container')
      break
    case 'outlined':
      wrapperClasses.push(
        'bg-transparent border-2 border-outline-variant hover:border-on-surface-variant group-data-[focus=true]:border-primary',
      )
      break
    case 'outlined-inverted':
      wrapperClasses.push(
        'bg-transparent border-2 border-primary/50 hover:border-primary group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-primary/20',
      )
      break
    case 'underlined':
      wrapperClasses.push(
        'bg-transparent border-b-2 border-outline-variant rounded-none px-0 group-data-[focus=true]:border-primary',
      )
      break
    case 'underlined-inverted':
      wrapperClasses.push(
        'bg-surface-container-highest/30 border-b-2 border-primary/50 hover:bg-surface-container-highest/50 group-data-[focus=true]:border-primary',
      )
      break
    case 'ghost':
      wrapperClasses.push(
        'bg-transparent border-2 border-transparent hover:bg-surface-container-highest/30 group-data-[focus=true]:bg-surface-container-highest/50',
      )
      break
    case 'ghost-inverted':
      wrapperClasses.push(
        'bg-transparent border-2 border-transparent hover:bg-primary/10 group-data-[focus=true]:bg-primary/10 text-primary',
      )
      break
  }

  // --- FIX: ERROR HANDLING WITH BORDER/RING ---
  if (isInvalid) {
    if (variant?.includes('filled')) {
      // Add a red ring for filled variants
      wrapperClasses.push('bg-error-container/20 !text-error ring-inset ring-2 ring-error')
    } else {
      // Add red border for outlined/others
      wrapperClasses.push('!border-error text-error')
    }
  }

  let py = 'py-2'
  let px = 'px-3'
  let minHeight = 'min-h-[60px]'
  let labelClasses = 'left-3'
  let inputPadding = ''

  if (shape === 'full') {
    px = 'px-5'
    labelClasses = 'left-5'
  } else {
    px = 'px-4'
    labelClasses = 'left-4'
  }

  if (size === 'sm') {
    minHeight = 'min-h-[40px]'
    py = 'py-2'
  } else if (size === 'md') {
    minHeight = 'min-h-[60px]'
    py = 'py-3'
  } else if (size === 'lg') {
    minHeight = 'min-h-[80px]'
    py = 'py-4'
  }

  if (labelPlacement === 'inside') {
    labelClasses += ' absolute top-3 font-normal'
    const filledLabelState = [
      'group-data-[filled=true]:-translate-y-[calc(50%_-_4px)]',
      'group-data-[filled=true]:scale-85',
      'group-data-[filled=true]:opacity-70',
    ].join(' ')
    labelClasses += ` ${filledLabelState}`

    if (props.isFilled) {
      if (size === 'sm') inputPadding = 'pt-4'
      else inputPadding = 'pt-5'
    }
  } else {
    labelClasses = 'static mb-1.5 ml-1 text-sm font-medium pointer-events-auto scale-100 translate-y-0'
  }

  if (variant === 'underlined') {
    px = 'px-0'
    labelClasses = labelClasses.replace(/left-\d+/, 'left-0')
  }

  return {
    base: '',
    label: [
      isInvalid ? 'text-error' : 'group-data-[focus=true]:text-primary text-on-surface-variant/70',
      labelClasses,
    ].join(' '),
    inputWrapper: [wrapperClasses.join(' '), minHeight, py, px].join(' '),
    input: [isInvalid ? 'text-error placeholder:text-error/50' : 'text-on-surface', inputPadding].join(' '),
  }
}
