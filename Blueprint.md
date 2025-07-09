# Cheetah Budgeting - Non-Profit Budget Management System

## Executive Summary

**Cheetah Budgeting** is a comprehensive, cloud-based budget management platform designed for non-profit organizations, with specific compliance features for Rwanda Governance Board (RGB) regulations. The system leverages modern web technologies including React.js frontend with Firebase backend to provide real-time collaboration, secure data storage, and comprehensive reporting capabilities.

## Project Overview

### Vision Statement
To revolutionize non-profit financial management through an intuitive, compliant, and collaborative budgeting platform that empowers organizations to maximize their impact while maintaining transparency and accountability.

### Purpose
Cheetah Budgeting enables non-profit organizations to:
- **Multi-Organization Management**: Support multiple organizations with role-based access control
- **Role-Based Access Control**: Three distinct user roles (App Admin, Org Admin, User) with granular permissions
- **Organization Selection**: Seamless organization switching for users managing multiple organizations
- **Collaborative Budget Management**: Multi-user, real-time budget creation and editing
- **Comprehensive Donor Tracking**: Manage restricted and unrestricted funds with full audit trails
- **Advanced Analytics**: Comprehensive insights and detailed cash flow analysis
- **Regulatory Compliance**: Automated RGB reporting and international standards compliance
- **Multi-Currency Support**: Handle international donations and local expenses
- **Document Management**: Centralized storage for budget documentation and approvals

### Target Users
- **App Administrators**: System-wide administrators with full access to all organizations
- **Org Administrators**: Organization-level administrators with full rights within their organizations
- **Users**: Department-level users with access to specific organizations and departments
- **Finance Teams**: Budget managers, accountants, and financial analysts
- **Leadership**: Executive directors, board members, and department heads
- **Stakeholders**: Donor relations coordinators, program managers
- **Regulatory**: RGB compliance officers and external auditors

## Enhanced System Architecture

### Technology Stack

#### Frontend (React.js)
```
Frontend Technologies:
├── React 18+ (with Concurrent Features)
├── TypeScript (for type safety)
├── Tailwind CSS (responsive design)
├── Framer Motion (animations)
├── React Query (data fetching)
├── React Hook Form (form management)
├── Recharts (data visualization)
├── React Router v6 (navigation)
└── Lucide React (icons)
```

#### Backend (Firebase)
```
Firebase Services:
├── Authentication (multi-provider)
├── Firestore (real-time database)
├── Cloud Storage (file management)
├── Cloud Functions (serverless logic)
├── Hosting (deployment)
├── Security Rules (data protection)
└── Analytics (usage tracking)
```

#### Development Tools
```
Development Stack:
├── Vite (build tool)
├── ESLint + Prettier (code quality)
├── Jest + React Testing Library (testing)
├── GitHub Actions (CI/CD)
└── Storybook (component documentation)
```

### Enhanced Component Architecture

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── OrganizationSelector.tsx
│   │   └── ProtectedRoute.tsx
│   ├── admin/
│   │   ├── OrganizationManagement.tsx
│   │   └── UserManagement.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx (with role-based navigation)
│   │   ├── KeyMetrics.tsx
│   │   ├── BudgetOverview.tsx
│   │   ├── RecentActivity.tsx
│   │   └── QuickActions.tsx
│   ├── departments/
│   │   ├── DepartmentList.tsx
│   │   ├── BudgetItemForm.tsx
│   │   ├── BudgetItemTable.tsx
│   │   └── BulkImport.tsx
│   ├── donors/
│   │   ├── DonorManagement.tsx
│   │   ├── FundingTracker.tsx
│   │   ├── RestrictionMonitor.tsx
│   │   └── CommunicationLog.tsx
│   ├── reports/
│   │   ├── FinancialReports.tsx
│   │   ├── ComplianceReports.tsx
│   │   ├── CashFlowProjections.tsx
│   │   └── CustomReportBuilder.tsx
│   ├── shared/
│   │   ├── ThemeProvider.tsx
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── DataTable.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       └── ThemeToggle.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useFirestore.ts
│   ├── useTheme.ts
│   └── useCurrency.ts
├── services/
│   ├── firebase.ts
│   ├── auth.ts
│   ├── database.ts
│   └── analytics.ts
├── utils/
│   ├── currency.ts
│   ├── calculations.ts
│   ├── validators.ts
│   ├── permissions.ts
│   └── exporters.ts
├── types/
│   ├── budget.ts
│   ├── donor.ts
│   ├── user.ts (with multi-org support)
│   └── reports.ts
└── contexts/
    ├── AuthContext.tsx (enhanced with org selection)
    ├── ThemeContext.tsx
    └── NotificationContext.tsx
