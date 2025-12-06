import React, { useState } from 'react'
import { getDaysInMonth, getFirstDayOfMonth, formatDateShort, isValid2026Date } from '../utils/dateUtils'
import './Calendar.css'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Calendar({ selectedDate, onDateSelect, currentMonth, onMonthChange }) {
  const year = 2026
  const [viewMonth, setViewMonth] = useState(currentMonth)

  const daysInMonth = getDaysInMonth(year, viewMonth)
  const firstDay = getFirstDayOfMonth(year, viewMonth)

  const handlePrevMonth = () => {
    if (viewMonth > 0) {
      const newMonth = viewMonth - 1
      setViewMonth(newMonth)
      onMonthChange(newMonth)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth < 11) {
      const newMonth = viewMonth + 1
      setViewMonth(newMonth)
      onMonthChange(newMonth)
    }
  }

  const handleDateClick = (day) => {
    const dateString = `${year}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (isValid2026Date(dateString)) {
      onDateSelect(dateString)
    }
  }

  const isSelected = (day) => {
    const dateString = `${year}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return selectedDate === dateString
  }

  const calendarDays = []
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button 
          className="calendar-nav-btn" 
          onClick={handlePrevMonth}
          disabled={viewMonth === 0}
          aria-label="Previous month"
        >
          ‹
        </button>
        <h2 className="calendar-month-year">
          {MONTH_NAMES[viewMonth]} {year}
        </h2>
        <button 
          className="calendar-nav-btn" 
          onClick={handleNextMonth}
          disabled={viewMonth === 11}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {DAY_NAMES.map(day => (
          <div key={day} className="calendar-day-name">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-day calendar-day--empty"></div>
          }
          
          const dateString = `${year}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const selected = isSelected(day)
          
          return (
            <button
              key={day}
              className={`calendar-day ${selected ? 'calendar-day--selected' : ''}`}
              onClick={() => handleDateClick(day)}
              aria-label={`Select ${formatDateShort(dateString)}`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar

