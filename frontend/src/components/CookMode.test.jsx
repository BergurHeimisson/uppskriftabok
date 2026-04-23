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
  steps: [
    'Mix all ingredients.',
    'Form into balls.',
    'Fry in butter.',
  ],
}

function renderCook(onExit = () => {}) {
  return render(<CookMode recipe={recipe} onExit={onExit} />)
}

describe('CookMode', () => {
  it('shows the first step on mount', () => {
    renderCook()
    expect(screen.getByText('Mix all ingredients.')).toBeInTheDocument()
  })

  it('shows step counter as "Step 1/3"', () => {
    renderCook()
    expect(screen.getByText('Step 1/3')).toBeInTheDocument()
  })

  it('advances to the next step on Next click', async () => {
    const user = userEvent.setup()
    renderCook()
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText('Form into balls.')).toBeInTheDocument()
    expect(screen.getByText('Step 2/3')).toBeInTheDocument()
  })

  it('goes back to the previous step on Back click', async () => {
    const user = userEvent.setup()
    renderCook()
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText('Mix all ingredients.')).toBeInTheDocument()
    expect(screen.getByText('Step 1/3')).toBeInTheDocument()
  })

  it('disables Back button on the first step', () => {
    renderCook()
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled()
  })

  it('disables Next button on the last step', async () => {
    const user = userEvent.setup()
    renderCook()
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('shows ingredient list when Ingredients button is clicked', async () => {
    const user = userEvent.setup()
    renderCook()
    await user.click(screen.getByRole('button', { name: /^ingredients$/i }))
    expect(screen.getByText('ground beef')).toBeInTheDocument()
    expect(screen.getByText('egg')).toBeInTheDocument()
  })

  it('hides ingredient list after it is shown and toggled again', async () => {
    const user = userEvent.setup()
    renderCook()
    await user.click(screen.getByRole('button', { name: /^ingredients$/i }))
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
