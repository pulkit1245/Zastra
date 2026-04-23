<p align="center">
  <h1 align="center">⚡ Zastra — DevForge Platform</h1>
  <p align="center">
    <strong>A unified developer portfolio & competitive-programming dashboard</strong>
  </p>
  <p align="center">
    <a href="#-quick-start-docker">Quick Start</a> •
    <a href="#-features">Features</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21"/>
  <img src="https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</p>

---

## 📖 Overview

**Zastra (DevForge)** aggregates developer profiles across multiple competitive-programming and open-source platforms into a single, gamified dashboard. Link your **GitHub**, **LeetCode**, **Codeforces**, **GeeksforGeeks**, and **CodeChef** accounts — then track activity, earn XP & badges, manage projects, and share a public portfolio with the world.

### Why Zastra?

| Pain Point | Zastra's Solution |
|---|---|
| Profiles scattered across 5+ platforms | One unified dashboard with aggregated stats |
| No single place to showcase all coding activity | Auto-generated public portfolio page |
| Manual tracking of progress | Gamification system with XP, levels & leaderboards |
| Constantly visiting each site for updates | Background sync engine with intelligent caching |

---

## ✨ Features

### 🔗 Multi-Platform Integration
- **GitHub** — Repositories, stars, contributions, and heatmap data
- **LeetCode** — Contest ratings, badges, difficulty breakdowns, topic-wise stats
- **Codeforces** — Real-time rating history and submission analytics
- **GeeksforGeeks** — Problem-solving counts via Selenium-based scraping
- **CodeChef** — Ratings and activity metrics

### 🎮 Gamification Engine
- XP-based progression system (problems solved → XP earned)
- Dynamic rank titles: *Code Newbie → Code Warrior → Algorithm Ace → ...*
- Global leaderboard with real-time rankings
- Badge rewards for milestones and streaks

### 📊 Unified Dashboard
- Global activity overview with aggregated statistics
- GitHub contribution heatmap visualization
- Contest performance tracking across platforms
- Topic-wise problem distribution charts (via Recharts)

### 🗂️ Project Showcase
- Add, manage, and showcase personal projects
- Tag projects with tech stacks
- Direct links to repositories

### 👤 Public Portfolio
- Shareable profile at `/portfolio/:username`
- Browseable developer directory at `/directory`
- Auto-populated from synced platform data

### 🌗 Theming
- Light and dark mode with system-preference detection
- Persistent theme toggle via `ThemeContext`

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         FRONTEND                               │
│               React 19 + Vite 8 + TailwindCSS 4               │
│        (SPA with React Router v7, Axios, Recharts)             │
│                     http://localhost:5173                       │
└────────────────────────┬───────────────────────────────────────┘
                         │ REST (JWT Bearer)
┌────────────────────────▼───────────────────────────────────────┐
│                    CORE BACKEND (Java)                          │
│          Spring Boot 3.5 · Spring Security · JPA               │
│          Spring Modulith · Flyway · Actuator · WebSocket       │
│                     http://localhost:8080                       │
├────────────┬───────────────────────┬───────────────────────────┤
│  PostgreSQL│       Redis           │         Kafka             │
│  :5432     │       :6379           │         :9092             │
└────────────┘───────────────────────┘───────────────────────────┘
                         │ HTTP
