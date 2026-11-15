# Runbook: Production Deployment Guide

Guide to deploying **Homeogenalpha1** to production environments (Vercel, Railway, or Docker VPS).

---

## 1. Environment Variables Configuration

Ensure the following variables are configured in your host environment:

| Variable | Description | Example / Note |
|:---|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client anon key | Client-side safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Server-only, NEVER in browser bundle |
| `GEMINI_API_KEY` | Google Gemini API Key | From Google AI Studio |
| `EXTRACTION_MODEL` | Pinned extraction model | `gemini-2.0-flash` |
| `EMBEDDING_MODEL` | Pinned embedding model | `gemini-embedding-001` |
| `EMBEDDING_DIM` | Embedding vector dimensions | `768` |
| `NODE_ENV` | Runtime environment | `production` |

---

## 2. Option A: Deploy to Railway / Docker VPS

1. Clone repository to deployment server.
2. Build and start containers:
   ```bash
   docker compose up -d --build
   ```
3. Run migrations on your Supabase Postgres:
   ```bash
   psql "$DATABASE_URL" -f supabase/migrations/20261115000000_init_v4.sql
   ```
4. Seed the initial verified Kent 1897 dataset:
   ```bash
   docker compose exec homeogen-app npm run seed
   ```
5. Confirm health check:
   ```bash
   curl -f http://localhost:3000/
   ```

---

## 3. Option B: Deploy to Vercel

1. Push repository to GitHub.
2. Link repository in Vercel Dashboard.
3. Configure Framework Preset: **Next.js**.
4. Add all environment variables in **Project Settings &rarr; Environment Variables**.
5. Trigger production deployment.
