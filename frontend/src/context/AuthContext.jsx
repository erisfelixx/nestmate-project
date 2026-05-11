import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // перевіряємо чи токен ще дійсний
      api.get('/profiles/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    const res = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    localStorage.setItem('token', res.data.access_token)

    try {
      //спроба отримати профіль
      const profile = await api.get('/profiles/me')
      setUser(profile.data)
      return profile.data
    } catch (e) {
      //встановлюємо користувача без анкети
      setUser({ email: email, hasProfile: false })
      return null
    }
  }

  const register = async (email, password) => {
    await api.post('/auth/register', { email, password })
    return login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)