<<<<<<< HEAD
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
=======
<div align="center">
	<img src="public/favicon.ico" alt="Doc+ Logo" width="80" height="80" style="border-radius: 10px;">
	<h1>Doc+ (Doc Plus)</h1>
	<p><strong>AI‑assisted medical collaboration platform for doctors and patients.</strong></p>
	<p>Secure onboarding • Patient management • Doctor ↔ Patient chat • AI clinical assistant • Email invitations</p>
</div>

---

## ✨ Overview

Doc+ is a full‑stack TypeScript React application that helps doctors manage patients, collaborate, and leverage AI safely for clinical context, summaries, and guidance. Patients can register (self or invited), view their profile, and interact with their doctor. Doctors gain tooling for structured onboarding, patient linking, and AI‑augmented chat.

## 📺 Demo Video

(https://youtu.be/s5PCMi7bwoc?si=2W32JhznSDeJgtJU)

Check out our demo video to see Doc+ in action!

## 🔍 Core Features

- Role-based experience (Doctor / Patient) with guided onboarding
- Secure auth using Clerk + Supabase profile linkage
- Patient invitation & temporary password email flows (Supabase Edge Functions + Resend)
- Doctor ↔ Patient real-time style chat UI (with session context)
- AI assistant modes:
  - AI Doctor assistant (clinical insights, treatment reasoning)
  - AI Patient support (wellness, emotional guidance)
  - Context injection of patient data & uploaded file summaries
- Chat session persistence (Supabase tables `chat_sessions`, `messages`)
- Environment-driven OpenRouter model selection
- Modern UI: React 18, Vite, Tailwind CSS, shadcn-ui, Radix primitives
- Form validation with React Hook Form + Zod
- React Query for async/cache patterns

## 🧱 Tech Stack

| Layer                  | Technology                                  |
| ---------------------- | ------------------------------------------- |
| Frontend Build         | Vite + TypeScript                           |
| UI                     | React 18, Tailwind CSS, shadcn-ui, Radix UI |
| State/Data             | React Query, Context APIs                   |
| Auth                   | Clerk (frontend) + Supabase profile records |
| Backend (DB & Edge)    | Supabase (PostgreSQL, Edge Functions)       |
| AI Integration         | OpenRouter (configurable model)             |
| Email                  | Resend via Supabase Edge Functions          |
| Charts / Visualization | Recharts                                    |
| Testing                | Vitest, @testing-library/react              |

## 📁 Project Structure (Key Paths)

```
src/
	components/           Reusable UI + feature components
	pages/                Route-level components (dashboards, chat, onboarding)
	contexts/             React Context (e.g. AuthContext)
	hooks/                Custom hooks (sessions, chat logic, toasts)
	integrations/
		supabase/           Supabase client & generated types
	services/
		openRouterService.ts  AI model interaction layer
supabase/
	functions/            Edge Functions (email flows)
	migrations/           SQL migrations for database schema
public/                 Static assets
```

## ⚙️ Environment Variables

Create a `.env` file (never commit real secrets). All variables prefixed `VITE_` are exposed to the client build by Vite—keep only non-sensitive or publishable keys there.

```
# Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_or_publishable_key

# Auth (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx_or_pk_test_xxx

# AI (OpenRouter)
VITE_OPENROUTER_API_KEY=sk_or_env_value (DO NOT expose if sensitive; proxy if required)
VITE_OPENROUTER_MODEL=openai/gpt-3.5-turbo

# Email / Functions
RESEND_API_KEY=your_resend_key
SITE_URL=https://your-deployed-domain (used in invitation links)
```

Optional: create a `.env.example` mirroring keys for contributors.

## 🛠 Local Development

```pwsh
git clone https://github.com/your-org/doc-plus.git
cd doc-plus
npm install
cp .env.example .env   # or copy manually on Windows
# edit .env with real values
npm run dev
```

App runs at: http://localhost:5173 (default Vite port)

## 🧪 Testing the AI Medical Assistant

### For Doctors: 5 Questions to Test the Medical AI Assistant

**Patient Diagnosis Query:**
> "A 45-year-old male patient presents with chest pain, shortness of breath, and fatigue. What differential diagnoses should I consider, and what immediate tests would you recommend?"

**Treatment Plan Request:**
> "For a patient with Type 2 diabetes and hypertension, what would be an appropriate medication regimen, including dosages and potential side effects?"

**Medical Image Analysis:**
> "I've uploaded an X-ray of a patient's chest. Can you analyze it for signs of pneumonia or other abnormalities and suggest next steps?"

**Medication Interaction Check:**
> "A patient is taking metformin, lisinopril, and atorvastatin. Are there any known interactions, and should I adjust the dosages?"

**Clinical Guidelines Inquiry:**
> "What are the current guidelines for managing acute coronary syndrome in an emergency setting, including thrombolytic therapy options?"

### For Patients: 5 Things to Discuss to Test Both AI Agents

**Stress Management Scenario:**
> "I've been feeling overwhelmed with work lately and having trouble sleeping. Can you help me with some relaxation techniques and stress relief strategies?"

**Emotional Support Request:**
> "I'm going through a difficult breakup and feeling very anxious. I'd like to talk about coping with emotional pain and building resilience."

**Health Anxiety Discussion:**
> "I've been worried about my health after reading about various diseases online. How can I manage health anxiety without constant worry?"

**Lifestyle Changes Query:**
> "I'm trying to improve my mental health through better habits. What are some practical ways to incorporate mindfulness and self-care into my daily routine?"

**Crisis Intervention Test:**
> "I'm feeling really down and having thoughts of not wanting to continue. What should I do, and can you guide me toward professional help?"

## 🚀 Deployment (Vercel)

1. Push repository to GitHub
2. In Vercel: Import → select repo
3. Framework preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add environment variables (see above)
7. Deploy

`vercel.json` rewrites SPA routes to `index.html` for client routing.

## 📨 Supabase Edge Functions (Email Flows)

Functions:

- `send-patient-invitation` – sends invitation with doctor ID code
- `send-temp-password` – sends temporary password credentials

Deploy (example):

```pwsh
npx supabase functions deploy send-patient-invitation
npx supabase functions deploy send-temp-password
```

Ensure `RESEND_API_KEY` and `SITE_URL` are set in Supabase project settings.

## 🤖 AI Integration

`src/services/openRouterService.ts` centralizes AI calls. Configure:

- `VITE_OPENROUTER_API_KEY`
- `VITE_OPENROUTER_MODEL` (fallback: `openai/gpt-3.5-turbo`)

Includes distinct system prompts for doctor vs patient support contexts and optional patient/file context injection.

## 🔐 Authentication Flow

1. Clerk handles frontend auth + role selection metadata
2. Supabase stores extended profile (doctors / patients) after onboarding
3. `AuthContext` stitches Clerk user + Supabase profile

## 🗃 Database

Supabase migrations live in `supabase/migrations/`. Apply locally:

```pwsh
npx supabase start          # if using local stack
npx supabase migration up   # applies migrations
```

## 📬 Email & Invitations

Resend is used via Edge Functions. Before production:

- Verify sending domain in Resend
- Update `from:` address in functions if needed
- Confirm `SITE_URL` reflects deployed frontend

## 🧩 Scripts

From `package.json`:
| Script | Purpose |
|--------|---------|
| dev | Start Vite dev server |
| build | Production build |
| build:dev | Dev-mode build (unminified) |
| preview | Preview production build locally |
| lint | Run ESLint |

## 🛡 Security Notes

- Do not ship private API keys in `VITE_` vars if they grant broad access—use a proxy/server if required
- Review system prompts for compliance & medical disclaimers before production
- Add rate limiting & audit logging for AI requests in future iterations

## 🗺 Roadmap Ideas

- File upload & structured medical record ingestion
- Doctor team collaboration & multi-specialty notes
- AI safety: reasoning trace + source citations enforcement
- Medication interaction checker
- Patient mobile-friendly PWA packaging

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feat/short-description`
3. Commit changes: `git commit -m "feat: add xyz"`
4. Open PR with context & screenshots


## 👥 Connect with our team

| Name                            | LinkedIn                                                 |
| ------------------------------- | -------------------------------------------------------- |
| Akshat Barve                    | https://www.linkedin.com/in/akshatbarve/                 |
| Arnish Baruah                   | https://www.linkedin.com/in/arnishbaruah/                |
| Jayesh Dubey                    | https://www.linkedin.com/in/jayesh-dubey823/             |
| Vijay Vinod Mane                | https://www.linkedin.com/in/vijay-vinod-mane/            |
| Kshatriya Nandini Kuldeep Singh | https://www.linkedin.com/in/kshatriya-nandini-331a16244/ |

Questions or improvements welcome—feel free to open an issue or PR.

— Doc+ Team
>>>>>>> 0616dda15e7755a245f8c9f2e6369a1c9fd79371
