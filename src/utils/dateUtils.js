// Import month backgrounds from config
import { getMonthBackground } from '../config/monthBackgrounds'

// Re-export for backward compatibility
export { getMonthBackground }

export const formatDateString = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

export const formatDateShort = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  const options = { month: 'short', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

export const isValid2026Date = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  const year = date.getFullYear()
  return year === 2026
}

export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate()
}

export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay()
}

export const isSameDate = (date1, date2) => {
  return date1 === date2
}

