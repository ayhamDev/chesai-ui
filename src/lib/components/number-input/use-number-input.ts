import { clsx } from 'clsx'
import React, { useCallback, useRef, useState } from 'react'
import { getNumberInputSlotClassNames, numberInputSlots, numberInputStyles } from './number-input-styles'

export interface UseNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color' | 'onChange'> {
  ref?: React.Ref<HTMLInputElement>
  // Fix: Added 'as' prop
  as?: React.ElementType
  variant?: 'flat' | 'bordered' | 'underlined' | 'faded'
  color?: 'primary' | 'secondary' | 'error'
  size?: 'sm' | 'md' | 'lg'
  shape?: 'full' | 'minimal' | 'sharp'
  label?: React.ReactNode
  labelPlacement?: 'inside' | 'outside' | 'outside-left'
  placeholder?: string
  description?: React.ReactNode
  errorMessage?: React.ReactNode
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  isClearable?: boolean
  isInvalid?: boolean
  hideStepper?: boolean
  min?: number
  max?: number
  step?: number
  allowFloat?: boolean
  defaultValue?: number | string
  value?: number | string
  onValueChange?: (value: number | string) => void
  onClear?: () => void
  classNames?: Partial<Record<keyof typeof numberInputSlots, string>>
}

export function useNumberInput(props: UseNumberInputProps) {
  const {
    ref,
    as: Component = 'div',
    label,
    description,
    errorMessage,
    className,
    classNames,
    variant = 'flat',
    color = 'primary',
    size = 'md',
    shape = 'minimal',
    labelPlacement = 'inside',
    startContent,
    endContent,
    isClearable = false,
    isInvalid = false,
    hideStepper = false,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    step = 1,
    allowFloat = false,
    placeholder,
    onClear,
    onValueChange,
    value: propValue,
    defaultValue,
    readOnly,
    disabled,
    ...otherProps
  } = props

  const domRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [internalValue, setInternalValue] = useState<string | number>(defaultValue ?? '')

  const isControlled = propValue !== undefined
  const value = isControlled ? propValue : internalValue
  const isFilled = (value !== '' && value !== undefined && value !== null) || !!placeholder || isFocused

  // Sync ref
  React.useImperativeHandle(ref, () => domRef.current!)

  // --- Logic ---

  const updateValue = (newValue: number | string) => {
    let finalVal = newValue

    // Clamp only if it is a complete number
    if (typeof finalVal === 'number') {
      if (finalVal < min) finalVal = min
      if (finalVal > max) finalVal = max
    }

    if (!isControlled) {
      setInternalValue(finalVal)
    }

    // Update ref for uncontrolled consistency
    if (domRef.current) {
      domRef.current.value = String(finalVal)
    }

    onValueChange?.(finalVal)
  }

  const handleIncrement = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault()
      const current = Number(value || 0)
      // Handle floating point precision errors
      const nextVal = current + step
      const precision = step.toString().split('.')[1]?.length || 0
      updateValue(parseFloat(nextVal.toFixed(precision)))
      domRef.current?.focus()
    },
    [value, step, min, max, isControlled],
  )

  const handleDecrement = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault()
      const current = Number(value || 0)
      const nextVal = current - step
      const precision = step.toString().split('.')[1]?.length || 0
      updateValue(parseFloat(nextVal.toFixed(precision)))
      domRef.current?.focus()
    },
    [value, step, min, max, isControlled],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value

      // 1. Handle Empty
      if (val === '') {
        if (!isControlled) setInternalValue('')
        onValueChange?.('')
        return
      }

      // 2. Strict Pattern Check
      // - Minus sign optional at start
      // - Digits
      // - Optional dot followed by digits (if float allowed)
      const regex = allowFloat
        ? /^-?\d*\.?\d*$/ // Integer or Float
        : /^-?\d*$/ // Integer only

      if (!regex.test(val)) {
        // If the new character makes the string invalid, reject the change entirely.
        // This prevents "12a" because it doesn't match the regex.
        return
      }

      // 3. Handle Intermediate States ("-", "1.", "1.0")
      // These are valid to type but shouldn't be parsed/clamped yet
      if (val === '-' || val.endsWith('.')) {
        if (!isControlled) setInternalValue(val)
        onValueChange?.(val)
        return
      }

      // 4. Valid Number Parsing
      const num = parseFloat(val)
      if (!isNaN(num)) {
        if (!isControlled) setInternalValue(val) // Keep input string as-is to allow typing "1.05" without snapping
        onValueChange?.(num)
      }
    },
    [isControlled, onValueChange, min, max, allowFloat],
  )

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    // Clamp on blur
    if (value !== '' && value !== '-' && value !== '.') {
      let num = parseFloat(String(value))
      if (!isNaN(num)) {
        if (num < min) num = min
        if (num > max) num = max
        updateValue(num)
      }
    } else if (value === '-' || value === '.') {
      // Reset invalid incomplete states on blur
      updateValue('')
    }
  }, [value, min, max])

  const handleClear = useCallback(() => {
    updateValue('')
    onClear?.()
  }, [onClear, updateValue])

  // --- Styling ---

  const dynamicStyles = getNumberInputSlotClassNames({
    variant,
    size,
    shape,
    labelPlacement,
    isInvalid,
    isFilled,
    hasStartContent: !!startContent,
    hideStepper,
  })

  const getBaseProps = () => ({
    'data-slot': 'base',
    'data-filled': isFilled,
    'data-filled-within': isFilled || isFocused,
    'data-focus': isFocused,
    'data-invalid': isInvalid,
    'data-disabled': disabled,
    'data-readonly': readOnly,
    'data-label-placement': labelPlacement,
    className: clsx(numberInputSlots.base, numberInputStyles({ labelPlacement }), className, classNames?.base),
  })

  const getLabelProps = () => ({
    'data-slot': 'label',
    className: clsx(numberInputSlots.label, dynamicStyles.label, classNames?.label),
  })

  const getInputWrapperProps = () => ({
    'data-slot': 'input-wrapper',
    'data-focus': isFocused,
    className: clsx(numberInputSlots.inputWrapper, dynamicStyles.inputWrapper, classNames?.inputWrapper),
    onClick: () => domRef.current?.focus(),
  })

  const getInnerWrapperProps = () => ({
    'data-slot': 'inner-wrapper',
    className: clsx(numberInputSlots.innerWrapper, classNames?.innerWrapper),
  })

  const getInputProps = () => ({
    ref: domRef,
    'data-slot': 'input',
    type: 'text',
    className: clsx(numberInputSlots.input, dynamicStyles.input, classNames?.input),
    placeholder,
    disabled,
    readOnly,
    value,
    onChange: handleChange,
    onFocus: () => setIsFocused(true),
    onBlur: handleBlur,
    inputMode: allowFloat ? 'decimal' : ('numeric' as const),
    pattern: '[0-9]*',
    ...otherProps,
  })

  const getClearButtonProps = () => ({
    'data-slot': 'clear-button',
    type: 'button' as const,
    onClick: handleClear,
    className: clsx(numberInputSlots.clearButton, classNames?.clearButton),
  })

  const getStepperWrapperProps = () => ({
    'data-slot': 'stepper-wrapper',
    className: clsx(numberInputSlots.stepperWrapper, dynamicStyles.stepperWrapper, classNames?.stepperWrapper),
  })

  const getStepperButtonProps = (direction: 'up' | 'down') => ({
    'data-slot': direction === 'up' ? 'increase-button' : 'decrease-button',
    type: 'button' as const,
    disabled: disabled || readOnly,
    className: clsx(numberInputSlots.stepperButton, classNames?.stepperButton),
    onClick: direction === 'up' ? handleIncrement : handleDecrement,
    tabIndex: -1, // Prevent tab focus into steppers
  })

  const getHelperWrapperProps = () => ({
    'data-slot': 'helper-wrapper',
    className: clsx(numberInputSlots.helperWrapper, classNames?.helperWrapper),
  })

  const getDescriptionProps = () => ({
    'data-slot': 'description',
    className: clsx(numberInputSlots.description, classNames?.description),
  })

  const getErrorMessageProps = () => ({
    'data-slot': 'error-message',
    className: clsx(numberInputSlots.errorMessage, classNames?.errorMessage),
  })

  return {
    Component,
    label,
    description,
    isClearable,
    startContent,
    endContent,
    labelPlacement,
    isOutsideLeft: labelPlacement === 'outside-left',
    isOutsideTop: labelPlacement === 'outside',
    shouldLabelBeOutside: labelPlacement === 'outside' || labelPlacement === 'outside-left',
    errorMessage,
    isInvalid,
    hideStepper,
    getBaseProps,
    getLabelProps,
    getInputProps,
    getInputWrapperProps,
    getInnerWrapperProps,
    getHelperWrapperProps,
    getDescriptionProps,
    getErrorMessageProps,
    getClearButtonProps,
    getStepperWrapperProps,
    getStepperButtonProps,
  }
}
