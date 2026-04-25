import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getRecipe } from '../api'
import AddRecipeForm from '../components/AddRecipeForm'

export default function Edit() {
  const { id } = useParams()
  const [recipe, setRecipe] = useState(null)

  useEffect(() => {
    getRecipe(id).then(setRecipe)
  }, [id])

  if (!recipe) return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <p className="text-gray-500">Loading…</p>
    </main>
  )

  return <AddRecipeForm initialRecipe={recipe} />
}
