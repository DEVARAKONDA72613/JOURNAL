import React, { useState } from 'react'
import WelcomePage from './components/WelcomePage'
import JournalView from './components/JournalView'
import './App.css'

function App() {
  const [showJournal, setShowJournal] = useState(false)

  return (
    <div className="app">
      {!showJournal ? (
        <WelcomePage onEnter={() => setShowJournal(true)} />
      ) : (
        <JournalView />
      )}
    </div>
  )
}

export default App

