// Mock API — used when VITE_USE_MOCK=true
// Simulates network latency so the UI feels realistic

const delay = (ms = 150) => new Promise(r => setTimeout(r, ms))

const RECIPES = [
  {
    id: 'r1',
    title: 'Kjötbollar',
    description: 'Klassískar íslenskar kjötbollar í brúnni sósu. Góðar með kartöflumús og rauðkáli.',
    servings: 4,
    prep_time: '20 mín',
    cook_time: '25 mín',
    tags: ['kvöldmatur', 'íslenskt', 'kjöt'],
    prep_ahead_note: null,
    ingredients: [
      { amount: 500, unit: 'g', item: 'hakkað nautakjöt' },
      { amount: 1, unit: '', item: 'egg' },
      { amount: 0.5, unit: 'dl', item: 'brauðmylsna' },
      { amount: 1, unit: 'tsk', item: 'salt' },
      { amount: 0.5, unit: 'tsk', item: 'pipar' },
      { amount: 1, unit: 'msk', item: 'smjör til steikingar' },
    ],
    instructions: 'Blandið saman hakki, eggi, brauðmylsnu, salti og pipar í skál.\nMótið blönduna í litlar kúlur, um 3–4 sm í þvermál.\nBræðið smjör á pönnu á meðalhita. Steikið kjötbollurnar í 8–10 mínútur þar til þær eru brúnar og soðnar í gegn.\nBerið fram með kartöflumús og rauðkálssalati.',
    source: null,
  },
  {
    id: 'r2',
    title: 'Baguette',
    description: 'Stökkt franskt brauð með mjúkt innra. Þarf að byrja daginn áður.',
    servings: 4,
    prep_time: '30 mín',
    cook_time: '25 mín',
    tags: ['bakstur', 'brauð'],
    prep_ahead_note: 'Deigið þarf að hvíla í ísskáp yfir nótt.',
    ingredients: [
      { amount: 500, unit: 'g', item: 'hveiti' },
      { amount: 7, unit: 'g', item: 'þurrger' },
      { amount: 10, unit: 'g', item: 'salt' },
      { amount: 350, unit: 'ml', item: 'volgt vatn' },
    ],
    instructions: 'Blandið hveiti, geri og salti saman.\nBætið vatni saman við og hnoðið þar til deigið er slétt, u.þ.b. 10 mínútur.\nHyljið og látið hefast í 1 klukkustund við stofuhita, setjið síðan í ísskáp yfir nótt.\nMótið deigið í baguette-lögun og látið hefast í 45 mínútur.\nBakið við 240°C í 22–25 mínútur þar til brauðið er gullið og stökkt.',
    source: null,
  },
  {
    id: 'r3',
    title: 'Hummus',
    description: 'Heimagerður hummus úr niðursoðnum kjúklingabaunum. Einföld og góð.',
    servings: 6,
    prep_time: '10 mín',
    cook_time: null,
    tags: ['foréttur', 'grænmetis', 'kalt'],
    prep_ahead_note: null,
    ingredients: [
      { amount: 400, unit: 'g', item: 'kjúklingabaunir (niðursoðnar)' },
      { amount: 2, unit: 'msk', item: 'tahini' },
      { amount: 2, unit: 'msk', item: 'sítrónusafi' },
      { amount: 1, unit: '', item: 'hvítlauksrif' },
      { amount: 3, unit: 'msk', item: 'ólífuolía' },
      { amount: null, unit: '', item: 'salt eftir smekk' },
    ],
    instructions: 'Hellið kjúklingabaunum í matvinnsluvél ásamt tahini, sítrónusafa og hvítlauk.\nBlandið þar til slétt. Hellið í ólífuolíuna meðan vinnsluvélin er í gangi.\nSmakkið til með salti og sítrónusafa.\nBerið fram með ólífuolíu og paprikudufti yfir.',
    source: null,
  },
  {
    id: 'r4',
    title: 'Skyr með berjum',
    description: 'Hraður morgunmatur eða léttur eftiréttur.',
    servings: 2,
    prep_time: '5 mín',
    cook_time: null,
    tags: ['morgunmatur', 'eftiréttur', 'íslenskt'],
    prep_ahead_note: null,
    ingredients: [
      { amount: 400, unit: 'g', item: 'skyr' },
      { amount: 100, unit: 'g', item: 'bláberjum' },
      { amount: 1, unit: 'msk', item: 'hunang' },
      { amount: 2, unit: 'msk', item: 'granola' },
    ],
    instructions: 'Setjið skyr í skál.\nDreifið berjunum yfir.\nHellið hunangi yfir og stráið granola yfir.',
    source: null,
  },
]

