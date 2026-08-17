/**
 * Frontend Application Entry Point
 * Mounts the React application tree wrapped in StrictMode, Redux Provider, BrowserRouter, and AuthProvider.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import App from './App'
import { AuthProvider } from './layouts/AuthContext';

// Render top-level component hierarchy into HTML root element
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
