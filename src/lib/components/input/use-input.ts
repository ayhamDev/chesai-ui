import { clsx } from 'clsx'
import React, { useCallback, useRef, useState } from 'react'
import { getInputSlotClassNames, inputSlots, inputStyles } from './input-styles'

export interface UseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'> {
  ref?: React.Ref<HTMLInputElement>
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
  onClear?: () => void
  onValueChange?: (value: string) => void
  classNames?: Partial<Record<keyof typeof inputSlots, string>>
}

export function useInput(props: UseInputProps) {
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
    placeholder,
    onClear,
    onValueChange,
    onChange,
    value: propValue,
    defaultValue,
    readOnly,
    disabled,
    ...otherProps
  } = props

  const domRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue || '')

  const isControlled = propValue !== undefined
  const value = isControlled ? propValue : internalValue

  const isFilled = !!value || !!placeholder || isFocused

  React.useImperativeHandle(ref, () => domRef.current!)

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('')
    }
    if (domRef.current) {
      domRef.current.value = ''
      domRef.current.focus()
    }
    onClear?.()
    onValueChange?.('')

    const event = new Event('input', { bubbles: true })
    domRef.current?.dispatchEvent(event)
  }, [isControlled, onClear, onValueChange])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value)
      }
      onChange?.(e)
      onValueChange?.(e.target.value)
    },
    [isControlled, onChange, onValueChange],
  )

  const dynamicStyles = getInputSlotClassNames({
    variant,
    size,
    shape,
    labelPlacement,
    isInvalid,
    isFilled,
    hasStartContent: !!startContent,
    hasLabel: !!label, // FIX: Pass this prop
  })

  // --- Props Generators ---

  const getBaseProps = () => ({
    'data-slot': 'base',
    'data-filled': isFilled,
    'data-filled-within': isFilled || isFocused,
    'data-focus': isFocused,
    'data-invalid': isInvalid,
    'data-disabled': disabled,
    'data-readonly': readOnly,
    'data-label-placement': labelPlacement,
    className: clsx(inputSlots.base, inputStyles({ labelPlacement }), className, classNames?.base),
  })

  const getLabelProps = () => ({
    'data-slot': 'label',
    className: clsx(inputSlots.label, dynamicStyles.label, classNames?.label),
  })

  const getInputWrapperProps = () => ({
    'data-slot': 'input-wrapper',
    'data-focus': isFocused,
    className: clsx(inputSlots.inputWrapper, dynamicStyles.inputWrapper, classNames?.inputWrapper),
    onClick: () => {
      domRef.current?.focus()
    },
  })

  const getInnerWrapperProps = () => ({
    'data-slot': 'inner-wrapper',
    className: clsx(inputSlots.innerWrapper, classNames?.innerWrapper),
  })

  const getInputProps = () => ({
    ref: domRef,
    'data-slot': 'input',
    className: clsx(inputSlots.input, dynamicStyles.input, classNames?.input),
    placeholder,
    disabled,
    readOnly,
    value,
    onChange: handleChange,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    ...otherProps,
  })

  const getClearButtonProps = () => ({
    'data-slot': 'clear-button',
    type: 'button' as const,
    onClick: handleClear,
    className: clsx(inputSlots.clearButton, classNames?.clearButton),
  })

  const getHelperWrapperProps = () => ({
    'data-slot': 'helper-wrapper',
    className: clsx(inputSlots.helperWrapper, classNames?.helperWrapper),
  })

  const getDescriptionProps = () => ({
    'data-slot': 'description',
    className: clsx(inputSlots.description, classNames?.description),
  })

  const getErrorMessageProps = () => ({
    'data-slot': 'error-message',
    className: clsx(inputSlots.errorMessage, classNames?.errorMessage),
  })

  return {
    Component,
    domRef,
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
    getBaseProps,
    getLabelProps,
    getInputProps,
    getInputWrapperProps,
    getInnerWrapperProps,
    getHelperWrapperProps,
    getDescriptionProps,
    getErrorMessageProps,
    getClearButtonProps,
  }
}
