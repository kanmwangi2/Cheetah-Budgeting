import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
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
  const { currentUser, selectedOrganization, availableOrganizations, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {currentUser ? (
          <>
            {/* If user is logged in but hasn't selected organization (and has choices) */}
            {!selectedOrganization && availableOrganizations.length > 1 ? (
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
