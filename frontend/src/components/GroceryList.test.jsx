import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import GroceryList from './GroceryList'
import * as api from '../api'

vi.mock('../api')

// The backend returns items enriched with recipe_title (join on recipe_id)
const items = [
  { id: 'g1', recipe_id: 'r1', recipe_title: 'Kjötbollar', label: '500g ground beef', checked: false },
  { id: 'g2', recipe_id: 'r1', recipe_title: 'Kjötbollar', label: '1 egg', checked: true },
  { id: 'g3', recipe_id: 'r2', recipe_title: 'Hummus', label: '400g chickpeas', checked: false },
]

beforeEach(() => {
  vi.clearAllMocks()
  api.getGroceryItems.mockResolvedValue(items)
  api.toggleGroceryItem.mockResolvedValue({})
  api.clearCompletedGroceryItems.mockResolvedValue({})
  api.clearAllGroceryItems.mockResolvedValue({})
})

function renderList() {
  return render(<MemoryRouter><GroceryList /></MemoryRouter>)
}

describe('GroceryList', () => {
  it('shows all grocery items', async () => {
    renderList()
    await waitFor(() => screen.getByText('500g ground beef'))
    expect(screen.getByText('1 egg')).toBeInTheDocument()
    expect(screen.getByText('400g chickpeas')).toBeInTheDocument()
  })

  it('groups items under their source recipe name', async () => {
    renderList()
    await waitFor(() => screen.getByText('500g ground beef'))
    expect(screen.getByText('Kjötbollar')).toBeInTheDocument()
    expect(screen.getByText('Hummus')).toBeInTheDocument()
  })

  it('shows empty state when list is empty', async () => {
    api.getGroceryItems.mockResolvedValue([])
    renderList()
    await waitFor(() => expect(screen.getByText(/grocery list is empty/i)).toBeInTheDocument())
  })

  it('renders already-checked items as checked', async () => {
    renderList()
    await waitFor(() => screen.getByText('1 egg'))
    expect(screen.getByRole('checkbox', { name: /1 egg/i })).toBeChecked()
  })

  it('renders unchecked items as unchecked', async () => {
    renderList()
    await waitFor(() => screen.getByText('500g ground beef'))
    expect(screen.getByRole('checkbox', { name: /500g ground beef/i })).not.toBeChecked()
  })

  it('calls toggleGroceryItem when a checkbox is clicked', async () => {
    const user = userEvent.setup()
    renderList()
    await waitFor(() => screen.getByText('500g ground beef'))
    await user.click(screen.getByRole('checkbox', { name: /500g ground beef/i }))
    expect(api.toggleGroceryItem).toHaveBeenCalledWith('g1')
  })

  it('optimistically toggles the checkbox before API responds', async () => {
    api.toggleGroceryItem.mockResolvedValue({})
    const user = userEvent.setup()
    renderList()
    await waitFor(() => screen.getByText('500g ground beef'))
    const checkbox = screen.getByRole('checkbox', { name: /500g ground beef/i })
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('calls clearCompletedGroceryItems on Clear done click', async () => {
    const user = userEvent.setup()
    renderList()
    await waitFor(() => screen.getByText('500g ground beef'))
    await user.click(screen.getByRole('button', { name: /clear done/i }))
    expect(api.clearCompletedGroceryItems).toHaveBeenCalled()
  })

  it('calls clearAllGroceryItems on Clear all click', async () => {
    const user = userEvent.setup()
    renderList()
    await waitFor(() => screen.getByText('500g ground beef'))
    await user.click(screen.getByRole('button', { name: /clear all/i }))
    expect(api.clearAllGroceryItems).toHaveBeenCalled()
  })

  it('removes items from the list after Clear all', async () => {
    api.clearAllGroceryItems.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderList()
    await waitFor(() => screen.getByText('500g ground beef'))
    await user.click(screen.getByRole('button', { name: /clear all/i }))
    await waitFor(() =>
      expect(screen.queryByText('500g ground beef')).not.toBeInTheDocument()
    )
  })
})
