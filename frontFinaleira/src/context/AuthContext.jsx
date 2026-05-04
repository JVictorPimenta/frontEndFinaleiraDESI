/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import {
  loginRequest,
  registerProfessorUser,
  registerStudentUser,
} from '../api/authApi'

const AuthContext = createContext(null)

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage('auth:user', null))
  const [token, setToken] = useState(() => readStorage('auth:token', null))

  useEffect(() => {
    localStorage.setItem('auth:user', JSON.stringify(user))
  }, [user])

  useEffect(() => {
    localStorage.setItem('auth:token', JSON.stringify(token))
  }, [token])

  async function login(email, password) {
    const response = await loginRequest({ email, password })
    setUser(response.user)
    setToken(response.token)
    return response.user
  }

  async function registerStudent(email, password) {
    const response = await registerStudentUser({ email, password })
    return response.user
  }

  async function registerProfessor(email, password) {
    const response = await registerProfessorUser({ email, password })
    return response.user
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth:user')
    localStorage.removeItem('auth:token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
        registerStudent,
        registerProfessor,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa estar dentro do AuthProvider')
  }

  return context
}
