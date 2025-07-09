import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './shared/LoadingSpinner'

// Lazy load components
const Dashboard = React.lazy(() => import('./dashboard/Dashboard'))
const LoginPage = React.lazy(() => import('./auth/LoginPage'))
const RegisterPage = React.lazy(() => import('./auth/RegisterPage'))
const OrganizationSelector = React.lazy(() => import('./auth/OrganizationSelector'))
const OrganizationManagement = React.lazy(() => import('./admin/OrganizationManagement'))
const UserManagement = React.lazy(() => import('./admin/UserManagement'))
const DepartmentList = React.lazy(() => import('./departments/DepartmentList'))
const DonorManagement = React.lazy(() => import('./donors/DonorManagement'))
const ReportsPage = React.lazy(() => import('./reports/ReportsPage'))
const SettingsPage = React.lazy(() => import('./settings/SettingsPage'))

const AppRouter: React.FC = () => {
  const { currentUser, selectedOrganization, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('AppRouter redirect check:')
    console.log('  currentUser:', currentUser)
    console.log('  selectedOrganization:', selectedOrganization)
    console.log('  pathname:', location.pathname)
    
    if (loading) {
      console.log('AppRouter: Still loading, skipping redirect logic')
      return
    }
    
    // Don't interfere with login/register pages
    if (location.pathname === '/login' || location.pathname === '/register') {
      console.log('AppRouter: On auth page, skipping redirect logic')
      return
    }
    
    if (
      currentUser &&
      !selectedOrganization &&
      location.pathname !== '/select-organization'
    ) {
      console.log('AppRouter: Redirecting to /select-organization')
      navigate('/select-organization', { replace: true })
      setTimeout(() => {
        if (window.location.pathname !== '/select-organization') {
          console.log('AppRouter: Hard redirect to /select-organization')
          window.location.replace('/select-organization')
        }
      }, 200)
    } else if (currentUser && selectedOrganization && location.pathname === '/select-organization') {
      console.log('AppRouter: User has organization selected but still on selector page, redirecting to dashboard')
      navigate('/', { replace: true })
    }
  }, [currentUser, selectedOrganization, location.pathname, navigate, loading])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {currentUser ? (
          <>
            {/* If user is logged in but hasn't selected organization */}
            {!selectedOrganization ? (
              <>
                <Route path="/select-organization" element={<OrganizationSelector />} />
                <Route path="*" element={<Navigate to="/select-organization" replace />} />
              </>
            ) : (
              <>
                {/* Main app routes - only accessible after organization selection */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/departments" element={<DepartmentList />} />
                <Route path="/donors" element={<DonorManagement />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/select-organization" element={<OrganizationSelector />} />
                
                {/* Admin routes */}
                <Route path="/admin/organizations" element={<OrganizationManagement />} />
                <Route path="/admin/users" element={<UserManagement />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </>
        ) : (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </Suspense>
  )
}

export default AppRouter
