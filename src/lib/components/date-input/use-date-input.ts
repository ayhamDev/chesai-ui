'use client'

import { createCalendar, type DateValue } from '@internationalized/date'
import { useDateField } from '@react-aria/datepicker'
import { useLocale } from '@react-aria/i18n'
import { useDateFieldState } from '@react-stately/datepicker'
import type { AriaDateFieldProps } from '@react-types/datepicker'
import type { VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { useMemo, useRef, useState } from 'react' // FIX: Imported useState
import { dateInputSlots, dateInputStyles, getDateInputSlotClassNames } from './date-input-styles'


// @ts-ignore
export interface UseDateInputProps<T extends DateValue>
  extends Omit<AriaDateFieldProps<T>, 'className'>, // FIX: Omit className to avoid conflict
    Omit<VariantProps<typeof dateInputStyles>, 'isDisabled'> { // FIX: Omit conflicting props
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  classNames?: Partial<typeof dateInputSlots>
  labelPlacement?: 'inside' | 'outside' | 'outside-left'
  ref?: React.Ref<HTMLDivElement>
  placeholder?: string; // FIX: Add placeholder prop
  className?: string; // FIX: Add className prop
}

export function useDateInput<T extends DateValue>(props: UseDateInputProps<T>) {
  const {
    ref,
    label,
    description,
    errorMessage,
    startContent,
    endContent,
    className, // FIX: Destructure className now that it's in the interface
    classNames,
    variant = 'flat',
    color = 'primary',
    size = 'md',
    shape = 'minimal',
    labelPlacement = 'inside',
    isInvalid: isInvalidProp = false,
    ...otherProps
  } = props

  const domRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null) // FIX: Create a ref for the input
  const [isFocused, setIsFocused] = useState(false); // FIX: Add local focus state
  const { locale } = useLocale()

  const state = useDateFieldState({
    ...otherProps,
    label,
    locale,
    createCalendar,
    isInvalid: isInvalidProp,
    shouldForceLeadingZeros: true,
  })

  const { labelProps, fieldProps, inputProps, validationErrors, descriptionProps, errorMessageProps, isInvalid } =
    useDateField(
      {
        ...otherProps,
        label,
        // FIX: Pass the correct input ref
        inputRef,
      },
      state,
      domRef,
    )

  const hasLabel = !!label
  const shouldLabelBeOutside = labelPlacement !== 'inside'
  const isFilled = state.value != null || !!props.placeholder || labelPlacement === 'inside'

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

  const getBaseGroupProps = () => ({
    ref: domRef,
    className: clsx(dateInputSlots.base, dateInputStyles({ labelPlacement }), className, classNames?.base),
    'data-slot': 'base',
    'data-filled': isFilled,
    'data-filled-within': isFilled || isFocused, // FIX: Use local isFocused state
    'data-invalid': isInvalid,
    'data-disabled': props.isDisabled,
    'data-readonly': props.isReadOnly,
    label,
    description,
    errorMessage: isInvalid ? errorMessage || validationErrors.join(' ') : null,
    isInvalid,
    startContent,
    endContent,
    shouldLabelBeOutside,

    labelProps: {
      ...labelProps,
      className: clsx(dateInputSlots.label, slots.label, classNames?.label),
    },
    wrapperProps: {
      className: clsx(dateInputSlots.inputWrapper, slots.inputWrapper, classNames?.inputWrapper),
      'data-focus': isFocused, // FIX: Use local isFocused state
      onClick: fieldProps.onClick,
    },
    innerWrapperProps: {
      className: clsx(dateInputSlots.innerWrapper, slots.innerWrapper, classNames?.innerWrapper),
    },
    helperWrapperProps: {
      className: clsx(dateInputSlots.helperWrapper, slots.helperWrapper, classNames?.helperWrapper),
    },
    errorMessageProps: {
      ...errorMessageProps,
      className: clsx(dateInputSlots.errorMessage, slots.errorMessage, classNames?.errorMessage),
    },
    descriptionProps: {
      ...descriptionProps,
      className: clsx(dateInputSlots.description, slots.description, classNames?.description),
    },
  })

  const getFieldProps = () => ({
    ...fieldProps,
    onFocus: () => setIsFocused(true), // FIX: Manage focus state
    onBlur: () => setIsFocused(false),  // FIX: Manage focus state
    className: clsx('flex items-center h-full'),
  })

  const getInputProps = () => ({
    ...inputProps,
    ref: inputRef, // FIX: Attach the ref here
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