```

## Multi-Organization & Role-Based Access Control

### User Role System

#### Role Hierarchy
```typescript
export type UserRole = 'app_admin' | 'org_admin' | 'user'

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationIds: string[];
  departmentIds: string[];
  // ... other properties
}
```

#### Role Permissions
- **App Admin**: 
  - Full system access across all organizations
  - Can create and manage organizations
  - Can create and manage all user types
  - First registered user automatically becomes App Admin
  
- **Org Admin**:
  - Full access within assigned organizations
  - Can create and manage users within their organizations
  - Can assign departments to users
  - Can manage organization settings
  
- **User**:
  - Access to assigned organizations and departments
  - Can create and edit budgets within their scope
  - View-only access to reports and analytics

### Organization Selection System

#### Organization Selection Flow
1. **User Login**: Standard authentication process
2. **Organization Check**: System checks user's available organizations
3. **Auto-Selection**: If user has only one organization, auto-select it
4. **Selection Interface**: If multiple organizations, show selection interface
5. **Dashboard Access**: Redirect to main dashboard with selected organization

#### Organization Selection Interface
```typescript
interface OrganizationSelection {
  id: string;
  name: string;
  role: 'admin' | 'member';
  departments: {
    id: string;
    name: string;
  }[];
}
```

### Multi-Organization Data Model

#### Enhanced Organization Structure
```typescript
interface Organization {
  id: string;
  name: string;
  description?: string;
  country: string;
  currency: string;
  adminIds: string[];
  memberIds: string[];
  settings: OrganizationSettings;
  subscription: SubscriptionInfo;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

#### Enhanced User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationIds: string[];
  departmentIds: string[];
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}
```

### Permission System

#### Permission Utilities
```typescript
const getUserPermissions = (user: User): UserPermissions => {
  // App admin has global permissions
  if (user.role === 'app_admin') {
    return {
      organizations: {
        '*': {
          canManage: true,
          canViewBudgets: true,
          canCreateBudgets: true,
          canApproveBudgets: true,
          canManageUsers: true,
          canViewReports: true,
          canExportData: true
        }
      }
    };
  }
  
  // Org admin has full permissions in their organizations
  if (user.role === 'org_admin') {
    const orgPermissions = {};
    user.organizationIds.forEach(orgId => {
      orgPermissions[orgId] = {
        canManage: true,
        canViewBudgets: true,
        canCreateBudgets: true,
        canApproveBudgets: true,
        canManageUsers: true,
        canViewReports: true,
        canExportData: true
      };
    });
    return { organizations: orgPermissions };
  }
  
  // Regular users have limited permissions
  return generateUserPermissions(user);
};
```

### Admin Management Interfaces

#### Organization Management
- **Create Organizations**: App Admins can create new organizations
- **Edit Organizations**: Modify organization details and settings
- **Delete Organizations**: Remove organizations (with confirmation)
- **User Assignment**: Assign users to organizations
- **Statistics Dashboard**: View organization metrics

#### User Management
- **Create Users**: App Admins and Org Admins can create users
- **Role Assignment**: Assign appropriate roles to users
- **Organization Assignment**: Assign users to organizations
- **Department Assignment**: Assign users to departments
- **User Status Management**: Activate/deactivate users
- **Bulk Operations**: Import/export user data

## Core Features & Enhancements

### 1. Advanced Dashboard Module

#### Role-Based Dashboard
- **App Admin Dashboard**: Global system overview with all organizations
- **Org Admin Dashboard**: Organization-specific metrics and management tools
- **User Dashboard**: Department-specific budget and activity views
- **Organization Selector**: Quick switching between organizations

#### Real-Time Key Metrics
- **Live Budget Tracking**: Real-time updates across all users
- **Variance Analysis**: Dynamic comparison with historical data
- **Funding Health**: Visual indicators for funding gaps and surpluses
- **Compliance Score**: Automated regulatory compliance monitoring

#### Enhanced Analytics
- **Comprehensive Cash Flow**: Detailed 12-month projections
- **Spending Patterns**: Historical trend analysis
- **Donor Retention**: Relationship health metrics
- **Impact Metrics**: Program effectiveness indicators

#### Interactive Visualizations
- **Budget Allocation Charts**: Pie and bar charts with drill-down
- **Funding Timeline**: Gantt chart for fund availability
- **Variance Heatmap**: Department-wise performance matrix
- **Forecast Graphs**: Interactive projection visualizations

### 2. Enhanced Authentication & Authorization

#### Multi-Organization Authentication
- **Organization-Aware Login**: Users select organization during login
- **Cross-Organization Access**: Seamless switching between organizations
- **Role-Based Navigation**: Dynamic menu based on user permissions
- **Session Management**: Maintain organization context across sessions

#### Enhanced Security Features
- **Granular Permissions**: Fine-grained access control per organization
- **Activity Logging**: Comprehensive audit trail for all actions
- **Multi-Factor Authentication**: Enhanced security for admin accounts
- **Session Timeout**: Automatic logout for security

### 2. Collaborative Budget Management

#### Multi-User & Multi-Organization Capabilities
- **Organization-Scoped Budgets**: Budgets isolated per organization
- **Role-Based Access**: Admin, Manager, Editor, Viewer permissions
- **Cross-Organization Reporting**: Consolidated reports for App Admins
- **Real-Time Collaboration**: Live editing with conflict resolution
- **Approval Workflows**: Department head and board approval processes
- **Version Control**: Track changes and revert capabilities

#### Advanced Budget Features
- **Template System**: Reusable budget templates per organization
- **Bulk Operations**: Import/export via CSV/Excel
- **Scenario Planning**: Multiple budget versions (conservative, optimistic)
- **Automated Calculations**: Dynamic totals and allocations
- **Department Isolation**: Department-specific budget views

#### Enhanced Data Models
```typescript
interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  category: BudgetCategory;
  department: string;
  organizationId: string;
  donorId?: string;
  cashFlowMonths: number[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  lastModified: Timestamp;
  modifiedBy: string;
  notes?: string;
  attachments?: string[];
}

