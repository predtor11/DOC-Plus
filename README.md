# Doc+ Medical Assistant

A comprehensive healthcare communication platform that connects doctors and patients through secure, AI-powered conversations. Built with modern web technologies to provide seamless medical consultations, patient management, and therapeutic support.

## 🌟 Features

### For Doctors
- **Patient Management**: Register and manage patient records with comprehensive medical history
- **AI-Powered Consultations**: Get intelligent medical insights and treatment recommendations
- **Secure Communication**: HIPAA-compliant messaging with patients
- **File Analysis**: Upload and analyze medical documents, images, and reports
- **Patient Context**: Access complete patient medical history during conversations

### For Patients
- **Therapeutic Support**: AI-powered stress relief and mental health support
- **Secure Messaging**: Direct communication with assigned doctors
- **File Sharing**: Upload medical documents and images for doctor review
- **Personal Health Tracking**: Maintain medical history and treatment records

### AI Integration
- **OpenRouter Integration**: Cloud-based AI models for enhanced capabilities
- **GPT-OSS-20B Model**: Advanced AI model optimized for medical and therapeutic contexts
- **Medical Knowledge**: Specialized prompts for healthcare and therapeutic contexts

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **React Query** - Data fetching and state management

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Clerk** - Authentication and user management
- **Supabase Edge Functions** - Serverless functions for backend logic

### AI & Integrations
- **OpenRouter** - Multi-provider AI API with GPT-OSS-20B
- **Resend** - Email delivery service

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

The application is pre-configured with database and authentication services. You'll only need to set up your OpenRouter API key:

```bash
cp .env.example .env
```

Edit `.env` with your OpenRouter API key:

```env
# AI Integration
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_OPENROUTER_MODEL=openai/gpt-oss-20B
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ChatWindow.tsx  # Main chat interface
│   ├── FileUpload.tsx  # File upload component
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
│   ├── useChatSessions.ts
│   └── ...
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
├── pages/              # Page components
├── services/           # Business logic services
└── test/               # Test files

supabase/
├── config.toml         # Supabase configuration
├── functions/          # Edge functions
└── migrations/         # Database migrations

public/                 # Static assets
├── logo.svg           # Application logo
└── ...
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run build:dev       # Build for development
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
```

## 🔐 Authentication Flow

### For Doctors
1. Register/Login via Clerk (pre-configured)
2. System automatically assigns "doctor" role
3. Can register patients and manage their records
4. Access to patient medical histories and conversations

### For Patients
1. Receive invitation email from doctor
2. Click invitation link and create Clerk account
3. System automatically links to patient record
4. Access to personal health records and doctor communications

## 🤖 AI Features

### GPT-OSS-20B Integration
- **Advanced AI Model**: Uses OpenRouter's GPT-OSS-20B for intelligent responses
- **Medical Expertise**: Specialized training for healthcare contexts
- **Context-Aware Responses**: Uses patient medical history for personalized advice
- **File Analysis**: Can analyze uploaded medical documents and images
- **Treatment Recommendations**: Provides evidence-based suggestions

### Therapeutic AI Support
- **Stress Management**: Evidence-based techniques for anxiety and stress relief
- **Emotional Support**: Empathetic listening and validation
- **Coping Strategies**: Practical tools for mental health management
- **Crisis Detection**: Recognizes signs of crisis and recommends professional help

## 📧 Email Integration

The application uses Resend for email delivery (pre-configured):

1. **Patient Invitations**: Automated emails when doctors register patients
2. **Notifications**: System alerts for important updates
3. **Password Reset**: Secure password recovery flow

## 🚀 Deployment

### Vercel (Already Deployed)

The application is deployed and running on Vercel. The deployment includes:

- **Automatic Builds**: Code changes trigger automatic deployments
- **Environment Variables**: All necessary environment variables are configured
- **Database**: Supabase database is connected and configured
- **Authentication**: Clerk authentication is set up and working
- **AI Integration**: OpenRouter API with GPT-OSS-20B is configured

### Production URL
Access the live application at: [Your Vercel Domain]

## 🔒 Security & Privacy

### HIPAA Compliance
- **Encrypted Communications**: All messages are encrypted in transit and at rest
- **Access Controls**: Role-based permissions for doctors and patients
- **Audit Logs**: Comprehensive logging of all system activities
- **Data Minimization**: Only collect necessary health information

### Authentication Security
- **Clerk Integration**: Enterprise-grade authentication (pre-configured)
- **JWT Tokens**: Secure token-based authorization
- **Session Management**: Automatic session expiration and renewal

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**AI Connection Issues**
```bash
# Check OpenRouter API key
echo $VITE_OPENROUTER_API_KEY
```

**Build Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. **Check existing issues** on GitHub
2. **Review documentation** in the `docs/` folder
3. **Create an issue** with detailed information about your problem

---

**Built with ❤️ for healthcare professionals and patients worldwide**

**🚀 Live on Vercel | 🤖 Powered by GPT-OSS-20B | 🔒 HIPAA Compliant**

For more information, visit our [documentation](docs/) or create an issue on GitHub.
