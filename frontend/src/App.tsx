import { useState } from 'react'
import './index.css'
import LoginPage from './pages/LoginPage'
import { DashboardLayout } from './layouts/DashboardLayout'

const App = () => {
  // Check localStorage on initial render (persists across page refresh)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token')
  })

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (isAuthenticated) {
    return <DashboardLayout onLogout={handleLogout} />
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />
}

export default App
