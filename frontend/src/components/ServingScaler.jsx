import { useState } from 'react'

const PRESETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function nearestPreset(n) {
  return PRESETS.reduce((best, p) =>
    Math.abs(p - n) < Math.abs(best - n) ? p : best
  )
}

export default function ServingScaler({ baseServings, onChange }) {
  const [selected, setSelected] = useState(() => nearestPreset(baseServings))

  function handleClick(preset) {
    setSelected(preset)
    onChange(preset)
  }

  return (
    <div className="flex items-center gap-1.5 my-3">
      <span className="text-sm text-gray-500 mr-1">Fjöldi:</span>
      {PRESETS.map(p => (
        <button
          key={p}
          aria-pressed={selected === p}
          onClick={() => handleClick(p)}
          className={`w-9 h-9 rounded-full text-sm font-medium transition-colors cursor-pointer border-0
            ${selected === p
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
