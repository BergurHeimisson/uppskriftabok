import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, refreshToken, setToken } from '../api'

const DEFAULT = { token: null, user: null, login: async () => {}, logout: async () => {} }
export const AuthContext = createContext(DEFAULT)

function parseJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setStateToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const applyToken = useCallback((t) => {
    setStateToken(t)
    setToken(t)
    setUser(t ? parseJwtPayload(t) : null)
  }, [])

  // On mount: attempt silent refresh from httpOnly cookie
  useEffect(() => {
    refreshToken()
      .then(data => applyToken(data.accessToken))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [applyToken])

  const login = useCallback(async (username, password) => {
    const data = await apiLogin(username, password)
    applyToken(data.accessToken)
  }, [applyToken])

  const logout = useCallback(async () => {
    await apiLogout(token).catch(() => {})
    applyToken(null)
  }, [token, applyToken])

  if (loading) return null

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
