import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DeviceProvider } from './contexts/DeviceContext'
import { ActivityProvider } from './contexts/ActivityContext'
import ErrorBoundary from './components/ErrorBoundary'

// Apply dark mode class to document directly
document.documentElement.classList.add('dark')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <DeviceProvider>
        <ActivityProvider>
          <App />
        </ActivityProvider>
      </DeviceProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)