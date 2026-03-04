import { cva, type VariantProps } from 'class-variance-authority'

export const numberInputStyles = cva('group flex flex-col data-[hidden=true]:hidden w-full', {
  // ... same variants config as input ...
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

export const numberInputSlots = {
  // ... same slots ...
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
  stepperWrapper: 'flex flex-col h-full right-0 absolute divide-y divide-outline-variant/20 overflow-hidden',
  stepperButton:
    'w-8 flex-1 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest hover:text-primary active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden',
}

export const getNumberInputSlotClassNames = (
  props: VariantProps<typeof numberInputStyles> & {
    isFilled?: boolean
    hasStartContent?: boolean
    hideStepper?: boolean
    hasLabel?: boolean
  },
) => {
  const { variant, size, labelPlacement, isInvalid, shape, hasStartContent, hideStepper, hasLabel } = props

  let rounding = 'rounded-2xl'
  if (shape === 'full') rounding = 'rounded-full'
  if (shape === 'sharp') rounding = 'rounded-none'

  if (variant?.includes('underlined') && variant !== 'underlined-inverted') rounding = 'rounded-none'

  const wrapperClasses: string[] = [rounding]

  switch (variant) {
    case 'filled':
      wrapperClasses.push(
        'bg-surface-container-highest/60 hover:bg-surface-container-highest',
        'group-data-[focus=true]:bg-surface-container-highest',
      )
      break
    case 'filled-inverted':
      wrapperClasses.push(
        'bg-surface-container-low hover:bg-surface-container',
        'group-data-[focus=true]:bg-surface-container',
      )
      break
    case 'outlined':
      wrapperClasses.push(
        'bg-transparent border-2 border-outline-variant hover:border-on-surface-variant group-data-[focus=true]:border-primary group-data-[focus=true]:ring-1 group-data-[focus=true]:ring-primary',
      )
      break
    case 'outlined-inverted':
      wrapperClasses.push(
        'bg-transparent border-2 border-primary/50 hover:border-primary group-data-[focus=true]:border-primary group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-primary/20',
      )
      break
    case 'underlined':
      wrapperClasses.push(
        'bg-transparent border-b-2 border-outline-variant px-0 shadow-none rounded-none! group-data-[focus=true]:border-primary',
      )
      break
    case 'underlined-inverted':
      wrapperClasses.push(
        'bg-surface-container-highest/30 border-b-2 border-primary/50 hover:bg-surface-container-highest/50 rounded-t-lg rounded-b-none group-data-[focus=true]:border-primary px-3',
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

  // --- FIX: Updated Error Handling to match MultiSelect ring ---
  if (isInvalid) {
    if (variant?.includes('filled')) {
      wrapperClasses.push('bg-error-container/20 !text-error ring-inset ring-2 ring-error')
    } else {
      wrapperClasses.push('!border-error text-error')
    }
  }

  const labelColor = isInvalid ? 'text-error' : 'group-data-[focus=true]:text-primary text-on-surface-variant/70'
  const inputColor = isInvalid ? 'text-error placeholder:text-error/50' : 'text-on-surface'

  let height = 'h-14'
  let py = 'py-2'
  let px = 'px-3'
  let labelClasses = 'left-3'
  let inputPadding = ''
  const paddingRight = hideStepper ? '' : 'pr-8'

  if (shape === 'full') {
    px = 'px-5'
    labelClasses = 'left-5'
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

  if (labelPlacement === 'inside') {
    if (hasStartContent) {
      if (shape === 'full') labelClasses = size === 'sm' ? 'left-10' : size === 'lg' ? 'left-14' : 'left-12'
      else labelClasses = size === 'sm' ? 'left-9' : size === 'lg' ? 'left-12' : 'left-11'
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

  let stepperRoundClass = ''
  if (shape === 'full') stepperRoundClass = 'rounded-r-full'
  else if (shape === 'minimal') stepperRoundClass = 'rounded-r-2xl'
  else stepperRoundClass = 'rounded-r-none'

  if (variant === 'underlined') stepperRoundClass = 'rounded-r-none'

  return {
    base: '',
    label: [labelColor, labelClasses].join(' '),
    inputWrapper: [wrapperClasses.join(' '), height, py, px].join(' '),
    input: [inputColor, inputPadding, paddingRight].join(' '),
    stepperWrapper: ['absolute right-0 top-0 bottom-0 z-20', stepperRoundClass].join(' '),
  }
}
