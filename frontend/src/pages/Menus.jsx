import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowLeft } from 'lucide-react'
import { getMenus } from '../api'

export default function Menus() {
  const [menus, setMenus] = useState([])

  useEffect(() => { getMenus().then(setMenus) }, [])

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Til baka" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Matseðlar</h1>
        </div>
        <Link
          to="/menus/new"
          aria-label="Nýr matseðill"
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Plus size={22} />
        </Link>
      </header>

      {menus.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Enginn matseðill til.{' '}
          <Link to="/menus/new" className="text-amber-600 hover:underline">Búðu til þinn fyrsta.</Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {menus.map(m => (
            <li key={m.id}>
              <Link
                to={`/menus/${m.id}`}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="font-semibold text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.dateCreated} · {m.guestCount} gestir</p>
                </div>
                <p className="text-sm text-gray-400">{(m.recipeIds || []).length} uppskriftir</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
