# Uppskriftabók

A mobile-friendly personal recipe book. Add recipes manually or import from a URL, scale servings, cook step-by-step, and manage a grocery list.

Live at [bergurheimisson.org](https://bergurheimisson.org).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Tailwind |
| Backend | Java 25 + Spring Boot 3.5 |
| Database | PostgreSQL 16 + Flyway |
| Reverse proxy | Nginx |
| Deployment | Docker Compose + Cloudflare Tunnel |

## Local development

**Backend**
```bash
cd backend
./mvnw spring-boot:run
```
Requires a local PostgreSQL instance matching `application.properties`.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Vite proxies `/api/*` to `localhost:8080`. Set `VITE_USE_MOCK=true` in `.env.development.local` to run without a backend.

**Tests**
```bash
cd backend && mvn test   # 30 integration tests, embedded PostgreSQL (no Docker needed)
cd frontend && npm test  # Vitest unit tests
```

## Production (self-hosted)

The app runs on a Mac in Reykjavík behind [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/).

**Start the stack**
```bash
colima start
docker compose up -d
# cloudflared runs automatically as a launchd system service
```

**Deploy frontend changes**
```bash
cd frontend && npm run build
docker compose restart nginx
```

**Deploy backend changes**
```bash
docker compose up -d --build backend
```

**View logs**
```bash
docker compose logs -f
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/recipes` | List all recipes |
| GET | `/api/recipes/:id` | Get recipe by ID |
| POST | `/api/recipes` | Create recipe |
| PUT | `/api/recipes/:id` | Update recipe |
| DELETE | `/api/recipes/:id` | Delete recipe |
| POST | `/api/import?url=` | Import recipe from URL |
| POST | `/api/parse-ingredients` | Parse free-text ingredient lines |
| GET | `/api/grocery` | List grocery items |
| POST | `/api/grocery` | Add items to grocery list |
| PATCH | `/api/grocery/:id` | Toggle checked state |
| DELETE | `/api/grocery/completed` | Clear checked items |
| DELETE | `/api/grocery` | Clear all items |
