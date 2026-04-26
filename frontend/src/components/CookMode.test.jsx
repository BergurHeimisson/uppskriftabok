import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CookMode from './CookMode'

const recipe = {
  id: 'r1',
  title: 'Kjötbollar',
  servings: 4,
  ingredients: [
    { amount: 500, unit: 'g', item: 'ground beef' },
    { amount: 1, unit: '', item: 'egg' },
  ],
  instructions: 'Mix all ingredients.\nForm into balls.\nFry in butter.',
}

function renderCook(onExit = () => {}) {
  return render(<CookMode recipe={recipe} onExit={onExit} />)
}

describe('CookMode', () => {
  it('shows the full instructions text', () => {
    renderCook()
    expect(screen.getByText(/mix all ingredients/i)).toBeInTheDocument()
  })

  it('shows ingredient list when Hráefni button is clicked', async () => {
    const user = userEvent.setup()
    renderCook()
    await user.click(screen.getByRole('button', { name: /^hráefni$/i }))
    expect(screen.getByText('ground beef')).toBeInTheDocument()
    expect(screen.getByText('egg')).toBeInTheDocument()
  })

  it('hides ingredient list after it is shown and toggled again', async () => {
    const user = userEvent.setup()
    renderCook()
    await user.click(screen.getByRole('button', { name: /^hráefni$/i }))
    await user.click(screen.getByRole('button', { name: /hide ingredients/i }))
    expect(screen.queryByText('ground beef')).not.toBeInTheDocument()
  })

  it('calls onExit when Exit is clicked', async () => {
    const user = userEvent.setup()
    const onExit = vi.fn()
    renderCook(onExit)
    await user.click(screen.getByRole('button', { name: /exit/i }))
    expect(onExit).toHaveBeenCalledOnce()
  })
})
