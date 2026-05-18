import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import './index.css'

/**
 * Entry point.
 * We use HashRouter (not BrowserRouter) so the app works perfectly on
 * GitHub Pages without server-side 404 handling for nested routes.
 *
 * Context providers wrap the app in order:
 *  Theme -> Toast -> AppData -> Router
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
