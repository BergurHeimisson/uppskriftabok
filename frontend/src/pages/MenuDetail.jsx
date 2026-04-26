import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { getMenu, deleteMenu, addMenuToGrocery } from '../api'
import RecipeCard from '../components/RecipeCard'

export default function MenuDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(null)
  const [sending, setSending] = useState(false)

  useEffect(() => { getMenu(id).then(setMenu) }, [id])

  async function handleAddToGrocery() {
    setSending(true)
    try {
      await addMenuToGrocery(id)
      navigate('/grocery')
    } finally {
      setSending(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Eyða matseðlinum "${menu.name}"?`)) return
    await deleteMenu(id)
    navigate('/menus')
  }

  if (!menu) return <main className="max-w-4xl mx-auto px-4 py-6"><p className="text-gray-400 text-sm">Hleður...</p></main>

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link to="/menus" aria-label="Til baka" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{menu.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{menu.dateCreated} · {menu.guestCount} gestir</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          aria-label="Eyða matseðli"
          className="text-gray-400 hover:text-red-500 transition-colors border-0 bg-transparent cursor-pointer"
        >
          <Trash2 size={18} />
        </button>
      </header>

      {(menu.recipes || []).length === 0 ? (
        <p className="text-gray-400 text-sm">Engar uppskriftir í þessum matseðli.</p>
      ) : (
        <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {menu.recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleAddToGrocery}
          disabled={sending || (menu.recipes || []).length === 0}
          className="px-5 py-2.5 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 cursor-pointer border-0"
        >
          {sending ? 'Sendi...' : 'Senda á innkaupalista'}
        </button>
      </div>
    </main>
  )
}
