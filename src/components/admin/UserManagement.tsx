import React, { useState, useEffect, useCallback } from 'react'
import { 
  User, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  Search,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  getDoc
} from 'firebase/firestore'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, db } from '../../services/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { User as UserType, Organization, Department } from '../../types/user'
import { getRoleDisplayName } from '../../utils/permissions'

interface UserWithDetails extends UserType {
  organizationNames: string[]
  departmentNames: string[]
}

const UserManagement: React.FC = () => {
  const { currentUser } = useAuth()
  const { showToast } = useNotifications()
  const [users, setUsers] = useState<UserWithDetails[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'app_admin' | 'org_admin' | 'user',
    organizationIds: [] as string[],
    departmentIds: [] as string[]
  })

  const canManageUsers = (user: any) => {
    return user?.role === 'app_admin' || user?.role === 'org_admin'
  }

  const fetchOrganizations = useCallback(async () => {
    try {
      let orgsQuery
      if (currentUser?.role === 'app_admin') {
        orgsQuery = query(collection(db, 'organizations'), orderBy('name'))
      } else if (currentUser?.role === 'org_admin') {
        orgsQuery = query(
          collection(db, 'organizations'),
          where('adminIds', 'array-contains', currentUser.id),
          orderBy('name')
        )
      } else {
        return
      }

      const orgsSnapshot = await getDocs(orgsQuery)
      const orgData = orgsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization))
      setOrganizations(orgData)
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }, [currentUser])

  const fetchDepartments = useCallback(async () => {
    try {
      let deptsQuery
      if (currentUser?.role === 'app_admin') {
        deptsQuery = query(collection(db, 'departments'), orderBy('name'))
      } else if (currentUser?.role === 'org_admin') {
        // Get departments for organizations where user is admin
        const userOrgs = organizations.filter(org => org.adminIds.includes(currentUser.id))
        if (userOrgs.length === 0) return
        
        deptsQuery = query(
          collection(db, 'departments'),
          where('organizationId', 'in', userOrgs.map(org => org.id)),
          orderBy('name')
        )
      } else {
        return
      }

      const deptsSnapshot = await getDocs(deptsQuery)
      const deptData = deptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department))
      setDepartments(deptData)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }, [currentUser, organizations])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      let usersQuery
      
      if (currentUser?.role === 'app_admin') {
        usersQuery = query(collection(db, 'users'), orderBy('name'))
      } else if (currentUser?.role === 'org_admin') {
        // Get users from organizations where current user is admin
        const userOrgs = organizations.filter(org => org.adminIds.includes(currentUser.id))
        if (userOrgs.length === 0) {
          setUsers([])
          return
        }
        
        usersQuery = query(
          collection(db, 'users'),
          where('organizationIds', 'array-contains-any', userOrgs.map(org => org.id)),
          orderBy('name')
        )
      } else {
        setUsers([])
        return
      }

      const usersSnapshot = await getDocs(usersQuery)
      const userData: UserWithDetails[] = []
      
      for (const userDoc of usersSnapshot.docs) {
        const user = { id: userDoc.id, ...userDoc.data() } as UserType
        
        // Get organization names
        const orgNames = await Promise.all(
          user.organizationIds.map(async (orgId) => {
            const orgDoc = await getDoc(doc(db, 'organizations', orgId))
            return orgDoc.exists() ? orgDoc.data().name : 'Unknown'
          })
        )
        
        // Get department names
        const deptNames = await Promise.all(
          user.departmentIds.map(async (deptId) => {
            const deptDoc = await getDoc(doc(db, 'departments', deptId))
            return deptDoc.exists() ? deptDoc.data().name : 'Unknown'
          })
        )
        
        userData.push({
          ...user,
          organizationNames: orgNames,
          departmentNames: deptNames
        })
      }
      
      setUsers(userData)
    } catch (error) {
      console.error('Error fetching users:', error)
      showToast('error', 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [currentUser, organizations, showToast])

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  useEffect(() => {
    if (organizations.length > 0) {
      fetchDepartments()
    }
  }, [fetchDepartments, organizations])

  useEffect(() => {
    if (organizations.length > 0) {
      fetchUsers()
    }
  }, [fetchUsers, organizations])

  // Check permissions
  if (!currentUser || !canManageUsers(currentUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Access Denied
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            You don't have permission to manage users.
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('error', 'Name and email are required')
      return
    }

    if (!editingUser && !formData.password.trim()) {
      showToast('error', 'Password is required for new users')
      return
    }

    try {
      if (editingUser) {
        // Update existing user
        await updateDoc(doc(db, 'users', editingUser.id), {
          name: formData.name,
          role: formData.role,
          organizationIds: formData.organizationIds,
          departmentIds: formData.departmentIds,
          updatedAt: new Date()
        })
        showToast('success', 'User updated successfully')
      } else {
        // Create new user
        const { user: firebaseUser } = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        )
        
        await updateProfile(firebaseUser, { displayName: formData.name })
        
        // Create user document in Firestore
        await addDoc(collection(db, 'users'), {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          organizationIds: formData.organizationIds,
          departmentIds: formData.departmentIds,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          createdBy: currentUser.id,
          preferences: {
            theme: 'system',
            currency: 'RWF',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              budgetAlerts: true,
              approvalRequests: true
            }
          }
        })
        showToast('success', 'User created successfully')
      }
      
      setIsCreateModalOpen(false)
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        organizationIds: [],
        departmentIds: []
      })
      fetchUsers()
    } catch (error: any) {
      console.error('Error saving user:', error)
      showToast('error', error.message || 'Failed to save user')
    }
  }

  const handleEdit = (user: UserWithDetails) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      organizationIds: user.organizationIds,
      departmentIds: user.departmentIds
    })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'users', userId))
      showToast('success', 'User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      showToast('error', 'Failed to delete user')
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus,
        updatedAt: new Date()
      })
      showToast('success', `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
      showToast('error', 'Failed to update user status')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organizationNames.some(org => org.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = roleFilter === '' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      organizationIds: [],
      departmentIds: []
    })
    setIsCreateModalOpen(true)
  }

  const getAvailableOrganizations = () => {
    if (currentUser?.role === 'app_admin') {
      return organizations
    } else if (currentUser?.role === 'org_admin') {
      return organizations.filter(org => org.adminIds.includes(currentUser.id))
    }
    return []
  }

  const getAvailableDepartments = () => {
    if (formData.organizationIds.length === 0) return []
    
    return departments.filter(dept => 
      formData.organizationIds.includes(dept.organizationId)
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage users and their permissions
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Roles</option>
            <option value="app_admin">App Admin</option>
            <option value="org_admin">Org Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Organizations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'app_admin' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : user.role === 'org_admin'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.organizationNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.organizationNames.map((org, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md"
                              >
                                {org}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full cursor-pointer ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {selectedUser === user.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                              <button
                                onClick={() => {
                                  handleEdit(user)
                                  setSelectedUser(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete(user.id)
                                  setSelectedUser(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingUser ? 'Edit User' : 'Create User'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                      disabled={!!editingUser}
                    />
                  </div>
                </div>
                
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {currentUser?.role === 'app_admin' && (
                      <>
                        <option value="app_admin">App Administrator</option>
                        <option value="org_admin">Org Admin</option>
                      </>
                    )}
                    <option value="user">User</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organizations
                  </label>
                  <select
                    multiple
                    value={formData.organizationIds}
                    onChange={(e) => {
                      const selectedIds = Array.from(e.target.selectedOptions, option => option.value)
                      setFormData({ ...formData, organizationIds: selectedIds, departmentIds: [] })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    size={4}
                  >
                    {getAvailableOrganizations().map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Hold Ctrl/Cmd to select multiple organizations
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Departments
                  </label>
                  <select
                    multiple
                    value={formData.departmentIds}
                    onChange={(e) => {
                      const selectedIds = Array.from(e.target.selectedOptions, option => option.value)
                      setFormData({ ...formData, departmentIds: selectedIds })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    size={4}
                    disabled={formData.organizationIds.length === 0}
                  >
                    {getAvailableDepartments().map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Select organizations first, then choose departments
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                  >
                    {editingUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagement
