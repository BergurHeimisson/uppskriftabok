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
  ├── /auth/* → Auth service :8082  (login, refresh, logout, validate)
  ├── /admin/* → Auth service :8082  (user management API)
  └── /api/* ──┬─ GET/HEAD/OPTIONS → Spring Boot :8080 (no auth check)
               └─ POST/PUT/PATCH/DELETE
                    │  auth_request /_auth_validate
                    ▼
               Auth service :8082  →  200 → Spring Boot :8080
                                   →  401 → JSON error to browser
       │
       ▼
  Spring Boot :8080  (Docker)          Auth service :8082  (Docker)
       │ JDBC                                │ JDBC
       └──────────────┬────────────────────-─┘
                      ▼
              PostgreSQL :5432  (Docker, volume: postgres_data)
              (shared instance, separate Flyway history tables)
```

## Containers

Four containers managed by Docker Compose, runtime provided by **colima** (Docker Desktop replacement on macOS).

| Container | Image | Port | Role |
|-----------|-------|------|------|
| `postgres` | `postgres:16` | 5432 | Persistent database, volume-backed |
| `backend` | Built from `backend/Dockerfile` | 8080 | Cookbook Spring Boot REST API |
| `auth-service` | Built from `auth-service/Dockerfile` | 8082 | JWT auth, user management |
| `nginx` | `nginx:alpine` | 80 | Serves frontend, proxies API + auth |

`backend` and `auth-service` both wait for `postgres` healthcheck before starting. `nginx` depends on both.

Secrets are injected via a `.env` file at repo root (git-ignored):
```
JWT_SECRET=<64-char random hex>
DB_USER=postgres
DB_PASSWORD=<password>
```

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
| `MenuController` | Menu CRUD + `POST /api/menus/:id/grocery` |
| `ParseController` | `POST /api/parse-ingredients` |
| `ImportController` | `POST /api/import?url=` |
| `ImportService` | Fetches URL via `PageFetcher`, parses JSON-LD then Open Graph |
| `MenuService` | Menu logic; scales ingredient amounts by `guestCount / recipe.servings` when building grocery labels |
| `IngredientParser` | Regex-based parser shared by import and free-text input |
| `PageFetcher` | Interface over Jsoup HTTP — `JsoupPageFetcher` in production, stub in tests |

**Database schema** managed by Flyway (migrations in `src/main/resources/db/migration/`):

- `V1__create_recipes.sql` — `recipes` table, `ingredients` stored as JSONB
- `V2__create_grocery_items.sql` — `grocery_items` table with nullable `recipe_id` FK
- `V3__steps_to_instructions.sql` — replaces `steps TEXT[]` with `instructions TEXT`
- `V4__create_menus.sql` — `menus` table with `name`, `guest_count`, `recipe_ids` (JSONB), `date_created`

**Why JSONB for ingredients?** Recipes are stored in multiple languages (Icelandic, English, etc.). "Hveiti" and "Flour" are the same ingredient but different strings — normalising them into a relational table would require a multilingual ingredient dictionary. JSONB keeps the data self-contained per recipe.

## Auth Service

Standalone Spring Boot 3 service (`auth-service/`, package `is.bergur.auth`) responsible for identity and access management across all present and future sites.

**Package layout:**
```
controller/   AuthController (login, refresh, logout, validate)
              AdminController (user CRUD — ADMIN role only)
service/      JwtService (HS256, sign/validate/extract claims)
              UserService (BCrypt cost-12, user CRUD)
              RefreshTokenService (create, rotate, invalidate)
security/     SecurityConfig (Spring Security 6, stateless sessions)
              JwtAuthFilter (OncePerRequestFilter, validates Bearer tokens)
model/        User, RefreshToken (JPA entities)
repository/   UserRepository, RefreshTokenRepository
dto/          LoginRequest, LoginResponse, CreateUserRequest
```

**Auth endpoints:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | None | Returns access JWT + sets refresh cookie |
| POST | `/auth/refresh` | Refresh cookie | Issues new access JWT (token rotated) |
| POST | `/auth/logout` | Bearer JWT | Deletes all refresh tokens for the user |
| GET | `/auth/validate` | See below | Called by Nginx `auth_request` |
| GET | `/admin/users` | ADMIN JWT | List all users |
| POST | `/admin/users` | ADMIN JWT | Create user |
| DELETE | `/admin/users/{id}` | ADMIN JWT | Delete user |
| PUT | `/admin/users/{id}/password` | ADMIN JWT | Reset user password |

**`/auth/validate` — method-aware gateway check:**
Nginx passes `X-Original-Method: $request_method`. The endpoint returns 200 immediately for `GET`/`HEAD`/`OPTIONS` (public reads). For all other methods it validates the `Authorization: Bearer` header and returns 200 or 401. This lets a single internal endpoint handle the entire `auth_request` flow without Lua.

**Token design:**
- Access JWT: 4h TTL, HS256, payload `{sub, username, role, iat, exp}`, stored in browser memory only
- Refresh token: 30-day TTL, 256-bit random, stored as SHA-256 hex hash in DB, sent as `httpOnly; Secure; SameSite=Strict` cookie (JS-inaccessible), rotated on every use

**Database schema** (Flyway history table: `auth_flyway_schema_history`):
- `V1__create_users.sql` — `users(id UUID, username UNIQUE, password_hash, role, created_at)`
- `V2__create_refresh_tokens.sql` — `refresh_tokens(id, user_id FK→users CASCADE, token_hash, expires_at, created_at)`
- `V3__seed_admin.sql` — seeds initial `bergur` admin account with `ON CONFLICT DO NOTHING`

## Frontend

React + Vite SPA. All routing is client-side (`react-router-dom`), nginx serves `index.html` for all non-API paths.

```
src/
  api.js          Real API client (fetch, BASE = '/api')
                  Module-level _token variable; setToken() stores JWT in memory.
                  authHeader() injects Authorization: Bearer on all write requests.
                  login(), refreshToken(), logout() for auth flows.
                  getUsers(), createUser(), deleteUser(), resetUserPassword() for admin.
  api.mock.js     In-memory mock for development without backend
  context/
    AuthContext.jsx  JWT in React state (never localStorage). Silent refresh on mount.
                     useAuth() hook exposes { token, user, login, logout }.
                     user payload: { username, role } decoded from JWT.
  components/     Reusable UI — AddRecipeForm, GroceryList, CookMode, ServingScaler, ...
  pages/          Route-level components:
                    Home, Recipe, Add, Edit, Grocery, Menus, MenuDetail, NewMenu
                    Login   — username/password form, calls useAuth().login()
                    Admin   — user list + create/delete/reset-password (ADMIN role only)
  utils/
    fractions.js  Client-side fraction formatting (0.5 → "1/2")
```

Mock mode toggled via `VITE_USE_MOCK=true` in `.env.development.local`. Vite alias rewrites `../api` imports to `api.mock.js` at build time — no runtime flag checks in component code.

**Auth flow in the browser:**
1. `AuthProvider` mounts → calls `POST /auth/refresh` (sends httpOnly cookie) → on success stores access JWT in React state
2. User logs in via `/login` → `POST /auth/login` → access JWT stored via `setToken()` + `AuthContext`
3. All write API calls automatically include `Authorization: Bearer <token>` via `authHeader()`
4. Write buttons (Add, Edit, Delete) shown only when `user` is non-null (security enforced server-side by Nginx)

## Networking

The Mac has no public IP (sits behind Tailscale). Public traffic flows through a **Cloudflare Tunnel** — `cloudflared` runs as a launchd system daemon, makes an outbound connection to Cloudflare's edge, and Cloudflare proxies `bergurheimisson.org` through it.

- Cloudflare terminates HTTPS from users
- SSL/TLS mode: **Full** (Cloudflare connects to origin over HTTPS; origin has self-signed cert on :443)
- Tunnel connects to `http://localhost:80` (nginx, no TLS needed on the tunnel leg)
- System daemon config: `/etc/cloudflared/config.yml` (not `~/.cloudflared/` — service runs as root)

## Testing

**Backend (cookbook) and Auth service:** Integration tests only — no unit tests for individual classes. Tests hit a real PostgreSQL instance via `embedded-database-spring-test` (Zonky embedded postgres, no Docker required). Every test class extends `AbstractIntegrationTest` which provides `@SpringBootTest(webEnvironment=RANDOM_PORT)` + `@AutoConfigureEmbeddedDatabase`. Auth-service tests use the same pattern; its Flyway history table (`auth_flyway_schema_history`) is isolated from the cookbook's.

**Frontend:** Vitest + React Testing Library for component behaviour. Mock API used throughout — components are tested via their rendered output, not implementation details. `AuthContext` is provided directly in tests via `<AuthContext.Provider value={...}>` — do not use `vi.mock` for the API module.

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
