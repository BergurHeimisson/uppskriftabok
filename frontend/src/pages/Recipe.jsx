import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChefHat, Trash2, ShoppingCart, Check, Pencil } from 'lucide-react'
import { getRecipe, deleteRecipe, addToGrocery } from '../api'
import ServingScaler from '../components/ServingScaler'
import CookMode from '../components/CookMode'
import { formatAmount } from '../utils/fractions'

export default function Recipe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [servings, setServings] = useState(null)
  const [cookMode, setCookMode] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [addedToGrocery, setAddedToGrocery] = useState(new Set())

  useEffect(() => {
    getRecipe(id).then(r => {
      setRecipe(r)
      setServings(r.servings)
    })
  }, [id])

  if (!recipe) return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <p className="text-gray-500">Loading…</p>
    </main>
  )

  if (cookMode) {
    return <CookMode recipe={recipe} onExit={() => setCookMode(false)} />
  }

  const scale = servings / recipe.servings

  async function handleAddToGrocery(i, ing) {
    const parts = []
    if (ing.amount != null) parts.push(formatAmount(ing.amount * scale))
    if (ing.unit) parts.push(ing.unit)
    parts.push(ing.item)
    await addToGrocery([{ recipeId: recipe.id, label: parts.join(' ') }])
    setAddedToGrocery(prev => new Set([...prev, i]))
  }

  async function handleDelete() {
    await deleteRecipe(id)
    navigate('/')
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-4">
        <ArrowLeft size={15} />
        Back
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
          {recipe.description && <p className="text-gray-500 mt-1">{recipe.description}</p>}
        </div>
        <Link
          to={`/recipe/${id}/edit`}
          aria-label="Edit recipe"
          className="text-gray-400 hover:text-gray-700 transition-colors ml-4 mt-1 shrink-0"
        >
          <Pencil size={16} />
        </Link>
      </div>

      {recipe.prep_ahead_note && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded px-4 py-3 mb-4 text-sm">
          <strong>[!] Start the day before:</strong> {recipe.prep_ahead_note}
        </div>
      )}

      <ServingScaler baseServings={recipe.servings} onChange={setServings} />

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Hráefni</h2>
        <ul className="space-y-1.5 list-none p-0">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center gap-2">
              <div className="flex items-baseline gap-2 flex-1">
                {ing.amount != null && (
                  <span className="text-sm tabular-nums text-right min-w-8 shrink-0">
                    {formatAmount(ing.amount * scale)}
                  </span>
                )}
                {ing.unit && (
                  <span className="text-sm text-gray-400 min-w-6 shrink-0">{ing.unit}</span>
                )}
                <span className="text-sm">{ing.item}</span>
              </div>
              <button
                onClick={() => handleAddToGrocery(i, ing)}
                disabled={addedToGrocery.has(i)}
                aria-label={`Add ${ing.item} to grocery`}
                className="shrink-0 text-gray-400 hover:text-amber-500 disabled:text-green-500 transition-colors cursor-pointer border-0 bg-transparent p-0 leading-none"
              >
                {addedToGrocery.has(i) ? <Check size={14} /> : <ShoppingCart size={14} />}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {recipe.instructions && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Punktar</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{recipe.instructions}</p>
        </section>
      )}

      <button
        onClick={() => setCookMode(true)}
        aria-label="Cook Mode"
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full
                   text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer border-0"
      >
        <ChefHat size={16} />
        Cook Mode
      </button>

      <div className="mt-12 pt-6 border-t border-gray-100">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete recipe"
            className="inline-flex items-center gap-2 px-4 py-2 text-red-500 rounded-full
                       text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer border border-red-200"
          >
            <Trash2 size={15} />
            Delete recipe
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Delete this recipe?</span>
            <button
              onClick={handleDelete}
              aria-label="Yes, delete"
              className="px-3 py-1.5 bg-red-500 text-white rounded-full text-sm font-medium
                         hover:bg-red-600 transition-colors cursor-pointer border-0"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              aria-label="Cancel"
              className="px-3 py-1.5 text-gray-500 rounded-full text-sm font-medium
                         hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
