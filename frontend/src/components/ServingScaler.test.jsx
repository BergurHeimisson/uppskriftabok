import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ServingScaler from './ServingScaler'

describe('ServingScaler', () => {
  it('renders preset buttons 2, 4, 6, 8', () => {
    render(<ServingScaler baseServings={4} onChange={() => {}} />)
    ;[2, 4, 6, 8].forEach(n =>
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

  it('clamps base servings below range to 2', () => {
    render(<ServingScaler baseServings={1} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('clamps base servings above range to 8', () => {
    render(<ServingScaler baseServings={9} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '8' })).toHaveAttribute('aria-pressed', 'true')
  })
})
