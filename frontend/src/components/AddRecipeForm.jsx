import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Download, Wand2, Plus, Trash2, Check, X, BookmarkCheck } from 'lucide-react'
import ServingScaler from './ServingScaler'
import { createRecipe, updateRecipe, importFromUrl, parseIngredients } from '../api'

const emptyIngredient = () => ({ amount: '', unit: '', item: '' })
const emptyStep = () => ''

export default function AddRecipeForm({ initialRecipe } = {}) {
  const navigate = useNavigate()
  const isEdit = !!initialRecipe

  const [title, setTitle] = useState(initialRecipe?.title ?? '')
  const [description, setDescription] = useState(initialRecipe?.description ?? '')
  const [servings, setServings] = useState(initialRecipe?.servings ?? 4)
  const [tagsInput, setTagsInput] = useState(initialRecipe?.tags?.join(', ') ?? '')
  const [showTimes, setShowTimes] = useState(!!(initialRecipe?.prep_time || initialRecipe?.cook_time))
  const [prepTime, setPrepTime] = useState(initialRecipe?.prep_time ?? '')
  const [cookTime, setCookTime] = useState(initialRecipe?.cook_time ?? '')
  const [showPrepAhead, setShowPrepAhead] = useState(!!initialRecipe?.prep_ahead_note)
  const [prepAheadNote, setPrepAheadNote] = useState(initialRecipe?.prep_ahead_note ?? '')
  const [ingredients, setIngredients] = useState(
    initialRecipe?.ingredients?.map(ing => ({
      amount: ing.amount ?? '',
      unit: ing.unit ?? '',
      item: ing.item ?? '',
    })) ?? [emptyIngredient()]
  )
  const [steps, setSteps] = useState(initialRecipe?.steps ?? [emptyStep()])
  const [urlInput, setUrlInput] = useState('')
  const [showParseModal, setShowParseModal] = useState(false)
  const [parseText, setParseText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [parsing, setParsing] = useState(false)

  function updateIngredient(i, field, value) {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
  }

  function addIngredient() {
    setIngredients(prev => [...prev, emptyIngredient()])
  }

  function removeIngredient(i) {
    setIngredients(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateStep(i, value) {
    setSteps(prev => prev.map((s, idx) => idx === i ? value : s))
  }

  function addStep() {
    setSteps(prev => [...prev, emptyStep()])
  }

  function removeStep(i) {
    setSteps(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleImport() {
    if (!urlInput) return
    setImporting(true)
    setImportError('')
    try {
      const data = await importFromUrl(urlInput)
      setTitle(data.title || '')
      setDescription(data.description || '')
      if (data.servings) setServings(data.servings)
      if (data.tags?.length) setTagsInput(data.tags.join(', '))
      if (data.ingredients?.length) {
        setIngredients(data.ingredients.map(ing => ({
          amount: ing.amount ?? '',
          unit: ing.unit ?? '',
          item: ing.item ?? '',
        })))
      }
      if (data.steps?.length) setSteps(data.steps)
      if (data.prep_ahead_note) {
        setShowPrepAhead(true)
        setPrepAheadNote(data.prep_ahead_note)
      }
    } catch (err) {
      setImportError(err.message || 'Could not import recipe from that URL')
    } finally {
      setImporting(false)
    }
  }

  async function handleParse() {
    const lines = parseText.split('\n').map(l => l.trim()).filter(Boolean)
    setShowParseModal(false)
    if (!lines.length) return
    setParsing(true)
    try {
      const parsed = await parseIngredients(lines)
      setIngredients(parsed.map(ing => ({
        amount: ing.amount ?? '',
        unit: ing.unit ?? '',
        item: ing.item ?? '',
      })))
      setParseText('')
    } finally {
      setParsing(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const payload = {
      title,
      description,
      servings,
      tags,
      ingredients: ingredients.filter(ing => ing.item).map(ing => ({
        amount: ing.amount !== '' ? Number(ing.amount) : null,
        unit: ing.unit,
        item: ing.item,
      })),
      steps: steps.filter(Boolean),
      ...(showTimes && prepTime && { prep_time: prepTime }),
      ...(showTimes && cookTime && { cook_time: cookTime }),
      ...(showPrepAhead && prepAheadNote && { prep_ahead_note: prepAheadNote }),
    }
    if (isEdit) {
      await updateRecipe(initialRecipe.id, payload)
      navigate(`/recipe/${initialRecipe.id}`)
    } else {
      await createRecipe(payload)
      navigate('/')
    }
  }

  const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
  const iconBtnCls = 'text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-0 bg-transparent p-1 rounded'

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-4">
        <ArrowLeft size={15} />
        Back
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Recipe' : 'Add Recipe'}</h1>

      {/* URL import — create mode only */}
      {!isEdit && <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Import from URL</p>
        <div className="flex gap-2 items-center">
          <input
            type="url"
            placeholder="https://..."
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            className={`flex-1 ${inputCls}`}
          />
          <button
            type="button"
            aria-label="Import Recipe"
            onClick={handleImport}
            aria-busy={importing}
            disabled={importing}
            className={`${iconBtnCls} shrink-0 ${importing ? 'opacity-50' : ''}`}
          >
            <Download size={18} />
          </button>
        </div>
        {importError && <p className="mt-2 text-sm text-red-500">{importError}</p>}
      </div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className={labelCls}>Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelCls}>Description</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Base servings</label>
          <ServingScaler baseServings={servings} onChange={setServings} />
        </div>

        <div>
          <label htmlFor="tags" className={labelCls}>
            Tags <span className="font-normal text-gray-400">(comma separated)</span>
          </label>
          <input
            id="tags"
            type="text"
            placeholder="dinner, icelandic, …"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showTimes}
              onChange={e => setShowTimes(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Add prep/cook times</span>
          </label>
          {showTimes && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input
                type="text"
                placeholder="Prep time"
                value={prepTime}
                onChange={e => setPrepTime(e.target.value)}
                className={inputCls}
              />
              <input
                type="text"
                placeholder="Cook time"
                value={cookTime}
                onChange={e => setCookTime(e.target.value)}
                className={inputCls}
              />
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPrepAhead}
              onChange={e => setShowPrepAhead(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Requires advance prep</span>
          </label>
          {showPrepAhead && (
            <input
              type="text"
              placeholder="e.g. Dough must rest overnight"
              value={prepAheadNote}
              onChange={e => setPrepAheadNote(e.target.value)}
              className={`mt-2 ${inputCls}`}
            />
          )}
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-800">Ingredients</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Parse ingredients"
                onClick={() => setShowParseModal(v => !v)}
                className={iconBtnCls}
              >
                <Wand2 size={16} />
              </button>
              <button
                type="button"
                aria-label="Add ingredient"
                onClick={addIngredient}
                className={iconBtnCls}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {showParseModal && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <label className={labelCls}>Paste ingredients (one per line):</label>
              <textarea
                placeholder="Paste ingredients..."
                value={parseText}
                onChange={e => setParseText(e.target.value)}
                rows={5}
                className={`${inputCls} font-mono`}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  aria-label="Parse"
                  onClick={handleParse}
                  aria-busy={parsing}
                  disabled={parsing}
                  className={`${iconBtnCls} ${parsing ? 'opacity-50' : 'text-amber-600 hover:text-amber-700'}`}
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Cancel"
                  onClick={() => { setShowParseModal(false); setParseText('') }}
                  className={iconBtnCls}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: '5rem 4.5rem 1fr auto' }}>
                <input
                  type="number"
                  placeholder="Amount"
                  value={ing.amount}
                  onChange={e => updateIngredient(i, 'amount', e.target.value)}
                  className={inputCls}
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={e => updateIngredient(i, 'unit', e.target.value)}
                  className={inputCls}
                />
                <input
                  type="text"
                  placeholder="Item"
                  value={ing.item}
                  onChange={e => updateIngredient(i, 'item', e.target.value)}
                  className={inputCls}
                />
                <button
                  type="button"
                  aria-label="Remove ingredient"
                  onClick={() => removeIngredient(i)}
                  className={iconBtnCls}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-800">Steps</h2>
            <button
              type="button"
              aria-label="Add step"
              onClick={addStep}
              className={iconBtnCls}
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="grid gap-2 items-start" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                <span className="text-sm text-gray-400 pt-2.5">{i + 1}.</span>
                <textarea
                  placeholder="Step"
                  value={step}
                  onChange={e => updateStep(i, e.target.value)}
                  rows={2}
                  className={inputCls}
                />
                <button
                  type="button"
                  aria-label="Remove step"
                  onClick={() => removeStep(i)}
                  className={`${iconBtnCls} mt-1`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            aria-label="Save Recipe"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-full
                       text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer border-0"
          >
            <BookmarkCheck size={16} />
            Save
          </button>
        </div>
      </form>
    </main>
  )
}
