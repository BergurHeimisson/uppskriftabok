import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecipeCard from './RecipeCard'

const base = {
  id: 'abc',
  title: 'Kjötbollar',
  tags: ['dinner', 'icelandic'],
  prep_ahead_note: null,
}

function renderCard(recipe = base) {
  return render(
    <MemoryRouter>
      <RecipeCard recipe={recipe} />
    </MemoryRouter>
  )
}

describe('RecipeCard', () => {
  it('shows the recipe title', () => {
    renderCard()
    expect(screen.getByText('Kjötbollar')).toBeInTheDocument()
  })

  it('shows each tag prefixed with #', () => {
    renderCard()
    expect(screen.getByText('#dinner')).toBeInTheDocument()
    expect(screen.getByText('#icelandic')).toBeInTheDocument()
  })

  it('links to the recipe detail page', () => {
    renderCard()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/recipe/abc')
  })

  it('shows prep-ahead icon when prep_ahead_note is set', () => {
    renderCard({ ...base, prep_ahead_note: 'Dough must rest overnight' })
    expect(screen.getByLabelText(/þarf undirbúning/i)).toBeInTheDocument()
  })

  it('does not show prep-ahead icon when prep_ahead_note is null', () => {
    renderCard()
    expect(screen.queryByLabelText(/þarf undirbúning/i)).not.toBeInTheDocument()
  })
})
