import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import * as api from './api'

vi.mock('./api')

beforeEach(() => {
  vi.clearAllMocks()
  api.getRecipes.mockResolvedValue([])
  api.getGroceryItems.mockResolvedValue([])
})

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

describe('App routing', () => {
  it('renders the home page at /', async () => {
    renderAt('/')
    await waitFor(() => expect(screen.getByText('Uppskriftapunktar')).toBeInTheDocument())
  })

  it('renders the Add Recipe page at /add', () => {
    renderAt('/add')
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
  })

  it('renders the Grocery List page at /grocery', async () => {
    renderAt('/grocery')
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /grocery list/i })).toBeInTheDocument()
    )
  })

  it('redirects unknown paths to home', async () => {
    renderAt('/unknown-path')
    await waitFor(() => expect(screen.getByText('Uppskriftapunktar')).toBeInTheDocument())
  })
})
