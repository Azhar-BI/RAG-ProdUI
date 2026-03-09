# RAG-ProdUI

AI chat application with RAG (pgvector), Python embedding service, and ChatGPT-style UI. Built with SvelteKit, Auth.js, Drizzle ORM, and Google Gemini.

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/Azhar-BI/RAG-ProdUI.git
cd RAG-ProdUI
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in all values in `.env` (DB, AUTH_SECRET, SMTP, OAuth, GEMINI_API_KEY, EMBEDDING_API_URL).

### 3. Start Docker Services

```bash
docker compose up -d
```

Starts pgvector DB (port 5433) and Python embedding service (port 8000).

### 4. Push Schema & Seed

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Run

```bash
pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173)

Verify: [/healthz](http://localhost:5173/healthz) and [/version](http://localhost:5173/version)

## Troubleshooting

**ECONNREFUSED on startup** — Docker isn't running. Start Docker Desktop, then `docker compose up -d`.

**Embedding service not reachable** — Check `docker compose logs embed-api`. Rebuild with `docker compose up -d --build embed-api`.

**Document upload fails** — The Python embedding service must be running. Verify with `curl http://localhost:8000/health`.

**RAG returns no context** — Upload documents first. Use content-related queries. Vague queries may not match.

**Email not sending** — Check SMTP credentials in `.env`. For Gmail use an App Password. For dev use Mailtrap.

**OAuth not working** — Set callback URLs: `http://localhost:5173/auth/callback/google` and `http://localhost:5173/auth/callback/github`.

**Lint/build fails** — Run `pnpm format` to fix formatting, `pnpm check` for type errors.

**Schema out of sync** — Run `pnpm db:migrate`.
