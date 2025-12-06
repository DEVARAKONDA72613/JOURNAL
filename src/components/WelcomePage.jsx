import React from 'react'
import { welcomeBackground } from '../config/monthBackgrounds'
import './WelcomePage.css'

function WelcomePage({ onEnter }) {
  return (
    <div 
      className="welcome-page responsive-bg"
      style={{
        backgroundImage: `url(${welcomeBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="welcome-overlay"></div>
      <div className="welcome-content">
        <h1 className="welcome-title">My 2026 Journal & Daily Tasks</h1>
        <p className="welcome-subtitle">Capture your 2026, one day at a time.</p>
        <button className="welcome-button" onClick={onEnter}>
          Enter 2026 Journal
        </button>
      </div>
    </div>
  )
}

export default WelcomePage

