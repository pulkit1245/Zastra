# Zastra — Render Deployment Guide

This guide walks you through deploying the full Zastra stack to [Render](https://render.com).

---

## Architecture

```
GitHub (main branch)
        │
        ▼
┌──────────────────────────────────┐
│         GitHub Actions           │
│   CI: Lint + Build verification  │
└────────────────┬─────────────────┘
                 │  (passes)
                 ▼
┌──────────────────────────────────────────────────────┐
│                    Render Platform                   │
│                                                      │
│  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │ zastra-frontend  │  │    zastra-backend        │   │
│  │  (Static Site)   │  │  (Docker Web Service)    │   │
│  │  React + Vite    │  │  Spring Boot Java 21     │   │
│  └─────────────────┘  └────────────┬────────────┘   │
│                                    │                  │
│  ┌─────────────────┐  ┌────────────▼────────────┐   │
│  │ zastra-python-api│  │   zastra-db (Postgres)  │   │
│  │  FastAPI Docker  │  │   zastra-redis (Redis)  │   │
│  └─────────────────┘  └─────────────────────────┘   │
└──────────────────────────────────────────────────────┘
                 + Upstash Kafka (external, free)
```

---

## Step-by-Step Setup

### Step 1 — Push your code to GitHub

Make sure the repo is on GitHub with all the CI/CD files:
```
Zastra/
├── render.yaml                          ← Render Blueprint
├── .github/workflows/ci.yml            ← GitHub Actions CI
├── .env.example                         ← Updated reference
├── ZastraBackend/
│   ├── Dockerfile
│   ├── src/main/resources/
│   │   ├── application.properties       ← Local dev (H2)
│   │   └── application-prod.properties  ← Render prod (Postgres)
│   └── src/.../security/SecurityConfig.java  ← Dynamic CORS
└── ZastraFrontend/
    ├── src/services/api.js              ← Uses VITE_API_URL
    └── vite.config.js
```

---

### Step 2 — Create Upstash Kafka (Free)

Render has no managed Kafka, so we use Upstash:

1. Go to [https://console.upstash.com/kafka](https://console.upstash.com/kafka)
2. Create a new Kafka cluster (free tier)
3. Note down:
   - `Bootstrap Endpoint` → `KAFKA_BOOTSTRAP_SERVERS`
   - `Username` → `KAFKA_API_KEY`
   - `Password` → `KAFKA_API_SECRET`

---

### Step 3 — Deploy via Render Blueprint

1. Log in to [https://render.com](https://render.com)
2. Click **New → Blueprint**
3. Connect your GitHub repo (`Zastra`)
4. Render will detect `render.yaml` and show you a preview of all services
5. Click **Apply** — Render provisions everything automatically:
   - `zastra-frontend` (Static Site)
   - `zastra-backend` (Docker Web Service)
   - `zastra-python-api` (Docker Web Service)
   - `zastra-db` (PostgreSQL)
   - `zastra-redis` (Redis)

---

### Step 4 — Set Secrets in Render Dashboard

After the Blueprint creates the services, you need to manually set the secrets that are marked `sync: false` in `render.yaml`.

Go to each service → **Environment** tab and add:

#### `zastra-backend` service
| Variable | Value |
|---|---|
| `JWT_SECRET` | Run `openssl rand -base64 64` and paste the output |
| `KAFKA_BOOTSTRAP_SERVERS` | From Upstash (e.g., `grounded-toad-13892-us1-kafka.upstash.io:9092`) |
| `KAFKA_API_KEY` | From Upstash |
| `KAFKA_API_SECRET` | From Upstash |
| `ALLOWED_ORIGINS` | The URL of your frontend (find it in `zastra-frontend` service page, e.g., `https://zastra-frontend.onrender.com`) |

#### `zastra-python-api` service
| Variable | Value |
|---|---|
| `GITHUB_TOKEN` | Your GitHub PAT — create at [github.com/settings/tokens](https://github.com/settings/tokens) with `read:user` scope |

#### `zastra-frontend` service
| Variable | Value |
|---|---|
| `VITE_API_URL` | The URL of your backend (find it in `zastra-backend` service page, e.g., `https://zastra-backend.onrender.com`) |

---

### Step 5 — Trigger a Manual Redeploy

After setting all secrets:
1. Go to each web service → click **Manual Deploy → Deploy latest commit**
2. The frontend needs to be rebuilt after `VITE_API_URL` is set (Vite bakes env vars at build time)

---

### Step 6 — Verify Everything Works

1. Open your frontend URL: `https://zastra-frontend.onrender.com`
2. Register a new account → should land on the dashboard
3. Check `zastra-backend` logs in Render for any startup errors
4. Visit `https://zastra-backend.onrender.com/actuator/health` → should return `{"status":"UP"}`

---

## CI/CD Flow (After Initial Setup)

```
Developer pushes to feature branch
        │
        ▼
GitHub Actions CI runs:
  ✓ Frontend: npm ci + build
  ✓ Backend: ./gradlew build
  ✓ Python: pip install + syntax check
        │
        ▼ (merge PR to main)
Render auto-deploys all three services
(no manual action needed)
```

---

## Important Notes

### Free Tier Limitations on Render
- **Web Services** spin down after 15 min of inactivity → first request may take ~30s to wake up
- **PostgreSQL free tier** expires after 90 days — upgrade to paid before then
- **Redis free tier** — 25MB storage limit

### Local Development (Unchanged)
Your local setup still works exactly as before:
```bash
cd ZastraBackend
docker compose up -d       # starts Postgres, Redis, Kafka, Python API
./gradlew bootRun          # starts Java backend on :8080

cd ZastraFrontend
npm run dev                # starts Vite dev server on :5173
```
No local env changes needed — `application.properties` still uses H2 in-memory by default.

---

## Generating a JWT Secret

```bash
openssl rand -base64 64
```

Paste the output into Render's `JWT_SECRET` env var for `zastra-backend`.
