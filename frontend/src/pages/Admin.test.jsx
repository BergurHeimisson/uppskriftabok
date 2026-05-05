import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Admin from './Admin'
import { AuthContext } from '../context/AuthContext'
import * as api from '../api'

vi.mock('../api')

const adminUser = { username: 'bergur', role: 'ADMIN' }
const memberUser = { username: 'sigga', role: 'MEMBER' }

function renderAdmin(user = adminUser) {
  return render(
    <AuthContext.Provider value={{ user }}>
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  api.getUsers.mockResolvedValue([
    { id: '1', username: 'bergur', role: 'ADMIN', created_at: '2026-01-01T00:00:00Z' },
    { id: '2', username: 'sigga', role: 'MEMBER', created_at: '2026-01-02T00:00:00Z' },
  ])
})

describe('Admin page', () => {
  it('shows user list for admin', async () => {
    renderAdmin()
    await waitFor(() => expect(screen.getByText('bergur')).toBeInTheDocument())
    expect(screen.getByText('sigga')).toBeInTheDocument()
  })

  it('shows 403 message for non-admin user', async () => {
    renderAdmin(memberUser)
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument()
    expect(api.getUsers).not.toHaveBeenCalled()
  })

  it('shows create user form when Add User button is clicked', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await waitFor(() => screen.getByText('bergur'))

    await user.click(screen.getByRole('button', { name: /add user/i }))

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('creates a new user and refreshes list', async () => {
    const user = userEvent.setup()
    api.createUser.mockResolvedValue({ id: '3', username: 'jon', role: 'MEMBER' })
    renderAdmin()
    await waitFor(() => screen.getByText('bergur'))

    await user.click(screen.getByRole('button', { name: /add user/i }))
    await user.type(screen.getByLabelText(/username/i), 'jon')
    await user.type(screen.getByLabelText(/password/i), 'pass123')
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(api.createUser).toHaveBeenCalledWith('jon', 'pass123', 'MEMBER'))
  })

  it('deletes a user after confirmation', async () => {
    const user = userEvent.setup()
    api.deleteUser.mockResolvedValue()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderAdmin()
    await waitFor(() => screen.getByText('sigga'))

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])

    await waitFor(() => expect(api.deleteUser).toHaveBeenCalled())
  })

  it('shows password reset form when Reset password is clicked', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await waitFor(() => screen.getByText('bergur'))

    await user.click(screen.getAllByRole('button', { name: /reset password/i })[0])

    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
  })

  it('calls resetUserPassword and hides form on submit', async () => {
    const user = userEvent.setup()
    api.resetUserPassword.mockResolvedValue()
    renderAdmin()
    await waitFor(() => screen.getByText('bergur'))

    await user.click(screen.getAllByRole('button', { name: /reset password/i })[0])
    await user.type(screen.getByLabelText(/new password/i), 'NewPass123!')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => expect(api.resetUserPassword).toHaveBeenCalledWith('1', 'NewPass123!'))
    expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument()
  })
})
