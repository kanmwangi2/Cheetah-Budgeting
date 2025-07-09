export interface Report {
  id: string
  name: string
  type: 'financial' | 'compliance' | 'donor' | 'budget' | 'custom'
  description?: string
  parameters: ReportParameter[]
  schedule?: ReportSchedule
  format: 'pdf' | 'excel' | 'csv' | 'json'
  generatedAt?: Date
  generatedBy?: string
  filePath?: string
  status: 'draft' | 'generating' | 'ready' | 'error'
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ReportParameter {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'select'
  value: any
  options?: string[]
  required: boolean
  description?: string
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  recipients: string[]
  isActive: boolean
  lastRun?: Date
  nextRun?: Date
}

export interface FinancialReport {
  reportId: string
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalIncome: number
    totalExpenses: number
    netIncome: number
    budgetVariance: number
  }
  incomeBreakdown: {
    category: string
    amount: number
    percentage: number
  }[]
  expenseBreakdown: {
    category: string
    amount: number
    percentage: number
  }[]
  departmentBreakdown: {
    department: string
    budget: number
    spent: number
    remaining: number
    variance: number
  }[]
  donorBreakdown: {
    donor: string
    amount: number
    restrictions: string[]
    utilized: number
  }[]
}

export interface ComplianceReport {
  reportId: string
  period: {
    start: Date
    end: Date
  }
  rgbCompliance: {
    score: number
    requirements: {
      requirement: string
      status: 'compliant' | 'non-compliant' | 'partial'
      details: string
    }[]
  }
  donorCompliance: {
    donor: string
    restrictions: {
      restriction: string
      status: 'compliant' | 'violated'
      details: string
    }[]
  }[]
  recommendations: string[]
}

export interface AnalyticsResult {
  id: string
  type: 'trend' | 'forecast' | 'anomaly' | 'comparison'
  title: string
  description: string
  data: any[]
  confidence: number
  insights: string[]
  recommendations: string[]
  createdAt: Date
}
