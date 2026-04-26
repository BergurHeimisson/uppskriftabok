import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ServingScaler from './ServingScaler'

describe('ServingScaler', () => {
  it('renders preset buttons 1 through 10', () => {
    render(<ServingScaler baseServings={4} onChange={() => {}} />)
    ;[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(n =>
      expect(screen.getByRole('button', { name: String(n) })).toBeInTheDocument()
    )
  })

  it('marks the button matching base servings as active', () => {
    render(<ServingScaler baseServings={4} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '4' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange with the chosen preset when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ServingScaler baseServings={4} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '6' }))
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('updates active button after click', async () => {
    const user = userEvent.setup()
    render(<ServingScaler baseServings={4} onChange={() => {}} />)
    await user.click(screen.getByRole('button', { name: '6' }))
    expect(screen.getByRole('button', { name: '6' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '4' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clamps base servings below range to 1', () => {
    render(<ServingScaler baseServings={0} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('clamps base servings above range to 10', () => {
    render(<ServingScaler baseServings={11} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '10' })).toHaveAttribute('aria-pressed', 'true')
  })
})