┌────────────────────────▼───────────────────────────────────────┐
│                 SCRAPING ENGINE (Python)                        │
│     FastAPI · BeautifulSoup · Selenium · GraphQL Queries       │
│                     http://localhost:8000                       │
└────────────────────────────────────────────────────────────────┘
```

### Service Overview

| Service | Tech | Port | Description |
|---|---|---|---|
| **Frontend** | React 19, Vite 8, TailwindCSS 4 | `5173` | Single-page application UI |
| **Core Backend** | Spring Boot 3.5, Java 21 | `8080` | REST API, auth, business logic |
| **Scraping Engine** | FastAPI, Python 3.11+ | `8000` | Platform data ingestion |
| **PostgreSQL** | v15 Alpine | `5432` | Primary relational datastore |
| **Redis** | v7 Alpine | `6379` | Session/cache store |
| **Kafka** | Confluent 7.4 | `9092` | Event broker (Modulith events) |
| **Zookeeper** | Confluent 7.4 | `2181` | Kafka coordination |

---

## 🚀 Quick Start (Docker)

The fastest way to run the full stack locally.

### Prerequisites
- [Docker Engine](https://docs.docker.com/engine/install/) & Docker Compose v2+
- [Node.js 18+](https://nodejs.org/) (for the frontend dev server)

### 1. Clone the repository

```bash
git clone https://github.com/pulkit1245/Zastra.git
cd Zastra
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env and set your POSTGRES_PASSWORD and JWT_SECRET
```

### 3. Start the backend stack

```bash
cd ZastraBackend
docker compose up --build -d
```

This launches **PostgreSQL**, **Redis**, **Kafka/Zookeeper**, the **Python Scraper**, and the **Spring Boot API**.

### 4. Start the frontend

```bash
cd ../ZastraFrontend
npm install
npm run dev
```

### 5. Open in browser

| URL | Service |
|---|---|
| [http://localhost:5173](http://localhost:5173) | Frontend (React) |
| [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) | Backend Health Check |
| [http://localhost:8000/docs](http://localhost:8000/docs) | Scraper Swagger UI |

---

## 🔧 Local Development (Without Docker)

### Java Backend

**Prerequisites:** Java 21 JDK ([Adoptium Temurin](https://adoptium.net/temurin/releases/?version=21))

```bash
cd ZastraBackend

# Option A: With H2 in-memory database (zero config, default)
./gradlew bootRun

# Option B: With PostgreSQL (set DB connection in application.properties or env vars)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/devforge \
SPRING_DATASOURCE_USERNAME=postgres \
SPRING_DATASOURCE_PASSWORD=yourpassword \
./gradlew bootRun
```

> **Note:** In the default H2 mode, Flyway is disabled and Hibernate auto-generates the schema. For production, enable Flyway in `application.properties` and use PostgreSQL.

**H2 Console (dev mode):**
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:devforge`
- Username: `sa` / Password: *(empty)*

### Python Scraping Engine

**Prerequisites:** Python 3.11+, Google Chrome (for Selenium)

```bash
cd ZastraBackend/APIS

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# .\venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### React Frontend

**Prerequisites:** Node.js 18+

```bash
cd ZastraFrontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` with hot module replacement.

---

## 📁 Project Structure

```
Zastra/
├── .env.example                 # Environment variable template
├── .gitignore                   # Git ignore rules
├── README.md                    # ← You are here
│
├── ZastraBackend/
│   ├── docker-compose.yml       # Full-stack orchestration (6 services)
│   ├── Dockerfile               # Multi-stage Java build
│   ├── build.gradle             # Gradle dependencies & plugins
│   ├── settings.gradle
│   ├── gradlew / gradlew.bat    # Gradle wrappers
│   ├── HOW_TO_RUN.txt           # Detailed run guide
│   ├── test-api.http            # HTTP client API test file
│   │
│   ├── APIS/                    # Python scraping microservice
│   │   ├── Dockerfile
│   │   ├── main.py              # FastAPI entry point
│   │   ├── requirements.txt
│   │   └── data/                # Scraper modules
│   │       ├── githubDataClass.py
│   │       ├── leetcodeDataClass.py
│   │       ├── codeforcesDataClass.py
│   │       ├── codechefDataClass.py
│   │       └── gfgUserProfile.py
│   │
│   └── src/main/
│       ├── java/com/pulkit/ZastraBackend/
│       │   ├── ZastraBackendApplication.java
│       │   ├── controller/      # REST controllers
│       │   │   ├── AuthController.java
│       │   │   ├── ProfileController.java
│       │   │   ├── ActivityController.java
│       │   │   ├── ProjectController.java
│       │   │   ├── IntegrationController.java
│       │   │   ├── GamificationController.java
│       │   │   ├── PortfolioController.java
│       │   │   └── DirectoryController.java
│       │   ├── service/         # Business logic
│       │   ├── entity/          # JPA entities
│       │   ├── repository/      # Spring Data JPA repos
│       │   ├── dto/             # Data Transfer Objects
│       │   ├── security/        # JWT auth & Spring Security
│       │   ├── config/          # App configuration
│       │   └── client/          # HTTP clients (Python API)
│       │
│       └── resources/
│           ├── application.properties
│           └── db/migration/
│               └── V1__init_schema.sql
│
└── ZastraFrontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx              # Route definitions
        ├── main.jsx             # Entry point
        ├── index.css            # Global styles
        ├── components/          # Reusable UI components
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── StatCard.jsx
        │   ├── SyncProgressPanel.jsx
        │   ├── ThemeToggle.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── LoadingSpinner.jsx
        │   ├── ConfirmDialog.jsx
        │   └── EmptyState.jsx
        ├── pages/               # Route-level page components
        │   ├── auth/            # Login, Register
        │   ├── dashboard/       # Main dashboard
        │   ├── activity/        # Activity & stats
        │   ├── projects/        # Project management
        │   ├── integrations/    # Platform connections
        │   ├── gamification/    # XP, levels, leaderboard
        │   ├── profile/         # User profile
        │   └── portfolio/       # Public portfolio & directory
        ├── services/            # API client modules (Axios)
        ├── context/             # React Context (Auth, Theme)
        ├── hooks/               # Custom React hooks
        ├── layouts/             # Auth & Dashboard layouts
        └── utils/               # Utility functions
