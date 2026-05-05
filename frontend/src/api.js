const BASE = '/api'

let _token = null
export function setToken(t) { _token = t }

function authHeader() {
  return _token ? { Authorization: `Bearer ${_token}` } : {}
}

async function json(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(username, password) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Invalid credentials')
  return res.json()
}

export async function refreshToken() {
  const res = await fetch('/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Session expired')
  return res.json()
}

export async function logout(token) {
  await fetch('/auth/logout', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  })
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function getUsers() {
  return json(await fetch('/admin/users', {
    headers: authHeader(),
  }))
}

export async function createUser(username, password, role = 'MEMBER') {
  return json(await fetch('/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ username, password, role }),
  }))
}

export async function deleteUser(id) {
  const res = await fetch(`/admin/users/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function resetUserPassword(id, password) {
  const res = await fetch(`/admin/users/${id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

// ── Recipes ───────────────────────────────────────────────────────────────────

export async function getRecipes() {
  return json(await fetch(`${BASE}/recipes`))
}

export async function getRecipe(id) {
  return json(await fetch(`${BASE}/recipes/${id}`))
}

export async function createRecipe(data) {
  return json(await fetch(`${BASE}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  }))
}

export async function updateRecipe(id, data) {
  return json(await fetch(`${BASE}/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  }))
}

export async function deleteRecipe(id) {
  const res = await fetch(`${BASE}/recipes/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function importFromUrl(url) {
  return json(await fetch(`${BASE}/import?url=${encodeURIComponent(url)}`, {
    method: 'POST',
    headers: authHeader(),
  }))
}

export async function parseIngredients(lines) {
  return json(await fetch(`${BASE}/parse-ingredients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ lines }),
  }))
}

// ── Grocery ───────────────────────────────────────────────────────────────────

export async function getGroceryItems() {
  return json(await fetch(`${BASE}/grocery`))
}

export async function addToGrocery(items) {
  return json(await fetch(`${BASE}/grocery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(items),
  }))
}

export async function toggleGroceryItem(id) {
  return json(await fetch(`${BASE}/grocery/${id}`, {
    method: 'PATCH',
    headers: authHeader(),
  }))
}

export async function clearCompletedGroceryItems() {
  const res = await fetch(`${BASE}/grocery/completed`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function clearAllGroceryItems() {
  const res = await fetch(`${BASE}/grocery`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

// ── Menus ─────────────────────────────────────────────────────────────────────

export async function getMenus() {
  return json(await fetch(`${BASE}/menus`))
}

export async function getMenu(id) {
  return json(await fetch(`${BASE}/menus/${id}`))
}

export async function createMenu(data) {
  return json(await fetch(`${BASE}/menus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  }))
}

export async function deleteMenu(id) {
  const res = await fetch(`${BASE}/menus/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function addMenuToGrocery(id) {
  return json(await fetch(`${BASE}/menus/${id}/grocery`, {
    method: 'POST',
    headers: authHeader(),
  }))
}
