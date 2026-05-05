import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUsers, createUser, deleteUser, resetUserPassword } from '../api'

export default function Admin() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('MEMBER')
  const [resetingId, setResetingId] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [error, setError] = useState(null)

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await getUsers())
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    if (user?.role === 'ADMIN') loadUsers()
  }, [user, loadUsers])

  if (user?.role !== 'ADMIN') {
    return (
      <main className="p-8 text-center text-gray-600">
        Not authorized
      </main>
    )
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createUser(newUsername, newPassword, newRole)
      setNewUsername('')
      setNewPassword('')
      setNewRole('MEMBER')
      setShowForm(false)
      await loadUsers()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleResetPassword(e, id) {
    e.preventDefault()
    try {
      await resetUserPassword(id, resetPassword)
      setResetingId(null)
      setResetPassword('')
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return
    try {
      await deleteUser(id)
      await loadUsers()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => setShowForm(f => !f)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          aria-label="Add user"
        >
          Add User
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <div>
            <label htmlFor="new-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="new-username"
              aria-label="Username"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="new-password"
              aria-label="Password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="new-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="new-role"
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Create
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {users.map(u => (
          <li key={u.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-800">{u.username}</span>
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{u.role}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setResetingId(resetingId === u.id ? null : u.id); setResetPassword('') }}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Reset password
                </button>
                {u.username !== user.username && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    aria-label={`Delete ${u.username}`}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {resetingId === u.id && (
              <form onSubmit={e => handleResetPassword(e, u.id)} className="mt-3 flex items-center gap-2">
                <label htmlFor={`pw-${u.id}`} className="sr-only">New password</label>
                <input
                  id={`pw-${u.id}`}
                  aria-label="New password"
                  type="password"
                  value={resetPassword}
                  onChange={e => setResetPassword(e.target.value)}
                  required
                  placeholder="New password"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setResetingId(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
