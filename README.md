# AuthFlow - Authentication App

![CI](https://github.com/Azhar-BI/Auth-AI-Chat/actions/workflows/ci.yml/badge.svg)

A full-stack authentication application built with SvelteKit, Auth.js, Drizzle ORM, and PostgreSQL. Features email/password auth, Google & GitHub OAuth, email verification, password reset, admin dashboard with role management, and an AI-powered chat interface using Google Gemini.

---

## Features

- Auth.js with email/password credentials and database sessions (no JWT)
- OAuth sign-in with Google and GitHub
- Email verification during signup
- Password reset via secure email link
- Protected routes with auth guards
- Profile management (view & update)
- Admin dashboard with user analytics, role management, and account controls
- AI chat interface with streaming responses (Vercel AI SDK + Gemini)
- Responsive UI with TailwindCSS

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18.x
- [pnpm](https://pnpm.io/) >= 9.x
- [Docker](https://www.docker.com/) (for PostgreSQL)
- SMTP server for email (e.g., [Mailtrap](https://mailtrap.io/))

---

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/Azhar-BI/Auth-AI-Chat.git
cd Auth-AI-Chat
pnpm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in the required values in `.env`:

| Variable                | Description                                |
| ----------------------- | ------------------------------------------ |
| `DATABASE_URL`          | PostgreSQL connection string               |
| `AUTH_SECRET`           | Secret key for Auth.js session signing     |
| `EMAIL_SERVER_HOST`     | SMTP server hostname                       |
| `EMAIL_SERVER_PORT`     | SMTP server port (e.g., 2525 for Mailtrap) |
| `EMAIL_SERVER_USER`     | SMTP username                              |
| `EMAIL_SERVER_PASSWORD` | SMTP password                              |
| `EMAIL_FROM`            | Sender email address                       |
| `AUTH_GOOGLE_ID`        | Google OAuth client ID                     |
| `AUTH_GOOGLE_SECRET`    | Google OAuth client secret                 |
| `AUTH_GITHUB_ID`        | GitHub OAuth client ID                     |
| `AUTH_GITHUB_SECRET`    | GitHub OAuth client secret                 |
| `GEMINI_API_KEY`        | Google Gemini API key for AI chat          |

### 3. Start the Database

```bash
pnpm db:start
```

This starts a PostgreSQL 16 container via Docker Compose.

### 4. Push the Schema

```bash
pnpm db:push
```

### 5. Run the App

```bash
pnpm dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Available Scripts

| Script             | Description                       |
| ------------------ | --------------------------------- |
| `pnpm dev`         | Start development server          |
| `pnpm build`       | Build for production              |
| `pnpm preview`     | Preview production build          |
| `pnpm check`       | Run svelte-check type checking    |
| `pnpm lint`        | Check code formatting (Prettier)  |
| `pnpm format`      | Auto-format code (Prettier)       |
| `pnpm db:start`    | Start PostgreSQL (Docker Compose) |
| `pnpm db:stop`     | Stop PostgreSQL                   |
| `pnpm db:push`     | Push schema to database           |
| `pnpm db:generate` | Generate Drizzle migrations       |
| `pnpm db:studio`   | Open Drizzle Studio               |

---

## Tech Stack

- **Framework:** SvelteKit (Svelte 5)
- **Styling:** TailwindCSS v4
- **Auth:** Auth.js (SvelteKit) with database sessions
- **Database:** PostgreSQL with Drizzle ORM
- **Email:** Nodemailer
- **AI:** Vercel AI SDK + Google Gemini
- **CI:** GitHub Actions (lint, type-check, build)

---

## Troubleshooting

- **Docker not running:** Make sure Docker Desktop is started before running `pnpm db:start`.
- **Port 5432 in use:** Stop any existing PostgreSQL instances or change the port in `docker-compose.yml`.
- **Email not sending:** Double-check your SMTP credentials in `.env`. Mailtrap is recommended for development.
- **OAuth not working:** Ensure your Google/GitHub OAuth app callback URLs are set to `http://localhost:5173/auth/callback/google` and `http://localhost:5173/auth/callback/github`.
- **Build fails:** Run `pnpm check` to see type errors, and `pnpm lint` to check formatting.
# RAG-ProdUI