let groceryItems = [
  { id: 'g1', recipe_id: 'r1', recipe_title: 'Kjötbollar', label: '500 g hakkað nautakjöt', checked: false },
  { id: 'g2', recipe_id: 'r1', recipe_title: 'Kjötbollar', label: '1 egg', checked: true },
  { id: 'g3', recipe_id: 'r3', recipe_title: 'Hummus', label: '400 g kjúklingabaunir', checked: false },
]

let nextGroceryId = 10

export async function getRecipes() {
  await delay()
  return RECIPES.map(({ id, title, tags, prep_time, cook_time, prep_ahead_note, ingredients }) => ({
    id, title, tags, prep_time, cook_time, prep_ahead_note, ingredients,
  }))
}

export async function getRecipe(id) {
  await delay()
  const r = RECIPES.find(r => r.id === id)
  if (!r) throw new Error('Recipe not found')
  return r
}

export async function createRecipe(data) {
  await delay(300)
  const newRecipe = { id: `r${Date.now()}`, ...data }
  RECIPES.push(newRecipe)
  return newRecipe
}

export async function updateRecipe(id, data) {
  await delay(300)
  const i = RECIPES.findIndex(r => r.id === id)
  if (i === -1) throw new Error('Recipe not found')
  RECIPES[i] = { ...RECIPES[i], ...data }
  return RECIPES[i]
}

export async function deleteRecipe(id) {
  await delay(300)
  const i = RECIPES.findIndex(r => r.id === id)
  if (i !== -1) RECIPES.splice(i, 1)
}

export async function importFromUrl(_url) {
  await delay(800)
  // Simulate a successful import with a sample recipe
  return {
    title: 'Lemon Pasta',
    description: 'Quick and zesty pasta dish.',
    servings: 4,
    tags: ['pasta', 'quick'],
    ingredients: [
      { amount: 400, unit: 'g', item: 'spaghetti' },
      { amount: 2, unit: '', item: 'lemons (zest + juice)' },
      { amount: 4, unit: 'msk', item: 'olive oil' },
      { amount: 50, unit: 'g', item: 'parmesan' },
    ],
    instructions: 'Cook spaghetti according to package instructions.\nToss with lemon zest, lemon juice, olive oil, and parmesan.\nSeason with salt and pepper.',
    prep_ahead_note: null,
    source: _url,
  }
}

export async function parseIngredients(lines) {
  await delay(400)
  return lines.map(line => {
    const m = line.match(/^([\d./½¼¾⅓⅔]+)?\s*([a-zA-Z]+)?\s+(.+)$/)
    if (!m) return { amount: null, unit: '', item: line }
    const [, amt, unit, item] = m
    return {
      amount: amt ? parseFloat(amt) : null,
      unit: unit || '',
      item: item.trim(),
    }
  })
}

export async function getGroceryItems() {
  await delay()
  return [...groceryItems]
}

export async function addToGrocery(items) {
  await delay(200)
  const added = items.map(it => ({
    id: `g${nextGroceryId++}`,
    ...it,
    checked: false,
  }))
  groceryItems.push(...added)
  return added
}

export async function toggleGroceryItem(id) {
  await delay(100)
  const item = groceryItems.find(it => it.id === id)
  if (item) item.checked = !item.checked
  return item
}

export async function clearCompletedGroceryItems() {
  await delay(200)
  groceryItems = groceryItems.filter(it => !it.checked)
}

export async function clearAllGroceryItems() {
  await delay(200)
  groceryItems = []
}
