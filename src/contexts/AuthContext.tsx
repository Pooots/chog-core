import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '@/services/authService'
import { isTokenValid } from '@/lib/tokenUtils'
import type {
  PortalLoginPayload,
  PortalRegisterPayload,
  PortalRole,
  PortalUser,
} from '@/types/auth'

interface AuthContextType {
  user: PortalUser | null
  role: PortalRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: PortalLoginPayload) => Promise<PortalRole>
  register: (payload: PortalRegisterPayload) => Promise<PortalRole>
  logout: () => Promise<void>
  setUser: (user: PortalUser) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null)
  const [role, setRole] = useState<PortalRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser()
      const currentRole = authService.getRole()
      const token = authService.getToken()

      if (currentUser && token && currentRole) {
        if (isTokenValid(token)) {
          setUser(currentUser)
          setRole(currentRole)
        } else {
          authService.clearSession()
        }
      }

      setIsLoading(false)
    }

    const onTokenExpired = () => {
      setUser(null)
      setRole(null)
    }

    initAuth()
    window.addEventListener('tokenExpired', onTokenExpired)

    return () => {
      window.removeEventListener('tokenExpired', onTokenExpired)
    }
  }, [])

  const login = async (payload: PortalLoginPayload) => {
    const response = await authService.login(payload)
    setUser(response.user)
    setRole(response.role)
    return response.role
  }

  const register = async (payload: PortalRegisterPayload) => {
    const response = await authService.register(payload)
    setUser(response.user)
    setRole(response.role)
    return response.role
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setRole(null)
  }

  const value = {
    user,
    role,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
