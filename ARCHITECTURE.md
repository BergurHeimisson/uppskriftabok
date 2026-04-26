# Architecture

## Overview

```
Browser
  │ HTTPS
  ▼
Cloudflare Edge  (SSL termination, CDN)
  │ HTTP via Cloudflare Tunnel
  ▼
cloudflared daemon  (launchd service on Mac)
  │ HTTP localhost:80
  ▼
Nginx :80  (Docker)
  ├── /* → serves React SPA from /usr/share/nginx/html
  └── /api/* → proxy to Spring Boot :8080
       │
       ▼
  Spring Boot :8080  (Docker)
       │ JDBC
       ▼
  PostgreSQL :5432  (Docker, volume: postgres_data)
```

## Containers

Three containers managed by Docker Compose, runtime provided by **colima** (Docker Desktop replacement on macOS).

| Container | Image | Role |
|-----------|-------|------|
| `postgres` | `postgres:16` | Persistent database, volume-backed |
| `backend` | Built from `backend/Dockerfile` | Spring Boot REST API |
| `nginx` | `nginx:alpine` | Serves frontend, proxies `/api/*` |

`backend` waits for `postgres` healthcheck before starting. `nginx` depends on `backend`.

## Backend

**Package layout** — layered, no circular dependencies:

```
controller/   HTTP layer — @RestController, request/response mapping
service/      Business logic — @Service, transactions
repository/   Data access — Spring Data JPA interfaces
model/        JPA entities and value types
```

**Key classes:**

| Class | Responsibility |
|-------|----------------|
| `RecipeController` | CRUD for `/api/recipes` |
| `GroceryController` | Grocery list operations |
| `ParseController` | `POST /api/parse-ingredients` |
| `ImportController` | `POST /api/import?url=` |
| `ImportService` | Fetches URL via `PageFetcher`, parses JSON-LD then Open Graph |
| `IngredientParser` | Regex-based parser shared by import and free-text input |
| `PageFetcher` | Interface over Jsoup HTTP — `JsoupPageFetcher` in production, stub in tests |

**Database schema** managed by Flyway (migrations in `src/main/resources/db/migration/`):

- `V1__create_recipes.sql` — `recipes` table, `ingredients` stored as JSONB
- `V2__create_grocery_items.sql` — `grocery_items` table with nullable `recipe_id` FK
- `V3__steps_to_instructions.sql` — replaces `steps TEXT[]` with `instructions TEXT`

**Why JSONB for ingredients?** Recipes are stored in multiple languages (Icelandic, English, etc.). "Hveiti" and "Flour" are the same ingredient but different strings — normalising them into a relational table would require a multilingual ingredient dictionary. JSONB keeps the data self-contained per recipe.

## Frontend

React + Vite SPA. All routing is client-side (`react-router-dom`), nginx serves `index.html` for all non-API paths.

```
src/
  api.js          Real API client (fetch, BASE = '/api')
  api.mock.js     In-memory mock for development without backend
  components/     Reusable UI — AddRecipeForm, GroceryList, CookMode, ServingScaler, ...
  pages/          Route-level components — Home, Recipe, Add, Edit, Grocery
  utils/
    fractions.js  Client-side fraction formatting (0.5 → "1/2")
```

Mock mode toggled via `VITE_USE_MOCK=true` in `.env.development.local`. Vite alias rewrites `../api` imports to `api.mock.js` at build time — no runtime flag checks in component code.

## Networking

The Mac has no public IP (sits behind Tailscale). Public traffic flows through a **Cloudflare Tunnel** — `cloudflared` runs as a launchd system daemon, makes an outbound connection to Cloudflare's edge, and Cloudflare proxies `bergurheimisson.org` through it.

- Cloudflare terminates HTTPS from users
- SSL/TLS mode: **Full** (Cloudflare connects to origin over HTTPS; origin has self-signed cert on :443)
- Tunnel connects to `http://localhost:80` (nginx, no TLS needed on the tunnel leg)
- System daemon config: `/etc/cloudflared/config.yml` (not `~/.cloudflared/` — service runs as root)

## Testing

**Backend:** Integration tests only — no unit tests for individual classes. Tests hit a real PostgreSQL instance via `embedded-database-spring-test` (Zonky embedded postgres, no Docker required). Every test extends `AbstractIntegrationTest` which provides `@SpringBootTest(webEnvironment=RANDOM_PORT)` + `@AutoConfigureEmbeddedDatabase`.

**Frontend:** Vitest + React Testing Library for component behaviour. Mock API used throughout — components are tested via their rendered output, not implementation details.

## Deployment workflow

```bash
# Frontend change
cd frontend && npm run build
docker compose restart nginx

# Backend change
docker compose up -d --build backend

# Both
cd frontend && npm run build && cd ..
docker compose up -d --build
```
