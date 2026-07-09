// src/lib/components/phone-input/index.tsx
'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import { useMediaQuery } from '@uidotdev/usehooks'
import { clsx } from 'clsx'
import type { CountryCode } from 'libphonenumber-js'
import { getExampleNumber } from 'libphonenumber-js'
import examples from 'libphonenumber-js/examples.mobile.json'
import { Check, ChevronDown, Search } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCountries, getCountryCallingCode } from 'react-phone-number-input'
import SmartPhoneInput from 'react-phone-number-input/input'
import enLabels from 'react-phone-number-input/locale/en.json'

import { ElasticScrollArea } from '../elastic-scroll-area'
import { Input, type InputProps } from '../input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../sheet'

export { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input'

const DEFAULT_COUNTRY: CountryCode = 'US'
const EMPTY_PHONE_VALUE = ''

type CountryLabels = Record<string, string>
type InputVariant = NonNullable<InputProps['variant']>
type InputSize = NonNullable<InputProps['size']>
type InputShape = NonNullable<InputProps['shape']>

interface CountryOption {
  country: CountryCode
  callingCode: string
}

interface LocalizedCountryOption extends CountryOption {
  name: string
}

const BASE_COUNTRY_OPTIONS: CountryOption[] = getCountries().map(country => ({
  country: country as CountryCode,
  callingCode: getCountryCallingCode(country),
}))

const normalizePhoneValue = (value?: string | null) => (value ? value : undefined)

export const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return 'ZZ'

  return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))
}

interface CountryPickerProps {
  value: CountryCode
  onChange: (country: CountryCode) => void
  disabled?: boolean
  labels?: CountryLabels
  variant?: InputVariant
  size?: InputSize
  shape?: InputShape
  isInvalid?: boolean
}

interface CountryOptionRowProps {
  option: LocalizedCountryOption
  selected: boolean
  density: 'compact' | 'comfortable'
  onSelect: (country: CountryCode) => void
}

const CountryOptionRow = React.memo(({ option, selected, density, onSelect }: CountryOptionRowProps) => {
  const handleClick = useCallback(() => onSelect(option.country), [onSelect, option.country])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        'flex items-center gap-3 px-3 text-sm rounded-lg text-left transition-colors shrink-0',
        density === 'comfortable' ? 'py-2.5' : 'py-2',
        selected
          ? 'bg-secondary-container text-on-secondary-container font-semibold'
          : 'hover:bg-surface-container-highest text-on-surface',
      )}
    >
      <span className="text-xl leading-none">{getFlagEmoji(option.country)}</span>
      <span className="flex-1 truncate rtl:text-right">{option.name}</span>
      <span className="text-on-surface-variant opacity-70" dir="ltr">
        +{option.callingCode}
      </span>
      {selected && <Check size={16} />}
    </button>
  )
})

CountryOptionRow.displayName = 'CountryOptionRow'

