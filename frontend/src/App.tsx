import { useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import LoginPage from './pages/LoginPage'
import { DashboardLayout } from './layouts/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'
import { SalesPage } from './pages/SalesPage'
import { ProductInventoryPage } from './pages/ProductInventoryPage'
import { ServiceInventoryPage } from './pages/ServiceInventoryPage'
import { ReportsPage } from './pages/ReportsPage'
import { InvoicePrintPage } from './pages/InvoicePrintPage'
import { UsersPage } from './pages/UsersPage'
import { RolePage } from './pages/RolePage'

const App = () => {
  // Initialize theme from localStorage — applies data-theme to <html>
  useTheme()
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

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Print Route without DashboardLayout */}
        <Route
          path="/print-invoice/:id"
          element={
            isAuthenticated ? (
              <InvoicePrintPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <DashboardLayout onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="products" element={<ProductInventoryPage />} />
          <Route path="services" element={<ServiceInventoryPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings/users" element={<UsersPage />} />
          <Route path="settings/role" element={<RolePage />} />
          <Route
            path="*"
            element={
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                    Halaman Tidak Ditemukan
                  </p>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
