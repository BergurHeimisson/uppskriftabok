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
- Menu planner (deferred to Phase 2)
- Print-friendly view
- Icelandic language toggle
- Meal planner (days of the week)

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
2. Grocery list view: check off items while shopping
3. Clear completed / clear all
4. List persisted in PostgreSQL — survives refresh and device switch

### Cook Mode
1. Fullscreen, minimal chrome
2. One step shown at a time, large text
3. Tap / swipe to advance steps
4. Slide-out panel shows full ingredient list
5. `navigator.wakeLock` keeps screen on

---

## Technical Architecture

```
+---------------------------------------------------+
|                  Docker Compose                   |
|                                                   |
|  +------------+  /api/*   +-----------------+    |
|  |  Nginx     | --------> |  Spring Boot    |    |
|  |  :80       |           |  :8080          |    |
|  |  serves    |           |  REST API       |    |
|  |  React     |           |  Jsoup importer |    |
|  +------------+           +--------+--------+    |
|                                    | JDBC         |
|                           +--------v--------+    |
|                           |  PostgreSQL     |    |
|                           |  :5432          |    |
|                           +-----------------+    |
+---------------------------------------------------+
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
| Column       | Type      | Notes                              |
|--------------|-----------|------------------------------------|
| id           | UUID PK   | Auto-generated                     |
| title        | TEXT      | Not null                           |
| description  | TEXT      |                                    |
| servings     | INT       | Default/base serving count         |
| prep_time    | TEXT      | Nullable. Optional — only shown/stored if user fills it in |
| cook_time    | TEXT      | Nullable. Optional — only shown/stored if user fills it in |
| tags         | TEXT[]    | PostgreSQL array                   |
| ingredients  | JSONB     | Array of `{amount, unit, item}` objects. `amount` is a number (null if unquantified), `unit` is a string (empty if unitless) |
| steps        | TEXT[]    | Ordered list of step strings       |
| source       | TEXT      | Original URL if imported           |
| prep_ahead_note | TEXT   | Nullable. If set, recipe requires advance preparation. E.g. "Dough must rest overnight" |
| date_added   | DATE      | Set on creation                    |

### `grocery_items`
| Column      | Type     | Notes                              |
|-------------|----------|------------------------------------|
| id          | UUID PK  |                                    |
| recipe_id   | UUID FK  | Source recipe (nullable)           |
| label       | TEXT     | Display text, e.g. "500g ground beef" |
| checked     | BOOLEAN  | Default false                      |
| added_at    | TIMESTAMP |                                   |

---

## API Endpoints

| Method | Path                     | Description                              |
|--------|--------------------------|------------------------------------------|
| GET    | /api/recipes             | List all recipes (id, title, tags, times) |
| GET    | /api/recipes/:id         | Full recipe with ingredients and steps   |
| POST   | /api/recipes             | Create a new recipe                      |
| PUT    | /api/recipes/:id         | Update a recipe                          |
| DELETE | /api/recipes/:id         | Delete a recipe                          |
| POST   | /api/import?url=         | Fetch + parse recipe from URL            |
| GET    | /api/grocery             | List all grocery items                   |
| POST   | /api/grocery             | Add item(s) to grocery list              |
| PATCH  | /api/grocery/:id         | Toggle checked state                     |
| DELETE | /api/grocery/completed   | Clear checked items                      |
| DELETE | /api/grocery             | Clear all items                          |

---

## Wireframes

Mobile-first. All views are single-column, touch-friendly.

### Home — Recipe List
```
+-----------------------------+
|  Uppskriftabok          [+] |
+-----------------------------+
| [?] Search recipes...       |
+-----------------------------+
| [All] [Dinner] [Soup]       |
| [Baking] [Plan ahead]       |
+-----------------------------+
| +-------------------------+ |
| | Kjotbollar              | |
| | #dinner #icelandic      | |
| +-------------------------+ |
| +-------------------------+ |
| | Baguette      [!] Plan  | |
| | #baking #bread          | |
| +-------------------------+ |
| +-------------------------+ |
| | Hummus                  | |
| | #starter #vegetarian    | |
| +-------------------------+ |
+-----------------------------+
```

### Recipe Detail
```
+-----------------------------+
| < Kjotbollar                |
+-----------------------------+
| Classic Icelandic meatballs |
+-----------------------------+
| Servings:  [2] [4] [6] [8] |
+-----------------------------+
| Ingredients                 |
| [ ] 500 g    ground beef    |
| [ ] 1        egg            |
| [ ] 1/2 dl   breadcrumbs   |
| [ ] 1 tsp    salt           |
+-----------------------------+
| Steps                       |
| 1. Mix all ingredients      |
|    together in a bowl.      |
|                             |
| 2. Form into small balls.   |
|                             |
| 3. Fry in butter on medium  |
|    heat for 8-10 minutes.   |
+-----------------------------+
|       [ Cook Mode ]         |
+-----------------------------+
```

### Recipe Detail — Plan Ahead notice
```
+-----------------------------+
| < Baguette                  |
+-----------------------------+
| +-------------------------+ |
| | [!] Start the day before| |
| |     Dough must rest     | |
| |     overnight           | |
| +-------------------------+ |
|  ...                        |
+-----------------------------+
```

### Add Recipe
```
+-----------------------------+
| < Add Recipe                |
+-----------------------------+
| Import from URL             |
| +-------------------------+  |
| | https://...             |  |
| +-------------------------+  |
|      [Import Recipe]        |
+-----------------------------+
| Title                       |
| +-------------------------+ |
| |                         | |
| +-------------------------+ |
| Description                 |
| +-------------------------+ |
| |                         | |
| +-------------------------+ |
| Base servings               |
| [2] [4] [6] [8]             |
| Tags (comma separated)      |
| +-------------------------+ |
| |                         | |
| +-------------------------+ |
| [ ] Add prep/cook times     |
| +----------+  +----------+  | <- appears when checked
| | 15 min   |  | 30 min   |  |
| +----------+  +----------+  |
+-----------------------------+
| [ ] Requires advance prep   |
| +-------------------------+ | <- appears when checked
| | Dough must rest...      | |
| +-------------------------+ |
+-----------------------------+
| Ingredients              [+]|
| +------+ +----+ +--------+  |
| | 500  | | g  | | beef   |  |
| +------+ +----+ +--------+  |
| +------+ +----+ +--------+  |
| | 1    | |    | | egg    |  |
| +------+ +----+ +--------+  |
+-----------------------------+
| Steps                    [+]|
| 1. +---------------------+  |
|    | Mix all ingredients  |  |
|    +---------------------+  |
| 2. +---------------------+  |
|    |                     |  |
|    +---------------------+  |
+-----------------------------+
|        [ Save Recipe ]      |
+-----------------------------+
```

### Grocery List
```
+-----------------------------+
|  Grocery List               |
+-----------------------------+
| From: Kjotbollar            |
| [x] 500 g ground beef       |
| [ ] 1 egg                   |
| [ ] 1/2 dl breadcrumbs      |
|                             |
| From: Hummus                |
| [ ] 400 g chickpeas         |
| [ ] 2 tbsp tahini           |
+-----------------------------+
| [Clear done]    [Clear all] |
+-----------------------------+
```

### Cook Mode
```
+-----------------------------+
| Kjotbollar          Step 2/3|
|                             |
|                             |
|                             |
|    Form into small balls.   |
|                             |
|                             |
|                             |
|                             |
|  < Back          Next >     |
+-----------------------------+
| [= Ingredients]             |
+-----------------------------+
```

#### Cook Mode — Ingredients panel (slide up)
```
+-----------------------------+
| Ingredients             [x] |
|  500 g    ground beef       |
|  1        egg               |
|  1/2 dl   breadcrumbs       |
+-----------------------------+
```

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
| Ingredient storage | JSONB on recipe row | No join needed; search and scaling are client-side so SQL-level queryability has no value here; simpler schema |
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
        Grocery.jsx
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
        V2__create_ingredients.sql
        V3__create_grocery_items.sql
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

1. Database schema + Flyway migrations for recipes, ingredients, grocery items
2. Spring Boot REST API (CRUD for recipes, grocery list, import endpoint)
3. React frontend: Home (search + filter), Recipe Detail (scaler + cross-off), Add Recipe form
4. Import from URL via Jsoup
5. Grocery list (add from recipe, check off, clear)
6. Cook mode (fullscreen, step-by-step, wakeLock)
7. Docker Compose setup for production

No auth. No photos. No menu planner. No offline.

---

## Phase 2 (Future)

- Menu Planner: create a multi-course dinner menu, auto-scale ingredients to guest count,
  combined de-duplicated grocery list, prep timeline, shareable link
- Photo per recipe
- Icelandic language toggle
- Print-friendly view
- Inline step timers
- Family sharing / multi-user
