import React, { useState, useEffect, useRef } from 'react'
import { formatDateString } from '../utils/dateUtils'
import './JournalEntry.css'

function JournalEntry({ selectedDate }) {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)
  const debounceTimer = useRef(null)

  useEffect(() => {
    // Load saved entry for the selected date
    const key = `journalEntries2026`
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const entries = JSON.parse(saved)
        setContent(entries[selectedDate] || '')
      } catch (e) {
        console.error('Error loading journal entry:', e)
      }
    }
  }, [selectedDate])

  const saveEntry = () => {
    const key = `journalEntries2026`
    let entries = {}
    
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        entries = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Error loading entries:', e)
    }

    entries[selectedDate] = content
    localStorage.setItem(key, JSON.stringify(entries))
    setSaved(true)
    
    setTimeout(() => {
      setSaved(false)
    }, 2000)
  }

  const handleChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
    setSaved(false)

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer for autosave
    debounceTimer.current = setTimeout(() => {
      const key = `journalEntries2026`
      let entries = {}
      
      try {
        const saved = localStorage.getItem(key)
        if (saved) {
          entries = JSON.parse(saved)
        }
      } catch (e) {
        console.error('Error loading entries:', e)
      }

      entries[selectedDate] = newContent
      localStorage.setItem(key, JSON.stringify(entries))
      setSaved(true)
      
      setTimeout(() => {
        setSaved(false)
      }, 2000)
    }, 1500)
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear this journal entry?')) {
      setContent('')
      const key = `journalEntries2026`
      let entries = {}
      
      try {
        const saved = localStorage.getItem(key)
        if (saved) {
          entries = JSON.parse(saved)
        }
      } catch (e) {
        console.error('Error loading entries:', e)
      }

      delete entries[selectedDate]
      localStorage.setItem(key, JSON.stringify(entries))
    }
  }

  return (
    <div className="journal-entry-card">
      <div className="journal-entry-header">
        <h2 className="journal-entry-title">
          Journal for {formatDateString(selectedDate)}
        </h2>
        {saved && (
          <span className="journal-entry-saved">Saved</span>
        )}
      </div>
      
      <textarea
        className="journal-entry-textarea"
        value={content}
        onChange={handleChange}
        placeholder="Write your thoughts, experiences, and reflections for today..."
        rows={12}
      />
      
      <div className="journal-entry-actions">
        <button 
          className="journal-entry-btn journal-entry-btn--save"
          onClick={saveEntry}
        >
          Save
        </button>
        <button 
          className="journal-entry-btn journal-entry-btn--clear"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default JournalEntry

