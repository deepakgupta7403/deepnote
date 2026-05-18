import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import './index.css'

/**
 * Entry point.
 * We use HashRouter (not BrowserRouter) so the app works on GitHub Pages.
 *
 * Provider order matters:
 *   Theme -> Toast -> Auth (knows about Firebase) -> AppData (uses Auth)
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <HashRouter>
              <App />
            </HashRouter>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
