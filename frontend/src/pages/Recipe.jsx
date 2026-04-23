import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChefHat } from 'lucide-react'
import { getRecipe } from '../api'
import ServingScaler from '../components/ServingScaler'
import CookMode from '../components/CookMode'
import { formatAmount } from '../utils/fractions'

export default function Recipe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [servings, setServings] = useState(null)
  const [crossedOff, setCrossedOff] = useState(new Set())
  const [cookMode, setCookMode] = useState(false)

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

  function toggleIngredient(i) {
    setCrossedOff(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-4">
        <ArrowLeft size={15} />
        Back
      </Link>

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
        {recipe.description && <p className="text-gray-500 mt-1">{recipe.description}</p>}
      </div>

      {recipe.prep_ahead_note && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded px-4 py-3 mb-4 text-sm">
          <strong>[!] Start the day before:</strong> {recipe.prep_ahead_note}
        </div>
      )}

      <ServingScaler baseServings={recipe.servings} onChange={setServings} />

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Ingredients</h2>
        <ul className="space-y-1.5 list-none p-0">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className={crossedOff.has(i) ? 'opacity-40 line-through' : ''}>
              <label className="flex items-baseline gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={crossedOff.has(i)}
                  onChange={() => toggleIngredient(i)}
                  aria-label={ing.item}
                  className="mt-0.5 shrink-0"
                />
                {ing.amount != null && (
                  <span className="text-sm tabular-nums text-right min-w-8 shrink-0">
                    {formatAmount(ing.amount * scale)}
                  </span>
                )}
                {ing.unit && (
                  <span className="text-sm text-gray-400 min-w-6 shrink-0">{ing.unit}</span>
                )}
                <span className="text-sm">{ing.item}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Steps</h2>
        <ol className="space-y-3 list-decimal list-inside">
          {recipe.steps.map((step, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed">{step}</li>
          ))}
        </ol>
      </section>

      <button
        onClick={() => setCookMode(true)}
        aria-label="Cook Mode"
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full
                   text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer border-0"
      >
        <ChefHat size={16} />
        Cook Mode
      </button>
    </main>
  )
}