```

---

## 📡 API Reference

All API endpoints are prefixed with `/api/v1` and require JWT authentication (except auth endpoints).

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login (returns JWT token) |

### Profile

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/profile` | Get current user profile |
| `PUT` | `/api/v1/profile` | Update profile (displayName, bio, targetRoles) |

### Integrations & Sync

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/integrations` | Get all integration statuses |
| `POST` | `/api/v1/integrations/{platform}/sync` | Trigger sync for a platform |

Supported platforms: `github`, `leetcode`, `codeforces`, `codechef`, `gfg`

### Activity & Statistics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/activity/global` | Aggregated stats across all platforms |
| `GET` | `/api/v1/activity/github` | GitHub-specific activity metrics |
| `GET` | `/api/v1/activity/contest` | Contest rankings & rating data |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/projects` | List all user projects |
| `POST` | `/api/v1/projects` | Create a new project |

### Gamification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/gamification/summary` | User's XP, level, and badges |
| `GET` | `/api/v1/gamification/leaderboard` | Global leaderboard |

### Public Portfolio

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/portfolio/public/{username}` | View user's public portfolio |
| `GET` | `/api/v1/portfolio/directory` | Browse all public profiles |

### Scraping Engine (Python — `localhost:8000`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/github/{username}` | Scrape GitHub profile |
| `GET` | `/leetcode/{username}` | Scrape LeetCode profile |
| `GET` | `/codeforces/{username}` | Scrape Codeforces profile |
| `GET` | `/codechef/{username}` | Scrape CodeChef profile |
| `GET` | `/gfg/{username}` | Scrape GeeksforGeeks profile |

---

## 🗄️ Database Schema

The schema is managed via Flyway migrations (production) or Hibernate auto-DDL (dev mode).

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
│    users     │────<│   user_profiles     │     │  gamification_       │
│              │     │                     │     │  profiles            │
│ id (PK, UUID)│     │ user_id (FK, UNIQUE)│     │ user_id (FK, UNIQUE) │
│ email        │     │ display_name        │     │ total_xp             │
│ password_hash│     │ bio                 │     │ current_level        │
│ username     │     └─────────┬───────────┘     └──────────────────────┘
│ created_at   │               │
└──────┬───────┘     ┌─────────▼───────────┐
       │             │ user_profile_       │
       │             │ target_roles        │
       │             └─────────────────────┘
       │
       ├────<┌──────────────────────┐
       │     │ integration_statuses │
       │     │ platform             │
       │     │ platform_username    │
       │     │ status               │
       │     │ last_synced          │
       │     └──────────────────────┘
       │
       ├────<┌──────────────────────┐     ┌──────────────────────┐
       │     │      projects       │────<│  project_tech_stack  │
       │     │ title, description  │     │  technology          │
       │     │ link                │     └──────────────────────┘
       │     └──────────────────────┘
       │
       ├────<┌──────────────────────┐
       │     │    notifications    │
       │     │ message, is_read    │
       │     └──────────────────────┘
       │
       └────<┌──────────────────────┐
             │ cached_activity_data │
             │ global_stats_json   │
             │ github_stats_json   │
             │ contest_stats_json  │
             │ topics_json         │
             │ heatmap_json        │
             └──────────────────────┘
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres_local_pw` | PostgreSQL password |
| `POSTGRES_DB` | `devforge` | Database name |
| `JWT_SECRET` | *(fallback in code)* | Secret key for JWT signing (min 32 chars) |
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring profile (`prod` enables Postgres) |
| `PYTHON_API_BASE_URL` | `http://127.0.0.1:8000` | URL of the Python scraping service |
| `GITHUB_TOKEN` | *(optional)* | GitHub personal access token for API rate limits |

