'use client'

import { createCalendar, type DateValue } from '@internationalized/date'
import { useDateField } from '@react-aria/datepicker'
import { useLocale } from '@react-aria/i18n'
import { useDateFieldState } from '@react-stately/datepicker'
import type { AriaDateFieldProps } from '@react-types/datepicker'
import type { VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { useMemo, useRef } from 'react'
import { dateInputSlots, dateInputStyles, getDateInputSlotClassNames } from './date-input-styles'

export interface UseDateInputProps<T extends DateValue>
  extends AriaDateFieldProps<T>,
    VariantProps<typeof dateInputStyles> {
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  classNames?: Partial<typeof dateInputSlots>
  labelPlacement?: 'inside' | 'outside' | 'outside-left'
  ref?: React.Ref<HTMLDivElement>
}

export function useDateInput<T extends DateValue>(props: UseDateInputProps<T>) {
  const {
    ref,
    label,
    description,
    errorMessage,
    startContent,
    endContent,
    className,
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
  const { locale } = useLocale()

  const state = useDateFieldState({
    ...otherProps,
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
        inputRef: domRef,
      },
      state,
      domRef,
    )

  const hasLabel = !!label
  const shouldLabelBeOutside = labelPlacement !== 'inside'

  // FIX: For DateInput, if label is inside, it should always look "filled"
  // because the segments (mm/dd/yyyy) are always visible placeholders.
  // Otherwise, they overlap the centered label.
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
    'data-filled-within': isFilled || state.isFocused,
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
      'data-focus': state.isFocused,
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
    className: clsx('flex items-center h-full'),
  })

  const getInputProps = () => ({
    ...inputProps,
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