interface Department {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  managerId: string;
  memberIds: string[];
  budgetItems: BudgetItem[];
  totalBudget: number;
  approvedBudget: number;
  spentAmount: number;
  restrictions: string[];
}
```

### 3. Enhanced Donor Management System

#### Comprehensive Donor Profiles
- **360° Donor View**: Complete interaction history
- **Communication Log**: All donor interactions and correspondence
- **Giving History**: Multi-year donation tracking
- **Relationship Scoring**: Automated donor health metrics

#### Advanced Fund Tracking
- **Granular Restrictions**: Project-specific and time-bound restrictions
- **Compliance Monitoring**: Automated restriction violation alerts
- **Fund Utilization**: Real-time tracking of fund usage
- **Impact Reporting**: Program-specific outcomes for donors

#### Donor Engagement Features
- **Automated Reporting**: Scheduled donor reports
- **Communication Templates**: Standardized thank you and update messages
- **Stewardship Calendar**: Automated follow-up reminders
- **Donor Portal**: Self-service donor dashboard

### 4. Advanced Reporting & Analytics

#### Financial Reporting Suite
- **Standard Reports**: Income statement, balance sheet, cash flow
- **Compliance Reports**: RGB-specific formats and international standards
- **Custom Report Builder**: Drag-and-drop report creation
- **Automated Scheduling**: Daily, weekly, monthly report generation

#### Advanced Analytics
- **Comprehensive Analytics**: Detailed budget forecasting
- **Variance Analysis**: Automated variance detection and alerts
- **Benchmark Analysis**: Industry comparison metrics
- **Performance Dashboards**: KPI tracking and visualization

#### Export & Integration
- **Multiple Formats**: PDF, Excel, CSV, JSON exports
- **API Integration**: QuickBooks, Xero, and other accounting systems
- **Print Optimization**: Professional report formatting
- **Email Distribution**: Automated report distribution

### 5. Theme System Implementation

#### Theme Architecture
```typescript
interface Theme {
  name: 'light' | 'dark' | 'system';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: Record<string, string>;
  typography: Record<string, string>;
}
```

#### Theme Features
- **System Default**: Automatically follows OS theme preference
- **Smooth Transitions**: Animated theme switching
- **Accessibility**: High contrast mode support
- **Customization**: Organization-specific color themes
- **Persistence**: Theme preference saved per user

#### Implementation Strategy
```typescript
const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>('system');
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  return { theme, setTheme };
};
```

## Firebase Integration Strategy

### 1. Authentication System

#### Multi-Provider Authentication
```typescript
// Enhanced authentication configuration
const authConfig = {
  providers: [
    'email/password',
    'google',
    'microsoft',
    'phone'
  ],
  mfa: true,
  emailVerification: true,
  passwordReset: true,
  roleBasedRegistration: true
};
```

#### User Management & Role Assignment
- **First User Registration**: Automatically assigned App Admin role
- **Organization-based Registration**: Users assigned to specific organizations
- **Role-Based Access Control**: Granular permissions system
- **Session Management**: Secure token handling with organization context
- **Audit Logging**: Track all user actions across organizations

### 2. Firestore Database Structure

#### Collections Architecture
```
organizations/
├── {orgId}/
│   ├── name, settings, subscription, adminIds, memberIds
│   ├── users/ (subcollection)
│   ├── departments/ (subcollection)
│   ├── donors/ (subcollection)
│   ├── budgets/ (subcollection)
│   ├── reports/ (subcollection)
│   └── activities/ (subcollection)