const CountryPicker = React.memo(
  ({
    value,
    onChange,
    disabled,
    labels = enLabels,
    variant = 'filled',
    size = 'md',
    shape = 'minimal',
    isInvalid = false,
  }: CountryPickerProps) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const isMobile = useMediaQuery('(max-width: 768px)')

    const countries = useMemo<LocalizedCountryOption[]>(() => {
      return BASE_COUNTRY_OPTIONS.map(option => ({
        ...option,
        name: labels[option.country] || enLabels[option.country] || option.country,
      }))
    }, [labels])

    const filteredCountries = useMemo(() => {
      const query = search.trim().toLowerCase()
      if (!query) return countries

      const callingCodeQuery = query.startsWith('+') ? query.slice(1) : query

      return countries.filter(option => {
        return (
          option.name.toLowerCase().includes(query) ||
          option.country.toLowerCase() === query ||
          option.callingCode.includes(callingCodeQuery)
        )
      })
    }, [countries, search])

    const handleOpenChange = useCallback((nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen) {
        setSearch('')
      }
    }, [])

    const handleSelect = useCallback(
      (country: CountryCode) => {
        if (country !== value) {
          onChange(country)
        }
        handleOpenChange(false)
      },
      [handleOpenChange, onChange, value],
    )

    const bloomColor = useMemo(() => {
      if (isInvalid) return 'after:bg-error/20 text-error'
      if (variant.includes('inverted')) return 'after:bg-primary/20 text-primary'
      return 'after:bg-on-surface/10 text-on-surface-variant hover:text-on-surface'
    }, [isInvalid, variant])

    const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'

    const shapeClass = useMemo(() => {
      if (shape === 'full') return 'rounded-full'
      if (shape === 'sharp') return 'rounded-none'
      return 'rounded-lg'
    }, [shape])

    const stopInputWrapperPropagation = useCallback((event: React.SyntheticEvent) => {
      event.stopPropagation()
    }, [])

    const triggerElement = (
      <button
        type="button"
        disabled={disabled}
        dir="ltr"
        onClick={stopInputWrapperPropagation}
        onPointerDown={stopInputWrapperPropagation}
        className={clsx(
          'relative z-0 flex flex-row items-center justify-center gap-1.5 transition-colors px-2.5 py-1.5 outline-none',
          shapeClass,
          'after:absolute after:inset-0 after:z-[-1] after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out hover:after:opacity-100 hover:after:scale-100',
          bloomColor,
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className={clsx('font-medium', textSize)}>{value}</span>
        <span className={clsx('font-medium opacity-60', textSize)}>+{getCountryCallingCode(value)}</span>
        <ChevronDown size={14} className="opacity-50 ml-0.5" />
      </button>
    )

    const countryList = (
      <div className="p-1 flex flex-col gap-0.5 pb-safe">
        {filteredCountries.map(option => (
          <CountryOptionRow
            key={option.country}
            option={option}
            selected={value === option.country}
            density={isMobile ? 'comfortable' : 'compact'}
            onSelect={handleSelect}
          />
        ))}
      </div>
    )

    const listContent = (
      <div className="flex flex-col flex-1 min-h-0 w-full h-full">
        <div className="p-2 border-b border-outline-variant/10 shrink-0">
          <Input
            variant="filled"
            size="sm"
            placeholder="Search country..."
            value={search}
            onChange={event => setSearch(event.target.value)}
            startContent={<Search size={14} className="text-on-surface-variant" />}
            className="bg-transparent"
            onClick={event => event.stopPropagation()}
            onPointerDown={event => event.stopPropagation()}
          />
        </div>

        <div className={clsx('flex-1 min-h-0 relative', !isMobile && 'overflow-y-auto')}>
          {isMobile ? (
            <ElasticScrollArea className="absolute inset-0" elasticity={false}>
              {countryList}
            </ElasticScrollArea>
          ) : (
            countryList
          )}
        </div>
      </div>
    )

    if (isMobile) {
      return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>{triggerElement}</SheetTrigger>
          <SheetContent shape="minimal" className="p-0 flex flex-col overflow-hidden max-h-[85vh] h-[500px]">
            <SheetHeader className="px-4 py-3 border-b border-outline-variant/20 shrink-0">
              <SheetTitle className="text-left rtl:text-right">Select Country</SheetTitle>
            </SheetHeader>
            {listContent}
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <PopoverPrimitive.Trigger asChild>{triggerElement}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className={clsx(
              'z-50 w-[320px] max-h-80 overflow-hidden flex flex-col p-0',
              'rounded-xl border border-outline-variant bg-surface-container text-on-surface shadow-md',
              'data-[state=open]:animate-menu-enter data-[state=closed]:animate-menu-exit',
            )}
            align="start"
            sideOffset={8}
          >
            {listContent}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  },
)

CountryPicker.displayName = 'CountryPicker'

type PhoneTextFieldProps = InputProps & {
  value?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}

const PhoneTextField = React.memo(
  React.forwardRef<HTMLInputElement, PhoneTextFieldProps>(
    ({ value, onChange, onFocus, onBlur, onFocusCapture, onBlurCapture, className, ...props }, ref) => {
      const handleFocusCapture = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
          onFocusCapture?.(event)
          onFocus?.(event)
        },
        [onFocus, onFocusCapture],
      )

      const handleBlurCapture = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
          onBlurCapture?.(event)
          onBlur?.(event)
        },
        [onBlur, onBlurCapture],
      )

      return (
        <Input
          {...props}
          ref={ref}
          value={value ?? EMPTY_PHONE_VALUE}
          onChange={onChange}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
          className={clsx('!text-left', className)}
        />
      )
    },
  ),
)

PhoneTextField.displayName = 'PhoneTextField'

