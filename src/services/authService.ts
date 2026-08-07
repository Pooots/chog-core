import api from '@/lib/api'
import type {
  PortalAuthResponse,
  PortalLinkStudentPayload,
  PortalLinkStudentResponse,
  PortalLoginPayload,
  PortalMeResponse,
  PortalRegisterPayload,
  PortalRole,
  PortalSchool,
  PortalUser,
} from '@/types/auth'

const ROLE_HOME: Record<PortalRole, string> = {
  student: '/portal/student',
  parent: '/portal/parent',
  teacher: '/portal/teacher',
}

export const authService = {
  persistSession(data: PortalAuthResponse): void {
    localStorage.setItem('auth_token', data.access_token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    localStorage.setItem('auth_role', data.role)
    if (data.school) {
      localStorage.setItem('auth_school', JSON.stringify(data.school))
    } else {
      localStorage.removeItem('auth_school')
    }
    localStorage.setItem('auth_profile', JSON.stringify(data.profile))
  },

  async login(payload: PortalLoginPayload): Promise<PortalAuthResponse> {
    const { data } = await api.post<PortalAuthResponse>('/portal/login', payload)

    if (data.access_token) {
      this.persistSession(data)
    }

    return data
  },

  async register(payload: PortalRegisterPayload): Promise<PortalAuthResponse> {
    const { data } = await api.post<PortalAuthResponse>(
      '/portal/register',
      payload,
    )

    if (data.access_token) {
      this.persistSession(data)
    }

    return data
  },

  async linkStudent(
    payload: PortalLinkStudentPayload,
  ): Promise<PortalLinkStudentResponse> {
    const { data } = await api.post<PortalLinkStudentResponse>(
      '/portal/link-student',
      payload,
    )

    localStorage.setItem('auth_user', JSON.stringify(data.user))
    localStorage.setItem('auth_role', data.role)
    if (data.school) {
      localStorage.setItem('auth_school', JSON.stringify(data.school))
    } else {
      localStorage.removeItem('auth_school')
    }
    localStorage.setItem('auth_profile', JSON.stringify(data.profile))

    return data
  },

  getProfile<T = unknown>(): T | null {
    const profileStr = localStorage.getItem('auth_profile')
    if (!profileStr) return null
    try {
      return JSON.parse(profileStr) as T
    } catch {
      return null
    }
  },

  getSchool(): PortalSchool | null {
    const schoolStr = localStorage.getItem('auth_school')
    if (!schoolStr) return null
    try {
      return JSON.parse(schoolStr) as PortalSchool
    } catch {
      return null
    }
  },

  async me(): Promise<PortalMeResponse> {
    const { data } = await api.get<PortalMeResponse>('/portal/me')
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    localStorage.setItem('auth_role', data.role)
    if (data.school) {
      localStorage.setItem('auth_school', JSON.stringify(data.school))
    } else {
      localStorage.removeItem('auth_school')
    }
    localStorage.setItem('auth_profile', JSON.stringify(data.profile))
    return data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/portal/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearSession()
      window.location.href = '/'
    }
  },

  clearSession(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_role')
    localStorage.removeItem('auth_school')
    localStorage.removeItem('auth_profile')
  },

  getCurrentUser(): PortalUser | null {
    const userStr = localStorage.getItem('auth_user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as PortalUser
    } catch {
      return null
    }
  },

  getRole(): PortalRole | null {
    const role = localStorage.getItem('auth_role')
    if (role === 'student' || role === 'parent' || role === 'teacher') {
      return role
    }
    return null
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  homeForRole(role?: PortalRole | null): string {
    if (!role) return '/'
    return ROLE_HOME[role]
  },
}
