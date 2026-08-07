import { adminApi } from '@/lib/api'
import type { AdminAuthResponse, LoginCredentials } from '@/types/auth'

const STORAGE_KEYS = {
  token: 'admin_token',
  user: 'admin_user',
  role: 'admin_role',
  isAdmin: 'is_admin',
} as const

export const adminAuthService = {
  async login(credentials: LoginCredentials): Promise<AdminAuthResponse> {
    const { data } = await adminApi.post<AdminAuthResponse>(
      '/admin/super/login',
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
}