---

## 🧪 Testing

### API Testing
The project includes a [`test-api.http`](ZastraBackend/test-api.http) file compatible with the VS Code REST Client or IntelliJ HTTP Client. It covers all major endpoints with example payloads.

### Backend Unit Tests
```bash
cd ZastraBackend
./gradlew test
```

### Frontend Linting
```bash
cd ZastraFrontend
npm run lint
```

---

## 🔒 Security

- **Authentication:** JWT-based stateless authentication via `Authorization: Bearer <token>` header
- **Password Hashing:** BCrypt via Spring Security
- **CORS:** Configured in both Spring Security and FastAPI middleware
- **Route Protection:** Frontend uses `ProtectedRoute` wrapper; backend uses `SecurityConfig` filter chain
- **Token Expiry:** 24-hour JWT expiration (configurable via `jwt.expiration`)
- **Auto-Logout:** Frontend interceptor detects 401 responses and redirects to login

---

## 🚢 Deployment

### Docker (Recommended)

The `docker-compose.yml` orchestrates all 6 backend services. For full deployment:

```bash
cd ZastraBackend
docker compose up --build -d
```

### Individual Service Builds

**Java Backend:**
```bash
cd ZastraBackend
./gradlew clean build -x test
java -jar build/libs/*.jar
```

**Python Scraper:**
```bash
cd ZastraBackend/APIS
docker build -t zastra-scraper .
docker run -p 8000:8000 zastra-scraper
```

**Frontend Production Build:**
```bash
cd ZastraFrontend
npm run build      # Output in dist/
npm run preview    # Preview production build locally
```

---

## 🔄 Rate Limiting & Caching

To prevent IP bans from external platforms, the backend implements a **15-minute persistent caching** mechanism:

1. When a sync is triggered, `ActivityService` checks the `cached_activity_data` table
2. If a cache entry exists and is **< 15 minutes old**, the cached JSON is returned
3. If the cache is stale or missing, a live scrape is triggered via the Python API
4. Fresh data is persisted back to the cache table for subsequent requests

This ensures platform APIs are called at most **once every 15 minutes per user**.

---

## 🛠️ Tech Stack Summary

### Backend
| Technology | Purpose |
|---|---|
| Java 21 | Core language |
| Spring Boot 3.5 | Application framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA | ORM & database access |
| Spring Modulith | Modular monolith architecture |
| Flyway | Database migrations |
| PostgreSQL 15 | Primary database |
| Redis 7 | Caching layer |
| Apache Kafka | Event-driven messaging |
| Lombok | Boilerplate reduction |
| JJWT | JWT token handling |
| Micrometer + Prometheus | Observability metrics |

### Scraping Engine
| Technology | Purpose |
|---|---|
| Python 3.11+ | Scripting language |
| FastAPI | Async HTTP framework |
| BeautifulSoup 4 | HTML parsing |
| Selenium | Browser-based scraping (GFG) |
| Requests | HTTP client |
| WebDriver Manager | Chrome driver management |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI library |
| Vite 8 | Build tool & dev server |
| TailwindCSS 4 | Utility-first CSS framework |
| React Router v7 | Client-side routing |
| Axios | HTTP client |
| Recharts | Data visualization charts |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'Add my feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

Please ensure your code passes linting and existing tests before submitting.

---

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">

  Built with ❤️ by <a href="https://github.com/pulkit1245">Team Mahaveera</a><br>

  <b>Lead: Pulkit Verma</b>

</p>
