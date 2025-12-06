import React, { useState, useEffect } from 'react'
import Calendar from './Calendar'
import JournalEntry from './JournalEntry'
import Tasks from './Tasks'
import { formatDateString } from '../utils/dateUtils'
import { getMonthBackground } from '../config/monthBackgrounds'
import './JournalView.css'

function JournalView() {
  const [selectedDate, setSelectedDate] = useState('2026-01-01')
  const [currentMonth, setCurrentMonth] = useState(0) // 0-11 for Jan-Dec
  const [backgroundImage, setBackgroundImage] = useState('')

  useEffect(() => {
    const date = new Date(selectedDate + 'T00:00:00')
    const month = date.getMonth() // 0-11
    setCurrentMonth(month)
    setBackgroundImage(getMonthBackground(month))
  }, [selectedDate])

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString)
  }

  const handleMonthChange = (monthIndex) => {
    setCurrentMonth(monthIndex)
    // Set to first day of the month
    const year = 2026
    const firstDay = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`
    setSelectedDate(firstDay)
  }

  return (
    <div 
      className="journal-view responsive-bg"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="journal-overlay"></div>
      
      <div className="journal-container">
        <header className="journal-header">
          <h1 className="journal-title">2026 Journal</h1>
          <div className="journal-date-display">
            {formatDateString(selectedDate)}
          </div>
        </header>

        <div className="journal-layout">
          <aside className="journal-sidebar">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
            />
          </aside>

          <main className="journal-content">
            <div className="journal-tabs">
              <JournalEntry selectedDate={selectedDate} />
              <Tasks selectedDate={selectedDate} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default JournalView

