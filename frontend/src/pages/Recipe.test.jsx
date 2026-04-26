import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Recipe from './Recipe'
import * as api from '../api'

vi.mock('../api')

const recipe = {
  id: 'r1',
  title: 'Kjötbollar',
  description: 'Classic Icelandic meatballs',
  servings: 4,
  prep_time: '15 min',
  cook_time: '20 min',
  tags: ['dinner'],
  prep_ahead_note: null,
  ingredients: [
    { amount: 500, unit: 'g', item: 'ground beef' },
    { amount: 1, unit: '', item: 'egg' },
    { amount: 0.5, unit: 'dl', item: 'breadcrumbs' },
  ],
  instructions: 'Mix all ingredients together in a bowl.\nForm into small balls.\nFry in butter on medium heat.',
}

function renderRecipe(id = 'r1') {
  return render(
    <MemoryRouter initialEntries={[`/recipe/${id}`]}>
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/recipe/:id" element={<Recipe />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  api.getRecipe.mockResolvedValue(recipe)
})

describe('Recipe page', () => {
  it('shows recipe title and description', async () => {
    renderRecipe()
    await waitFor(() => expect(screen.getByText('Kjötbollar')).toBeInTheDocument())
    expect(screen.getByText('Classic Icelandic meatballs')).toBeInTheDocument()
  })

  it('shows all ingredients', async () => {
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))
    expect(screen.getByText('ground beef')).toBeInTheDocument()
    expect(screen.getByText('egg')).toBeInTheDocument()
    expect(screen.getByText('breadcrumbs')).toBeInTheDocument()
  })

  it('shows instructions text', async () => {
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))
    expect(screen.getByText(/mix all ingredients together in a bowl/i)).toBeInTheDocument()
  })

  it('doubles ingredient amounts when servings are doubled', async () => {
    const user = userEvent.setup()
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))

    // base 4 → select 8 (2× scale): 500g → 1000
    await user.click(screen.getByRole('button', { name: '8' }))
    expect(screen.getByText('1000')).toBeInTheDocument()
  })

  it('shows fractions for scaled fractional amounts', async () => {
    const user = userEvent.setup()
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))

    // base 4 → select 2 (0.5× scale): 0.5 dl breadcrumbs → 0.25 dl = 1/4
    await user.click(screen.getByRole('button', { name: '2' }))
    expect(screen.getByText('1/4')).toBeInTheDocument()
  })

  it('shows plan-ahead notice when prep_ahead_note is set', async () => {
    api.getRecipe.mockResolvedValue({ ...recipe, prep_ahead_note: 'Dough must rest overnight' })
    renderRecipe()
    await waitFor(() => screen.getByText(/dough must rest overnight/i))
  })

  it('has an add-to-grocery button for each ingredient', async () => {
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))
    const buttons = screen.getAllByRole('button', { name: /add .* to grocery/i })
    expect(buttons).toHaveLength(3)
  })

  it('calls addToGrocery with the formatted label when an ingredient is added', async () => {
    api.addToGrocery.mockResolvedValue([])
    const user = userEvent.setup()
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))

    await user.click(screen.getByRole('button', { name: /add ground beef to grocery/i }))
    expect(api.addToGrocery).toHaveBeenCalledWith([{ recipeId: 'r1', label: '500 g ground beef' }])
  })

  it('disables the add button after adding', async () => {
    api.addToGrocery.mockResolvedValue([])
    const user = userEvent.setup()
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))

    const btn = screen.getByRole('button', { name: /add ground beef to grocery/i })
    await user.click(btn)
    await waitFor(() => expect(btn).toBeDisabled())
  })

  it('has a delete button', async () => {
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))
    expect(screen.getByRole('button', { name: /delete recipe/i })).toBeInTheDocument()
  })

  it('shows confirmation when delete is clicked', async () => {
    const user = userEvent.setup()
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))

    await user.click(screen.getByRole('button', { name: /delete recipe/i }))
    expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('hides confirmation when cancel is clicked', async () => {
    const user = userEvent.setup()
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))

    await user.click(screen.getByRole('button', { name: /delete recipe/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('button', { name: /yes, delete/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete recipe/i })).toBeInTheDocument()
  })

  it('calls deleteRecipe and navigates home on confirm', async () => {
    api.deleteRecipe.mockResolvedValue()
    const user = userEvent.setup()
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))

    await user.click(screen.getByRole('button', { name: /delete recipe/i }))
    await user.click(screen.getByRole('button', { name: /yes, delete/i }))

    expect(api.deleteRecipe).toHaveBeenCalledWith('r1')
    await waitFor(() => expect(screen.getByText('Home page')).toBeInTheDocument())
  })

  it('has a Cook Mode button', async () => {
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))
    expect(screen.getByRole('button', { name: /cook mode/i })).toBeInTheDocument()
  })

  it('enters cook mode showing instructions when Cook Mode is clicked', async () => {
    const user = userEvent.setup()
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))

    await user.click(screen.getByRole('button', { name: /cook mode/i }))

    expect(screen.getByText(/mix all ingredients together in a bowl/i)).toBeInTheDocument()
  })
})
