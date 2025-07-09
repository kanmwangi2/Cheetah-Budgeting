export interface BudgetItem {
  id: string
  description: string
  quantity: number
  unitCost: number
  totalCost: number
  category: BudgetCategory
  department: string
  donorId?: string
  cashFlowMonths: number[]
  approvalStatus: 'pending' | 'approved' | 'rejected'
  lastModified: Date
  modifiedBy: string
  notes?: string
  attachments?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Department {
  id: string
  name: string
  description: string
  managerId: string
  budgetItems: BudgetItem[]
  totalBudget: number
  approvedBudget: number
  spentAmount: number
  restrictions: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  id: string
  name: string
  description?: string
  year: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active'
  totalAmount: number
  approvedAmount: number
  spentAmount: number
  remainingAmount: number
  departments: Department[]
  createdBy: string
  approvedBy?: string
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface BudgetCategory {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  parentId?: string
  order: number
  isActive: boolean
}

export interface CashFlowProjection {
  month: number
  year: number
  projectedIncome: number
  projectedExpenses: number
  actualIncome?: number
  actualExpenses?: number
  variance?: number
  notes?: string
}

export interface BudgetTemplate {
  id: string
  name: string
  description?: string
  categories: BudgetCategory[]
  items: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>[]
  createdBy: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}
