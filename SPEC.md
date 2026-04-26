# Uppskriftabók — Personal Recipe Book

## Overview

A mobile-friendly web app for storing, browsing, and cooking from personal recipes.
Single user, no authentication. Backend API + PostgreSQL database, React frontend.
Self-hosted via Docker Compose.

---

## Goals & Non-Goals

### Goals
- Simple to use on a phone while cooking
- Add recipes manually or by importing from a URL
- Serving scaler with clean fraction display
- Cook mode — distraction-free, step-by-step
- Grocery list persisted across sessions
- Fast on mobile, works on home network

### Non-Goals (for now)
- Offline / PWA support
- Multi-user / authentication
- Photos per recipe
- Print-friendly view
- Icelandic language toggle
- Meal planner (days of the week)
- Shareable menu links

---

## User Flows

### Browse & Find
1. Open app → Home page shows recipe cards (title, tags, prep time)
2. Search bar filters by title, ingredient, or tag in real time (client-side)
3. Tag filter buttons (dinner, soup, baking, etc.)

### View a Recipe
1. Tap a card → Recipe detail page
2. Adjust servings → ingredient amounts update instantly (client-side math, nice fractions)
3. Tap an ingredient to cross it off while cooking
4. Tap "Cook mode" → fullscreen, one step at a time, screen stays awake

### Add a Recipe
1. Tap "Add" → form with title, description, servings, tags
2. Dynamic ingredient rows (amount, unit, item — add/remove)
3. Dynamic step rows (add/remove)
4. Submit → POST to API → saved to PostgreSQL

### Import from URL
1. In Add Recipe form, paste a URL → click "Import"
2. POST /api/import?url=... → Spring Boot fetches page, Jsoup parses HTML
3. Extracts JSON-LD (`<script type="application/ld+json">` with `@type: Recipe`)
4. Falls back to Open Graph / meta tags for title and description
5. Response pre-fills the Add Recipe form → user reviews and saves

### Grocery List
1. On any recipe detail page, tap ingredients to add to grocery list
2. Grocery list (Innkaupalisti) view: check off items while shopping
3. Clear completed / clear all
4. List persisted in PostgreSQL — survives refresh and device switch

### Dinner Menu (Matseðill)
1. Tap the utensils icon on Home → Menus list
2. Create a menu: give it a name, set guest count, pick recipes from a searchable checkbox list
3. Menu detail shows all selected recipes and the guest count
4. Tap "Senda á innkaupalista" → all ingredients pushed to the grocery list, quantities scaled by `guestCount / recipe.servings`
5. Past menus are listed with name, date, and guest count — recall what guests were served

### Cook Mode
1. Fullscreen, minimal chrome
2. One step shown at a time, large text
3. Tap / swipe to advance steps
4. Slide-out panel shows full ingredient list
5. `navigator.wakeLock` keeps screen on

---

## Technical Architecture

```
+--------------------------------------------------+
|                 Docker Compose                   |
|                                                  |
|  +----------+     /api/*     +----------------+  |
|  | Nginx    | -------------> | Spring Boot    |  |
|  | :80      |                | :8080          |  |
|  | serves   |                | REST API       |  |
|  | React    |                | Jsoup importer |  |
|  +----------+                +----------------+  |
|                                      | JDBC      |
|                                      |           |
|                              +----------------+  |
|                              | PostgreSQL     |  |
|                              | :5432          |  |
|                              +----------------+  |
+--------------------------------------------------+
```

### Development Setup
- Backend: `./mvnw spring-boot:run` on `:8080`
- Frontend: `npm run dev` (Vite) on `:5173`, proxies `/api/*` to `localhost:8080`
- Database: PostgreSQL running locally or via Docker

### Production Setup
- `docker-compose up` starts three containers: Nginx, Spring Boot, PostgreSQL
- Nginx serves built React (`dist/`) and proxies `/api/*` to Spring Boot
- Frontend built with `npm run build` and copied into the Nginx container

---

## Stack

