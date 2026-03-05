// FILE: src/main.jsx  — COMPLETE REPLACEMENT
// Add ThemeProvider wrapper so themes work across entire app

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0e1629',
              color: '#e0e7ff',
              borderRadius: '10px',
              border: '1px solid rgba(99,102,241,0.3)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#0e1629' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#0e1629' } },
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
