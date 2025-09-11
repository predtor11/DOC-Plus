# Welcome to your Lovable project

## Patient Registration Fix

### Issue
When doctors registered patients, temporary credentials were sent via email, but patients couldn't log in because Clerk accounts weren't being created properly.

### Solution
The patient registration system has been updated to use Clerk's invitation system:

1. **Clerk Invitations**: Patients now receive proper Clerk invitations instead of temporary passwords
2. **Proper Authentication**: Patients can accept invitations and create real Clerk accounts
3. **Database Integration**: Patient records are linked to Clerk user IDs when they sign in

### Setup Required

1. **Get your Clerk Secret Key**:
   - Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
   - Navigate to API Keys
   - Copy your "Secret Key"
   - Replace `YOUR_CLERK_SECRET_KEY_HERE` in `.env` with the actual key

2. **Deploy the new function**:
   ```bash
   npx supabase functions deploy invite-patient
   ```

3. **Run the database migration**:
   ```bash
   npx supabase db push
   ```

### How it works now

1. Doctor registers a patient → Clerk invitation is sent
2. Patient receives email with invitation link
3. Patient clicks link and creates Clerk account
4. AuthContext automatically links the Clerk account to the patient record
5. Patient can now log in normally

## Project info

**URL**: https://lovable.dev/projects/783997ea-cab6-4e5f-9aca-08f482cfa4cb

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/783997ea-cab6-4e5f-9aca-08f482cfa4cb) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/783997ea-cab6-4e5f-9aca-08f482cfa4cb) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
