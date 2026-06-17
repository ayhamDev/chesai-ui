'use client'

import { useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { dateInputSlots, dateInputStyles, getDateInputSlotClassNames } from './date-input-styles'

export interface DurationValue {
  hours: number | null
  minutes: number | null
  seconds: number | null
}

export interface DurationSegment {
  type: 'hours' | 'minutes' | 'seconds' | 'literal'
  text: string
  value: number | null
  isPlaceholder: boolean
  placeholder: string
  isEditable: boolean
  minValue: number
  maxValue: number
}

export interface DurationFieldState {
  segments: DurationSegment[]
  value: DurationValue
  isInvalid: boolean
  setSegmentValue: (type: 'hours' | 'minutes' | 'seconds', val: number | null) => void
}

export interface UseDurationInputProps {
  ref?: React.Ref<HTMLDivElement>
  value?: DurationValue
  defaultValue?: DurationValue
  onChange?: (value: DurationValue) => void
  name?: string
  label?: React.ReactNode
  description?: React.ReactNode
  errorMessage?: React.ReactNode
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  classNames?: Partial<typeof dateInputSlots>
  labelPlacement?: 'inside' | 'outside' | 'outside-left'
  className?: string
  variant?:
    | 'filled'
    | 'filled-inverted'
    | 'outlined'
    | 'outlined-inverted'
    | 'underlined'
    | 'underlined-inverted'
    | 'ghost'
    | 'ghost-inverted'
  color?: 'primary' | 'secondary' | 'error'
  size?: 'sm' | 'md' | 'lg'
  shape?: 'full' | 'minimal' | 'sharp'
  isInvalid?: boolean
  isDisabled?: boolean
  isRequired?: boolean
}

export function parseDuration(value: string): DurationValue {
  const parts = value.split(':').map(Number)
  return {
    hours: isNaN(parts[0]) ? null : parts[0],
    minutes: isNaN(parts[1]) ? null : parts[1],
    seconds: isNaN(parts[2]) ? null : parts[2],
  }
}

export function formatDuration(value: DurationValue | null | undefined): string {
  if (!value) return ''
  const h = value.hours !== null ? value.hours.toString().padStart(2, '0') : '00'
  const m = value.minutes !== null ? value.minutes.toString().padStart(2, '0') : '00'
  const s = value.seconds !== null ? value.seconds.toString().padStart(2, '0') : '00'
  return `${h}:${m}:${s}`
}

export function useDurationInput(props: UseDurationInputProps) {
  const {
    label,
    description,
    errorMessage,
    startContent,
    endContent,
    className,
    classNames,
    variant = 'filled',
    color = 'primary',
    size = 'md',
    shape = 'minimal',
    labelPlacement = 'inside',
    isInvalid: isInvalidProp = false,
    isRequired = false,
    ...otherProps
  } = props

  const domRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const [values, setValues] = useState<DurationValue>(() => {
    if (props.value) return props.value
    if (props.defaultValue) return props.defaultValue
    return { hours: null, minutes: null, seconds: null }
  })

  const isControlled = props.value !== undefined
  const currentValues = isControlled ? props.value! : values

  const setSegmentValue = (type: 'hours' | 'minutes' | 'seconds', val: number | null) => {
    const nextValues = {
      ...currentValues,
      [type]: val,
    }
    if (!isControlled) {
      setValues(nextValues)
    }
    if (props.onChange) {
      props.onChange(nextValues)
    }
  }

  const isInvalid =
    isInvalidProp ||
    (isRequired &&
      (currentValues.hours === null || currentValues.minutes === null || currentValues.seconds === null))

  const segments: DurationSegment[] = useMemo(() => {
    return [
      {
        type: 'hours',
        text: currentValues.hours === null ? '--' : currentValues.hours.toString().padStart(2, '0'),
        value: currentValues.hours,
        isPlaceholder: currentValues.hours === null,
        placeholder: '--',
        isEditable: true,
        minValue: 0,
        maxValue: 99,
      },
      {
        type: 'literal',
        text: ':',
        value: null,
        isPlaceholder: false,
        placeholder: ':',
        isEditable: false,
        minValue: 0,
        maxValue: 0,
      },
      {
        type: 'minutes',
        text: currentValues.minutes === null ? '--' : currentValues.minutes.toString().padStart(2, '0'),
        value: currentValues.minutes,
        isPlaceholder: currentValues.minutes === null,
        placeholder: '--',
        isEditable: true,
        minValue: 0,
        maxValue: 99,
      },
      {
        type: 'literal',
        text: ':',
        value: null,
        isPlaceholder: false,
        placeholder: ':',
        isEditable: false,
        minValue: 0,
        maxValue: 0,
      },
      {
        type: 'seconds',
        text: currentValues.seconds === null ? '--' : currentValues.seconds.toString().padStart(2, '0'),
        value: currentValues.seconds,
        isPlaceholder: currentValues.seconds === null,
        placeholder: '--',
        isEditable: true,
        minValue: 0,
        maxValue: 99,
      },
    ]
  }, [currentValues])

  const state: DurationFieldState = {
    segments,
    value: currentValues,
    isInvalid,
    setSegmentValue,
  }

  const hasLabel = !!label
  const shouldLabelBeOutside = labelPlacement !== 'inside'
  const isFilled =
    currentValues.hours !== null ||
    currentValues.minutes !== null ||
    currentValues.seconds !== null ||
    labelPlacement === 'inside'

  const slots = useMemo(
    () =>
      getDateInputSlotClassNames({
        variant,
        color,
        size,
        shape,
        labelPlacement,
        isInvalid,
        hasLabel,
        isFilled,
      }),
    [variant, color, size, shape, labelPlacement, isInvalid, hasLabel, isFilled],
  )

  const handleFocus = (e: React.FocusEvent) => {
    setIsFocused(true)
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsFocused(false)
    }
  }

  const getBaseGroupProps = () => ({
    ref: domRef,
    className: clsx(dateInputSlots.base, dateInputStyles({ labelPlacement }), className, classNames?.base),
    'data-slot': 'base',
    'data-filled': isFilled,
    'data-filled-within': isFilled || isFocused,
    'data-invalid': isInvalid,
    'data-disabled': props.isDisabled,
    label,
    description,
    errorMessage: isInvalid ? errorMessage || 'Please enter a valid duration' : null,
    isInvalid,
    startContent,
    endContent,
    shouldLabelBeOutside,

    labelProps: {
      className: clsx(dateInputSlots.label, slots.label, classNames?.label),
    },
    wrapperProps: {
      className: clsx(dateInputSlots.inputWrapper, slots.inputWrapper, classNames?.inputWrapper),
      'data-focus': isFocused,
    },
    innerWrapperProps: {
      className: clsx(dateInputSlots.innerWrapper, slots.innerWrapper, classNames?.innerWrapper),
    },
    helperWrapperProps: {
      className: clsx(dateInputSlots.helperWrapper, slots.helperWrapper, classNames?.helperWrapper),
    },
    errorMessageProps: {
      className: clsx(dateInputSlots.errorMessage, slots.errorMessage, classNames?.errorMessage),
    },
    descriptionProps: {
      className: clsx(dateInputSlots.description, slots.description, classNames?.description),
    },
  })

  const getFieldProps = () => ({
    onFocus: handleFocus,
    onBlur: handleBlur,
    className: clsx('flex items-center h-full'),
  })

  const getInputProps = () => ({
    type: 'hidden',
    name: props.name,
    value: formatDuration(currentValues),
    disabled: props.isDisabled,
  })

  return {
    state,
    domRef,
    slots,
    classNames,
    getBaseGroupProps,
    getFieldProps,
    getInputProps,
  }
}