| Layer       | Choice                    | Why                                              |
|-------------|---------------------------|--------------------------------------------------|
| Frontend    | React + Vite              | Component model suits dynamic UI (scaler, cook mode) |
| Backend     | Java 25 + Spring Boot     | Current LTS (Sept 2025), familiar, strong typing, rich ecosystem |
| Database    | PostgreSQL                | Reliable, relational, good for structured data   |
| Migrations  | Flyway                    | SQL migration files versioned in git, auto-applied on startup |
| HTML parser | Jsoup (in Spring Boot)    | Java-native, no separate service needed          |
| Reverse proxy | Nginx                   | Serves static files + proxies API                |
| Deployment  | Docker Compose            | Self-hosted on home server/VPS                   |

---

## Data Model

### `recipes`
| Column          | Type    | Notes                              |
|-----------------|---------|------------------------------------|
| id              | UUID PK | Auto-generated                     |
| title           | TEXT    | Not null                           |
| description     | TEXT    |                                    |
| servings        | INT     | Default/base serving count         |
| prep_time       | TEXT    | Nullable. Optional — only shown/stored if user fills it in |
| cook_time       | TEXT    | Nullable. Optional — only shown/stored if user fills it in |
| tags            | TEXT[]  | PostgreSQL array                   |
| ingredients     | JSONB   | Array of `{amount, unit, item}` objects. `amount` is a number (null if unquantified), `unit` is a string (empty if unitless) |
| instructions    | TEXT    | Free-form cooking instructions     |
| source          | TEXT    | Original URL if imported           |
| prep_ahead_note | TEXT    | Nullable. If set, recipe requires advance preparation. E.g. "Dough must rest overnight" |
| date_added      | DATE    | Set on creation                    |

### `grocery_items`
| Column      | Type     | Notes                              |
|-------------|----------|------------------------------------|
| id          | UUID PK  |                                    |
| recipe_id   | UUID FK  | Source recipe (nullable)           |
| label       | TEXT     | Display text, e.g. "500g ground beef" |
| checked     | BOOLEAN  | Default false                      |
| added_at    | TIMESTAMP |                                   |

### `menus`
| Column       | Type    | Notes                                          |
|--------------|---------|------------------------------------------------|
| id           | UUID PK | Auto-generated                                 |
| name         | TEXT    | Not null. E.g. "Jólakveðjur 2025"             |
| date_created | DATE    | Set on creation                                |
| guest_count  | INT     | Default 4. Drives ingredient scaling           |
| recipe_ids   | JSONB   | Ordered list of recipe UUIDs                   |

---

## API Endpoints

| Method | Path                     | Description                              |
|--------|--------------------------|------------------------------------------|
| GET    | /api/recipes             | List all recipes (id, title, tags, times) |
| GET    | /api/recipes/:id         | Full recipe with ingredients and instructions |
| POST   | /api/recipes             | Create a new recipe                      |
| PUT    | /api/recipes/:id         | Update a recipe                          |
| DELETE | /api/recipes/:id         | Delete a recipe                          |
| POST   | /api/import?url=         | Fetch + parse recipe from URL            |
| POST   | /api/parse-ingredients   | Parse free-text ingredient lines into structured {amount, unit, item} |
| GET    | /api/grocery             | List all grocery items                   |
| POST   | /api/grocery             | Add item(s) to grocery list              |
| PATCH  | /api/grocery/:id         | Toggle checked state                     |
| DELETE | /api/grocery/completed   | Clear checked items                      |
| DELETE | /api/grocery             | Clear all items                          |
| GET    | /api/menus               | List all menus                           |
| POST   | /api/menus               | Create a menu (name, guestCount, recipeIds) |
| GET    | /api/menus/:id           | Menu with embedded full recipe objects   |
| DELETE | /api/menus/:id           | Delete a menu                            |
| POST   | /api/menus/:id/grocery   | Push all ingredients (guest-scaled) to grocery list |

---

## Wireframes

See [WIREFRAME.md](WIREFRAME.md).

---

## UI & UX Details

