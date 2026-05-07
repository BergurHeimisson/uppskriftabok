import { useState, useEffect } from 'react'
import { Trash2, CheckCheck, House } from 'lucide-react'
import { getGroceryItems, toggleGroceryItem, clearCompletedGroceryItems, clearAllGroceryItems } from '../api'

export default function GroceryList() {
  const [items, setItems] = useState([])

  useEffect(() => {
    getGroceryItems().then(setItems)
  }, [])

  async function handleToggle(id) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, checked: !it.checked } : it))
    await toggleGroceryItem(id)
  }

  async function handleClearDone() {
    await clearCompletedGroceryItems()
    setItems(prev => prev.filter(it => !it.checked))
  }

  async function handleClearAll() {
    await clearAllGroceryItems()
    setItems([])
  }

  const groups = items.reduce((acc, item) => {
    const key = item.recipe_id || '__none__'
    if (!acc[key]) acc[key] = { title: item.recipe_title || null, items: [] }
    acc[key].items.push(item)
    return acc
  }, {})

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <header className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <a href="/" aria-label="Home" className="text-gray-500 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-gray-100">
          <House size={20} />
        </a>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Innkaupalisti</h1>
      </header>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm dark:text-gray-400">Your grocery list is empty.</p>
      ) : (
        <>
          {Object.values(groups).map((group, gi) => (
            <div key={gi} className="mb-4">
              {group.title && (
                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2 dark:text-gray-500">
                  {group.title}
                </h2>
              )}
              {group.items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 py-2 ${item.checked ? 'opacity-40 line-through' : ''}`}
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggle(item.id)}
                      aria-label={item.label}
                    />
                    <span className="text-sm dark:text-gray-300">{item.label}</span>
                  </label>
                </div>
              ))}
            </div>
          ))}

          <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              aria-label="Clear done"
              onClick={handleClearDone}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors cursor-pointer border-0 bg-transparent dark:text-gray-500 dark:hover:text-gray-300"
            >
              <CheckCheck size={15} />
              Clear done
            </button>
            <button
              aria-label="Clear all"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors cursor-pointer border-0 bg-transparent dark:text-red-500 dark:hover:text-red-400"
            >
              <Trash2 size={15} />
              Clear all
            </button>
          </div>
        </>
      )}
    </main>
  )
}
