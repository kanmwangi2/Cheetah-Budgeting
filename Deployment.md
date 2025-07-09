# Deployment Guide - Cheetah Budgeting

This guide provides step-by-step instructions for deploying the Cheetah Budgeting application to Firebase.

## Prerequisites

Before starting the deployment process, ensure you have:

1. **Node.js** (version 18 or higher)
2. **npm** (comes with Node.js)
3. **Git** (for version control)
4. **Google account** (for Firebase access)
5. **Firebase CLI** (will be installed in this guide)

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `cheetah-budgeting` (or your preferred name)
4. Choose whether to enable Google Analytics (recommended for production)
5. Select or create a Google Analytics account (if enabled)
6. Click **"Create project"**
7. Wait for project creation to complete

### 1.2 Enable Required Firebase Services

#### Enable Authentication
1. In Firebase Console, go to **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable the following providers:
   - **Email/Password**: Click and toggle **"Enable"**
   - **Google** (optional): Click, enable, and configure OAuth consent screen
5. Click **"Save"**

#### Enable Firestore Database
1. Go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll configure security rules later)
4. Select a location closest to your users (e.g., `us-central1`)
5. Click **"Done"**

#### Enable Cloud Storage
1. Go to **"Storage"**
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Select the same location as your Firestore database
5. Click **"Done"**

## Step 2: Firebase CLI Installation and Setup

### 2.1 Install Firebase CLI

Open your terminal/command prompt and run:

```bash
npm install -g firebase-tools
```

### 2.2 Login to Firebase

```bash
firebase login
```

This will open your browser for authentication. Sign in with your Google account.

### 2.3 Verify Installation

```bash
firebase --version
```

You should see the Firebase CLI version number.

## Step 3: Project Configuration

### 3.1 Initialize Firebase in Your Project

Navigate to your project directory:

```bash
cd "d:\Software\Applications\Cheetah-Budgeting"
```

Initialize Firebase:

```bash
firebase init
```

You'll be prompted with several options:

1. **Select Firebase features**: Use arrow keys and spacebar to select:
   - ☑️ Firestore: Configure security rules and indexes
   - ☑️ Hosting: Configure files for Firebase Hosting
   - ☑️ Storage: Configure security rules for Cloud Storage

2. **Select project**: Choose **"Use an existing project"** and select your `cheetah-budgeting` project

3. **Firestore configuration**:
   - **Firestore rules file**: Press Enter (default: `firestore.rules`)
   - **Firestore indexes file**: Press Enter (default: `firestore.indexes.json`)

4. **Hosting configuration**:
   - **Public directory**: Type `dist` (this is where Vite builds the app)
   - **Configure as single-page app**: Type `y` (Yes)
   - **Set up automatic builds**: Type `n` (No, we'll build manually)
   - **Overwrite index.html**: Type `n` (No)

5. **Storage configuration**:
   - **Storage rules file**: Press Enter (default: `storage.rules`)

### 3.2 Get Firebase Configuration

1. Go to Firebase Console
2. Click on **"Project settings"** (gear icon)
3. Scroll down to **"Your apps"** section
4. Click **"Add app"** and select the **web icon** (`</>`)
5. Enter app nickname: `cheetah-budgeting-web`
6. **Don't** check "Set up Firebase Hosting" (we'll do this manually)
7. Click **"Register app"**
8. Copy the configuration object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3.3 Create Environment Configuration

1. Copy the example environment file:

```bash
copy .env.example .env
```

2. Edit `.env` file and replace the placeholder values with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Step 4: Configure Security Rules

### 4.1 Firestore Security Rules

Update the `firestore.rules` file that was created during initialization:

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
      
      match /departments/{deptId} {
        allow read: if request.auth != null && 
          (isAppAdmin() || canAccessOrganization(orgId));
        allow write: if request.auth != null && 
          (isAppAdmin() || isOrgAdmin(orgId));
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

### 4.2 Storage Security Rules

Update the `storage.rules` file:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /organizations/{orgId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (isAppAdmin() || canAccessOrganization(orgId));
    }
    
    function isAppAdmin() {
      return request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'app_admin';
    }
    
    function canAccessOrganization(orgId) {
      return request.auth != null && 
        request.auth.uid in firestore.get(/databases/(default)/documents/organizations/$(orgId)).data.memberIds;
    }
  }
}
```

## Step 5: Build and Deploy

### 5.1 Install Dependencies

```bash
npm install
```

### 5.2 Run Tests and Linting

**Run linting (required):**
```bash
npm run lint:all
```

**Run tests (optional - only if test files exist):**
```bash
npm test -- --passWithNoTests
```

**Note**: Tests are not required for initial deployment. The project currently focuses on linting and build verification. When you add test files in the future, they will run automatically.

Make sure all linting passes and there are no errors.

### 5.3 Build the Application

```bash
npm run build
```

This creates a `dist` folder with the production-ready files.

### 5.4 Deploy to Firebase

Deploy everything (hosting, rules, and indexes):

```bash
firebase deploy
```

Or deploy specific services:

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules
firebase deploy --only storage
```

