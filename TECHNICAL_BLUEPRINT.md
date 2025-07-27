# 🤖 KhedmaFinal - Technical Blueprint & Development Plan

## 1. Project Overview

KhedmaFinal is a sophisticated, AI-powered job-seeking platform designed to connect candidates with relevant job opportunities. It provides advanced tools for both job seekers (candidates) and administrators.

The core of the platform lies in its intelligent agents, which automate the process of CV analysis and job matching, delivering a highly personalized and efficient experience.

**Key Objectives:**
- Simplify the job application process for candidates.
- Provide powerful, data-driven insights through CV analysis.
- Intelligently match candidates with the most suitable job offers.
- Offer a comprehensive admin panel for managing the platform.

## 2. Technology Stack

This project is built on a modern and robust technology stack:

- **Frontend:**
  - **Framework:** React 18
  - **Build Tool:** Vite
  - **Language:** TypeScript
  - **Styling:** Tailwind CSS with Shadcn/UI components
  - **State Management:** Redux Toolkit
  - **Routing:** React Router v6
  - **Linting:** ESLint

- **Backend & Database:**
  - **Platform:** Supabase (PostgreSQL, Authentication, Storage)
  - **Security:** Row-Level Security (RLS) is heavily used.

- **AI Agents:**
  - **Runtime:** Deno
  - **Primary AI Model:** Google Gemini
  - **Document Extraction:** Google Document AI
  - **Fallback AI Model:** Groq (Llama 3.1)

- **Deployment:**
  - **Script:** `deploy.sh` (details need to be confirmed)

## 3. System Architecture

The application is divided into three main parts: the Frontend (React Client), the Backend (Supabase), and the AI Services (Deno Agents).

### 3.1. Frontend Architecture (`/src`)

The frontend is a single-page application (SPA) with a well-organized, feature-driven structure.

- **`main.tsx`**: The application's entry point. It initializes React, the Redux store, and renders the main `App` component.
- **`App.tsx`**: The root component. It handles routing, authentication state, and the main application layout (Header, Sidebar).
- **`/pages`**: Contains the main page components, which are often wrappers for more complex feature components.
- **`/components`**: The core of the UI. It is organized by feature (e.g., `Auth`, `Layout`, `Dashboard`).
  - **`/components/ui`**: Contains reusable, low-level UI components from Shadcn/UI (e.g., `Button`, `Input`, `Card`).
- **`/hooks`**: Contains custom React hooks (e.g., `useIdleTimer` for auto-logout, `useAppDispatch` for Redux).
- **`/store`**: Manages the global application state using Redux Toolkit.
  - **`/store/slices`**: Each slice corresponds to a feature (e.g., `authSlice`, `jobsSlice`).
- **`/services`**: Handles communication with the Supabase backend. Each service file (e.g., `authService.ts`, `jobService.ts`) encapsulates the logic for interacting with a specific Supabase table or feature.
- **`/lib`**: Contains utility functions, like the Supabase client instance.

### 3.2. Backend Architecture (Supabase)

Supabase serves as the all-in-one backend.

- **Database:** A PostgreSQL database hosts all the application data (users, jobs, applications, etc.).
- **Authentication:** Manages user sign-up, login, and session management. It integrates with the database via the `auth.users` table.
- **Storage:** Used to store files, primarily candidate CVs.
- **SQL Scripts:**
  - `auth_data.sql`: Likely contains initial data or schema for authentication.
  - `fix_rls_security.sql`: Contains the Row-Level Security policies that are critical for protecting user data.
  - `reset_supabase.sql`: A script to reset the database to a clean state for testing or development.

### 3.3. AI Agents Architecture (`/agents`)

The AI agents are standalone Deno scripts that perform heavy computational tasks.

- **`cv-analyzer-agent.ts`**: 
  - **Purpose:** To analyze a candidate's CV.
  - **Process:** 
    1. Receives a CV file (PDF, Word, etc.).
    2. Extracts the raw text using Google Document AI or Gemini.
    3. Sends the text to an AI model (Gemini or Groq) with a detailed prompt to extract structured data (experience, skills, education, etc.).
    4. Scores the CV's quality and completeness.
    5. Saves the structured analysis back to the Supabase database.

- **`matching-agent.ts`**:
  - **Purpose:** To match a candidate's profile with a job offer.
  - **Process:**
    1. Fetches the candidate's profile and the job offer details from Supabase.
    2. Calculates a multi-dimensional score based on skills, experience, education, location, and salary.
    3. Uses AI to assess semantic skill similarity and cultural fit.
    4. Generates a detailed explanation of the match, including strengths and weaknesses.
    5. Saves the match result to the database.

## 4. Key Files to Modify (Plan de Travail)

This section serves as a guide for developers and AI assistants on where to make changes for common tasks.

### Adding a New Page/Feature:
1.  **Create the main component:** Add a new folder in `/src/components/` (e.g., `/src/components/MyNewFeature`).
2.  **Create the page wrapper:** Add a new file in `/src/pages/` (e.g., `MyNewFeaturePage.tsx`) that imports and renders your main component.
3.  **Add the route:** Open `/src/App.tsx` and add a new `<Route>` within the authenticated or unauthenticated section.
4.  **Add to navigation:** Modify `/src/components/Layout/Sidebar.tsx` to add a link to your new page in the navigation menu.
5.  **Add state management (if needed):** Create a new slice in `/src/store/slices/` and add it to the main store in `/src/store/index.ts`.
6.  **Add backend communication (if needed):** Create a new service file in `/src/services/` to handle API calls to Supabase.

### Modifying an Existing Feature:
- **Authentication:** Look in `/src/components/Auth`, `/src/store/slices/authSlice.ts`, and `/src/services/authService.ts`.
- **Job Listings:** Look in `/src/components/Jobs`, `/src/store/slices/jobsSlice.ts`, and `/src/services/jobService.ts`.
- **CV Analysis UI:** Look in `/src/components/CVAnalysis`.
- **AI Agent Logic:** Modify the Deno scripts in the `/agents` directory.
  - For CV parsing logic, edit `agents/cv-analyzer-agent.ts`.
  - For job matching logic, edit `agents/matching-agent.ts`.

### Changing the UI/Styling:
- **Global styles:** Edit `/src/index.css`.
- **Component-specific styles:** Use Tailwind CSS utility classes directly in the `className` prop of the React components.
- **UI Components:** To modify or add new reusable components, see `/src/components/ui`.

### Modifying the Database:
- **Schema Changes:** Use the Supabase dashboard UI or create new SQL migration scripts in the `/supabase/migrations` directory.
- **Security Policies:** All data access rules are in `fix_rls_security.sql`. **This is a critical file.** Any change to the database schema that involves user data must be reflected here.

## 5. Next Steps & Code Cleanup Plan

Based on the initial analysis, the following actions are recommended:

1.  **Run ESLint:** Run `npx eslint . --fix` to automatically fix linting errors and ensure code consistency.
2.  **Add Comments:** Add TSDoc comments to key functions, especially in the services and hooks, to improve clarity.
3.  **Environment Variables:** Ensure that `.env.example` is up-to-date with all the necessary environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, etc.).
4.  **Refactor `App.tsx`:** The main `AppContent` component is very large. It could be broken down into smaller components, such as `AuthenticatedRoutes` and `UnauthenticatedRoutes`, to improve readability.
5.  **Consolidate Type Definitions:** Ensure all shared types between the frontend and the agents are located in the `/types` directory to maintain a single source of truth.
