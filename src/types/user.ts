export type UserRole = 'app_admin' | 'org_admin' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
  // For org_admin and user roles
  organizationIds: string[]
  // For user role - departments they can access within organizations
  departmentIds: string[]
  preferences: {
    theme: 'light' | 'dark' | 'system'
    currency: string
    language: string
    notifications: {
      email: boolean
      push: boolean
      budgetAlerts: boolean
      approvalRequests: boolean
    }
  }
}

export interface Organization {
  id: string
  name: string
  description?: string
  country: string
  currency: string
  adminIds: string[] // org_admin users
  memberIds: string[] // all users in this org
  settings: {
    fiscalYearStart: string
    approvalWorkflow: boolean
    multiCurrency: boolean
    complianceReporting: boolean
  }
  subscription: {
    plan: 'free' | 'pro' | 'enterprise'
    status: 'active' | 'inactive' | 'suspended'
    expiresAt?: Date
  }
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Department {
  id: string
  name: string
  description?: string
  organizationId: string
  managerId: string
  memberIds: string[]
  budgetLimit?: number
  createdAt: Date
  updatedAt: Date
}

export interface UserPermissions {
  organizations: {
    [orgId: string]: {
      canManage: boolean
      canViewBudgets: boolean
      canCreateBudgets: boolean
      canApproveBudgets: boolean
      canManageUsers: boolean
      canViewReports: boolean
      canExportData: boolean
      departments: {
        [deptId: string]: {
          canView: boolean
          canEdit: boolean
          canManage: boolean
        }
      }
    }
  }
}

export interface OrganizationSelection {
  id: string
  name: string
  role: 'admin' | 'member'
  departments: {
    id: string
    name: string
  }[]
}