### 5.5 Verify Deployment

After deployment, Firebase will provide a hosting URL like:
`https://your-project-id.web.app`

1. Open the URL in your browser
2. Test the following:
   - Registration (first user becomes App Admin)
   - Login functionality
   - Organization creation
   - User management
   - Theme switching

## Step 6: Production Configuration

### 6.1 Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow the verification steps
5. Configure DNS records as instructed

### 6.2 Configure Authentication Settings

1. Go to Firebase Console → Authentication → Settings
2. **Authorized domains**: Add your custom domain if using one
3. **User actions**: Configure email verification and password reset
4. **Templates**: Customize email templates for your organization

### 6.3 Set Up Monitoring

1. Go to Firebase Console → Analytics
2. Enable Google Analytics if not already done
3. Set up conversion tracking for key user actions
4. Configure alerts for important metrics

## Step 7: Environment-Specific Deployments

### 7.1 Development Environment

For development, you can use Firebase Emulators:

```bash
# Install emulators
firebase setup:emulators:firestore
firebase setup:emulators:auth
firebase setup:emulators:storage

# Start emulators
firebase emulators:start
```

### 7.2 Staging Environment

Create a separate Firebase project for staging:

1. Create new Firebase project (e.g., `cheetah-budgeting-staging`)
2. Create `.env.staging` file with staging configuration
3. Use separate deployment commands:

```bash
# Deploy to staging
firebase use staging
firebase deploy
```

### 7.3 Production Environment

```bash
# Deploy to production
firebase use production
firebase deploy
```

## Step 8: Continuous Integration/Deployment (Optional)

### 8.1 GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --passWithNoTests
    
    - name: Run linting
      run: npm run lint:all
    
    - name: Build
      run: npm run build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
        VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: your-project-id
```

### 8.2 Configure Secrets

In your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `FIREBASE_SERVICE_ACCOUNT` (from Firebase Console → Project Settings → Service accounts)

## Troubleshooting

### Common Issues and Solutions

#### 1. Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Firebase CLI Issues
```bash
# Update Firebase CLI
npm install -g firebase-tools@latest

# Re-login
firebase logout
firebase login
```

#### 3. Authentication Domain Issues
- Add your hosting domain to Firebase Console → Authentication → Settings → Authorized domains

#### 4. CORS Issues
- Ensure your Firebase configuration is correct
- Check that your domain is authorized in Firebase Console

#### 5. Security Rules Issues
```bash
# Test security rules
firebase firestore:rules:test

# Deploy rules only
firebase deploy --only firestore:rules
```

### Performance Optimization

1. **Enable compression** in Firebase Hosting (automatically enabled)
2. **Use CDN** for static assets (Firebase CDN is automatic)
3. **Implement caching** strategies in your application
4. **Monitor bundle size** and optimize imports

### Security Best Practices

1. **Never commit** `.env` files to version control
2. **Use environment variables** for all sensitive configuration
3. **Regularly review** Firebase security rules
4. **Enable audit logging** in Firebase Console
5. **Set up alerts** for unusual activity

## Useful Commands

```bash
# View deployment history
firebase hosting:history

# View logs
firebase functions:log

# Test locally with emulators
firebase emulators:start

# Deploy specific functions
firebase deploy --only functions:functionName

# Rollback deployment
firebase hosting:rollback

# Check Firebase project info
firebase use --alias

# Switch between projects
firebase use project-id
```

## Support and Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firebase Console**: https://console.firebase.google.com
- **Firebase CLI Reference**: https://firebase.google.com/docs/cli
- **Firebase Status**: https://status.firebase.google.com
- **Community Support**: https://firebase.google.com/support

---

**Note**: This deployment guide assumes you're using the current project structure and configuration. Always test deployments in a staging environment before deploying to production.

**Last Updated**: July 9, 2025  
**Version**: 1.0  
**Compatible with**: Firebase CLI 12.0+, Node.js 18+
