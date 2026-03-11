# AuthFlow - Technical Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication-system)
6. [OAuth Integration](#oauth-integration)
7. [Email Flows](#email-flows)
8. [Admin Dashboard](#admin-dashboard)
9. [AI Chat Interface](#ai-chat-interface)
10. [Route Protection](#route-protection)
11. [Security Measures](#security-measures)
12. [Authentication Flow Diagrams](#authentication-flow-diagrams)

---

## Project Overview

AuthFlow is a full-stack authentication application built with SvelteKit. It implements Auth.js with database-backed sessions (no JWT), OAuth sign-in (Google & GitHub), email verification, password reset, role-based access control with a production-grade admin dashboard (analytics, charts, activity audit log), and an AI-powered RAG chat interface with tree-structured history using the Vercel AI SDK with Google Gemini.

---

## Tech Stack

| Layer            | Technology                    |
| ---------------- | ----------------------------- |
| Framework        | SvelteKit (Svelte 5)          |
| Styling          | TailwindCSS v4                |
| Authentication   | Auth.js (`@auth/sveltekit`)   |
| Database         | PostgreSQL 16                 |
| ORM              | Drizzle ORM                   |
| Email            | Nodemailer (SMTP)             |
| Password Hash    | bcryptjs                      |
| AI               | Vercel AI SDK + Google Gemini |
| CI/CD            | GitHub Actions                |
| Containerization | Docker Compose (PostgreSQL)   |

---

## Project Structure

```
src/
├── app.d.ts                              Type declarations (Auth.js session)
├── app.html                              HTML shell template
├── hooks.server.ts                       Server middleware (delegates to Auth.js)
├── lib/
│   ├── assets/                           Static assets (images)
│   ├── components/
│   │   └── chat/
│   │       └── ChatMessage.svelte        Reusable chat message bubble component
│   └── server/
│       ├── auth.ts                       Auth.js configuration (providers, adapter, callbacks)
│       ├── db.ts                         Drizzle ORM + PostgreSQL connection pool
│       ├── email.ts                      Nodemailer email service (verification & reset)
│       └── schema.ts                     Database table definitions (Drizzle pgTable)
└── routes/
    ├── +layout.svelte                    Root layout (public pages)
    ├── +layout.server.ts                 Root loader (session check)
    ├── +page.svelte                      Landing page (public)
    ├── api/
    │   └── chat/+server.ts              AI chat API endpoint (streaming)
    ├── login/                            Email/password login + OAuth buttons
    ├── register/                         User registration with validation
    ├── logout/                           Logout (POST action)
    ├── forgot-password/                  Password reset request
    ├── reset-password/                   Password reset form (token-based)
    ├── verify-email/                     Email verification (token validation)
    ├── verify-email-required/            Prompt to verify email (with resend)
    └── dashboard/
        ├── +layout.svelte               Dashboard layout (navbar, floating chat button)
        ├── +layout.server.ts            Auth guard (session + email verification check)
        ├── +page.svelte                 Dashboard home (welcome, stats, quick actions)
        ├── profile/                     Profile management (update name/email)
        ├── admin/                       Admin dashboard (users table, analytics, controls)
        └── chat/                        AI chat interface (streaming, suggestions)
```

Configuration files:

- `drizzle.config.ts` — Drizzle ORM config (schema path, DB connection, migrations)
- `docker-compose.yml` — PostgreSQL 16 Alpine container
- `.github/workflows/ci.yml` — GitHub Actions (lint, type-check, build)
- `.env.example` — All required environment variables

---

## Database Schema

Defined in `src/lib/server/schema.ts` using Drizzle ORM.

### users

| Column           | Type      | Notes                                   |
| ---------------- | --------- | --------------------------------------- |
| `id`             | UUID      | Primary key, auto-generated             |
| `name`           | text      | User's display name                     |
| `email`          | text      | Unique, not null                        |
| `password`       | text      | bcrypt hash (null for OAuth-only users) |
| `email_verified` | timestamp | Set when email is verified              |
| `image`          | text      | Profile image URL (from OAuth)          |
| `role`           | text      | `"user"` (default) or `"admin"`         |
| `disabled`       | text      | `"false"` (default) or `"true"`         |
| `created_at`     | timestamp | Auto-set on creation                    |

### accounts

OAuth provider accounts (required by Auth.js).

| Column                | Type    | Notes                                    |
| --------------------- | ------- | ---------------------------------------- |
| `user_id`             | UUID    | FK to users, cascade delete              |
| `type`                | text    | Account type (e.g., "oauth")             |
| `provider`            | text    | Provider name (e.g., "google", "github") |
| `provider_account_id` | text    | Provider's user ID                       |
| `access_token`        | text    | OAuth access token                       |
| `refresh_token`       | text    | OAuth refresh token                      |
| `expires_at`          | integer | Token expiry timestamp                   |

Primary key: `(provider, provider_account_id)`

### sessions

Database-backed sessions (Auth.js database strategy).

| Column          | Type      | Notes                       |
| --------------- | --------- | --------------------------- |
| `session_token` | text      | Primary key                 |
| `user_id`       | UUID      | FK to users, cascade delete |
| `expires`       | timestamp | Session expiry (30 days)    |

### verification_tokens

| Column       | Type      | Notes                |
| ------------ | --------- | -------------------- |
| `identifier` | text      | User's email address |
| `token`      | text      | UUID token           |
| `expires`    | timestamp | 24-hour expiry       |

Primary key: `(identifier, token)`

### password_reset_tokens

| Column       | Type      | Notes                |
| ------------ | --------- | -------------------- |
| `identifier` | text      | User's email address |
| `token`      | text      | UUID token           |
| `expires`    | timestamp | 1-hour expiry        |

Primary key: `(identifier, token)`

---

## Authentication System

### Configuration (`src/lib/server/auth.ts`)

Auth.js is configured with:

- **DrizzleAdapter** — Maps Auth.js operations to PostgreSQL via Drizzle ORM
- **Database session strategy** — Sessions stored in the `sessions` table (no JWT)
- **30-day session expiry**
- **Custom sign-in page** — Redirects to `/login`
- **`trustHost: true`** — Allows running on any host

### Session Callback

The session callback enriches the session object with:

- `user.id` — From the database user record
- `user.emailVerified` — Timestamp of email verification
- `user.role` — Fetched from the `users` table (`"user"` or `"admin"`)
- `user.disabled` — Account disabled status

### Credentials Login (`src/routes/login/+page.server.ts`)

The credentials login flow bypasses Auth.js's built-in credentials provider and directly:

1. Validates email and password inputs
2. Looks up user by email in the database
3. Compares password with bcrypt hash
4. Checks email is verified (returns 403 if not)
5. Checks account is not disabled (returns 403 if disabled)
6. Creates a session directly in the `sessions` table
7. Sets the `authjs.session-token` httpOnly cookie (30-day expiry)
8. Redirects to `/dashboard`

### Hooks (`src/hooks.server.ts`)

Delegates entirely to Auth.js's handle function. Auth.js processes the session cookie on every request and populates `locals.auth()`.

---

## OAuth Integration

### Providers

Configured in `src/lib/server/auth.ts`:

- **Google** — Uses `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
- **GitHub** — Uses `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`

Both providers have `allowDangerousEmailAccountLinking: true`, which allows users who registered with email/password to also sign in with OAuth using the same email (and vice versa).

### OAuth User Creation Event

When a new user is created via OAuth (`events.createUser`):

1. Resets `emailVerified` to `null` (OAuth users must also verify)
2. Generates a UUID verification token (24-hour expiry)
3. Stores the token in `verification_tokens`
4. Sends a verification email

---

## Email Flows

### Email Service (`src/lib/server/email.ts`)

Uses Nodemailer with SMTP credentials. Sends HTML-formatted emails with styled buttons.

### Email Verification

```
Registration/OAuth signup
  -> Generate UUID token (24h expiry)
  -> Store in verification_tokens table
  -> Send email with verification link

User clicks link (/verify-email?token=...&email=...)
  -> Validate token exists and matches email
  -> Check token hasn't expired
  -> Set emailVerified timestamp on user
  -> Delete used token
  -> Show success page with login link
```

Users cannot access the dashboard until their email is verified. Unverified users are redirected to `/verify-email-required` where they can request a new verification email.

### Password Reset

```
Forgot Password (/forgot-password)
  -> User enters email
  -> Generate UUID token (1h expiry)
  -> Store in password_reset_tokens table
  -> Send reset email
  -> Always show success (prevents email enumeration)

Reset Password (/reset-password?token=...&email=...)
  -> Validate token and expiry
  -> User enters new password (min 6 chars)
  -> Hash with bcrypt (10 rounds)
  -> Update user's password
  -> Delete used token
  -> Redirect to /login?reset=true
```

---

## Admin Dashboard

### Access Control

- The `role` field on the `users` table determines access (`"user"` or `"admin"`)
- The dashboard layout passes `role` to all child routes
- The admin page (`src/routes/dashboard/admin/+page.server.ts`) checks `role === "admin"` and redirects non-admins to `/dashboard`
- The admin nav link is only visible to admin users in the dashboard layout

### Features

**User Analytics** (calculated server-side):

- Total registered users
- Verified users count
- Admin users count
- Recent signups (last 7 days)

**User Management Table**:

- Displays all users with: name, email, role, verification status, join date
- Desktop: full table layout / Mobile: card layout

**Admin Actions**:

- **Change Role** — Promote user to admin or demote to user
- **Toggle Disabled** — Enable or disable a user account
- Self-protection: admins cannot demote themselves or disable their own account

---

## AI Chat Interface

### API Endpoint (`src/routes/api/chat/+server.ts`)

- Requires authenticated session (returns 401 if not logged in)
- Uses Vercel AI SDK's `streamText()` with Google Gemini (`gemini-2.5-flash`)
- System prompt: "You are a helpful AI assistant. Be concise and friendly in your responses."
- Returns a streaming text response

### Chat Page (`src/routes/dashboard/chat/+page.svelte`)

- Streaming response display (reads chunks from response body)
- Uses the reusable `ChatMessage` component (`src/lib/components/chat/ChatMessage.svelte`)
- Suggested prompts for new conversations (auth, coding, security, writing)
- Clear conversation button
- Error handling with dismissible alerts
- Loading indicator (animated bouncing dots)
- Auto-scroll to latest message
- Enter to send, Shift+Enter for newline

### ChatMessage Component (`src/lib/components/chat/ChatMessage.svelte`)

Reusable Svelte 5 component with props:

- `role` — `"user"` or `"assistant"`
- `content` — Message text
- `loading` — Shows typing indicator when true

Renders avatar (gradient for assistant, black for user), styled message bubble, and loading state.

### Floating Chat Button

A floating button in the dashboard layout (bottom-right corner) links to `/dashboard/chat`. Hidden when already on the chat page.

---

## Route Protection

### Public Routes

| Route                    | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `/`                      | Landing page                                           |
| `/login`                 | Login (redirects to dashboard if authenticated)        |
| `/register`              | Registration (redirects to dashboard if authenticated) |
| `/forgot-password`       | Password reset request                                 |
| `/reset-password`        | Password reset form (token-based)                      |
| `/verify-email`          | Email verification (token-based)                       |
| `/verify-email-required` | Prompt to verify email                                 |

### Protected Routes

**Dashboard Auth Guard** (`src/routes/dashboard/+layout.server.ts`):

- Checks `session?.user` exists — redirects to `/login` if not
- Checks `emailVerified` is set — redirects to `/verify-email-required` if not
- Passes `user` and `role` to all child routes

**Admin Auth Guard** (`src/routes/dashboard/admin/+page.server.ts`):

- Checks `role === "admin"` — redirects to `/dashboard` if not

**Chat API Guard** (`src/routes/api/chat/+server.ts`):

- Checks `session?.user` — returns 401 if not authenticated

### Root Layout (`src/routes/+layout.server.ts`)

Loads the session on every page. Only treats the user as "logged in" if their email is verified. This controls navbar display (Login/Register vs Dashboard link).

---

## Security Measures

| Measure                      | Implementation                                           |
| ---------------------------- | -------------------------------------------------------- |
| Password hashing             | bcrypt with 10 salt rounds                               |
| Password requirements        | Min 6 chars, must contain letters and numbers            |
| Session storage              | httpOnly cookies (not accessible via JavaScript)         |
| Session strategy             | Database-backed (no JWT, tokens stored server-side)      |
| Email verification           | Required before login/dashboard access                   |
| Email enumeration prevention | Password reset always returns success                    |
| Verification token expiry    | 24 hours                                                 |
| Password reset token expiry  | 1 hour                                                   |
| Session expiry               | 30 days                                                  |
| Token cleanup                | Used tokens deleted from database immediately            |
| Account disabling            | Admins can disable accounts; disabled users cannot login |
| Self-protection              | Admins cannot demote or disable themselves               |
| OAuth account linking        | Enabled for same-email accounts across providers         |
| Input validation             | Server-side validation on all form submissions           |

---

## Authentication Flow Diagrams

### Registration Flow

```
User fills form (name, email, password)
  -> Server validates inputs
  -> Check email uniqueness
  -> Hash password (bcrypt, 10 rounds)
  -> Insert user into database
  -> Generate verification token (UUID, 24h expiry)
  -> Store token in verification_tokens
  -> Send verification email
  -> Redirect to /login?registered=true
```

### Login Flow (Credentials)

```
User enters email + password
  -> Validate inputs
  -> Look up user by email
  -> Compare password with bcrypt hash
  -> Check email is verified
  -> Check account is not disabled
  -> Create session in sessions table
  -> Set authjs.session-token cookie (httpOnly, 30 days)
  -> Redirect to /dashboard
```

### Login Flow (OAuth)

```
User clicks "Sign in with Google/GitHub"
  -> Auth.js redirects to provider
  -> Provider authenticates and redirects back
  -> Auth.js creates/links account via DrizzleAdapter
  -> If new user: createUser event fires
    -> Reset emailVerified to null
    -> Send verification email
  -> Session created in database
  -> Cookie set automatically by Auth.js
  -> Redirect to dashboard (or verify-email-required if unverified)
```

### Session Validation (Every Request)

```
Request arrives
  -> Auth.js handle reads authjs.session-token cookie
  -> Looks up session in sessions table
  -> If valid: populates locals.auth() with session + user
  -> Session callback enriches with role, disabled, emailVerified
  -> Route handlers access via locals.auth()
```

### Password Reset Flow

```
User requests reset (/forgot-password)
  -> Generate token (UUID, 1h expiry)
  -> Store in password_reset_tokens
  -> Send reset email
  -> Always show "check your email" (prevents enumeration)

User clicks link (/reset-password?token=...&email=...)
  -> Validate token exists and not expired
  -> User enters new password
  -> Hash with bcrypt
  -> Update user's password
  -> Delete used token
  -> Redirect to /login?reset=true
```

---

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

**Triggers:** Push to `main`, Pull requests to `main`

**Steps:**

1. Checkout code
2. Install pnpm v10
3. Setup Node.js 20 with pnpm cache
4. Install dependencies (`pnpm install --frozen-lockfile`)
5. Lint with Prettier (`pnpm lint`)
6. Type-check with svelte-check (`pnpm check`)
7. Build (`pnpm build`)

---

## Environment Variables

| Variable                | Required | Description                        |
| ----------------------- | -------- | ---------------------------------- |
| `DATABASE_URL`          | Yes      | PostgreSQL connection string       |
| `AUTH_SECRET`           | Yes      | Auth.js secret for session signing |
| `EMAIL_SERVER_HOST`     | Yes      | SMTP server hostname               |
| `EMAIL_SERVER_PORT`     | Yes      | SMTP server port                   |
| `EMAIL_SERVER_USER`     | Yes      | SMTP username                      |
| `EMAIL_SERVER_PASSWORD` | Yes      | SMTP password                      |
| `EMAIL_FROM`            | Yes      | Sender email address               |
| `AUTH_GOOGLE_ID`        | Yes      | Google OAuth client ID             |
| `AUTH_GOOGLE_SECRET`    | Yes      | Google OAuth client secret         |
| `AUTH_GITHUB_ID`        | Yes      | GitHub OAuth client ID             |
| `AUTH_GITHUB_SECRET`    | Yes      | GitHub OAuth client secret         |
| `GEMINI_API_KEY`        | Yes      | Google Gemini API key for AI chat  |
