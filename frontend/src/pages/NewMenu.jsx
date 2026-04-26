import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getRecipes, createMenu } from '../api'

export default function NewMenu() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [guestCount, setGuestCount] = useState(4)
  const [recipes, setRecipes] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { getRecipes().then(setRecipes) }, [])

  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || selected.size === 0) return
    setSaving(true)
    try {
      const menu = await createMenu({ name: name.trim(), guestCount, recipeIds: [...selected] })
      navigate(`/menus/${menu.id}`)
    } finally {
      setSaving(false)
    }
  }

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
  const inputCls = 'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <header className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <Link to="/menus" aria-label="Til baka" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nýr matseðill</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className={labelCls}>Nafn matseðils</label>
          <input
            className={inputCls}
            placeholder="t.d. Jólakveðjur 2025"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelCls}>Fjöldi gesta</label>
          <input
            type="number"
            min="1"
            max="100"
            className={inputCls + ' w-24'}
            value={guestCount}
            onChange={e => setGuestCount(Number(e.target.value))}
          />
        </div>

        <div>
          <label className={labelCls}>Uppskriftir</label>
          <input
            type="search"
            placeholder="Leita..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={inputCls + ' mb-2'}
          />
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-2">
            {filtered.map(r => (
              <label
                key={r.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggle(r.id)}
                  className="accent-amber-500"
                />
                {r.title}
              </label>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-400 px-2 py-1">Engar uppskriftir fundust.</p>
            )}
          </div>
          {selected.size > 0 && (
            <p className="text-xs text-gray-500 mt-1">{selected.size} uppskrift{selected.size !== 1 ? 'ir' : ''} valdar</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !name.trim() || selected.size === 0}
            className="px-5 py-2.5 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 cursor-pointer border-0"
          >
            {saving ? 'Vista...' : 'Vista'}
          </button>
        </div>
      </form>
    </main>
  )
}
