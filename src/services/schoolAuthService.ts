import { schoolAdminApi } from '@/lib/api'
import type { AdminAuthResponse, LoginCredentials } from '@/types/auth'

const STORAGE_KEYS = {
  token: 'school_admin_token',
  user: 'school_admin_user',
  role: 'school_admin_role',
  isAdmin: 'school_is_admin',
} as const

export const schoolAuthService = {
  async login(credentials: LoginCredentials): Promise<AdminAuthResponse> {
    const { data } = await schoolAdminApi.post<AdminAuthResponse>(
      '/admin/login',
      credentials,
    )

    localStorage.setItem(STORAGE_KEYS.token, data.access_token)
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.admin_user))
    localStorage.setItem(STORAGE_KEYS.role, data.role ?? '')
    localStorage.setItem(STORAGE_KEYS.isAdmin, String(data.is_admin ?? true))

    return data
  },

  logout(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.token)
  },

  getRole(): string | null {
    return localStorage.getItem(STORAGE_KEYS.role)
  },

  isScanner(): boolean {
    return this.getRole() === 'scanner'
  },
}
