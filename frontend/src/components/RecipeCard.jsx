import { Link } from 'react-router-dom'

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="block group no-underline">
      <div className="bg-white rounded-xl border border-gray-200 p-4 h-full transition-shadow duration-150 group-hover:shadow-md">
        <div className="recipe-card__title font-semibold text-gray-900 mb-1">{recipe.title}</div>
        {recipe.prep_ahead_note && (
          <div className="recipe-card__badge inline-block text-xs bg-amber-100 text-amber-700 rounded px-2 py-0.5 mb-1.5">
            [!] Plan ahead
          </div>
        )}
        <div className="recipe-card__tags text-xs text-gray-400 mt-1.5 space-x-1">
          {recipe.tags.map(tag => (
            <span key={tag} className="recipe-card__tag">#{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}