users/
├── {userId}/
│   ├── name, email, role, organizationIds, departmentIds
│   ├── preferences
│   └── audit_logs/ (subcollection)

departments/
├── {deptId}/
│   ├── name, organizationId, managerId, memberIds
│   └── budgets/ (subcollection)
```

#### Multi-Organization Data Queries
```typescript
// Get organizations for user based on role
const getUserOrganizations = async (user: User): Promise<Organization[]> => {
  if (user.role === 'app_admin') {
    // App admin sees all organizations
    return await db.collection('organizations').get();
  } else {
    // Org admin and users see only their organizations
    return await db.collection('organizations')
      .where('memberIds', 'array-contains', user.id)
      .get();
  }
};
```

#### Real-time Data Synchronization
```typescript
// Real-time budget updates
const useBudgetItems = (organizationId: string) => {
  const [items, setItems] = useState<BudgetItem[]>([]);
  
  useEffect(() => {
    const unsubscribe = db
      .collection('organizations')
      .doc(organizationId)
      .collection('budgets')
      .onSnapshot(snapshot => {
        const budgetItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setItems(budgetItems);
      });
    
    return unsubscribe;
  }, [organizationId]);
  
  return items;
};
```

### 3. Security Rules

#### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Organization-level security
    match /organizations/{orgId} {
      // App admins can read/write all organizations
      allow read, write: if request.auth != null && 
        (isAppAdmin() || request.auth.uid in resource.data.memberIds);
      
      // Organization-specific collections
      match /budgets/{budgetId} {
        allow read: if request.auth != null && 
          (isAppAdmin() || canAccessOrganization(orgId));
        allow write: if request.auth != null && 
          (isAppAdmin() || isOrgAdmin(orgId) || canEditBudget(budgetId));
      }
      
      match /users/{userId} {
        allow read: if request.auth != null && 
          (isAppAdmin() || isOrgAdmin(orgId));
        allow write: if request.auth != null && 
          (isAppAdmin() || isOrgAdmin(orgId));
      }
    }
    
    // User profile access
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || isAppAdmin());
    }
    
    // Helper functions
    function isAppAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'app_admin';
    }
    
    function isOrgAdmin(orgId) {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'org_admin' &&
        request.auth.uid in get(/databases/$(database)/documents/organizations/$(orgId)).data.adminIds;
    }
    
    function canAccessOrganization(orgId) {
      return request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/organizations/$(orgId)).data.memberIds;
    }
  }
}
```

