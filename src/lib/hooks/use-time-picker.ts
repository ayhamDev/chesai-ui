import { getHours, getMinutes, setHours, setMinutes } from 'date-fns'
import { useMemo, useState } from 'react'

export const useTimePicker = (initialDate: Date) => {
  const [time, setTime] = useState(initialDate)

  const hours = getHours(time)
  const minutes = getMinutes(time)

  const period = useMemo(() => (hours >= 12 ? 'PM' : 'AM'), [hours])
  const displayHour = useMemo(() => {
    const h = hours % 12
    return h === 0 ? 12 : h
  }, [hours])

  const setHour = (hour: number) => {
    // Converts 12-hour format to 24-hour format
    let newHour = hour
    if (period === 'PM' && newHour < 12) {
      newHour += 12
    } else if (period === 'AM' && newHour === 12) {
      newHour = 0 // Midnight case
    }
    setTime(prev => setHours(prev, newHour))
  }

  const setMinute = (minute: number) => {
    setTime(prev => setMinutes(prev, minute))
  }

  const setPeriod = (newPeriod: 'AM' | 'PM') => {
    if (newPeriod !== period) {
      const currentHours = getHours(time)
      if (newPeriod === 'PM' && currentHours < 12) {
        setTime(prev => setHours(prev, currentHours + 12))
      } else if (newPeriod === 'AM' && currentHours >= 12) {
        setTime(prev => setHours(prev, currentHours - 12))
      }
    }
  }

  const formattedTime = useMemo(
    () => ({
      hour: String(displayHour).padStart(2, '0'),
      minute: String(minutes).padStart(2, '0'),
      period: period,
    }),
    [displayHour, minutes, period],
  )

  return {
    time,
    setTime,
    displayHour,
    minutes,
    period,
    setHour,
    setMinute,
    setPeriod,
    formattedTime,
  }
}
