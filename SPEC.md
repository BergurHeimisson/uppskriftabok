# Uppskriftabok — Personal Recipe Book

## Overview

A lightweight, mobile-friendly web app for storing and browsing personal recipes.
No database, no backend — recipes stored as JSON, hosted as a static site.

## Goals

- Simple to use on a phone while cooking
- Easy to add recipes (manually or by importing from a URL)
- Fast, offline-capable (PWA)
- No photos for now — focus on clean text layout

---

## Tech Stack

| Layer       | Choice                        | Why                                  |
|-------------|-------------------------------|--------------------------------------|
| Frontend    | Vanilla JS + HTML + CSS       | No build step, dead simple           |
| Data        | Single `recipes.json` file    | Easy to edit, version with git       |
| Hosting     | GitHub Pages or Netlify       | Free, static, HTTPS out of the box   |
| Offline     | Service Worker (PWA)          | Works in the kitchen without wifi    |
| URL Import  | Server function or client-side scraper | Extract recipe from any URL |

---

## Recipe Data Model

```json
{
  "id": "kjotbollar",
  "title": "Kjotbollar",
  "description": "Classic Icelandic meatballs",
  "servings": 4,
  "prepTime": "15 min",
  "cookTime": "30 min",
  "tags": ["dinner", "icelandic", "meat"],
  "ingredients": [
    { "amount": 500, "unit": "g", "item": "ground beef" },
    { "amount": 1, "unit": "", "item": "egg" },
    { "amount": 0.5, "unit": "dl", "item": "breadcrumbs" }
  ],
  "steps": [
    "Mix all ingredients together in a bowl.",
    "Form into small balls.",
    "Fry in butter on medium heat for 8-10 minutes."
  ],
  "source": "https://example.com/original-recipe",
  "dateAdded": "2026-04-01"
}
```

---

## Pages / Views

### 1. Home — Recipe List
- Grid or list of recipe cards (title, tags, prep time)
- Search bar (filters by title, ingredient, or tag)
- Filter buttons for common tags (dinner, soup, baking, etc.)

### 2. Recipe Detail
- Title and description
- Servings selector (adjusts ingredient amounts dynamically)
- Ingredients list (tap to cross off while cooking)
- Steps (numbered, large text)
- Source link (if imported)
- "Cook mode" button — full screen, large font, step-by-step with tap to advance

### 3. Add Recipe
- Form with fields for title, description, servings, tags
- Dynamic ingredient rows (amount, unit, item — add/remove rows)
- Dynamic step rows (add/remove)
- **Import from URL** button — paste a URL, auto-extract recipe data

### 4. Grocery List
- Tap ingredients from any recipe to add them to a shared grocery list
- Check off items while shopping
- Clear completed / clear all

---

## Import from URL — How It Works

Many recipe sites embed structured data (JSON-LD with schema.org/Recipe).
The importer should:

1. Fetch the page HTML
2. Look for `<script type="application/ld+json">` containing `@type: Recipe`
3. Extract: title, ingredients, steps, servings, prep/cook time
4. Fall back to Open Graph / meta tags for title and description
5. Pre-fill the "Add Recipe" form for the user to review and save

**Challenge:** CORS prevents client-side fetching of external pages.
**Solutions:**
- A tiny serverless function (Netlify Function / Cloudflare Worker) as a proxy
- A local CLI tool that outputs JSON (for offline/dev use)
- Use a free CORS proxy for MVP (with caveats)

---

## Cook Mode

A distraction-free view for use while cooking:

- One step shown at a time, large text
- Swipe or tap to go forward/back
- Ingredients visible via a slide-out panel
- Screen stays awake (`navigator.wakeLock`)
- Minimal chrome — just the recipe content

---

## Serving Scaler

- Default servings shown from recipe data
- User picks desired servings (e.g., 4 -> 6)
- All ingredient amounts scale proportionally
- Fractions displayed nicely (e.g., "1/2" not "0.5")

---

## Offline / PWA

- `manifest.json` for install-to-home-screen
- Service worker caches `index.html`, CSS, JS, and `recipes.json`
- Works fully offline once cached
- Badge or toast when new recipes are available after sync

---

## File Structure

```
uppskriftabok/
  index.html          — single page app shell
  style.css           — responsive, mobile-first styles
  app.js              — main application logic
  recipes.json        — all recipe data
  importer.js         — URL import logic
  sw.js               — service worker for offline
  manifest.json       — PWA manifest
  functions/          — (optional) serverless proxy for URL import
    fetch-recipe.js
```

---

## Menu Planner (for Guests)

Create a menu for a dinner party or gathering — pick recipes, set the guest count,
and get a unified view of everything you need to prepare.

### How It Works

- **Create a menu**: give it a name, date, and number of guests
- **Add recipes**: browse your recipe list and add dishes to the menu (starter, main, side, dessert, etc.)
- **Auto-scale**: all ingredient amounts adjust to the guest count
- **Combined grocery list**: merge ingredients across all dishes in the menu — no duplicates (e.g., if two recipes need butter, show the total)
- **Timeline view**: order the dishes by prep/cook time so you know what to start first
- **Share**: generate a simple link or printable page to share the menu (just the dish names and descriptions, not full recipes)

### Menu Data Model

```json
{
  "id": "pasku-kvoldmatur",
  "name": "Paskukvoldmatur",
  "date": "2026-04-05",
  "guests": 8,
  "courses": [
    { "category": "starter", "recipeId": "hummus", "servings": 8 },
    { "category": "main", "recipeId": "kjotbollar", "servings": 8 },
    { "category": "side", "recipeId": "kartoflumauk", "servings": 8 },
    { "category": "dessert", "recipeId": "skyr-terta", "servings": 8 }
  ],
  "notes": "Jón is allergic to nuts"
}
```

### Menu View

- Menu title, date, and guest count at the top
- Courses listed in order (starter → main → side → dessert)
- Each course links to the full recipe
- "Prep timeline" button — shows when to start each dish counting back from serving time
- "Full grocery list" button — combined, de-duplicated ingredients for the whole menu

---

## Future Ideas (Not Now)

- Photo per recipe
- Family sharing / multi-user
- Print-friendly view
- Inline timer buttons in steps
- Meal planner (assign recipes to days of the week)
- Icelandic language toggle

---

## MVP Scope

For the first version, build:

1. `recipes.json` with 2-3 sample recipes
2. Home page with search
3. Recipe detail view with serving scaler
4. Add recipe form
5. Import from URL (using a CORS proxy for MVP)
6. Basic PWA setup (service worker + manifest)

No auth, no database, no photos. Keep it minimal.
