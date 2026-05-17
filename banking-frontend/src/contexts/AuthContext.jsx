import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const session = localStorage.getItem('session')
    if (!session) { setLoading(false); return }
    try {
      const data = await api.getMe()
      setUser(data)
    } catch {
      localStorage.removeItem('session')
      localStorage.removeItem('username')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (username, password) => {
    const data = await api.login(username, password)
    localStorage.setItem('session', data.session)
    localStorage.setItem('username', data.username)
    setUser({ username: data.username, balance: data.balance })
    return data
  }

  const register = async (username, password) => {
    const data = await api.register(username, password)
    return data
  }

  const logout = () => {
    localStorage.removeItem('session')
    localStorage.removeItem('username')
    setUser(null)
  }

  const refreshUser = async () => {
    const data = await api.getMe()
    setUser(data)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
