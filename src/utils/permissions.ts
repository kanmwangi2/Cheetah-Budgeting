import { User, UserPermissions, UserRole } from '../types/user'

export const getUserPermissions = (user: User): UserPermissions => {
  const basePermissions: UserPermissions = {
    organizations: {}
  }

  switch (user.role) {
    case 'app_admin':
      // App admin has full permissions on all organizations
      return {
        organizations: {
          '*': {
            canManage: true,
            canViewBudgets: true,
            canCreateBudgets: true,
            canApproveBudgets: true,
            canManageUsers: true,
            canViewReports: true,
            canExportData: true,
            departments: {
              '*': {
                canView: true,
                canEdit: true,
                canManage: true
              }
            }
          }
        }
      }

    case 'org_admin':
      // Org admin has full permissions on their assigned organizations
      user.organizationIds.forEach(orgId => {
        basePermissions.organizations[orgId] = {
          canManage: true,
          canViewBudgets: true,
          canCreateBudgets: true,
          canApproveBudgets: true,
          canManageUsers: true,
          canViewReports: true,
          canExportData: true,
          departments: {
            '*': {
              canView: true,
              canEdit: true,
              canManage: true
            }
          }
        }
      })
      return basePermissions

    case 'user':
      // Regular user has limited permissions on assigned organizations and departments
      user.organizationIds.forEach(orgId => {
        const deptPermissions: { [deptId: string]: { canView: boolean; canEdit: boolean; canManage: boolean } } = {}
        
        user.departmentIds.forEach(deptId => {
          deptPermissions[deptId] = {
            canView: true,
            canEdit: true,
            canManage: false
          }
        })

        basePermissions.organizations[orgId] = {
          canManage: false,
          canViewBudgets: true,
          canCreateBudgets: true,
          canApproveBudgets: false,
          canManageUsers: false,
          canViewReports: true,
          canExportData: false,
          departments: deptPermissions
        }
      })
      return basePermissions

    default:
      return basePermissions
  }
}

export const hasPermission = (
  user: User,
  permission: string,
  organizationId?: string,
  departmentId?: string
): boolean => {
  const permissions = getUserPermissions(user)

  if (user.role === 'app_admin') {
    return true
  }

  if (!organizationId) {
    return false
  }

  const orgPermissions = permissions.organizations[organizationId]
  if (!orgPermissions) {
    return false
  }

  switch (permission) {
    case 'manage_org':
      return orgPermissions.canManage
    case 'view_budgets':
      return orgPermissions.canViewBudgets
    case 'create_budgets':
      return orgPermissions.canCreateBudgets
    case 'approve_budgets':
      return orgPermissions.canApproveBudgets
    case 'manage_users':
      return orgPermissions.canManageUsers
    case 'view_reports':
      return orgPermissions.canViewReports
    case 'export_data':
      return orgPermissions.canExportData
    case 'view_department':
      if (!departmentId) return false
      return orgPermissions.departments[departmentId]?.canView || orgPermissions.departments['*']?.canView || false
    case 'edit_department':
      if (!departmentId) return false
      return orgPermissions.departments[departmentId]?.canEdit || orgPermissions.departments['*']?.canEdit || false
    case 'manage_department':
      if (!departmentId) return false
      return orgPermissions.departments[departmentId]?.canManage || orgPermissions.departments['*']?.canManage || false
    default:
      return false
  }
}

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'app_admin':
      return 'App Administrator'
    case 'org_admin':
      return 'Org Admin'
    case 'user':
      return 'User'
    default:
      return 'Unknown'
  }
}

export const canCreateUsers = (user: User): boolean => {
  return user.role === 'app_admin' || user.role === 'org_admin'
}

export const canManageOrganization = (user: User, organizationId: string): boolean => {
  return hasPermission(user, 'manage_org', organizationId)
}
