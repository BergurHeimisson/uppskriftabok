import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Plus } from 'lucide-react'
import { getRecipes } from '../api'
import RecipeCard from '../components/RecipeCard'

export default function Home() {
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => {
    getRecipes().then(setRecipes)
  }, [])

  const allTags = [...new Set(recipes.flatMap(r => r.tags))]

  const filtered = recipes.filter(r => {
    if (activeTag && !r.tags.includes(activeTag)) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        r.title.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        (r.ingredients || []).some(ing => ing.item.toLowerCase().includes(q))
      )
    }
    return true
  })

  function resetFilters() {
    setActiveTag(null)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Uppskriftapunktar</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/grocery"
            role="link"
            aria-label="Grocery"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ShoppingCart size={20} />
          </Link>
          <Link
            to="/add"
            aria-label="+"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Plus size={22} />
          </Link>
        </div>
      </header>

      <input
        type="search"
        placeholder="Leita..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4"
      />

      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filters">
        <button
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border-0
            ${!activeTag
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          onClick={resetFilters}
        >
          Allar
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border-0
              ${activeTag === tag
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            aria-pressed={activeTag === tag}
            onClick={() => setActiveTag(t => t === tag ? null : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No recipes yet.{' '}
          <Link to="/add" className="text-amber-600 hover:underline">Add a recipe</Link> or import from URL.
        </p>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </main>
  )
}