### 4. Cloud Functions

#### Serverless Business Logic
```typescript
// Enhanced budget approval workflow with organization context
export const approveBudget = functions.firestore
  .document('organizations/{orgId}/budgets/{budgetId}')
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    const { orgId, budgetId } = context.params;
    
    if (newValue.status === 'approved' && previousValue.status === 'pending') {
      // Send notification to submitter
      await sendNotification(newValue.submittedBy, 'Budget approved', {
        budgetId,
        organizationId: orgId
      });
      
      // Update organization totals
      await updateOrganizationTotals(orgId);
      
      // Log activity with organization context
      await logActivity({
        type: 'budget_approved',
        budgetId,
        organizationId: orgId,
        userId: newValue.approvedBy,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Notify organization admins
      await notifyOrgAdmins(orgId, 'budget_approved', {
        budgetId,
        approvedBy: newValue.approvedBy
      });
    }
  });

// User role assignment validation
export const validateUserRole = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    
    // Ensure only one app admin if first user
    if (newValue?.role === 'app_admin') {
      const appAdmins = await admin.firestore()
        .collection('users')
        .where('role', '==', 'app_admin')
        .get();
      
      if (appAdmins.size > 1) {
        // Validate if this is the first user registration
        const allUsers = await admin.firestore()
          .collection('users')
          .get();
        
        if (allUsers.size > 1) {
          throw new functions.https.HttpsError(
            'permission-denied',
            'Only the first user can be assigned app_admin role'
          );
        }
      }
    }
  });
```

## Advanced Features

### 1. Enhanced Data Analytics

#### Comprehensive Analytics
- **Budget Forecasting**: Statistical models for expense prediction
- **Anomaly Detection**: Unusual spending pattern identification
- **Donor Behavior Analysis**: Donor retention scoring
- **Cash Flow Optimization**: Intelligent timing recommendations

#### Implementation
```typescript
interface AnalyticsModel {
  id: string;
  type: 'budget_forecast' | 'donor_retention' | 'cash_flow';
  accuracy: number;
  lastCalculation: Date;
  results: AnalyticsResult[];
}

const useAnalytics = (type: string) => {
  const [results, setResults] = useState<AnalyticsResult[]>([]);
  
  useEffect(() => {
    const runAnalysis = async () => {
      const response = await fetch('/api/analytics/calculate', {
        method: 'POST',
        body: JSON.stringify({ type, data: historicalData })
      });
      
      const analysisResults = await response.json();
      setResults(analysisResults.results);
    };
    
    runAnalysis();
  }, [type]);
  
  return results;
};
```

### 2. Mobile Responsiveness

#### Progressive Web App (PWA)
- **Offline Capability**: Service worker for offline access
- **Push Notifications**: Real-time alerts and reminders
- **App-like Experience**: Native app feel on mobile devices
- **Cross-platform**: iOS and Android compatibility

#### Responsive Design Strategy
```typescript
// Responsive breakpoints
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Mobile-first approach
const mobileStyles = {
  dashboard: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
  navigation: 'bottom-tabs md:side-nav',
  tables: 'horizontal-scroll md:full-width'
};
```

### 3. International Support

