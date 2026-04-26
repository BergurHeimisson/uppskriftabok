import { useState, useEffect, useRef } from 'react'
import { X, UtensilsCrossed } from 'lucide-react'
import { formatAmount } from '../utils/fractions'

export default function CookMode({ recipe, onExit }) {
  const [showIngredients, setShowIngredients] = useState(false)
  const wakeLock = useRef(null)

  useEffect(() => {
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(lock => {
        wakeLock.current = lock
      }).catch(() => {})
    }
    return () => { wakeLock.current?.release() }
  }, [])

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
        <span className="font-semibold text-gray-900 text-base">{recipe.title}</span>
        <div className="flex items-center gap-3">
          <button
            aria-label="Ingredients"
            onClick={() => setShowIngredients(v => !v)}
            className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer border-0 bg-transparent p-1"
          >
            <UtensilsCrossed size={20} />
          </button>
          <button
            aria-label="Exit"
            onClick={onExit}
            className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer border-0 bg-transparent p-1"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap max-w-xl mx-auto">
          {recipe.instructions}
        </p>
      </div>

      {/* Ingredients panel */}
      {showIngredients && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 max-h-[50vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Ingredients</h3>
            <button
              aria-label="Hide ingredients"
              onClick={() => setShowIngredients(false)}
              className="text-gray-400 hover:text-gray-700 cursor-pointer border-0 bg-transparent p-1"
            >
              <X size={16} />
            </button>
          </div>
          <ul className="space-y-1 list-none p-0">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                {ing.amount != null && <span className="tabular-nums">{formatAmount(ing.amount)}</span>}
                {ing.unit && <span className="text-gray-400">{ing.unit}</span>}
                <span>{ing.item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
