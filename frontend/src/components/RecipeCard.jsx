import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="block group no-underline">
      <div className="bg-white rounded-xl border border-gray-200 p-4 h-full transition-shadow duration-150 group-hover:shadow-md">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="recipe-card__title font-semibold text-gray-900">{recipe.title}</div>
          {recipe.prep_ahead_note && (
            <Clock
              size={15}
              className="recipe-card__prep-icon shrink-0 text-amber-500 mt-0.5"
              aria-label="Þarf undirbúning"
            />
          )}
        </div>
        <div className="recipe-card__tags text-xs text-gray-400 mt-1.5 space-x-1">
          {recipe.tags.map(tag => (
            <span key={tag} className="recipe-card__tag">#{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}
