# Cheetah Budgeting

A comprehensive, cloud-based budget management platform designed for non-profit organizations, with specific compliance features for Rwanda Governance Board (RGB) regulations.

## Features

### 🚀 Core Features
- **Real-time Collaboration**: Multi-user budget creation and editing
- **Donor Management**: Track restricted and unrestricted funds
- **Compliance Reporting**: Automated RGB reporting
- **Multi-Currency Support**: Handle international donations
- **Theme System**: Light, dark, and system themes
- **Responsive Design**: Works on desktop and mobile

### 📊 Advanced Analytics
- Budget forecasting and variance analysis
- Cash flow projections
- Donor behavior analysis
- Compliance scoring

### 🔐 Security & Compliance
- Firebase Authentication with multi-factor support
- Role-based access control
- Data encryption and audit trails
- GDPR and local regulations compliance

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **React Hook Form** for form management
- **Recharts** for data visualization

### Backend
- **Firebase Authentication**
- **Cloud Firestore** for real-time database
- **Cloud Storage** for file management
- **Cloud Functions** for serverless logic

### Development Tools
- **Vite** for fast development
- **ESLint** and **Prettier** for code quality
- **Jest** and **React Testing Library** for testing

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project setup

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/cheetah-budgeting.git
cd cheetah-budgeting
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── departments/    # Department management
│   ├── donors/         # Donor management
│   ├── reports/        # Reporting components
│   ├── shared/         # Shared components
│   └── ui/             # UI components
├── contexts/           # React contexts
├── hooks/             # Custom hooks
├── services/          # API services
├── types/             # TypeScript types
├── utils/             # Utility functions
└── App.tsx            # Main app component
```

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication, Firestore, and Storage

### 2. Configure Authentication
- Enable Email/Password authentication
- Configure other providers as needed (Google, Microsoft, etc.)

### 3. Set up Firestore
- Create a Firestore database
- Configure security rules

### 4. Deploy Rules
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React hooks patterns
- Use functional components
- Implement proper error handling

### Component Structure
- Keep components focused and reusable
- Use custom hooks for complex logic
- Implement proper loading and error states
- Follow accessibility best practices

### Testing
- Write unit tests for utilities
- Test component behavior
- Integration tests for critical flows
- E2E tests for user journeys

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@cheetahbudgeting.com or join our Slack channel.

## Roadmap

### Phase 1 (Current)
- [x] Core authentication system
- [x] Basic dashboard
- [x] Theme system
- [x] Responsive design

### Phase 2 (Next)
- [ ] Department management
- [ ] Budget CRUD operations
- [ ] Donor management
- [ ] Basic reporting

### Phase 3 (Future)
- [ ] Advanced analytics
- [ ] Compliance automation
- [ ] Mobile app
- [ ] API integration

## Acknowledgments

- Built with React and Firebase
- UI components inspired by Tailwind UI
- Icons from Lucide React
- Charts powered by Recharts
