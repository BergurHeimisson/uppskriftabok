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
  steps: [
    'Mix all ingredients together in a bowl.',
    'Form into small balls.',
    'Fry in butter on medium heat.',
  ],
}

function renderRecipe(id = 'r1') {
  return render(
    <MemoryRouter initialEntries={[`/recipe/${id}`]}>
      <Routes>
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

  it('shows all steps', async () => {
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))
    expect(screen.getByText('Mix all ingredients together in a bowl.')).toBeInTheDocument()
    expect(screen.getByText('Form into small balls.')).toBeInTheDocument()
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

  it('can cross off an ingredient with its checkbox', async () => {
    const user = userEvent.setup()
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))

    const checkbox = screen.getByRole('checkbox', { name: /ground beef/i })
    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('un-crosses an ingredient when clicked again', async () => {
    const user = userEvent.setup()
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))

    const checkbox = screen.getByRole('checkbox', { name: /ground beef/i })
    await user.click(checkbox)
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('shows plan-ahead notice when prep_ahead_note is set', async () => {
    api.getRecipe.mockResolvedValue({ ...recipe, prep_ahead_note: 'Dough must rest overnight' })
    renderRecipe()
    await waitFor(() => screen.getByText(/dough must rest overnight/i))
  })

  it('has a Cook Mode button', async () => {
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))
    expect(screen.getByRole('button', { name: /cook mode/i })).toBeInTheDocument()
  })

  it('enters cook mode showing first step when Cook Mode is clicked', async () => {
    const user = userEvent.setup()
    renderRecipe()
    await waitFor(() => screen.getByText('Kjötbollar'))

    await user.click(screen.getByRole('button', { name: /cook mode/i }))

    expect(screen.getByText('Mix all ingredients together in a bowl.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })
})