#### Multi-Currency System
```typescript
interface CurrencyConfig {
  primary: string; // RWF
  secondary: string[]; // USD, EUR, etc.
  exchangeRates: Record<string, number>;
  updateFrequency: 'daily' | 'hourly';
}

const useCurrency = () => {
  const [rates, setRates] = useState<ExchangeRates>({});
  
  const convert = (amount: number, from: string, to: string): number => {
    return amount * (rates[`${from}_${to}`] || 1);
  };
  
  return { rates, convert };
};
```

#### Localization Support
- **Multi-language**: English, Kinyarwanda, French support
- **Date/Time Formatting**: Locale-specific formatting
- **Number Formatting**: Currency and number localization
- **RTL Support**: Right-to-left language support

### 4. Advanced Security

#### Data Protection
- **End-to-end Encryption**: Sensitive data encryption
- **Audit Trails**: Comprehensive activity logging
- **Access Controls**: Fine-grained permissions
- **Data Backup**: Automated backup and recovery

#### Compliance Features
- **GDPR Compliance**: Data protection regulations
- **SOC 2 Type II**: Security audit compliance
- **ISO 27001**: Information security management
- **Local Regulations**: Rwanda data protection laws

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2, July 9-22) ✅ COMPLETED
**Core Infrastructure Setup**
- [x] Project initialization with Vite + React + TypeScript
- [x] Firebase project setup and configuration
- [x] Multi-organization authentication system implementation
- [x] Role-based access control (App Admin, Org Admin, User)
- [x] Organization selection interface
- [x] Enhanced theme system with light/dark/system modes
- [x] Responsive layout foundation with sidebar navigation
- [x] Core navigation structure with role-based menus

**Multi-Organization Features**
- [x] User types with proper role hierarchy
- [x] Organization management interface (for App Admins)
- [x] User management interface (for App Admins and Org Admins)
- [x] Organization selection after login
- [x] Permission system with granular access control
- [x] First user auto-assignment as App Admin

**Deliverables:**
- ✅ Working multi-organization authentication system
- ✅ Role-based dashboard layout with sidebar navigation
- ✅ Organization and user management interfaces
- ✅ Theme switching functionality
- ✅ Firebase integration with multi-org support
- ✅ Permission-based UI rendering

### Phase 2: Core Features (Weeks 3-4, July 23-31) 🔄 IN PROGRESS
**Budget Management System**
- [ ] Department management interface with multi-org support
- [ ] Budget item CRUD operations with organization isolation
- [ ] Real-time data synchronization across organizations
- [ ] Enhanced donor management system with organization context
- [ ] Multi-organization reporting functionality
- [ ] Cross-organization analytics for App Admins

**Deliverables:**
- Complete budget management system with multi-org support
- Real-time collaboration within organization boundaries
- Organization-aware donor tracking
- Role-based export functionality
- Production-ready multi-tenant application

## Technical Specifications

### Performance Requirements
- **Page Load Time**: < 2 seconds initial load
- **Time to Interactive**: < 3 seconds
- **Real-time Updates**: < 500ms latency
- **Offline Capability**: 24-hour offline access
- **Concurrent Users**: 100+ simultaneous users

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari, Android Chrome
- **PWA Support**: All modern browsers with PWA capabilities

### Data Limits
- **Organizations**: Unlimited (App Admin managed)
- **Users per Organization**: 500
- **Budget Items**: 10,000 per organization
- **File Storage**: 5GB per organization
- **Concurrent Users**: 100+ simultaneous users per organization
- **Historical Data**: 10 years retention
- **Cross-Organization Access**: Based on user role assignments

## Security & Compliance

### Data Security Measures
1. **Authentication**: Multi-factor authentication required
2. **Authorization**: Role-based access control
3. **Encryption**: AES-256 encryption for sensitive data
4. **Transmission**: TLS 1.3 for all communications
5. **Storage**: Firebase Security Rules for data protection

### Compliance Standards
1. **Rwanda Governance Board (RGB)**: Full compliance with local regulations
2. **International Standards**: IFRS compliance for financial reporting
3. **Data Protection**: GDPR and local privacy regulations
4. **Security**: SOC 2 Type II compliance
5. **Accessibility**: WCAG 2.1 AA compliance

