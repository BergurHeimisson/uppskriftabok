import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'
import { AuthContext } from '../context/AuthContext'

function renderLogin({ login = vi.fn() } = {}) {
  return render(
    <AuthContext.Provider value={{ login, user: null }}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('Login page', () => {
  it('renders username and password fields', () => {
    renderLogin()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('calls login with entered credentials on submit', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue()
    renderLogin({ login })

    await user.type(screen.getByLabelText(/username/i), 'bergur')
    await user.type(screen.getByLabelText(/password/i), 'secret')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(login).toHaveBeenCalledWith('bergur', 'secret'))
  })

  it('shows error message when login fails', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    renderLogin({ login })

    await user.type(screen.getByLabelText(/username/i), 'bergur')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })

  it('disables button while logging in', async () => {
    const user = userEvent.setup()
    let resolve
    const login = vi.fn().mockReturnValue(new Promise(r => { resolve = r }))
    renderLogin({ login })

    await user.type(screen.getByLabelText(/username/i), 'bergur')
    await user.type(screen.getByLabelText(/password/i), 'secret')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled()
    resolve()
  })
})
