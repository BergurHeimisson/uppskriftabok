# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Backend**
```bash
cd backend
./mvnw spring-boot:run          # start dev server on :8080
mvn test                        # run all integration tests
mvn test -Dtest=RecipeControllerTest   # run a single test class
mvn test -Dtest=RecipeControllerTest#deleteRecipeReturns204AndIsGone  # single test method
```

**Frontend**
```bash
cd frontend
npm run dev                     # Vite dev server on :5173, proxies /api/* to :8080
npm test                        # Vitest in watch mode
npm run test:run                # Vitest single run (CI)
npm run build                   # production build → dist/
```

**Mock mode** (frontend without a running backend):
```bash
# create frontend/.env.development.local containing:
VITE_USE_MOCK=true
npm run dev
```
The Vite config rewrites `../api` imports to `api.mock.js` at build time — there are no runtime flag checks in components.

**Deploy**
```bash
# Frontend change only
cd frontend && npm run build && docker compose restart nginx

# Backend change
docker compose up -d --build backend

# Both
cd frontend && npm run build && cd .. && docker compose up -d --build
```

## Architecture

Full details are in `ARCHITECTURE.md`. Key points for day-to-day work:

**Request path:** Browser → Cloudflare Tunnel → cloudflared → Nginx :80 → Spring Boot :8080 → PostgreSQL :5432. In dev, Vite proxies `/api/*` directly to `:8080`, skipping Nginx.

**Backend layout** (`is.bergur.uppskriftabok`):
- `controller/` — HTTP mapping only, delegates to service
- `service/` — business logic; `RecipeService`, `GroceryService`, `ImportService`, `IngredientParser`
- `repository/` — Spring Data JPA interfaces
- `model/` — JPA entities; `Recipe` stores `ingredients` as JSONB (`List<Ingredient>`), not a join table

**Frontend layout** (`src/`):
- `pages/` — route-level components (`Home`, `Recipe`, `Add`, `Edit`, `Grocery`)
- `components/` — reusable (`RecipeCard`, `AddRecipeForm`, `CookMode`, `ServingScaler`, `GroceryList`)
- `api.js` — real API client; `api.mock.js` — in-memory mock with the same interface
- `utils/fractions.js` — client-side fraction formatting (serving scaler math stays in the browser)

**Routes:** `/` Home, `/recipe/:id` Recipe detail, `/add` Add, `/recipe/:id/edit` Edit, `/grocery` Grocery list.

`AddRecipeForm` serves both create and edit: pass `initialRecipe` prop to pre-fill fields and switch to `PUT`. Without the prop it renders as "Add Recipe" and calls `POST`.

## Testing

**Backend:** integration tests only — no unit tests for individual classes. All tests extend `AbstractIntegrationTest` which provides `@SpringBootTest(webEnvironment=RANDOM_PORT)` + `@AutoConfigureEmbeddedDatabase` (Zonky embedded PostgreSQL — no Docker required). Use `TestRestTemplate` for HTTP-level assertions; `@BeforeEach` cleans the repo.

**Frontend:** Vitest + React Testing Library. Tests render components via their public output, not implementation details. Mock API is used throughout — do not introduce `jest.mock` for the API module.

**TDD is mandatory.** Write a failing test first, then the minimum code to pass it.

## Key Constraints and Non-obvious Decisions

**JSONB for ingredients:** Recipes can be stored in any language (Icelandic, English, etc.). "Hveiti" and "Flour" are the same ingredient — normalising into a relational table would require a multilingual dictionary. JSONB keeps ingredients self-contained per recipe. Never introduce a `recipe_ingredients` table.

**Grocery FK is nullable:** `grocery_items.recipe_id` is `REFERENCES recipes(id) ON DELETE SET NULL`. Deleting a recipe leaves the grocery items intact with `recipe_id = NULL`.

**Flyway migrations:** Files in `src/main/resources/db/migration/`. Never edit an existing migration file — add a new versioned file instead.

**Ingredient parsing:** `IngredientParser` is shared between `ImportService` (URL import) and `ParseController` (free-text input). Unit aliases are normalised to canonical forms (e.g. `gram` → `g`, `tablespoon` → `tbsp`).

**Serving scaler:** Client-side only. Raw `amount` numbers come from the API; React multiplies by `selectedServings / baseServings`. Fractions formatted in `utils/fractions.js`.

**Cook mode:** Uses `navigator.wakeLock.request('screen')` to keep display on while cooking. Graceful fallback if unsupported.

**Icons:** Use `lucide-react`. Prefer icons with `aria-label` over labelled button boxes.