### Audit & Monitoring
```typescript
interface AuditLog {
  id: string;
  userId: string;
  organizationId: string;
  action: string;
  resource: string;
  timestamp: Timestamp;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  userRole: UserRole;
}

const useAuditLogging = () => {
  const logActivity = async (
    action: string, 
    resource: string, 
    organizationId: string,
    metadata?: any
  ) => {
    await db.collection('audit_logs').add({
      userId: auth.currentUser?.uid,
      organizationId,
      action,
      resource,
      metadata,
      timestamp: serverTimestamp(),
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent,
      userRole: currentUser?.role
    });
  };
  
  return { logActivity };
};
```

## Testing Strategy

### Testing Pyramid
```
E2E Tests (Cypress)
├── User workflows
├── Cross-browser testing
└── Performance testing

Integration Tests (Jest)
├── Firebase integration
├── API endpoints
└── Component integration

Unit Tests (Jest + RTL)
├── Component logic
├── Utility functions
└── Custom hooks
```

### Test Coverage Requirements
- **Unit Tests**: 90% code coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Load testing up to 1000 concurrent users

## Deployment & DevOps

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      - name: Build application
        run: npm run build
      - name: Deploy to Firebase
        run: firebase deploy
```

### Environment Configuration
- **Development**: Local development with Firebase emulators
- **Staging**: Pre-production testing environment
- **Production**: Live production environment with monitoring

## Monitoring & Analytics

### Application Monitoring
- **Performance**: Core Web Vitals tracking
- **Errors**: Real-time error tracking with Sentry
- **Usage**: Firebase Analytics for user behavior
- **Uptime**: 99.9% uptime monitoring

### Business Intelligence
- **User Engagement**: Feature adoption rates
- **Performance Metrics**: Budget creation efficiency
- **Compliance Metrics**: Regulatory adherence scores
- **Financial Metrics**: Cost per organization metrics

## Support & Training

### User Support System
- **Help Documentation**: Comprehensive user guides
- **Video Tutorials**: Step-by-step process videos
- **Chat Support**: Real-time assistance
- **Community Forum**: User community for peer support

### Training Program
- **Onboarding**: New user orientation program
- **Advanced Features**: Power user training sessions
- **Compliance Training**: Regulatory requirement education
- **Administrator Training**: System administration guides

## Conclusion

Cheetah Budgeting represents a comprehensive solution for non-profit budget management, combining modern web technologies with specific regulatory compliance requirements and advanced multi-organization capabilities. The system's modular architecture ensures scalability and maintainability while providing an exceptional user experience across all devices and platforms.

### Key Achievements

**Multi-Organization Architecture**: Successfully implemented a robust multi-tenant system that supports unlimited organizations with proper data isolation and role-based access control.

**Role-Based Access Control**: Implemented three distinct user roles (App Admin, Org Admin, User) with granular permissions and seamless organization switching capabilities.

**Enhanced Security**: Comprehensive permission system with organization-scoped access control, audit logging, and Firebase security rules ensuring data protection and compliance.

**Modern User Experience**: Responsive design with sidebar navigation, theme switching, and intuitive organization selection interface.

The integration of Firebase provides real-time collaboration capabilities, secure multi-tenant data storage, and seamless scaling. The enhanced authentication system with organization selection ensures users can efficiently manage multiple organizations while maintaining proper access controls.

The comprehensive admin interfaces enable App Admins to manage the entire system and organizations, while Org Admins can effectively manage their assigned organizations and users. The permission system ensures that users only access resources appropriate to their role and organization assignments.

This blueprint serves as a complete guide for building a production-ready, multi-organization application that will significantly improve efficiency, transparency, and compliance for non-profit organizations in Rwanda and beyond.

---

**Document Version**: 2.1  
**Last Updated**: July 9, 2025  
**Prepared By**: Norman Mwangi  
**Next Review**: September 2025  
**Status**: Phase 1 Complete - Multi-Organization System Implemented
