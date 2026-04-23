import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AddRecipeForm from './AddRecipeForm'
import * as api from '../api'

vi.mock('../api')

beforeEach(() => {
  vi.clearAllMocks()
  api.createRecipe.mockResolvedValue({ id: 'new-id' })
  api.importFromUrl.mockResolvedValue({
    title: 'Imported Recipe',
    description: 'From the web',
    servings: 4,
    tags: ['baking'],
    ingredients: [{ amount: 100, unit: 'g', item: 'flour' }],
    steps: ['Mix', 'Bake'],
    prep_ahead_note: null,
  })
  api.parseIngredients.mockResolvedValue([
    { amount: 500, unit: 'g', item: 'ground beef' },
    { amount: 1, unit: '', item: 'egg' },
  ])
})

function renderForm() {
  return render(<MemoryRouter><AddRecipeForm /></MemoryRouter>)
}

describe('AddRecipeForm', () => {
  it('has a title input', () => {
    renderForm()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
  })

  it('has serving size preset buttons', () => {
    renderForm()
    ;[2, 4, 6, 8].forEach(n =>
      expect(screen.getByRole('button', { name: String(n) })).toBeInTheDocument()
    )
  })

  it('starts with one ingredient row', () => {
    renderForm()
    expect(screen.getAllByPlaceholderText(/^item$/i)).toHaveLength(1)
  })

  it('adds a new ingredient row when + is clicked', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: /add ingredient/i }))
    expect(screen.getAllByPlaceholderText(/^item$/i)).toHaveLength(2)
  })

  it('removes an ingredient row when its remove button is clicked', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: /add ingredient/i }))
    const removeButtons = screen.getAllByRole('button', { name: /remove ingredient/i })
    await user.click(removeButtons[0])
    expect(screen.getAllByPlaceholderText(/^item$/i)).toHaveLength(1)
  })

  it('starts with one step row', () => {
    renderForm()
    expect(screen.getAllByPlaceholderText(/^step$/i)).toHaveLength(1)
  })

  it('adds a new step row when + is clicked', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: /add step/i }))
    expect(screen.getAllByPlaceholderText(/^step$/i)).toHaveLength(2)
  })

  it('shows prep/cook time fields when checkbox is checked', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByLabelText(/add prep\/cook times/i))
    expect(screen.getByPlaceholderText(/prep time/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/cook time/i)).toBeInTheDocument()
  })

  it('shows advance-prep note field when checkbox is checked', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByLabelText(/requires advance prep/i))
    expect(screen.getByPlaceholderText(/e\.g\. dough/i)).toBeInTheDocument()
  })

  it('opens parse textarea when Parse ingredients button is clicked', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: /parse ingredients/i }))
    expect(screen.getByPlaceholderText(/paste ingredients/i)).toBeInTheDocument()
  })

  it('calls parseIngredients and fills ingredient rows on Parse', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: /parse ingredients/i }))
    await user.type(
      screen.getByPlaceholderText(/paste ingredients/i),
      '500g ground beef\n1 egg'
    )
    await user.click(screen.getByRole('button', { name: /^parse$/i }))

    await waitFor(() =>
      expect(api.parseIngredients).toHaveBeenCalledWith(['500g ground beef', '1 egg'])
    )
    expect(screen.getByDisplayValue('ground beef')).toBeInTheDocument()
  })

  it('closes parse textarea after successful parse', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: /parse ingredients/i }))
    await user.click(screen.getByRole('button', { name: /^parse$/i }))
    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/paste ingredients/i)).not.toBeInTheDocument()
    )
  })

  it('closes parse textarea on Cancel', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: /parse ingredients/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByPlaceholderText(/paste ingredients/i)).not.toBeInTheDocument()
  })

  it('imports from URL and pre-fills title', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByPlaceholderText(/https/i), 'https://example.com/recipe')
    await user.click(screen.getByRole('button', { name: /import recipe/i }))

    await waitFor(() =>
      expect(api.importFromUrl).toHaveBeenCalledWith('https://example.com/recipe')
    )
    expect(screen.getByDisplayValue('Imported Recipe')).toBeInTheDocument()
  })

  it('imports from URL and pre-fills ingredient rows', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByPlaceholderText(/https/i), 'https://example.com/recipe')
    await user.click(screen.getByRole('button', { name: /import recipe/i }))

    await waitFor(() => screen.getByDisplayValue('flour'))
  })

  it('submits the form with entered title', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText(/title/i), 'My Recipe')
    await user.click(screen.getByRole('button', { name: /save recipe/i }))

    await waitFor(() => expect(api.createRecipe).toHaveBeenCalled())
    expect(api.createRecipe.mock.calls[0][0].title).toBe('My Recipe')
  })

  it('includes imported ingredients in the submitted payload', async () => {
    const user = userEvent.setup()
    renderForm()

    // Import pre-fills ingredient rows; verify they reach createRecipe
    await user.type(screen.getByPlaceholderText(/https/i), 'https://example.com/recipe')
    await user.click(screen.getByRole('button', { name: /import recipe/i }))
    await waitFor(() => screen.getByDisplayValue('flour'))

    await user.click(screen.getByRole('button', { name: /save recipe/i }))
    await waitFor(() => expect(api.createRecipe).toHaveBeenCalled())

    const payload = api.createRecipe.mock.calls[0][0]
    expect(payload.ingredients[0].item).toBe('flour')
  })
})
