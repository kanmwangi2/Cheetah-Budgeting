export interface Donor {
  id: string
  name: string
  type: 'individual' | 'foundation' | 'corporation' | 'government'
  email?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  contactPerson?: {
    name: string
    email: string
    phone: string
    position: string
  }
  totalDonated: number
  currency: string
  relationshipScore: number
  status: 'active' | 'inactive' | 'prospect'
  preferences: {
    communicationMethod: 'email' | 'phone' | 'mail'
    reportingFrequency: 'monthly' | 'quarterly' | 'annually'
    areas: string[]
  }
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Donation {
  id: string
  donorId: string
  amount: number
  currency: string
  date: Date
  method: 'cash' | 'check' | 'bank_transfer' | 'online' | 'other'
  restrictions: DonationRestriction[]
  purpose?: string
  receipt?: string
  notes?: string
  status: 'pending' | 'received' | 'processed'
  createdAt: Date
  updatedAt: Date
}

export interface DonationRestriction {
  id: string
  type: 'project' | 'department' | 'category' | 'time'
  value: string
  amount?: number
  startDate?: Date
  endDate?: Date
  description?: string
  isActive: boolean
}

export interface FundingSource {
  id: string
  name: string
  type: 'grant' | 'donation' | 'revenue' | 'investment'
  amount: number
  currency: string
  restrictions: DonationRestriction[]
  donorId?: string
  startDate: Date
  endDate?: Date
  renewalDate?: Date
  status: 'pending' | 'active' | 'expired' | 'cancelled'
  utilizedAmount: number
  remainingAmount: number
  createdAt: Date
  updatedAt: Date
}

export interface CommunicationLog {
  id: string
  donorId: string
  type: 'email' | 'phone' | 'meeting' | 'letter' | 'report'
  subject: string
  content: string
  date: Date
  method: string
  outcome?: string
  followUpDate?: Date
  createdBy: string
  createdAt: Date
}
