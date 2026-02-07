import { clsx } from 'clsx'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { type UseInputProps, useInput } from '../input/use-input'
import { getTextareaSlotClassNames, textareaSlots, textareaStyles } from './textarea-styles'

export interface UseTextareaProps extends Omit<UseInputProps, 'ref' | 'onValueChange' | 'onChange'> {
  ref?: React.Ref<HTMLTextAreaElement>
  minRows?: number
  maxRows?: number
  disableAutosize?: boolean
  onValueChange?: (value: string) => void
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
}

export function useTextarea(props: UseTextareaProps) {
  const {
    ref,
    minRows = 3,
    maxRows = 8,
    disableAutosize = false,
    onChange,
    onValueChange,
    classNames,
    ...otherProps
  } = props

  const {
    label,
    description,
    errorMessage,
    isInvalid,
    isClearable,
    isOutsideLeft,
    isOutsideTop,
    shouldLabelBeOutside,
    getBaseProps: getBaseInputProps,
    getLabelProps: getBaseLabelProps,
    getInputWrapperProps: getBaseWrapperProps,
    getHelperWrapperProps,
    getDescriptionProps,
    getErrorMessageProps,
    getClearButtonProps,
  } = useInput(props as any)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  React.useImperativeHandle(ref, () => textareaRef.current!)

  useLayoutEffect(() => {
    if (disableAutosize || !textareaRef.current) return

    const textarea = textareaRef.current
    const adjustHeight = () => {
      textarea.style.height = 'auto'
      const singleRowHeight = 24
      const minHeight = minRows * singleRowHeight
      const maxHeight = maxRows * singleRowHeight
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
    }

    textarea.addEventListener('input', adjustHeight)
    adjustHeight()
    return () => textarea.removeEventListener('input', adjustHeight)
  }, [minRows, maxRows, disableAutosize, props.value, props.defaultValue])

  const isFilled = !!props.value || !!props.placeholder || isFocused

  const dynamicStyles = getTextareaSlotClassNames({
    variant: props.variant,
    color: props.color,
    size: props.size,
    shape: props.shape,
    labelPlacement: props.labelPlacement,
    isInvalid,
    isFilled,
  })

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      props.onFocus?.(e as any)
    },
    [props.onFocus],
  )

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      props.onBlur?.(e as any)
    },
    [props.onBlur],
  )

  const getBaseProps = () => {
    const baseProps = getBaseInputProps()
    return {
      ...baseProps,
      'data-filled': isFilled,
      'data-filled-within': isFilled || isFocused,
      'data-focus': isFocused,
      className: clsx(
        textareaSlots.base,
        textareaStyles({ labelPlacement: props.labelPlacement }),
        props.className,
        classNames?.base,
      ),
    }
  }

  const getLabelProps = () => {
    const labelProps = getBaseLabelProps()
    return {
      ...labelProps,
      className: clsx(textareaSlots.label, dynamicStyles.label, classNames?.label),
    }
  }

  const getInputWrapperProps = () => {
    const wrapperProps = getBaseWrapperProps()
    return {
      ...wrapperProps,
      'data-focus': isFocused,
      className: clsx(textareaSlots.inputWrapper, dynamicStyles.inputWrapper, classNames?.inputWrapper),
      onClick: () => {
        textareaRef.current?.focus()
      },
    }
  }

  const getInputProps = () => ({
    ref: textareaRef,
    'data-slot': 'input',
    className: clsx(textareaSlots.input, dynamicStyles.input, classNames?.input),
    placeholder: props.placeholder,
    disabled: props.disabled,
    readOnly: props.readOnly,
    value: props.value,
    defaultValue: props.defaultValue,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e)
      onValueChange?.(e.target.value)
    },
    ...otherProps,
  })

  const getInnerWrapperProps = () => ({
    'data-slot': 'inner-wrapper',
    className: clsx(textareaSlots.innerWrapper, classNames?.innerWrapper),
  })

  return {
    Component: 'div',
    label,
    description,
    isClearable,
    startContent: props.startContent,
    endContent: props.endContent,
    labelPlacement: props.labelPlacement,
    isOutsideLeft,
    isOutsideTop,
    shouldLabelBeOutside,
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
