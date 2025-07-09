import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, limit } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { User, OrganizationSelection } from '../types/user'

interface AuthContextType {
  currentUser: User | null
  selectedOrganization: OrganizationSelection | null
  availableOrganizations: OrganizationSelection[]
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (updates: Partial<User>) => Promise<void>
  selectOrganization: (organization: OrganizationSelection) => void
  refreshOrganizations: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationSelection | null>(null)
  const [availableOrganizations, setAvailableOrganizations] = useState<OrganizationSelection[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUserOrganizations = async (user: User): Promise<OrganizationSelection[]> => {
    if (user.role === 'app_admin') {
      // App admin can access all organizations
      const orgsQuery = query(collection(db, 'organizations'))
      const orgsSnapshot = await getDocs(orgsQuery)
      
      const organizations: OrganizationSelection[] = []
      for (const orgDoc of orgsSnapshot.docs) {
        const orgData = orgDoc.data()
        const deptsQuery = query(collection(db, 'departments'), where('organizationId', '==', orgDoc.id))
        const deptsSnapshot = await getDocs(deptsQuery)
        
        organizations.push({
          id: orgDoc.id,
          name: orgData.name,
          role: 'admin',
          departments: deptsSnapshot.docs.map(deptDoc => ({
            id: deptDoc.id,
            name: deptDoc.data().name
          }))
        })
      }
      return organizations
    }

    // For org_admin and user roles, get their assigned organizations
    const organizations: OrganizationSelection[] = []
    
    for (const orgId of user.organizationIds) {
      const orgDoc = await getDoc(doc(db, 'organizations', orgId))
      if (orgDoc.exists()) {
        const orgData = orgDoc.data()
        const isAdmin = user.role === 'org_admin' && orgData.adminIds?.includes(user.id)
        
        // Get departments (all for admin, assigned for users)
        let deptQuery
        if (user.role === 'org_admin') {
          deptQuery = query(collection(db, 'departments'), where('organizationId', '==', orgId))
        } else {
          // Filter departments for user role
          deptQuery = query(
            collection(db, 'departments'), 
            where('organizationId', '==', orgId),
            where('memberIds', 'array-contains', user.id)
          )
        }
        
        const deptsSnapshot = await getDocs(deptQuery)
        
        organizations.push({
          id: orgId,
          name: orgData.name,
          role: isAdmin ? 'admin' : 'member',
          departments: deptsSnapshot.docs.map(deptDoc => ({
            id: deptDoc.id,
            name: deptDoc.data().name
          }))
        })
      }
    }
    
    return organizations
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || userData.name,
              role: userData.role,
              avatar: firebaseUser.photoURL || userData.avatar,
              createdAt: userData.createdAt?.toDate() || new Date(),
              lastLogin: new Date(),
              isActive: userData.isActive ?? true,
              organizationIds: userData.organizationIds || [],
              departmentIds: userData.departmentIds || [],
              preferences: userData.preferences || {
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
            }
            setCurrentUser(user)
            
            // Update last login
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              lastLogin: new Date()
            })

            // Fetch available organizations
            const organizations = await fetchUserOrganizations(user)
            setAvailableOrganizations(organizations)

            // Auto-select first organization if only one available
            if (organizations.length === 1) {
              setSelectedOrganization(organizations[0])
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      } else {
        setCurrentUser(null)
        setSelectedOrganization(null)
        setAvailableOrganizations([])
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email: string, password: string, name: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update Firebase Auth profile
    await updateProfile(firebaseUser, { displayName: name })
    
    // Check if this is the first user (should be app_admin)
    const usersQuery = query(collection(db, 'users'), limit(1))
    const usersSnapshot = await getDocs(usersQuery)
    const isFirstUser = usersSnapshot.empty
    
    // Create user document in Firestore
    const userData: Omit<User, 'id'> = {
      email,
      name,
      role: isFirstUser ? 'app_admin' : 'user', // First user becomes app_admin
      createdAt: new Date(),
      isActive: true,
      organizationIds: [],
      departmentIds: [],
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
    }
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData)
  }

  const logout = async () => {
    await firebaseSignOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return
    
    await updateDoc(doc(db, 'users', currentUser.id), updates)
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null)
  }

  const selectOrganization = (organization: OrganizationSelection) => {
    setSelectedOrganization(organization)
    // Store selection in localStorage for persistence
    localStorage.setItem('selectedOrganization', JSON.stringify(organization))
  }

  const refreshOrganizations = async () => {
    if (!currentUser) return
    
    const organizations = await fetchUserOrganizations(currentUser)
    setAvailableOrganizations(organizations)
  }

  // Load selected organization from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedOrganization')
    if (saved && availableOrganizations.length > 0) {
      try {
        const savedOrg = JSON.parse(saved)
        const stillAvailable = availableOrganizations.find(org => org.id === savedOrg.id)
        if (stillAvailable) {
          setSelectedOrganization(stillAvailable)
        }
      } catch (error) {
        localStorage.removeItem('selectedOrganization')
      }
    }
  }, [availableOrganizations])

  const value: AuthContextType = {
    currentUser,
    selectedOrganization,
    availableOrganizations,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    selectOrganization,
    refreshOrganizations
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
