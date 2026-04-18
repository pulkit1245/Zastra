# Zastra Backend (DevForge Platform)

A scalable, containerized microservice backend powering the DevForge platform. DevForge aggregates developer profiles across platforms (GitHub, LeetCode, Codeforces, GeeksforGeeks, CodeChef) into a single unified dashboard with gamification and activity tracking.

## Architecture

The system utilizes a hybrid microservice architecture:
- **Core Backend (`Spring Boot 3 / Java 21`)**: Handles user authentication (JWT), gamification profiles, project management, and rate-limited API caching.
- **Scraping Engine (`FastAPI / Python 3.11`)**: A dedicated data-ingestion microservice using BeautifulSoup, Selenium, and GraphQL to fetch live metrics from competitive programming platforms.
- **Data Persistence**: `PostgreSQL` instances managed via `Flyway` migrations.
- **Infrastructure**: Fully orchestratable via `Docker Compose`, running alongside `Redis` and `Kafka`.

## Quick Start (Docker)

The easiest way to run the entire backend stack locally is via Docker.

### Prerequisites
- Docker Engine & Docker Compose

### 1. Setup Environment Variables
Copy the example environment variables file and update it if necessary:
```bash
cp .env.example .env
```

### 2. Build and Launch
Launch the entire stack (Postgres, Redis, Kafka, FastAPI Scraper, and Spring Boot app):
```bash
docker compose up --build -d
```

The services will be exposed as follows:
- **Spring Boot API**: `http://localhost:8080/api/v1`
- **FastAPI Scraper**: `http://localhost:8000`
- **Postgres**: `localhost:5432`

## Local Development (Without Docker)

### Java Backend
1. Ensure a PostgreSQL instance is running and matches the credentials in your `.env` or `application.properties`.
2. Run standard gradle build:
```bash
./gradlew bootRun
```

### Python FastAPI Scraper
The Python environment requires specific browser drivers (Chrome/Chromium) for Selenium scraping.
```bash
cd APIS
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Platform Integrations
The scraping engine currently supports live aggregation for:
* **GitHub**: Repositories, stars, and heatmap commits.
* **LeetCode**: Contest ratings, badges, and difficulty breakdowns.
* **Codeforces**: Real-time rating and submission histories.
* **GeeksforGeeks**: Problem-solving counts via Selenium WebDriver.
* **CodeChef**: Ratings and activity metrics.

## Rate Limiting & Caching
To prevent IP bans from external platforms, the Spring Boot application implements a strict 15-minute persistent caching mechanism. Live data calls are intercepted via `ActivityService` and served from the local `cached_activity_data` Postgres table if the data is recent.

## License
MIT License. See `LICENSE` for details.
