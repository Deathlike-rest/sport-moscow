'use client'

import { useState, useEffect } from 'react'
import type { User } from '@sport/types'
import { getToken, getUser, saveAuth, clearAuth } from '../auth'
import { login as apiLogin, register as apiRegister } from '../api-client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setUser(getUser())
    setToken(getToken())
  }, [])

  async function login(email: string, password: string) {
    const res = await apiLogin({ email, password })
    saveAuth(res.token, res.user)
    setUser(res.user)
    setToken(res.token)
    return res
  }

  async function register(email: string, password: string, displayName?: string) {
    const res = await apiRegister({ email, password, displayName })
    saveAuth(res.token, res.user)
    setUser(res.user)
    setToken(res.token)
    return res
  }

  function logout() {
    clearAuth()
    setUser(null)
    setToken(null)
  }

  return { user, token, login, register, logout, isAuthenticated: !!user }
}