export interface PhoneInputProps
  extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'onValueChange' | 'maxLength'> {
  value?: string
  onValueChange?: (value: string | undefined) => void
  defaultCountry?: CountryCode
  country?: CountryCode
  onCountryChange?: (country: CountryCode) => void
  labels?: CountryLabels
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onValueChange,
      defaultCountry = DEFAULT_COUNTRY,
      country: controlledCountry,
      onCountryChange,
      startContent,
      disabled,
      labels = enLabels,
      labelPlacement = 'outside',
      placeholder,
      variant = 'filled',
      size = 'md',
      shape = 'minimal',
      isInvalid = false,
      errorMessage,
      onFocus,
      onBlur,
      onFocusCapture,
      onBlurCapture,
      className,
      classNames,
      ...inputProps
    },
    ref,
  ) => {
    const [internalCountry, setInternalCountry] = useState<CountryCode>(() => defaultCountry)
    const [isFocused, setIsFocused] = useState(false)
    const lastEmittedValueRef = useRef<string | undefined>(normalizePhoneValue(value))

    useEffect(() => {
      lastEmittedValueRef.current = normalizePhoneValue(value)
    }, [value])

    const isCountryControlled = controlledCountry !== undefined
    const selectedCountry = controlledCountry ?? internalCountry

    const handleCountryChange = useCallback(
      (nextCountry: CountryCode) => {
        if (nextCountry === selectedCountry) return

        if (!isCountryControlled) {
          setInternalCountry(nextCountry)
        }

        onCountryChange?.(nextCountry)
      },
      [isCountryControlled, onCountryChange, selectedCountry],
    )

    const handlePhoneValueChange = useCallback(
      (nextValue?: string) => {
        const normalizedValue = normalizePhoneValue(nextValue)

        if (normalizedValue === normalizePhoneValue(value) || normalizedValue === lastEmittedValueRef.current) {
          return
        }

        lastEmittedValueRef.current = normalizedValue
        onValueChange?.(normalizedValue)
      },
      [onValueChange, value],
    )

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
        onFocusCapture?.(event)
        onFocus?.(event)
      },
      [onFocus, onFocusCapture],
    )

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false)
        onBlurCapture?.(event)
        onBlur?.(event)
      },
      [onBlur, onBlurCapture],
    )

    const activeInvalid = isInvalid && !isFocused && !!value
    const activeErrorMessage = !isFocused ? errorMessage : undefined

    const composedStartContent = useMemo(
      () => (
        <>
          <div className="flex items-center self-stretch my-1 border-r border-outline-variant/30 pr-1.5 mr-1.5 shrink-0">
            <CountryPicker
              value={selectedCountry}
              onChange={handleCountryChange}
              disabled={disabled}
              labels={labels}
              variant={variant}
              size={size}
              shape={shape}
              isInvalid={activeInvalid}
            />
          </div>
          {startContent}
        </>
      ),
      [activeInvalid, disabled, handleCountryChange, labels, selectedCountry, shape, size, startContent, variant],
    )

    const dynamicPlaceholder = useMemo(() => {
      if (placeholder) return placeholder

      try {
        return getExampleNumber(selectedCountry, examples)?.formatNational() ?? ''
      } catch {
        return ''
      }
    }, [placeholder, selectedCountry])

    const mergedClassNames = useMemo(
      () => ({
        ...classNames,
        innerWrapper: clsx('[direction:ltr] flex-row', classNames?.innerWrapper),
      }),
      [classNames],
    )

    return (
      <SmartPhoneInput
        {...inputProps}
        ref={ref}
        inputComponent={PhoneTextField}
        smartCaret={false}
        country={selectedCountry}
        value={normalizePhoneValue(value)}
        onChange={handlePhoneValueChange}
        disabled={disabled}
        startContent={composedStartContent}
        labelPlacement={labelPlacement}
        placeholder={dynamicPlaceholder}
        variant={variant}
        size={size}
        shape={shape}
        isInvalid={activeInvalid}
        errorMessage={activeErrorMessage}
        onFocus={handleFocus}
        onBlur={handleBlur}
        dir="ltr"
        classNames={mergedClassNames}
        className={className}
      />
    )
  },
)

PhoneInput.displayName = 'PhoneInput'

export { default as phoneLocaleAr } from 'react-phone-number-input/locale/ar.json'
export { default as phoneLocaleDe } from 'react-phone-number-input/locale/de.json'
export { default as phoneLocaleEn } from 'react-phone-number-input/locale/en.json'
export { default as phoneLocaleEs } from 'react-phone-number-input/locale/es.json'
export { default as phoneLocaleFr } from 'react-phone-number-input/locale/fr.json'
export { default as phoneLocaleIt } from 'react-phone-number-input/locale/it.json'
export { default as phoneLocaleJa } from 'react-phone-number-input/locale/ja.json'
export { default as phoneLocaleKo } from 'react-phone-number-input/locale/ko.json'
export { default as phoneLocalePt } from 'react-phone-number-input/locale/pt.json'
export { default as phoneLocaleRu } from 'react-phone-number-input/locale/ru.json'
export { default as phoneLocaleTr } from 'react-phone-number-input/locale/tr.json'
export { default as phoneLocaleZh } from 'react-phone-number-input/locale/zh.json'
