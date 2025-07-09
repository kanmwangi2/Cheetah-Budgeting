import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Users, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { OrganizationSelection } from '../../types/user'

const OrganizationSelector: React.FC = () => {
  const { availableOrganizations, selectOrganization, currentUser } = useAuth()
  const { showToast } = useNotifications()
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  const handleOrganizationSelect = (organization: OrganizationSelection) => {
    selectOrganization(organization)
    showToast('success', `Selected ${organization.name}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedOrg = availableOrganizations.find(org => org.id === selectedOrgId)
    if (selectedOrg) {
      handleOrganizationSelect(selectedOrg)
    }
  }

  if (availableOrganizations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              No Organizations Available
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.role === 'app_admin' 
                ? 'Create your first organization to get started.'
                : 'You are not assigned to any organizations yet. Contact your administrator.'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (availableOrganizations.length === 1) {
    // Auto-select if only one organization (handled in AuthContext)
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Select Organization
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Choose the organization you want to work with
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {availableOrganizations.map((org) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 ${
                  selectedOrgId === org.id
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setSelectedOrgId(org.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`rounded-full p-2 ${
                      selectedOrgId === org.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {org.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          org.role === 'admin'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {org.role === 'admin' ? 'Administrator' : 'Member'}
                        </span>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-1" />
                          {org.departments.length} departments
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${
                    selectedOrgId === org.id ? 'rotate-90' : ''
                  } text-gray-400`} />
                </div>

                {selectedOrgId === org.id && org.departments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pl-12 space-y-2"
                  >
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Available Departments:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {org.departments.map((dept) => (
                        <span
                          key={dept.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        >
                          {dept.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                <input
                  type="radio"
                  name="organization"
                  value={org.id}
                  checked={selectedOrgId === org.id}
                  onChange={() => setSelectedOrgId(org.id)}
                  className="sr-only"
                />
              </motion.div>
            ))}
          </div>

          <div>
            <button
              type="submit"
              disabled={!selectedOrgId}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Continue to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrganizationSelector
