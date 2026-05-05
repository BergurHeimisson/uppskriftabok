import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'
import * as api from '../api'
import { AuthContext } from '../context/AuthContext'

vi.mock('../api')

const recipes = [
  { id: '1', title: 'Kjötbollar', tags: ['dinner', 'icelandic'], prep_ahead_note: null,
    ingredients: [{ amount: 500, unit: 'g', item: 'ground beef' }] },
  { id: '2', title: 'Baguette', tags: ['baking', 'bread'], prep_ahead_note: 'Dough must rest overnight',
    ingredients: [] },
  { id: '3', title: 'Hummus', tags: ['starter', 'vegetarian'], prep_ahead_note: null,
    ingredients: [{ amount: 400, unit: 'g', item: 'chickpeas' }] },
]

const loggedInUser = { username: 'bergur', role: 'MEMBER' }

beforeEach(() => {
  api.getRecipes.mockResolvedValue(recipes)
})

function renderHome(user = null) {
  return render(
    <AuthContext.Provider value={{ user, logout: vi.fn() }}>
      <MemoryRouter><Home /></MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('Home page', () => {
  it('shows all recipe titles after loading', async () => {
    renderHome()
    await waitFor(() => expect(screen.getByText('Kjötbollar')).toBeInTheDocument())
    expect(screen.getByText('Baguette')).toBeInTheDocument()
    expect(screen.getByText('Hummus')).toBeInTheDocument()
  })

  it('shows empty state prompt when there are no recipes', async () => {
    api.getRecipes.mockResolvedValue([])
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/no recipes yet/i)).toBeInTheDocument()
    )
  })

  it('filters recipes by title search', async () => {
    const user = userEvent.setup()
    renderHome()
    await waitFor(() => screen.getByText('Kjötbollar'))

    await user.type(screen.getByPlaceholderText(/leita/i), 'Hummus')

    expect(screen.getByText('Hummus')).toBeInTheDocument()
    expect(screen.queryByText('Kjötbollar')).not.toBeInTheDocument()
    expect(screen.queryByText('Baguette')).not.toBeInTheDocument()
  })

  it('filters recipes by ingredient search', async () => {
    const user = userEvent.setup()
    renderHome()
    await waitFor(() => screen.getByText('Kjötbollar'))

    await user.type(screen.getByPlaceholderText(/leita/i), 'chickpeas')

    expect(screen.getByText('Hummus')).toBeInTheDocument()
    expect(screen.queryByText('Kjötbollar')).not.toBeInTheDocument()
  })

  it('shows tag filter buttons for each unique tag', async () => {
    renderHome()
    await waitFor(() => screen.getByText('Kjötbollar'))
    expect(screen.getByRole('button', { name: /baking/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dinner/i })).toBeInTheDocument()
  })

  it('filters by tag when a tag button is clicked', async () => {
    const user = userEvent.setup()
    renderHome()
    await waitFor(() => screen.getByText('Kjötbollar'))

    await user.click(screen.getByRole('button', { name: /baking/i }))

    expect(screen.getByText('Baguette')).toBeInTheDocument()
    expect(screen.queryByText('Kjötbollar')).not.toBeInTheDocument()
    expect(screen.queryByText('Hummus')).not.toBeInTheDocument()
  })

  it('restores full list when All button is clicked', async () => {
    const user = userEvent.setup()
    renderHome()
    await waitFor(() => screen.getByText('Kjötbollar'))

    await user.click(screen.getByRole('button', { name: /baking/i }))
    await user.click(screen.getByRole('button', { name: /^allar$/ }))

    expect(screen.getByText('Kjötbollar')).toBeInTheDocument()
    expect(screen.getByText('Hummus')).toBeInTheDocument()
  })

  it('shows Add Recipe link when logged in', async () => {
    renderHome(loggedInUser)
    await waitFor(() => screen.getByText('Kjötbollar'))
    expect(screen.getByRole('link', { name: /\+/i })).toBeInTheDocument()
  })

  it('hides Add Recipe link when not logged in', async () => {
    renderHome()
    await waitFor(() => screen.getByText('Kjötbollar'))
    expect(screen.queryByRole('link', { name: /\+/i })).not.toBeInTheDocument()
  })

  it('has a Grocery List link', async () => {
    renderHome()
    await waitFor(() => screen.getByText('Kjötbollar'))
    expect(screen.getByRole('link', { name: /grocery/i })).toBeInTheDocument()
  })
})
