import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/auth/me')
        .then(r => setUser(r.data))
        .catch(() => { localStorage.clear(); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token',  data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    setUser({ id: data.user_id, full_name: data.full_name,
              class_level: data.class_level, journey_stage: data.journey_stage })
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('access_token',  data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    setUser({ id: data.user_id, full_name: data.full_name,
              class_level: data.class_level, journey_stage: data.journey_stage })
    return data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout', { refresh_token: localStorage.getItem('refresh_token') })
    } catch (_) {}
    localStorage.clear()
    setUser(null)
  }

  const refreshUser = async () => {
    const { data } = await api.get('/auth/me')
    setUser(prev => ({ ...prev, ...data }))
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
