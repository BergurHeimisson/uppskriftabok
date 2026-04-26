const BASE = '/api'

async function json(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function getRecipes() {
  return json(await fetch(`${BASE}/recipes`))
}

export async function getRecipe(id) {
  return json(await fetch(`${BASE}/recipes/${id}`))
}

export async function createRecipe(data) {
  return json(await fetch(`${BASE}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }))
}

export async function updateRecipe(id, data) {
  return json(await fetch(`${BASE}/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }))
}

export async function deleteRecipe(id) {
  const res = await fetch(`${BASE}/recipes/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function importFromUrl(url) {
  return json(await fetch(`${BASE}/import?url=${encodeURIComponent(url)}`, {
    method: 'POST',
  }))
}

export async function parseIngredients(lines) {
  return json(await fetch(`${BASE}/parse-ingredients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines }),
  }))
}

export async function getGroceryItems() {
  return json(await fetch(`${BASE}/grocery`))
}

export async function addToGrocery(items) {
  return json(await fetch(`${BASE}/grocery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items),
  }))
}

export async function toggleGroceryItem(id) {
  return json(await fetch(`${BASE}/grocery/${id}`, { method: 'PATCH' }))
}

export async function clearCompletedGroceryItems() {
  const res = await fetch(`${BASE}/grocery/completed`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function clearAllGroceryItems() {
  const res = await fetch(`${BASE}/grocery`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function getMenus() {
  return json(await fetch(`${BASE}/menus`))
}

export async function getMenu(id) {
  return json(await fetch(`${BASE}/menus/${id}`))
}

export async function createMenu(data) {
  return json(await fetch(`${BASE}/menus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }))
}

export async function deleteMenu(id) {
  const res = await fetch(`${BASE}/menus/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function addMenuToGrocery(id) {
  return json(await fetch(`${BASE}/menus/${id}/grocery`, { method: 'POST' }))
}