### Serving Scaler
- Four preset buttons: **2 / 4 / 6 / 8** servings — no free-form input
- Active button highlighted; default selection matches the recipe's base servings (clamped to nearest preset)
- Raw `amount` values returned from API as numbers
- React multiplies by `selectedServings / baseServings`
- Fractions formatted client-side: e.g. `0.5` → `1/2`, `0.333` → `1/3`
- Common fractions: 1/8, 1/4, 1/3, 1/2, 2/3, 3/4 — round to nearest
- Amounts > 10 rounded to 1 decimal

### Import from URL
- Jsoup fetches the page server-side (no CORS issues)
- Looks for `<script type="application/ld+json">` with `@type: Recipe`
- Falls back to Open Graph meta tags for title/description
- Returns partial data if only some fields found — user fills the rest
- Returns 422 with explanation if no recipe data found

#### Ingredient parsing (shared logic)
Both the URL importer and the free-text parser (see below) use the same ingredient parsing logic on the backend:

1. Input: a list of raw strings, e.g. `["500g ground beef", "1 egg", "½ dl breadcrumbs"]`
2. Best-effort regex attempts to split each string into `{amount, unit, item}`:
   - Matches patterns like `500g`, `1/2 dl`, `2 tsp`, `3 large`
   - Normalises Unicode fractions (`½` → `0.5`, `¼` → `0.25`) before parsing
   - Normalises unit aliases to a canonical form before storing:
     | Input variants         | Stored as |
     |------------------------|-----------|
     | `g`, `gr`, `gram`      | `g`       |
     | `kg`, `kilo`           | `kg`      |
     | `dl`, `deciliter`      | `dl`      |
     | `l`, `liter`, `litre`  | `l`       |
     | `ml`, `milliliter`     | `ml`      |
     | `tsp`, `ts`, `teaspoon`| `tsp`     |
     | `tbsp`, `tbs`, `tablespoon` | `tbsp` |
     | `cup`, `cups`          | `cup`     |
3. Strings that don't match cleanly are returned as `{amount: null, unit: "", item: "raw string"}`
4. User reviews and corrects all rows in the Add Recipe form before saving

**Failure is safe:** unrecognised ingredients are pre-filled as free-text item strings — nothing is silently dropped.

### Free-text Ingredient Parser
When adding a recipe manually, the user can type (or paste) a block of free-text ingredients instead of filling in rows one by one.

The Add Recipe form has a **"Parse ingredients"** button above the ingredient rows. Clicking it opens a text area:

```
+-----------------------------+
| Paste ingredients:          |
| +-------------------------+ |
| | 500g ground beef        | |
| | 1 egg                   | |
| | 1/2 dl breadcrumbs      | |
| +-------------------------+ |
|   [Parse]    [Cancel]       |
+-----------------------------+
```

On "Parse": POST the text to `/api/parse-ingredients` → same backend parser as the URL importer → results pre-fill the ingredient rows. User corrects anything that didn't parse cleanly, then proceeds as normal.

Each line in the text area is treated as one ingredient. Empty lines are ignored.

### Advance Prep Indicator
- If `prep_ahead_note` is set, recipe card shows a "Plan ahead" badge
- Recipe detail page shows the note prominently near the top (e.g. "Start the day before: Dough must rest overnight")
- Home page has a "Plan ahead" filter button alongside the tag filters
- Add Recipe form has a "Requires advance preparation" checkbox; if checked, a text field appears for the note

### Search
- Filters client-side on the full recipe list fetched at load
- Matches title, tags, and ingredient items (case-insensitive substring)

### Empty States
- No recipes yet: prompt to add first recipe or import from URL
- No search results: "No recipes match your search"
- Empty grocery list: "Your grocery list is empty"

### Cook Mode
- Entered via a button on the recipe detail page
- Uses Fullscreen API
- `navigator.wakeLock.request('screen')` to keep display on
- Graceful fallback if wakeLock not supported (no error, just doesn't lock)

---

## Tradeoffs & Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Backend language | Java + Spring Boot | User preference and familiarity |
| Separate scraper service | Rejected | Jsoup inside Spring Boot is simpler; no inter-service complexity |
| Offline / PWA | Dropped | Home server always reachable on local network; sync complexity not worth it |
| Auth | None | Single user; secure by network (VPN / home LAN) |
| Ingredient storage | JSONB on recipe row | Recipes are stored in multiple languages (Icelandic, English, French). "Hveiti" and "Flour" are the same ingredient but different strings — cross-recipe SQL queries on ingredient names are meaningless without a multilingual ingredient dictionary. JSONB avoids that complexity; search and scaling stay client-side |
| Fraction formatting | Client-side | Avoids API call on every scaler adjustment |
| Frontend framework | React + Vite | Dynamic UI components justify the build step |
| DB migrations | Flyway | Versioned SQL in git; safe for production |
| Menu planner | Deferred (Phase 2) | Core recipe book first; menu planner adds significant scope |
| Spring MVC vs WebFlux | Spring MVC | All queries are simple CRUD; Jsoup importer is synchronous; JPA + Flyway fit the blocking model; easier to debug |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Recipe sites block server-side fetching (bot detection, JS-rendered pages) | Jsoup works for static HTML; document known-working sites; graceful 422 response for failures |
| PostgreSQL data loss on self-hosted server | Docker volume + periodic pg_dump backup (document in runbook) |
| Flyway migration failures on deploy | Test migrations in dev first; never edit existing migration files |
| wakeLock not supported on all browsers | Graceful degradation — cook mode works, screen may sleep |
| Ingredient fractions not always clean | Define rounding strategy clearly in code; surface raw decimal as fallback |

---

## File Structure

```
uppskriftabok/
  frontend/                   — React + Vite app
    src/
      components/
        RecipeCard.jsx
        RecipeDetail.jsx
        CookMode.jsx
        ServingScaler.jsx
        GroceryList.jsx
        AddRecipeForm.jsx
        ImportUrl.jsx
      pages/
        Home.jsx
        Recipe.jsx
        Add.jsx
        Edit.jsx
        Grocery.jsx
        Menus.jsx
        MenuDetail.jsx
        NewMenu.jsx
      App.jsx
      main.jsx
    vite.config.js            — proxy /api/* to localhost:8080
    index.html

  backend/                    — Spring Boot (Maven)
    src/main/java/
      recipes/
        RecipeController.java
        RecipeService.java
        RecipeRepository.java
        ImportService.java    — Jsoup URL importer
        GroceryController.java
        GroceryService.java
        GroceryRepository.java
        model/
          Recipe.java
          Ingredient.java
          GroceryItem.java
    src/main/resources/
      db/migration/           — Flyway SQL files
        V1__create_recipes.sql
        V2__create_grocery_items.sql
        V3__steps_to_instructions.sql
        V4__create_menus.sql
      application.properties

  docker-compose.yml          — postgres + spring boot + nginx
  nginx/
    nginx.conf                — static files + /api proxy
```

---

## Development Approach

**TDD is mandatory, no exceptions.** Write a failing test first, then write the minimum code to pass it, then refactor. This applies to every layer — Spring Boot services, repositories, React components, and utilities. No implementation code without a red test first.

- Backend: JUnit 5 + Spring Boot Test + Testcontainers (real PostgreSQL in tests)
- Frontend: Vitest + React Testing Library for components; Playwright for e2e

---

## MVP Scope

1. Database schema + Flyway migrations for recipes, grocery items, menus
2. Spring Boot REST API (CRUD for recipes, grocery list, menus, import endpoint)
3. React frontend: Home (search + filter), Recipe Detail (scaler + cross-off), Add Recipe form
4. Import from URL via Jsoup
5. Grocery list / Innkaupalisti (add from recipe, check off, clear)
6. Cook mode (fullscreen, step-by-step, wakeLock)
7. Dinner menus (Matseðlar) — name, guest count, recipe picker, scaled grocery push
8. Docker Compose setup for production

No auth. No photos. No menu planner. No offline.

---

## Phase 2 (Future)

- Photo per recipe
- Icelandic language toggle
- Print-friendly view
- Inline step timers
- Family sharing / multi-user
- Shareable menu links
- Meal planner (days of the week)
